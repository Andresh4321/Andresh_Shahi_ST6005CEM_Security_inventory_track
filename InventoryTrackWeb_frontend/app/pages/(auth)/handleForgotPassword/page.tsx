"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      setMessage(result.message || "Check your email for password reset instructions");
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Forgot Password?</h2>
        <p className="text-muted-foreground">Enter your email to receive password reset instructions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <p className="text-sm text-green-600 text-center bg-green-50 dark:bg-green-950 p-3 rounded-md">
            {message}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 text-center bg-red-50 dark:bg-red-950 p-3 rounded-md">
            {error}
          </p>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
            placeholder="you@example.com"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-10 w-full rounded-md text-background bg-teal-600 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="text-center text-sm">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold hover:underline text-teal-600"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
