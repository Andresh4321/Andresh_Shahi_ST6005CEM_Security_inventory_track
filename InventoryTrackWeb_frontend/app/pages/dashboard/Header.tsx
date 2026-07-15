"use client";

import { useState, useEffect } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { fetchInventoryMaterials } from '@/lib/api/material';
import { messagingApi } from '@/lib/api/messaging';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  const [lowStockCount, setLowStockCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const resolveProfileImageUrl = (src?: string) => {
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const normalized = src.startsWith("/") ? src : `/${src}`;
    if (!baseUrl) return normalized;
    return `${baseUrl.replace(/\/$/, "")}${normalized}`;
  };

  useEffect(() => {
    const loadHeaderData = async () => {
      try {
        // Load low stock count
        const inventory = await fetchInventoryMaterials();
        setLowStockCount(inventory.filter((m) => m.quantity <= m.minimumStock).length);

        // Load unread message count
        try {
          const msgResponse = await messagingApi.getUnreadCount();
          setUnreadMessages(msgResponse.data?.data?.unreadCount || 0);
        } catch (error) {
          console.error('Failed to load unread messages', error);
        }
      } catch (error) {
        console.error('Failed to load header data', error);
      }
    };

    // Load user from localStorage
    const userData = localStorage.getItem('inventorytrack_user') || localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    loadHeaderData();

    // Refresh unread count every 30 seconds
    const interval = setInterval(() => {
      messagingApi.getUnreadCount()
        .then(res => setUnreadMessages(res.data?.data?.unreadCount || 0))
        .catch(err => console.error('Failed to refresh unread count', err));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const profileSrc = resolveProfileImageUrl(user?.profileImage);
  const fallbackAvatar = "/default-avatar.svg";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-lg px-6">
      <div className="animate-fade-in">
        <h1 className="font-display text-xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          className="hidden md:flex gap-2 bg-linear-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 border-purple-500/30"
          onClick={() => router.push('/AIAssistant')}
        >
          <Sparkles className="h-4 w-4 text-purple-500" />
          View with AI
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={() => router.push('/Notifications')}
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {(lowStockCount > 0 || unreadMessages > 0) && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
              {Math.min((lowStockCount > 0 ? 1 : 0) + (unreadMessages > 0 ? 1 : 0), 9)}
            </span>
          )}
        </Button>

        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary overflow-hidden">
            <img 
              src={profileSrc || fallbackAvatar} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = fallbackAvatar;
              }}
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{user?.fullname || user?.fullName || 'User'}</p>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'admin' || user?.isAdmin ? 'Administrator' : 'User'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
