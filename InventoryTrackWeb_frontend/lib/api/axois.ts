import axios from "axios";

// If NEXT_PUBLIC_BACKEND_URL is not defined, use same origin (empty string)
export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 30000, // 30 seconds timeout (longer for slow VMs)
    headers: {
        "Content-Type": "application/json",
    },
});

// Set header from localStorage on module init (client only)
if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
}

// Request interceptor: attach auth token from localStorage
axiosInstance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers = config.headers ?? {};
            config.headers["Authorization"] = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor: just pass errors through (no auto-redirect)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
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
