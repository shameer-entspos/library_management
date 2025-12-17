/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { MembersDataTable } from '@/components/app/dashboard/data-table'
import React, { useEffect, useState } from 'react'

import { Loader2 } from 'lucide-react'
import { useMemberStore } from '@/zustand/members'
import { useQuery } from '@tanstack/react-query'
import { getAllMembers } from '@/lib/api'
import { useSession } from 'next-auth/react'

const MembersPage = () => {
  const { data: session }: any = useSession()
  const { members, setMembers } = useMemberStore()

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['members'],
    enabled: !!session?.user,
    queryFn: async () => {
      const token = session?.user?.access

      const res = await getAllMembers(token)

      if (res.status === 200) {
        setMembers(res.data.members)
      }

      return res.data.members
    },
  })

  return !isSuccess || isLoading ? (
    <>
      <div className="flex flex-1 items-center justify-center gap-2">
        <Loader2 className="size-6 animate-spin" />
        <span>Loading...</span>
      </div>
    </>
  ) : (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <MembersDataTable />
        </div>
      </div>
    </div>
  )
}

export default MembersPage
