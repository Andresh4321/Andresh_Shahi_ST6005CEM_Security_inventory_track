"use client";

import { useState } from "react";
import { handleForgotPassword } from "@/lib/actions/auth_action";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");         // store user input
  const [error, setError] = useState("");         // for error messages
  const [message, setMessage] = useState("");     // for success messages
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await handleForgotPassword(email);
      if (res.success) {
        setMessage(res.message || "Check your email for reset link");
      } else {
        setError(res.message || "Failed to send reset email");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md mx-auto mt-10">
      <h2 className="text-lg font-bold text-center">Forgot Password</h2>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full h-10 rounded-md border px-3 text-sm outline-none focus:border-teal-500"
          required
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {message && <p className="text-green-600 text-sm">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 bg-teal-600 text-white rounded-md hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
}
