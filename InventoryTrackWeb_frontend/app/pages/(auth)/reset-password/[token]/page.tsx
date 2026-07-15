"use client";

import LoginForm from "../../_components/LoginForm";
import ResetPassword from "../../_components/reset-password";

export default function Page() {
    return (
        <div className="space-y-6 w-full">
            <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Enter Your New Password</h2>
            </div>
            <ResetPassword />
        </div>
    );
}