"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FileText,
  Boxes,
  Users,
  AlertTriangle,
  Factory,
  BarChart3,
  LogOut,
  Settings,
  MessageCircle,
  Bell,
  Box
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Raw Materials', href: '/Materials', icon: Package },
  { name: 'Bill of Materials', href: '/BillOfMaterials', icon: FileText },
  { name: 'Stock Management', href: '/StockManagement', icon: Boxes },
  { name: 'Suppliers', href: '/Suppliers', icon: Users },
  { name: 'Messages', href: '/Messaging', icon: MessageCircle },
  { name: 'Low Stock Alerts', href: '/LowStockAlerts', icon: AlertTriangle },
  { name: 'Notifications', href: '/Notifications', icon: Bell },
  { name: 'Production', href: '/Production', icon: Factory },
  { name: 'Reports & Analytics', href: '/Reports', icon: BarChart3 },
];

export const Sidebar = () => {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('inventorytrack_user');
    window.location.href = '/';
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
            <Box className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-sidebar-foreground">
            InventoryTrack
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item, index) => {
            // Better active detection - matches both exact path and child paths
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-white font-medium transition-all duration-200 no-underline",
                  "opacity-0 animate-slide-in-left",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-primary font-semibold" 
  : "text-white hover:bg-sidebar-accent/50 hover:text-white"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                )} />
                <span className="flex-1">{item.name}</span>
                {item.name === 'Low Stock Alerts' && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shrink-0">
                    !
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          <Link 
            href="/Setting"
            className="flex w-full text-white items-center gap-3 rounded-lg px-3 py-2.5 font-medium  hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};
