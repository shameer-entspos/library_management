import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SectionCards({
  total,
  stats,
}: {
  total: number
  stats: {
    active_memberships: number
    today_attendance: number
    total_users: number
    verified: number
  }
}) {
  return (
    <div className="*:data-[slot=card]:from-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-3 px-4 *:data-[slot=card]:bg-linear-to-br sm:gap-4 lg:px-6 @sm/main:grid-cols-2 @5xl/main:grid-cols-4 *:data-[slot=card]:[&:nth-child(4n)]:to-amber-500/30 *:data-[slot=card]:[&:nth-child(4n)]:dark:to-amber-500/50 *:data-[slot=card]:[&:nth-child(4n+1)]:to-emerald-500/30 *:data-[slot=card]:[&:nth-child(4n+1)]:dark:to-emerald-500/50 *:data-[slot=card]:[&:nth-child(4n+2)]:to-violet-500/30 *:data-[slot=card]:[&:nth-child(4n+2)]:dark:to-violet-500/50 *:data-[slot=card]:[&:nth-child(4n+3)]:to-sky-500/30 *:data-[slot=card]:[&:nth-child(4n+3)]:dark:to-sky-500/50">
      {/* Total Users */}
      <Card
        className="@container/card border-none py-4 shadow-none sm:py-5!"
        style={{
          boxShadow: 'rgba(10, 37, 64, 0.05) 0px 0px 10px 1px inset',
        }}
      >
        <CardHeader className="px-4 sm:px-6">
          <CardDescription className="text-foreground/80 font-normal">
            Total Users
          </CardDescription>
          <CardTitle className="text-end text-2xl font-semibold text-emerald-500 tabular-nums md:text-3xl lg:text-5xl">
            {stats?.total_users ?? 0}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Active Memberships */}
      <Card
        className="@container/card border-none py-4 shadow-none sm:py-5!"
        style={{
          boxShadow: 'rgba(10, 37, 64, 0.05) 0px 0px 10px 1px inset',
        }}
      >
        <CardHeader className="px-4 sm:px-6">
          <CardDescription className="text-foreground/80 font-normal">
            Active Memberships
          </CardDescription>
          <CardTitle className="text-end text-2xl font-semibold text-purple-500 tabular-nums md:text-3xl lg:text-5xl">
            {stats?.active_memberships ?? 0}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Today's Attendance */}
      <Card
        className="@container/card border-none py-4 shadow-none sm:py-5!"
        style={{
          boxShadow: 'rgba(10, 37, 64, 0.05) 0px 0px 10px 1px inset',
        }}
      >
        <CardHeader className="px-4 sm:px-6">
          <CardDescription className="text-foreground/80 font-normal">
            Today&apos;s Attendance
          </CardDescription>
          <CardTitle className="text-end text-2xl font-semibold text-blue-500 tabular-nums md:text-3xl lg:text-5xl">
            {stats?.today_attendance ?? 0}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card
        className="@container/card border-none py-4 shadow-none sm:py-5!"
        style={{
          boxShadow: 'rgba(10, 37, 64, 0.05) 0px 0px 10px 1px inset',
        }}
      >
        <CardHeader className="px-4 sm:px-6">
          <CardDescription className="text-foreground/80 font-normal">
            Verified Users
          </CardDescription>
          <CardTitle className="text-end text-2xl font-semibold text-orange-500 tabular-nums md:text-3xl lg:text-5xl">
            {stats?.verified ?? 0}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
