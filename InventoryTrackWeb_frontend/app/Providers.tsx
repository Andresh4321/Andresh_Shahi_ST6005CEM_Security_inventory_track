"use client";

import { AuthProvider } from "@/app/context/AuthContext";
import { AppProvider } from "@/app/context/AppContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AppProvider>
  );
}
