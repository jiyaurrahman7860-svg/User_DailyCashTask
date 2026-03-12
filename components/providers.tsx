'use client'

import { ThemeProvider } from '@/lib/theme-provider'
import { ToastProvider } from '@/components/ui/toast-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ToastProvider />
    </ThemeProvider>
  )
}
