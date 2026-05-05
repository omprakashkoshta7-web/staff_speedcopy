// API Debug Utility
// Use this to test API endpoints and see responses

export const testDashboardAPI = async (role: string, token: string) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const endpoint = `/api/staff/dashboard?role=${role}`;
  const url = `${baseUrl}${endpoint}`;

  console.group('🔍 Dashboard API Test');
  console.log('URL:', url);
  console.log('Role:', role);
  console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Status:', response.status, response.statusText);
    
    const data = await response.json().catch(() => ({}));
    console.log('Response Data:', data);

    if (!response.ok) {
      console.error('❌ API Error:', data.message || data.error);
    } else {
      console.log('✅ API Success');
    }

    console.groupEnd();
    return { success: response.ok, data, status: response.status };
  } catch (error: any) {
    console.error('❌ Network Error:', error.message);
    console.groupEnd();
    return { success: false, error: error.message };
  }
};

export const testOrdersAPI = async (token: string) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const endpoint = '/api/staff/orders';
  const url = `${baseUrl}${endpoint}`;

  console.group('🔍 Orders API Test');
  console.log('URL:', url);
  console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Status:', response.status, response.statusText);
    
    const data = await response.json().catch(() => ({}));
    console.log('Response Data:', data);

    if (!response.ok) {
      console.error('❌ API Error:', data.message || data.error);
    } else {
      console.log('✅ API Success');
      console.log('Orders Count:', Array.isArray(data.data) ? data.data.length : 0);
    }

    console.groupEnd();
    return { success: response.ok, data, status: response.status };
  } catch (error: any) {
    console.error('❌ Network Error:', error.message);
    console.groupEnd();
    return { success: false, error: error.message };
  }
};

export const testTicketsAPI = async (token: string) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const endpoint = '/api/staff/tickets';
  const url = `${baseUrl}${endpoint}`;

  console.group('🔍 Tickets API Test');
  console.log('URL:', url);
  console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Status:', response.status, response.statusText);
    
    const data = await response.json().catch(() => ({}));
    console.log('Response Data:', data);

    if (!response.ok) {
      console.error('❌ API Error:', data.message || data.error);
    } else {
      console.log('✅ API Success');
      console.log('Tickets Count:', Array.isArray(data.data?.tickets) ? data.data.tickets.length : 0);
    }

    console.groupEnd();
    return { success: response.ok, data, status: response.status };
  } catch (error: any) {
    console.error('❌ Network Error:', error.message);
    console.groupEnd();
    return { success: false, error: error.message };
  }
};

// Add this to window for easy testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testStaffAPI = {
    dashboard: testDashboardAPI,
    orders: testOrdersAPI,
    tickets: testTicketsAPI,
  };
}
