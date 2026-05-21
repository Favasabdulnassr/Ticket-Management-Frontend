import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: we no longer attach the token manually, 
// the browser handles HttpOnly cookies.
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 Unauthorized (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not intercept 401s for login or refresh endpoints
    if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Our backend now reads the refresh_token cookie automatically
        await axios.post(`${API_BASE_URL}/auth/refresh/`, {}, { withCredentials: true });
        // The backend set a new access_token cookie, retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token also expired or invalid - force logout if not already on auth pages
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
