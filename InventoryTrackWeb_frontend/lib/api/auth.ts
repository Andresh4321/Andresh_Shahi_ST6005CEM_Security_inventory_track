//API Layer
//Call api from backend

import axios from "./axois";
import { API } from "./endpoints";

export const register = async (registerData: any) => {
    try {
        const response = await axios.post(
            API.AUTH.REGISTER, //API path '/api/auth/register'
            registerData // body.data
        );
        return response.data; //what the backend-controller returns
    } catch (err: Error | any) {
        // 4xx or 5xx counts as exception
        throw new Error(
            err.response?.data?.message // message from abckend)
            || err.message //genreal message
            || "REegistration failed" //fallback message
        );
    }
};

export const login = async (loginData: any) => {
    try {
        const response = await axios.post(
            API.AUTH.LOGIN, //API path '/api/auth/register'
            loginData // body.data
        );
        return response.data; //what the backend-controller returns
    } catch (err: Error | any) {
        // 4xx or 5xx counts as exception
        throw new Error(
            err.response?.data?.message // message from abckend)
            || err.message //genreal message
            || "Login failed" //fallback message
        );
    }
};

export const admin = async (adminData: any) => {
    try {
        // ensure role is set so backend validation expecting "admin" passes
        const payload = { ...(adminData || {}), role: adminData?.role ?? "admin" };
        const response = await axios.post(API.ADMIN.ADMINLOGIN, payload);

        const data = response.data;

        // Keep expected auth failures as normal responses (avoid noisy thrown errors in UI flow)
        if (data && data.success === false) {
            const m = data.message ?? (typeof data === "object" ? JSON.stringify(data) : String(data));
            return { success: false, message: m };
        }

        return data;
    } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
            const d = err?.response?.data;
            const message = d?.message || "Access denied: Admins only";
            return { success: false, message };
        }

        // If there's no response object it's likely a network/connection/CORS error
        const base = axios.defaults?.baseURL ?? "(same origin)";
        if (!err?.response || err?.message === "Network Error") {
            throw new Error(
                `Network Error: could not reach backend (${base}). Ensure backend is running and CORS is configured. Original: ${err?.message ?? String(err)}`
            );
        }

        // Fallback: surface backend message or stringify payload
        let message = "Admin Login failed";
        if (err?.response?.data) {
            const d = err.response.data;
            message = d.message ?? (typeof d === "object" ? JSON.stringify(d) : String(d));
        } else if (err?.message) {
            message = err.message;
        }
        throw new Error(message);
    }
};

// NEW: get all admin users
// lib/api/auth.ts

// Get all admin users with pagination
export const getAllAdminUsers = async (page = 1, limit = 10) => {
    try {
        const response = await axios.get(`${API.ADMIN.ADMIN}?page=${page}&limit=${limit}`);
        return response.data; 
        // Expected response from backend:
        // { users: [...], total: 12, page: 1, totalPages: 2, message: "Users Retrieved Successfully" }
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch users"
        );
    }
};

// Get user by phone number
export const getUserByPhone = async (phoneNumber: string) => {
    try {
        const response = await axios.get(`${API.ADMIN.ADMIN}/search?phone=${phoneNumber}`);
        return response.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to search user by phone"
        );
    }
};


// helper: simple ObjectId (24 hex chars) validator
const isValidObjectId = (id: any) =>
  typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

// NEW: get single admin user by id (validated)
export const getAdminUser = async (id: string) => {
    if (!isValidObjectId(id)) {
        throw new Error(`Invalid user id: ${String(id)}`);
    }
    try {
        const response = await axios.get(API.ADMIN.GET_USER(id));
        return response.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch user"
        );
    }
};

// NEW: delete admin user (validated)
export const deleteAdminUser = async (id: string) => {
    if (!isValidObjectId(id)) {
        throw new Error(`Invalid user id: ${String(id)}`);
    }
    try {
        const response = await axios.delete(API.ADMIN.DELETE_USER(id));
        return response.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to delete user"
        );
    }
};

// NEW: create admin user
export const createAdminUser = async (data: any) => {
    try {
        const response = await axios.post(API.ADMIN.CREATE_USER(), data);
        return response.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to create user"
        );
    }
};

// NEW: update admin user (validated)
export const updateAdminUser = async (id: string, data: any) => {
    if (!isValidObjectId(id)) {
        throw new Error(`Invalid user id: ${String(id)}`);
    }
    try {
        const response = await axios.put(API.ADMIN.UPDATE_USER(id), data);
        return response.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to update user"
        );
    }
};
// Send forgot password email
export const forgotPassword = async (email: string) => {
    try {
        const response = await axios.post(API.AUTH.FORGOT_PASSWORD, { email });
        return response.data; // backend returns { success: true, message: "Email sent" }
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to send reset email"
        );
    }
};

// Reset password with token
export const resetPassword = async (token: string, password: string) => {
    try {
        const response = await axios.post(API.AUTH.RESET_PASSWORD(token), { password });
        return response.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to reset password"
        );
    }
};

// Update user profile image
export const updateUserImage = async (id: string, formData: FormData) => {
    try {
        const response = await axios.put(`/admin/users/${id}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to update profile image"
        );
    }
};

// Upload profile image for the currently authenticated user
export const uploadProfilePhoto = async (formData: FormData) => {
    try {
        const response = await axios.post('/api/auth/upload-photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to upload profile image"
        );
    }
};

// Update current user's profile (name and phone only)
export const updateProfile = async (id: string, data: { fullname?: string; phone_number?: string }) => {
    try {
        const response = await axios.put(`/api/auth/${id}`, data);
        return response.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to update profile"
        );
    }
};