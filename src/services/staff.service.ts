import STAFF_API_CONFIG from '../config/api.config';

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
  message?: string;
  data?: {
    success?: boolean;
    message?: string;
    sessionId?: string;
    mfaCode?: string;
    requiresMFA?: boolean;
    token?: string;
    user?: {
      id: string;
      email: string;
      role: string;
      name: string;
    };
  };
}

class StaffService {
  private baseUrl = STAFF_API_CONFIG.BASE_URL;
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('staffToken');
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private normalizeErrorMessage(message: string, status?: number) {
    const text = String(message || '').trim();

    if (status === 502 || text === 'Gateway error') {
      return 'Staff service is unavailable right now. Start the backend admin-service on port 4008 and try again.';
    }

    if (status === 500 && !text) {
      return 'Staff login failed due to a server error. Please check the backend services and try again.';
    }

    return text || 'Request failed. Please try again.';
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    body?: any,
    includeAuth = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Always use the stored platform JWT (from /api/auth/verify), NOT Firebase idToken.
    // Firebase idToken is only used during login to get the platform JWT.
    // Re-read from localStorage in case it was updated by StaffContext.
    if (includeAuth) {
      const stored = localStorage.getItem('staffToken');
      if (stored) this.token = stored;
    }

    const options: RequestInit = {
      method,
      headers: this.getHeaders(includeAuth),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Create error object with response data
        const error: any = new Error(this.normalizeErrorMessage(data.message || data.error, response.status));
        error.response = { data, status: response.status };
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error(`Request failed: ${endpoint}`, error);
      // Preserve response data in error
      if (!error.response && error.message) {
        error.response = { data: { message: error.message } };
      }
      throw error;
    }
  }

  async login(email: string, password: string, role: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      STAFF_API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      'POST',
      { email, password, role },
      false
    );

    if (response.token) {
      this.token = response.token;
      localStorage.setItem('staffToken', response.token);
    }

