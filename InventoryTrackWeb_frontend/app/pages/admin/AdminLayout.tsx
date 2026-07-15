import { ReactNode } from "react";
import Link from "next/link";
import { getUserData } from "@/lib/cookie";
import { User, Shield, Search, LogOut, Home } from "lucide-react";

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
    const userData = await getUserData();
    const user = userData?.user || userData; // Adjust based on how we stored it

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col hidden md:flex shadow-2xl z-20">
                <div className="p-6 border-b border-gray-700/50">
                    <div className="flex items-center gap-3 text-teal-600 mb-2">
                        <div className="p-2 bg-teal-600/10 rounded-lg">
                            <Shield className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-lg tracking-wider">ADMIN</span>
                    </div>
                    <p className="text-xs text-gray-400">Management Panel</p>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-3">
                    <Link href="/admin/users"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium group">
                        <User size={18} className="group-hover:text-teal-600 transition-colors" />
                        <span>Users Management</span>
                    </Link>
                    <Link href="/admin/findUser"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium group">
                        <Search size={18} className="group-hover:text-teal-600 transition-colors" />
                        <span>Find User</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-700/50">
                    <Link href="/" className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors group">
                        <Home size={18} className="group-hover:text-teal-600 transition-colors" />
                        <span className="text-sm">Back to Home</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navigation Bar */}
                <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-6 lg:px-8 shadow-sm sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 hidden sm:block">Dashboard</h1>

                    <div className="flex items-center gap-6 ml-auto">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.fullname || "Admin User"}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">{user?.role || "Administrator"}</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                            {(user?.fullname?.[0] || "A").toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
