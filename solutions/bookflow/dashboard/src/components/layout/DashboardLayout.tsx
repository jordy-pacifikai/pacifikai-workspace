'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  businessName?: string;
  notificationCount?: number;
}

export function DashboardLayout({
  children,
  title,
  businessName,
  notificationCount,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar businessName={businessName} open={sidebarOpen} onClose={closeSidebar} />
      <TopBar title={title} notificationCount={notificationCount} onMenuToggle={toggleSidebar} />

      {/* Main content: sidebar offset on desktop only */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
