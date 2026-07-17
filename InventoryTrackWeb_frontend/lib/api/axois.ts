import axios from "axios";

// If NEXT_PUBLIC_BACKEND_URL is not defined, use same origin (empty string)
export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

const axiosInstance = axios.create({
    baseURL: BASE_URL, // empty => same origin
    withCredentials: true,
    timeout: 10000, // ms
    headers: {
        "Content-Type": "application/json",
    },
});

// CSRF token storage
let csrfToken: string | null = null;

// Fetch CSRF token from backend
async function fetchCsrfToken(): Promise<string | null> {
    try {
        const response = await axiosInstance.get("/api/auth/csrf-token");
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

// Set header from localStorage on module init (client only)
if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
}

// Auth endpoints that should NOT wait for CSRF token (user isn't authenticated yet)
const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/admin/login', '/api/auth/google', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/auth/mfa/verify-login'];

// Request interceptor: ensure latest token is applied and attach CSRF token
axiosInstance.interceptors.request.use(async (config) => {
    if (typeof window !== "undefined") {
        // Attach auth token
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers = config.headers ?? {};
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        // Attach CSRF token to mutating requests (POST, PUT, DELETE, PATCH)
        // BUT skip for auth endpoints where user isn't logged in yet
        const method = (config.method || "").toUpperCase();
        const url = config.url || "";
        const isAuthEndpoint = AUTH_ENDPOINTS.some(ep => url.includes(ep));

        if (["POST", "PUT", "DELETE", "PATCH"].includes(method) && !isAuthEndpoint) {
            // Only fetch CSRF if user is authenticated
            if (!csrfToken && token) {
                await fetchCsrfToken();
            }
            if (csrfToken) {
                config.headers = config.headers ?? {};
                config.headers["X-CSRF-Token"] = csrfToken;
            }
        }
    }
    return config;
});

// Response interceptor: refresh CSRF token on 403 CSRF errors
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // If we get a 403 with CSRF-related message, refresh the token and retry once
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
            return axiosInstance(originalRequest);
        }
        return Promise.reject(error);
    }
);

export function setAuthTokenClient(token: string | null) {
    if (typeof window === "undefined") return;
    if (token) {
        localStorage.setItem("auth_token", token);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        localStorage.removeItem("auth_token");
        delete axiosInstance.defaults.headers.common["Authorization"];
    }
}

export default axiosInstance;
