'use client'

import { SessionProvider } from 'next-auth/react'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider 
      basePath="/api/auth"
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  )
}