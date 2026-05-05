import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type AuthError,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../config/firebase";
import STAFF_API_CONFIG from "../config/api.config";

const STAFF_TOKEN_KEY = "staffToken";
const STAFF_USER_KEY  = "staff_user";
const STAFF_TEAM_KEY  = "staff_team";

export type StaffTeam = "ops" | "support" | "finance" | "marketing";

type VerifyUser = {
  _id: string;
  firebaseUid?: string;
  email: string;
  name?: string;
  role: "staff" | "admin" | string;
  staffProfile?: {
    team?: StaffTeam;
    permissions?: string[];
    scopes?: string[];
  };
};

type VerifyResponse = {
  user?: VerifyUser;
  token?: string;
  data?: {
    user?: VerifyUser;
    token?: string;
  };
  message?: string;
};

export interface StaffAuthUser {
  uid: string;
  email: string;
  displayName?: string;
  role: "staff" | "admin";
  team: StaffTeam;
  permissions: string[];
  scopes: string[];
}

const mapStaffUser = (user: VerifyUser, fallbackTeam: StaffTeam): StaffAuthUser => ({
  uid: user.firebaseUid || user._id,
  email: user.email || "",
  displayName: user.name || undefined,
  role: user.role === "admin" ? "admin" : "staff",
  team: user.staffProfile?.team || fallbackTeam,
  permissions: user.staffProfile?.permissions || [],
  scopes: user.staffProfile?.scopes || [],
});

const setStoredSession = (token: string, user: VerifyUser) => {
  localStorage.setItem(STAFF_TOKEN_KEY, token);
  localStorage.setItem(STAFF_USER_KEY, JSON.stringify(user));
  if (user.staffProfile?.team) {
    localStorage.setItem(STAFF_TEAM_KEY, user.staffProfile.team);
  }
};

export const clearStoredSession = () => {
  localStorage.removeItem(STAFF_TOKEN_KEY);
  localStorage.removeItem(STAFF_USER_KEY);
  localStorage.removeItem(STAFF_TEAM_KEY);
};

const verifyStaffAccess = async (
  idToken: string,
  team: StaffTeam = "ops"
): Promise<{ user: VerifyUser; token: string }> => {
  const response = await fetch(`${STAFF_API_CONFIG.BASE_URL}${STAFF_API_CONFIG.ENDPOINTS.AUTH.VERIFY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`,
    },
    body: JSON.stringify({ role: "staff", team }),
  });

  const payload = (await response.json().catch(() => ({}))) as VerifyResponse;
  const data = payload.data || payload;

  if (!response.ok) {
    throw new Error(payload.message || "Staff login failed");
  }

  // token is required
  const token = data.token;
  if (!token) {
    throw new Error("Staff session token was not returned by the server");
  }

  // user may not be returned by older production backend — decode from token fallback
  let user: VerifyUser = data.user as VerifyUser;
  if (!user) {
    // Decode JWT payload to get basic user info (no verification needed here — server already verified)
    try {
      const payloadB64 = token.split(".")[1];
      const decoded = JSON.parse(atob(payloadB64));
      user = {
        _id: decoded.id || decoded.sub || decoded.uid || "unknown",
        firebaseUid: decoded.firebaseUid || decoded.uid,
        email: decoded.email || "",
        name: decoded.name || decoded.email || "Staff",
        role: decoded.role || "staff",
        staffProfile: {
          team: decoded.team || decoded.staffTeam || "ops",
          permissions: decoded.permissions || [],
          scopes: decoded.scopes || [],
        },
      };
    } catch {
      // absolute fallback
      user = {
        _id: "unknown",
        email: "",
        name: "Staff",
        role: "staff",
        staffProfile: { team: "ops", permissions: [], scopes: [] },
      };
    }
  }

  if (user.role !== "staff" && user.role !== "admin") {
    throw new Error("This Firebase account is not approved for staff access");
  }

  return { user, token };
};

// Dev mock login — uses backend mock token format: mock_<uid>_<role>
export const loginWithMock = async (
  email: string,
  _password: string,
  fallbackTeam: StaffTeam
): Promise<{ user: StaffAuthUser; token: string }> => {
  const uid = email.split("@")[0].replace(/[^a-z0-9]/gi, "");
  const mockToken = `mock_${uid}_staff`;

  const response = await fetch(`${STAFF_API_CONFIG.BASE_URL}${STAFF_API_CONFIG.ENDPOINTS.AUTH.VERIFY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${mockToken}`,
    },
    body: JSON.stringify({ role: "staff", team: fallbackTeam }),
  });

  const payload = (await response.json().catch(() => ({}))) as VerifyResponse;
  const data = payload.data || payload;

  if (!response.ok) {
    throw new Error(payload.message || "Mock login failed — is the backend running?");
  }

  if (!data.token) {
    throw new Error("No token returned from backend");
  }

  const user: VerifyUser = data.user || {
    _id: uid,
    email,
    name: email.split("@")[0],
    role: "staff",
    staffProfile: { team: fallbackTeam, permissions: [], scopes: [] },
  };

  // Always trust backend's staffProfile.team — store it so refresh picks it up
  const resolvedTeam = user.staffProfile?.team || fallbackTeam;
  setStoredSession(data.token, user);
  localStorage.setItem(STAFF_TEAM_KEY, resolvedTeam);

  return { user: mapStaffUser(user, resolvedTeam), token: data.token };
};

export const loginWithFirebase = async (
  email: string,
  password: string,
  fallbackTeam: StaffTeam
): Promise<{ user: StaffAuthUser; token: string }> => {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase login is not configured for this staff app");
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    const { user, token } = await verifyStaffAccess(idToken, fallbackTeam);

    // Always trust backend's staffProfile.team — store it so refresh picks it up
    const resolvedTeam = user.staffProfile?.team || fallbackTeam;
    setStoredSession(token, user);
    localStorage.setItem(STAFF_TEAM_KEY, resolvedTeam);

    return { user: mapStaffUser(user, resolvedTeam), token };
  } catch (error) {
    const authError = error as AuthError & { message?: string };

    if (authError.code === "auth/invalid-credential") {
      throw new Error("Firebase rejected these credentials. Check the staff account in Firebase and try again.");
    }

    throw new Error(authError.message || "Staff login failed");
  }
};

export const logoutFirebase = async (): Promise<void> => {
  try {
    await signOut(auth);
  } finally {
    clearStoredSession();
  }
};

export const syncStaffAuthSession = (
  onAuthenticated: (session: { user: StaffAuthUser; token: string }) => void,
  onUnauthenticated: () => void
) =>
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      clearStoredSession();
      onUnauthenticated();
      return;
    }

    try {
      // Pass "ops" as fallback — backend's staffProfile.team will override it
      // storedTeam is only used if backend doesn't return staffProfile.team
      const storedTeam = (localStorage.getItem(STAFF_TEAM_KEY) as StaffTeam) || "ops";

      const idToken = await firebaseUser.getIdToken(/* forceRefresh */ true);
      const { user, token } = await verifyStaffAccess(idToken, storedTeam);

      // Always trust backend's staffProfile.team over stored/selected team
      const resolvedTeam = user.staffProfile?.team || storedTeam;
      setStoredSession(token, user);

      // Update stored team to match what backend returned
      if (user.staffProfile?.team) {
        localStorage.setItem(STAFF_TEAM_KEY, user.staffProfile.team);
      }

      onAuthenticated({
        user: mapStaffUser(user, resolvedTeam),
        token,
      });
    } catch {
      clearStoredSession();
      await signOut(auth).catch(() => undefined);
      onUnauthenticated();
    }
  });
