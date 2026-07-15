"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { handleResetPassword } from "@/lib/actions/auth_action";

export default function ResetPassword() {
  const router = useRouter();
  const { token: rawToken } = useParams();
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (!token) throw new Error("Invalid reset token");
      const res = await handleResetPassword(token, password);
      if (res.success) {
        setMessage(res.message || "Password reset successful");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(res.message || "Failed to reset password");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md mx-auto mt-10">
      <h2 className="text-lg font-bold text-center">Reset Password</h2>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">New Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
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
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}
