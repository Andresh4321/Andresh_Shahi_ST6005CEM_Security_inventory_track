"use client";

import AdminLoginForm from "../_components/AdminLoginForm";

export default function Page() {
    return (
        <div className="space-y-6 w-full">
            <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Admin Access</h2>
                <p className="text-muted-foreground">Restricted area. Please sign in with admin credentials.</p>
            </div>
            <AdminLoginForm />
        </div>
    );
}