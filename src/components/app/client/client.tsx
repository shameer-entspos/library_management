'use client'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BackupData from '../backup/backupData'

const Client = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <BackupData />
      {children}
    </QueryClientProvider>
  )
}

export default Client
