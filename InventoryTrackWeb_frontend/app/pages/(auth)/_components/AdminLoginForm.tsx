"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoginData, loginSchema } from "../schema";
import { admin as adminLogin } from "@/lib/api/auth";
import { setAuthTokenClient } from "@/lib/api/axois"; // new helper

export default function AdminLoginForm() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        mode: "onSubmit",
    });
    const [pending, startTransition] = useTransition();

    const [error, setError] = useState("");

    const onSubmit = async (data: LoginData) => {
        setError(""); // reset error
        try {
            const result = await adminLogin({ ...data, role: "admin" });

            if (result && result.success === false) {
                setError(result.message || "Access denied: Admins only");
                return;
            }

            const user = result?.data?.user ?? result?.user ?? result?.data ?? result;
            const token = result?.data?.token ?? result?.token ?? undefined;
            const role = user?.role ?? undefined;

            if (!user || Object.keys(user).length === 0) {
                setError("Login succeeded but server returned no user data.");
                return;
            }

            if (!role) {
                setError("Login succeeded but role information is missing from response.");
                return;
            }

            if (role !== "admin") {
                setError("Access denied: You do not have admin access.");
                return;
            }

            // Persist token and user on client so subsequent API calls include Authorization header
            if (token) {
                try {
                    setAuthTokenClient(token);
                    localStorage.setItem("user", JSON.stringify(user));
                } catch {
                    // ignore storage warnings for login flow
                }
            }

            // Admin user → redirect to the admin dashboard (users list)
            startTransition(() => {
                router.push("/admin/users");
            });

        } catch (err: any) {
            const msg = String(err?.message ?? err);
            if (msg.includes("Network Error") || msg.includes("could not reach backend")) {
                setError("Network Error: unable to reach backend. Check NEXT_PUBLIC_BACKEND_URL and CORS.");
            } else {
                setError(msg || "Login failed");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}
            <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
                    {...register("email")}
                    placeholder="admin@example.com"
                />
                {errors.email?.message && (
                    <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
                    {...register("password")}
                    placeholder="••••••"
                />
                {errors.password?.message && (
                    <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting || pending}
                className="h-10 w-full rounded-md text-white bg-teal-600 text-sm font-semibold hover:bg-teal-700 disabled:opacity-60 transition-colors"
            >
                {isSubmitting || pending ? "Checking permissions..." : "Access Admin Panel"}
            </button>
        </form>
    );
}
