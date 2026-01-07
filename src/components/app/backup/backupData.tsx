import { useInternetCheck } from '@/hooks/user-internet'
import React, { useEffect, useRef } from 'react'
import { toast } from 'sonner'

const BackupData = () => {
  const online = useInternetCheck()
  const toastIdRef = useRef<string | number | null>(null)

  useEffect(() => {
    if (!online) {
      if (!toastIdRef.current) {
        toast.warning('No internet connection...')
      }
    } else {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
        toastIdRef.current = null

        toast.success('Internet connection restored')
      }
    }
  }, [online])

  return null
}

export default BackupData
