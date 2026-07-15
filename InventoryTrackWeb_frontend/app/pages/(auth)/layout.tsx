"use client";

import { Boxes } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background dark:bg-foreground">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1D212C] relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl opacity-20 animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/50 rounded-full blur-3xl opacity-30 animate-pulse-slow" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5 bg-black">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-glow animate-pulse-glow bg-teal-500">
                <Boxes className="h-7 w-7 text-primary-foreground" />
              </div>
              <span className="font-display text-3xl font-bold text-sidebar-foreground text-white">
                InventoryTrack
              </span>
            </div>

            <h1 className="font-display text-4xl xl:text-5xl font-bold text-sidebar-foreground leading-tight mb-6 text-white">
              Smart Inventory <br />
              <span className="text-teal-400">Management System</span>
            </h1>

            <p className="text-lg max-w-md mb-12 text text-gray-400">
              Streamline your inventory operations with real-time stock tracking, production planning, and analytics.
            </p>

            <div className="space-y-4">
              {[
                "Real-time Inventory Tracking",
                "Production Batch Management",
                "Smart Low Stock Alerts",
                "Comprehensive Analytics",
              ].map((feature, index) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 text-sidebar-foreground/80 opacity-0 animate-slide-in-left"
                  style={{ animationDelay: `${(index + 1) * 150}ms` }}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white dark:bg-foreground/5 rounded-2xl shadow-xl p-8 lg:p-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
              <Boxes className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">InventoryTrack</span>
          </div>

          {/* Children (auth form) */}
          <div className="animate-fade-in">{children}</div>
        </div>
      </div>
    </div>
  );
}
