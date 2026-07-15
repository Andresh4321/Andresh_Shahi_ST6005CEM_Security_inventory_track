"use client";

import { ReactNode } from 'react';
import { Sidebar } from './sliderbar';
import { Header } from './Header';
import './dashboard.css';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  return (
    <div className="dashboard-wrapper min-h-screen bg-background ">
      <Sidebar />
      <div className="pl-64">
        <Header title={title} subtitle={subtitle} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
