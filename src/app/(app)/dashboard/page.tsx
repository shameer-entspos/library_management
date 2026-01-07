'use client'
import { ChartAreaInteractive } from '@/components/app/dashboard/chart-area-interactive'
import { ChartPieDonutText } from '@/components/app/dashboard/memberships-pie-chart'
import { SectionCards } from '@/components/app/dashboard/section-cards'
import { useMemberStore } from '@/zustand/members'
import { useProfile } from '@/zustand/profile'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import React from 'react'
import { toast } from 'sonner'

const DashboardPage = () => {
  const { data: session }: any = useSession()
  const { profile } = useProfile()
  const { members, setMembers } = useMemberStore()
  const [totalmembers, setTotalMembers] = React.useState(0)
  const [stats, setStats] = React.useState({
    active_memberships: 0,
    today_attendance: 0,
    total_users: 0,
    verified: 0,
  })

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['members'],
    enabled: !!profile,
    queryFn: async () => {
      if (!profile?.access) {
        toast.error('You are not logged in.')
        return
      }
      const token = profile?.access

      const res = await axios.get('http://127.0.0.1:8000/api/user/dashboard/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 200) {
        setStats(res.data.stats)
        setTotalMembers(res.data.count)
        setMembers(res.data.members)
      }

      return res.data.members
    },
  })

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards total={totalmembers || 0} stats={stats} />
          <div className="px-4 lg:px-6">
            <div className="flex flex-col gap-4 md:gap-6 xl:flex-row">
              <div className="w-full xl:w-2/3">
                <ChartAreaInteractive />
              </div>

              <div className="flex-1">
                <ChartPieDonutText />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
