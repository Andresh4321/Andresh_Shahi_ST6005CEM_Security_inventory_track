"use client";

import ForgotPassword from "../ForgotPassword";
import LoginForm from "../LoginForm";


export default function Page() {
    return (
        <div className="space-y-6 w-full">
            <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Enter Your Email</h2>
            </div>
            <ForgotPassword />
        </div>
    );
}