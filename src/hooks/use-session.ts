import { useSession } from 'next-auth/react'
import React from 'react'

const DEV = process.env.DEV === 'development' || 'server'

const useCustomSession = () => {
  const { data: session } = useSession()

  if (DEV == 'server') {
    return { session }
  }

  return {}
}

export default useCustomSession
