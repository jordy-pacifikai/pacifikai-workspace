'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthInit } from '@/components/AuthInit';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { CommandPalette } from '@/components/search/CommandPalette';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,  // 5 minutes
            gcTime: 10 * 60 * 1000,    // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ErrorBoundary>
      <OfflineIndicator />
      <QueryClientProvider client={queryClient}>
        <AuthInit />
        {children}
        {/* Global command palette — Cmd+K, available on every page */}
        <CommandPalette />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