    return response;
  }

  async verifyMFA(code: string, sessionId: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      STAFF_API_CONFIG.ENDPOINTS.AUTH.MFA_VERIFY,
      'POST',
      { code, sessionId }
    );

    if (response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('staffToken', response.data.token);
    }

    return response;
  }

  async logout(): Promise<{ success: boolean }> {
    await this.request(STAFF_API_CONFIG.ENDPOINTS.AUTH.LOGOUT, 'POST');
    this.token = null;
    localStorage.removeItem('staffToken');
    return { success: true };
  }

  async getSession(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.AUTH.SESSION, 'GET');
  }

  async getSessions(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.AUTH.SESSIONS, 'GET');
  }

  async killSession(sessionId: string): Promise<{ success: boolean }> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.AUTH.KILL_SESSION(sessionId),
      'DELETE'
    );
  }

  // ==================== RBAC APIs ====================

  async getUserRole(userId: string): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.RBAC.USER_ROLE(userId), 'GET');
  }

  async getPermissions(role: string): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.RBAC.PERMISSIONS(role), 'GET');
  }

  async assignRole(userId: string, role: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.RBAC.ASSIGN_ROLE,
      'POST',
      { userId, role }
    );
  }

  // ==================== TASK APIs ====================

  async getTasks(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.TASKS.LIST, 'GET');
  }

  async getTaskDetail(taskId: string): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.TASKS.DETAIL(taskId), 'GET');
  }

  async completeTask(taskId: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.TASKS.COMPLETE(taskId),
      'POST'
    );
  }

  async assignTask(taskId: string, assigneeId: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.TASKS.ASSIGN(taskId),
      'POST',
      { assigneeId }
    );
  }

  // ==================== ORDER APIs ====================

  async getOrderQueue(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.ORDERS.QUEUE, 'GET');
  }

  async getAssignableVendors(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.ORDERS.VENDORS, 'GET');
  }

  async getOrderDetail(orderId: string): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.ORDERS.DETAIL(orderId), 'GET');
  }

  async reassignVendor(orderId: string, newVendorId: string, reason: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.ORDERS.REASSIGN_VENDOR(orderId),
      'POST',
      { newVendorId, reason }
    );
  }

  async raiseClarification(orderId: string, message: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.ORDERS.CLARIFICATION(orderId),
      'POST',
      { message }
    );
  }

  // ==================== SUPPORT APIs ====================

  async getTickets(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.SUPPORT.TICKETS, 'GET');
  }

  async getTicketDetail(ticketId: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.SUPPORT.TICKET_DETAIL(ticketId),
      'GET'
    );
  }

  async replyTicket(ticketId: string, message: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.SUPPORT.REPLY(ticketId),
      'POST',
      { message }
    );
  }

  async closeTicket(ticketId: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.SUPPORT.CLOSE(ticketId),
      'POST'
    );
  }

  async escalateTicket(ticketId: string, reason: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.SUPPORT.ESCALATE(ticketId),
      'POST',
      { reason }
    );
  }

  async getVendorTickets(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.SUPPORT.VENDOR_TICKETS, 'GET');
  }

  async replyVendorTicket(ticketId: string, message: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.SUPPORT.VENDOR_REPLY(ticketId),
      'POST',
      { message }
    );
  }

  // ==================== FINANCE APIs ====================

  async getRefunds(status?: string): Promise<any> {
    const q = status ? `?status=${encodeURIComponent(status)}` : "";
    return this.request(`${STAFF_API_CONFIG.ENDPOINTS.FINANCE.REFUNDS}${q}`, 'GET');
  }

  async approveRefund(refundId: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.FINANCE.APPROVE_REFUND(refundId),
      'POST'
    );
  }

  async escalateRefund(refundId: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.FINANCE.ESCALATE_REFUND(refundId),
      'POST'
    );
  }

  async creditWallet(userId: string, amount: number, reason?: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.FINANCE.CREDIT_WALLET,
      'POST',
      { userId, amount, reason }
    );
  }

  async debitWallet(userId: string, amount: number, reason?: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.FINANCE.DEBIT_WALLET,
      'POST',
      { userId, amount, reason }
    );
  }

  async getWalletLedger(params?: { userId?: string; category?: string; page?: number; limit?: number }): Promise<any> {
    const q = new URLSearchParams();
    if (params?.userId)   q.append('userId',   params.userId);
    if (params?.category) q.append('category', params.category);
    if (params?.page)     q.append('page',     String(params.page));
    if (params?.limit)    q.append('limit',    String(params.limit));
    const qs = q.toString();
    return this.request(`${STAFF_API_CONFIG.ENDPOINTS.FINANCE.WALLET_LEDGER}${qs ? `?${qs}` : ''}`, 'GET');
  }
  // ==================== PAYOUT APIs ====================

  async getPayouts(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.FINANCE.PAYOUTS, 'GET');
  }

  async issuePayoutTicket(payoutId: string, issueDetails: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.FINANCE.ISSUE_PAYOUT_TICKET,
      'POST',
      { payoutId, issueDetails }
    );
  }

  // ==================== MARKETING APIs ====================

  async getCoupons(params?: { isActive?: boolean; search?: string; page?: number; limit?: number }): Promise<any> {
    const q = new URLSearchParams();
    if (params?.isActive !== undefined) q.append('isActive', String(params.isActive));
    if (params?.search) q.append('search', params.search);
    if (params?.page)   q.append('page',   String(params.page));
    if (params?.limit)  q.append('limit',  String(params.limit));
    const qs = q.toString();
    return this.request(`${STAFF_API_CONFIG.ENDPOINTS.MARKETING.COUPONS}${qs ? `?${qs}` : ''}`, 'GET');
  }

  async createCoupon(couponData: {
    code: string;
    description?: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    maxDiscount?: number;
    minOrderValue?: number;
    applicableFlows?: string[];
    usageLimit?: number;
    perUserLimit?: number;
    isActive?: boolean;
    expiresAt?: string;
  }): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.MARKETING.COUPONS, 'POST', couponData);
  }

  // ==================== ESCALATION APIs ====================

  async triggerEscalation(entityId: string, type: string, reason: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.ESCALATION.TRIGGER,
      'POST',
      { entityId, type, reason }
    );
  }

  async getEscalations(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.ESCALATION.LIST, 'GET');
  }

  // ==================== AUDIT APIs ====================

  async getAuditLogs(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.AUDIT.LOGS, 'GET');
  }

  async getActivityLogs(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.AUDIT.ACTIVITY, 'GET');
  }

  async getPerformanceMetrics(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.AUDIT.PERFORMANCE, 'GET');
  }

  // ==================== SYSTEM APIs ====================

  async getSystemStatus(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.SYSTEM.STATUS, 'GET');
  }

  async checkPermissions(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.SYSTEM.PERMISSIONS_CHECK, 'GET');
  }

  async conflictLock(resourceId: string, lockType: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.SYSTEM.CONFLICT_LOCK,
      'POST',
      { resourceId, lockType }
    );
  }

  // ==================== PROFILE APIs ====================

  /** GET /api/staff/profile — apna profile */
  async getMyProfile(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.PROFILE.ME, 'GET');
  }

  /** PATCH /api/staff/profile — apna profile update
   *  Accepted fields per backend spec:
   *  fullName (alias: name), emailAddress (alias: email),
   *  permissions, mfaEnabled, department, manager, memberSince (alias: joinDate)
   *  NOTE: role and status cannot be changed by self.
   */
  async updateMyProfile(data: {
    fullName?: string;
    emailAddress?: string;
    permissions?: string[];
    mfaEnabled?: boolean;
    department?: string;
    manager?: string;
    memberSince?: string;
  }): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.PROFILE.UPDATE_ME, 'PATCH', data);
  }

  /** GET /api/staff/profiles — all staff (admin only) */
  async listProfiles(params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }): Promise<any> {
    const q = new URLSearchParams();
    if (params?.role)   q.append('role',   params.role);
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    if (params?.page)   q.append('page',   String(params.page));
    if (params?.limit)  q.append('limit',  String(params.limit));
    const qs = q.toString();
    return this.request(`${STAFF_API_CONFIG.ENDPOINTS.PROFILE.LIST}${qs ? `?${qs}` : ''}`, 'GET');
  }

  /** POST /api/staff/profiles — create staff (admin only) */
  async createProfile(data: {
    fullName: string; emailAddress: string; password: string;
    role?: string; permissions?: string[]; mfaEnabled?: boolean;
    status?: string; department?: string; manager?: string; memberSince?: string;
  }): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.PROFILE.CREATE, 'POST', data);
  }

  /** GET /api/staff/profiles/:id — get by id (admin only) */
  async getProfileById(id: string): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.PROFILE.GET(id), 'GET');
  }

  /** PATCH /api/staff/profiles/:id — update by id (admin only) */
  async updateProfileById(id: string, data: Record<string, any>): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.PROFILE.UPDATE(id), 'PATCH', data);
  }

  /** DELETE /api/staff/profiles/:id — delete (admin only) */
  async deleteProfile(id: string): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.PROFILE.DELETE(id), 'DELETE');
  }

  // ==================== UTILITY ====================

  async getDashboard(role: string): Promise<any> {
    return this.request(`${STAFF_API_CONFIG.ENDPOINTS.DASHBOARD.GET}?role=${role}`, 'GET');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('staffToken', token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('staffToken');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export default new StaffService();
