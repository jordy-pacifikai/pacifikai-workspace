'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { DetailPanel } from '@/components/layout/DetailPanel';
import { CommandPalette } from '@/components/layout/CommandPalette';

export default function PipelineLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a12] text-[#e0e0e0]">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopBar */}
        <TopBar />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Detail panel (fixed overlay) */}
      <DetailPanel />

      {/* Command palette (fixed modal) */}
      <CommandPalette />
    </div>
  );
}
