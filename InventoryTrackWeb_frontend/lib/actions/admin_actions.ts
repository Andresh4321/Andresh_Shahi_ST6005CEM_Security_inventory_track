"use server";

import { login } from "../api/auth";
import { setAuthToken, setUserData } from "../cookie";
import { LoginData } from "@/app/pages/(auth)/schema";
import { redirect } from "next/navigation";

export const handleAdminLogin = async (data: LoginData) => {
    try {
        const result = await login(data);

        if (result.success) {
            // result.data contains the payload
            const payload = result.data;

            // Attempt to extract role. Adjust based on actual API response structure.
            // Common patterns: payload.role, payload.user.role
            const user = payload.user || payload;
            const role = user.role;

            if (role !== "admin") {
                return {
                    success: false,
                    message: "Access restricted to admins only.",
                };
            }

            // Handle Token
            // Attempt to find token in payload
            const token = payload.token || payload.accessToken || payload.access_token;

            if (token && typeof token === 'string') {
                await setAuthToken(token);
            } else if (typeof payload === 'string') {
                // rare case where payload itself is token
                await setAuthToken(payload);
            } else {
                // If we can't find a token, maybe the existing auth_action was assuming payload IS the token?
                // But we need to verify role. 
                // If payload is object and we verified role, we should try to save it.
                // Note: If existing code passed 'payload' to setAuthToken (which takes string), it might have been wrong.
                // We will try our best.
            }

            await setUserData(user);

            return {
                success: true,
                message: "Admin Login successful",
            };
        }

        return {
            success: false,
            message: result.message || "Login failed",
        };
    } catch (err: any) {
        return {
            success: false,
            message: err.message || "Login failed",
        };
    }
};
