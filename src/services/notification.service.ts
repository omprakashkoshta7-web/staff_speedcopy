import STAFF_API_CONFIG from "../config/api.config";
import staffService from "./staff.service";

export interface PortalNotification {
  _id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationSummary {
  unread_count: number;
  recent_notifications: PortalNotification[];
  category_counts: Record<string, number>;
}

const getHeaders = () => {
  const token = staffService.getToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

const get = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${STAFF_API_CONFIG.BASE_URL}${path}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.message || "Failed to fetch notifications");
  }
  return response.json();
};

const patch = async <T>(path: string, body?: unknown): Promise<T> => {
  const response = await fetch(`${STAFF_API_CONFIG.BASE_URL}${path}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.message || "Request failed");
  }
  return response.json();
};

export const notificationService = {
  getSummary() {
    return get<{ data: NotificationSummary }>("/api/notifications/summary");
  },

  getRecent(limit = 20) {
    return get<{ data: { notifications: PortalNotification[] } }>(
      `/api/notifications?limit=${limit}`
    );
  },

  /** PATCH /api/notifications/:id/read */
  markAsRead(id: string) {
    return patch<{ success: boolean }>(`/api/notifications/${id}/read`);
  },

  /** PATCH /api/notifications/read-all */
  markAllAsRead() {
    return patch<{ success: boolean }>("/api/notifications/read-all");
  },
};
