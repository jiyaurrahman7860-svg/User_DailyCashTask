'use client';

import PageAccessGuard from '@/components/PageAccessGuard';
import { ScrollRefreshProvider } from '@/contexts/ScrollRefreshContext';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <ScrollRefreshProvider>
      <PageAccessGuard>
        {children}
      </PageAccessGuard>
    </ScrollRefreshProvider>
  );
}
