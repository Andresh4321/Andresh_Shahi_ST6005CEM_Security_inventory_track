"use client";

import LoginForm from "../_components/LoginForm";

export default function Page() {
    return (
        <div className="space-y-6 w-full">
            <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Welcome back</h2>
                <p className="text-muted-foreground">Enter your credentials to access your dashboard</p>
            </div>
            <LoginForm />
        </div>
    );
}