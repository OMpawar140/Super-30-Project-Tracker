import { auth } from '../lib/firebase';

const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token for API calls
const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

// Generic API call function
const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const token = await getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

// API service object
export const apiService = {
  // Auth endpoints
  auth: {
    
   
    emailRegister: (email: string) =>
      apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    // Verify current token
    verifyToken: () => apiCall('/auth/verify-token', { method: 'POST' }),
    
    // Get user profile
    getProfile: () => apiCall('/auth/profile'),
    
    // Logout (revoke tokens)
    logout: () => apiCall('/auth/logout', { method: 'POST' }),
    
    // Create custom token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createCustomToken: (claims: Record<string, any>) =>
      apiCall('/auth/custom-token', {
        method: 'POST',
        body: JSON.stringify({ claims }),
      }),
  },

  // Public endpoints (no auth required)
  public: {
    // Get public data
    getPublicData: () => apiCall('/public'),
    
    // Get feed (with optional auth)
    getFeed: () => apiCall('/feed'),
  },

  // Protected endpoints (auth required)
  protected: {
    // Get dashboard data
    getDashboard: () => apiCall('/dashboard'),
    
    // Get user settings
    getUserSettings: () => apiCall('/user/settings'),
    
    // Update user settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateUserSettings: (settings: Record<string, any>) =>
      apiCall('/user/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      }),
  },

  // Admin endpoints (admin role required)
  admin: {
    // Get admin data
    getAdminData: () => apiCall('/admin/users'),
  },
};

// Custom hook for API calls with loading and error states
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callApi = async (apiFunction: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { callApi, loading, error };
};

// React hook import (add this to your imports)
import { useState } from 'react';

export default apiService;