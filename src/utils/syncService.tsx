'use client'

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useProfile } from '@/zustand/profile'
import axios from 'axios'
import { useOnlineStatus } from '@/hooks/use-online'

const LOCAL_API = 'http://127.0.0.1:8000' // local Django
const REMOTE_API = 'http://192.168.100.85:8000' // remote server

interface SyncPayload {
  users: any[]
  attendances: any[]
}

const SyncService = () => {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncStatus, setLastSyncStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')
  const isOnline = useOnlineStatus()
  const { profile } = useProfile()

  const syncUnsyncedData = async () => {
    if (!isOnline) {
      toast.warning('No internet connection. Sync skipped.')
      return
    }

    if (isSyncing) return

    setIsSyncing(true)
    setLastSyncStatus('idle')

    try {
      await pullFromRemote()

      // 1. Get unsynced data from local Django
      const response = await axios.get(`${LOCAL_API}/api/user/unsynced/`, {
        headers: {
          Authorization: `Bearer ${profile?.access}`,
        },
      })
      if (response.status !== 200)
        throw new Error('Failed to fetch unsynced data')

      const data = await response.data
      const { users, attendances, count } = data

      if (count.users === 0 && count.attendances === 0) {
        setLastSyncStatus('success')
        setIsSyncing(false)
        return
      }

      toast.info(
        `Syncing ${count.users} users & ${count.attendances} attendances...`
      )

      // 2. Prepare payload
      const payload: SyncPayload = { users, attendances }

      console.log('Sync payload:', payload)

      // 3. Send to remote server
      const syncResponse = await fetch(`${REMOTE_API}/api/user/sync/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!syncResponse.ok) {
        const errorText = await syncResponse.text()
        throw new Error(
          `Server sync failed: ${syncResponse.status} - ${errorText}`
        )
      }

      // 4. Mark as synced locally
      const userIds = users.map((u: any) => u.pk)
      const attendanceIds = attendances.map((a: any) => a.pk)

      const markResponse = await fetch(`${LOCAL_API}/api/user/mark-synced/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_ids: userIds,
          attendance_ids: attendanceIds,
        }),
      })

      if (!markResponse.ok) {
        throw new Error('Failed to mark records as synced locally')
      }

      toast.success(
        `Successfully synced ${count.users} users & ${count.attendances} attendances!`
      )
      setLastSyncStatus('success')
    } catch (error: any) {
      console.error('Sync failed:', error)
      toast.error(`Sync failed. Please login again!`)
      setLastSyncStatus('error')
    } finally {
      setIsSyncing(false)
    }
  }

  const pullFromRemote = async () => {
    if (!profile?.server_key) {
      toast.error('Please login again')
      return
    }
    try {
      const response = await axios.get(
        `${REMOTE_API}/api/user/remote-unsynced/`,
        {
          headers: {
            Authorization: `Bearer ${profile?.server_key}`,
          },
        }
      )
      if (response.status !== 200) throw new Error('Failed to pull remote data')

      const data = await response.data
      const { users, attendances } = data

      if (users.length === 0 && attendances.length === 0) {
        return
      }

      // Save pulled data into LOCAL Django
      const saveResponse = await fetch(`${LOCAL_API}/api/user/sync/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users, attendances }),
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save remote data locally')
      }

      console.log('Remote data pulled successfully')
    } catch (err) {
      console.error('Pull failed:', err)
      throw err
    }
  }

  // Badge styles based on state
  const getBadgeVariant = () => {
    if (isSyncing) return 'secondary'
    if (lastSyncStatus === 'success') return 'default'
    if (lastSyncStatus === 'error') return 'destructive'
    return 'outline'
  }

  useEffect(() => {
    if (!isSyncing && isOnline) {
      setTimeout(() => {}, 2000)
      syncUnsyncedData()
    }
  }, [isOnline])

  return (
    <Badge
      variant={getBadgeVariant()}
      className={`hover:opacity-90 ${isSyncing ? 'animate-pulse' : ''} ${!isOnline ? 'cursor-not-allowed opacity-50' : ''} `}
      onClick={!isSyncing && isOnline ? syncUnsyncedData : undefined}
    >
      {isSyncing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Syncing...
        </>
      ) : lastSyncStatus === 'success' ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          Synced
        </>
      ) : lastSyncStatus === 'error' ? (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          Sync Error
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          Sync Now
        </>
      )}
    </Badge>
  )
}

export default SyncService
