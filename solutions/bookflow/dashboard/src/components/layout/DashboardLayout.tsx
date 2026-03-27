'use client';

import { useState, useCallback, Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { TrialBanner } from '@/components/dashboard/TrialBanner';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  businessName?: string;
}

export function DashboardLayout({
  children,
  title,
  businessName,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar businessName={businessName} open={sidebarOpen} onClose={closeSidebar} />
      <TopBar title={title} onMenuToggle={toggleSidebar} />

      {/* Main content: sidebar offset on desktop only */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6">
          <TrialBanner />
          <Suspense fallback={<div className="animate-pulse bg-gray-800 rounded-xl h-96 m-6" />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
