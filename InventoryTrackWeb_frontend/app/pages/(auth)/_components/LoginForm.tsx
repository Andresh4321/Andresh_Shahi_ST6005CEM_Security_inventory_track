"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoginData, loginSchema } from "../schema";
import { handleLogin } from "@/lib/actions/auth_action";
import { setAuthTokenClient } from "@/lib/api/axois";

export default function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });
  const [pending, setTransition] = useTransition();
  const [error, setError] = useState("");

  const onSubmit = async (data: LoginData) => {
    setError("");
    try {
      const result = await handleLogin(data);
      if (!result.success) {
        throw new Error(result.message);
      }
      const user = result.data?.user ?? result.data;
      const token = result.token ?? result.data?.token;
      if (user) {
        localStorage.setItem("inventorytrack_user", JSON.stringify(user));
      }
      if (token) {
        setAuthTokenClient(token);
      }
      router.push("/dashboard");
    } catch (err: Error | any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
         {/* General error message */}
      {error && (
        <p className="mt-1 text-xs text-red-600 text-center">{error}</p>
      )}
      {/* Email */}
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
          {...register("email")}
          placeholder="you@example.com"
        />
        {errors.email?.message && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
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
        {/* Show Forgot Password link only if login fails */}
        {error && (
          <div className="mt-1 text-right">
            <Link
              href="/handleForgotPassword"
              className="text-xs text-teal-500 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || pending}
        className="h-10 w-full rounded-md text-white bg-teal-600 text-sm font-semibold hover:bg-teal-700 disabled:opacity-60 transition-colors"
      >
        {isSubmitting || pending ? "Logging in..." : "Log in"}
      </button>

      {/* Sign Up */}
      <div className="mt-1 text-center text-sm">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-semibold hover:underline text-teal-500"
        >
          Sign up
        </Link>
      </div>

     
    </form>
  );
}
