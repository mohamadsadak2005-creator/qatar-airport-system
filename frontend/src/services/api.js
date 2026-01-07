/**
 * API Service - Handle all backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to set default headers
const getHeaders = (withAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (withAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    withAuth = true,
    ...otherOptions
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    method,
    headers: getHeaders(withAuth),
    ...otherOptions,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};

// Auth API endpoints
export const authAPI = {
  login: (username, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: { username, password },
      withAuth: false,
    }),

  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
      withAuth: false,
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

  getCurrentUser: () =>
    apiRequest('/auth/profile', {
      method: 'GET',
    }),

  updateProfile: (profileData) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: profileData,
    }),

  changePassword: (oldPassword, newPassword) =>
    apiRequest('/auth/change-password', {
      method: 'PUT',
      body: { oldPassword, newPassword },
    }),
};

// Health Data API endpoints
export const healthAPI = {
  addRecord: (record) =>
    apiRequest('/medical/record', {
      method: 'POST',
      body: record,
    }),

  getRecords: () =>
    apiRequest('/medical/records', {
      method: 'GET',
    }),

  updateRecord: (recordId, data) =>
    apiRequest(`/medical/record/${recordId}`, {
      method: 'PUT',
      body: data,
    }),

  deleteRecord: (recordId) =>
    apiRequest(`/medical/record/${recordId}`, {
      method: 'DELETE',
    }),

  getBloodSugarHistory: () =>
    apiRequest('/medical/blood-sugar/history', {
      method: 'GET',
    }),

  getBloodPressureHistory: () =>
    apiRequest('/medical/blood-pressure/history', {
      method: 'GET',
    }),

  addBloodSugar: (data) =>
    apiRequest('/medical/blood-sugar', {
      method: 'POST',
      body: data,
    }),

  addBloodPressure: (data) =>
    apiRequest('/medical/blood-pressure', {
      method: 'POST',
      body: data,
    }),

  getLatestReadings: () =>
    apiRequest('/medical/latest', {
      method: 'GET',
    }),

  searchRecords: (query) =>
    apiRequest(`/medical/search?q=${query}`, {
      method: 'GET',
    }),

  getMedicalAnalysis: () =>
    apiRequest('/medical/analysis', {
      method: 'GET',
    }),

  getMedicalStats: () =>
    apiRequest('/medical/stats', {
      method: 'GET',
    }),
};

// AI API endpoints
export const aiAPI = {
  chat: (message) =>
    apiRequest('/ai/chat', {
      method: 'POST',
      body: { message },
    }),

  analyzeText: (text) =>
    apiRequest('/ai/analyze', {
      method: 'POST',
      body: { text },
    }),

  conversation: (data) =>
    apiRequest('/ai/conversation', {
      method: 'POST',
      body: data,
    }),

  generateImage: (prompt) =>
    apiRequest('/ai/generate-image', {
      method: 'POST',
      body: { prompt },
    }),
};

// Analytics API endpoints
export const analyticsAPI = {
  getComprehensiveAnalytics: () =>
    apiRequest('/analytics/comprehensive', {
      method: 'GET',
    }),

  getTrendAnalysis: () =>
    apiRequest('/analytics/trends', {
      method: 'GET',
    }),

  getRiskReport: () =>
    apiRequest('/analytics/risk-report', {
      method: 'GET',
    }),

  getPeriodComparison: () =>
    apiRequest('/analytics/comparison', {
      method: 'GET',
    }),

  getUsageStats: () =>
    apiRequest('/analytics/usage', {
      method: 'GET',
    }),

  getPredictions: () =>
    apiRequest('/analytics/predictions', {
      method: 'GET',
    }),

  getDashboard: () =>
    apiRequest('/analytics/dashboard', {
      method: 'GET',
    }),
};

export default {
  authAPI,
  healthAPI,
  aiAPI,
  analyticsAPI,
};
