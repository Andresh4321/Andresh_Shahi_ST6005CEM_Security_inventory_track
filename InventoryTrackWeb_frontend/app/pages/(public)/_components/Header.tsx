"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/admin", label: "Admin" },
];

export default function Header() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

    return (
        <header className="sticky top-0 z-50 border-b border-border/70 bg-background/75 backdrop-blur-2xl">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Global">
                <div className="flex h-16 items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] w-full">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            <img 
                                src="/logo.png" 
                                alt="InventoryTrack Logo"
                                className="h-8 w-8 transition-transform duration-200 group-hover:scale-105"
                            />
                            <span className="text-base font-semibold tracking-tight text-foreground/95 group-hover:text-foreground transition-colors">
                                InventoryTrack
                            </span>
                        </Link>
                    </div>

                    {/* Center: Desktop Nav */}
                    <div className="hidden md:flex items-center gap-2 justify-self-center rounded-full border border-border/70 bg-muted/40 px-2 py-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={
                                    "rounded-full px-4 py-1.5 text-sm font-medium transition-all " +
                                    (isActive(link.href)
                                        ? "bg-foreground text-background shadow-sm"
                                        : "text-foreground/70 hover:text-foreground hover:bg-foreground/5")
                                }
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right: Auth + Mobile Toggle */}
                    <div className="flex items-center gap-2 md:justify-self-end">
                        <div className="hidden sm:flex items-center gap-2">
                            <Link
                                href="/login"
                                className="h-9 px-4 inline-flex items-center justify-center rounded-full border border-border bg-background text-sm font-medium text-foreground/85 hover:text-foreground hover:bg-muted transition-colors"
                            >
                                Log In
                            </Link>
                            <Link
                                href="/register"
                                className="h-9 px-4 inline-flex items-center justify-center rounded-full bg-linear-to-r from-teal-600 to-cyan-600 text-white text-sm font-semibold shadow-[0_8px_20px_rgba(13,148,136,0.3)] hover:brightness-105 transition-all"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Theme toggle */}
                        <ThemeToggle />

                        {/* Mobile hamburger */}
                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            aria-label="Toggle menu"
                            aria-expanded={open}
                            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background hover:bg-muted transition-colors"
                        >
                            {open ? (
                                // Close icon
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                // Hamburger icon
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                    <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile panel */}
                <div className={"md:hidden overflow-hidden transition-[max-height] duration-300 " + (open ? "max-h-96" : "max-h-0")}>
                    <div className="pb-4 pt-2 border-t border-border/70">
                        <div className="flex flex-col gap-2">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className={
                                        "rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-muted " +
                                        (isActive(link.href) ? "text-foreground bg-foreground/5" : "text-foreground/70")
                                    }
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div className="mt-2 flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="flex-1 h-9 px-3 inline-flex items-center justify-center rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex-1 h-9 px-3 inline-flex items-center justify-center rounded-full bg-linear-to-r from-teal-600 to-cyan-600 text-white text-sm font-semibold shadow-[0_8px_20px_rgba(13,148,136,0.3)] hover:brightness-105 transition-all"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}