'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#22C55E',
            secondary: 'white',
          },
          style: {
            background: '#22C55E',
            color: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#FF3B30',
            secondary: 'white',
          },
          style: {
            background: '#FF3B30',
            color: '#fff',
          },
        },
      }}
    />
  )
}
