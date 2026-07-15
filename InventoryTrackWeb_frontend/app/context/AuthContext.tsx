"use client"
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { clearAuthCookies, getAuthToken, getUserData } from "@/lib/cookie.client";
import { useRouter } from "next/navigation";

interface AuthContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    user: any;
    setUser: (user: any) => void;
    logout: () => Promise<void>;
    loading: boolean;
    checkAuth: () => Promise<void>;
    clearAppData?: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Helper to clear app context data
const clearAuthCachesOnLogout = () => {
    // Dispatch custom event that AppContext can listen to
    window.dispatchEvent(new Event('logout'));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const checkAuth = async () => {
        try {
            const token = await getAuthToken();
            const storedUser = await getUserData();
            const user = storedUser?.user ?? storedUser?.data ?? storedUser;
            
            // Debug logging
            console.log('checkAuth: token exists:', !!token, 'user:', user?.email || user?.fullname);
            
            setUser(user);
            setIsAuthenticated(!!token);
        } catch (err) {
            console.error('Auth check failed:', err);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await clearAuthCookies();
            setIsAuthenticated(false);
            setUser(null);
            
            // Clear app-level caches
            clearAuthCachesOnLogout();
            
            console.log('User logged out successfully');
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser, logout, loading, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};