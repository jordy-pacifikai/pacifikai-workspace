import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  /** Page title displayed in the TopBar */
  title: string;
  /** Business name displayed in the Sidebar */
  businessName?: string;
  /** Number of unread notifications */
  notificationCount?: number;
}

export function DashboardLayout({
  children,
  title,
  businessName,
  notificationCount,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar businessName={businessName} />
      <TopBar title={title} notificationCount={notificationCount} />

      {/* Main content: offset sidebar (w-64) + topbar (h-16) */}
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
