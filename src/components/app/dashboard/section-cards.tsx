import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/20 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-3 px-4 *:data-[slot=card]:bg-gradient-to-t sm:gap-4 lg:px-6 @sm/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Users */}
      <Card
        className="@container/card border-none py-4 sm:py-6!"
        style={{ boxShadow: '0px 0px 10px 0px #88888820' }}
      >
        <CardHeader className="px-4 sm:px-6">
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl lg:text-4xl">
            1,250
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Active Memberships */}
      <Card
        className="@container/card border-none py-4 sm:py-6!"
        style={{ boxShadow: '0px 0px 10px 0px #88888820' }}
      >
        <CardHeader className="px-4 sm:px-6">
          <CardDescription>Active Memberships</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl lg:text-4xl">
            980
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Today's Attendance */}
      <Card
        className="@container/card border-none py-4 sm:py-6!"
        style={{ boxShadow: '0px 0px 10px 0px #88888820' }}
      >
        <CardHeader className="px-4 sm:px-6">
          <CardDescription>Today&apos;s Attendance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl lg:text-4xl">
            142
          </CardTitle>
        </CardHeader>
      </Card>

      <Card
        className="@container/card border-none py-4 sm:py-6!"
        style={{ boxShadow: '0px 0px 10px 0px #88888820' }}
      >
        <CardHeader className="px-4 sm:px-6">
          <CardDescription>Library Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl lg:text-4xl">
            5.2%
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
