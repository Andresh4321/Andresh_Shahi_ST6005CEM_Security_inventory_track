import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000') + '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF token storage
let csrfToken: string | null = null;

// Fetch CSRF token from backend
async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await apiClient.get("/auth/csrf-token");
    const token = response.data?.csrfToken || response.data?.token;
    if (token) {
      csrfToken = token;
    }
    return csrfToken;
  } catch {
    return null;
  }
}

// Initialize CSRF token on client side only if user is already authenticated
if (typeof window !== "undefined") {
  const existingToken = localStorage.getItem("auth_token");
  if (existingToken) {
    fetchCsrfToken();
  }
}

// Add token to headers if available - using 'auth_token' which is set by login
// Also attach CSRF token to mutating requests
apiClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach CSRF token to mutating requests (POST, PUT, DELETE, PATCH)
  // Skip for unauthenticated users (no point fetching CSRF without auth)
  const method = (config.method || "").toUpperCase();
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method) && token) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
  }

  return config;
});

// Handle token expiration and CSRF errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Refresh CSRF token on 403 CSRF errors and retry once
    if (
      error.response?.status === 403 &&
      error.response?.data?.message?.toLowerCase().includes("csrf") &&
      !originalRequest._csrfRetry
    ) {
      originalRequest._csrfRetry = true;
      await fetchCsrfToken();
      if (csrfToken) {
        originalRequest.headers["X-CSRF-Token"] = csrfToken;
      }
      return apiClient(originalRequest);
    }

    if (error.response?.status === 401) {
      // Just log the error - don't auto-redirect (causes refresh loops)
      // Let individual pages handle auth state
      console.warn('API returned 401 - token may be expired');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
