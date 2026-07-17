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
import GoogleLoginButton from "./GoogleLoginButton";

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
  const [mfaRequired, setMfaRequired] = useState(false);
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState("");
  const [passwordExpired, setPasswordExpired] = useState(false);

  const onSubmit = async (data: LoginData) => {
    setError("");
    setLockoutMessage("");
    setPasswordExpired(false);

    try {
      const result = await handleLogin(data);

      // Handle MFA required response
      if (result.mfaRequired) {
        setMfaRequired(true);
        setShowMfaInput(true);
        return;
      }

      // Handle password expired response
      if (result.passwordExpired) {
        setPasswordExpired(true);
        router.push("/Setting?tab=change-password");
        return;
      }

      // Handle account locked response
      if (result.accountLocked) {
        const remainingMinutes = result.lockoutRemainingMinutes || 15;
        setLockoutMessage(
          `Account is temporarily locked due to too many failed login attempts. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`
        );
        return;
      }

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
      const msg = err.message || "Login failed";
      // Check if the error message indicates account lockout
      if (msg.toLowerCase().includes("locked") || msg.toLowerCase().includes("too many")) {
        setLockoutMessage(msg);
      } else {
        setError(msg);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* General error message */}
      {error && (
        <p className="mt-1 text-xs text-red-600 text-center">{error}</p>
      )}

      {/* Account locked message */}
      {lockoutMessage && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-700 text-center font-medium">
            {lockoutMessage}
          </p>
        </div>
      )}

      {/* Password expired message */}
      {passwordExpired && (
        <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200">
          <p className="text-sm text-yellow-700 text-center">
            Your password has expired. Redirecting to change password...
          </p>
        </div>
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

      {/* MFA Token Input - shown when MFA is required */}
      {showMfaInput && (
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="mfaToken">
            Two-Factor Authentication Code
          </label>
          <input
            id="mfaToken"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground/40 tracking-widest text-center font-mono"
            {...register("mfaToken")}
            placeholder="000000"
            maxLength={6}
          />
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || pending}
        className="h-10 w-full rounded-md text-white bg-teal-600 text-sm font-semibold hover:bg-teal-700 disabled:opacity-60 transition-colors"
      >
        {isSubmitting || pending
          ? "Logging in..."
          : mfaRequired
          ? "Verify & Log in"
          : "Log in"}
      </button>

      {/* OAuth Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-black/10 dark:border-white/15" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Google OAuth Login */}
      <GoogleLoginButton
        onError={(msg) => setError(msg)}
        onSuccess={() => {}}
      />

      {/* Sign Up */}
      <div className="mt-1 text-center text-sm">
        Don&apos;t have an account?{" "}
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
