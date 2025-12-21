'use client'

import * as React from 'react'
import { TrendingUp } from 'lucide-react'
import { Label, Pie, PieChart } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

import { useMemberStore } from '@/zustand/members'

export const description = 'Membership payment status donut chart'

const chartConfig = {
  count: {
    label: 'Memberships',
  },
  paid: {
    label: 'Paid',
    color: 'var(--chart-1)',
  },
  unpaid: {
    label: 'Unpaid',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function ChartPieDonutText() {
  const { members } = useMemberStore()

  const chartData = React.useMemo(() => {
    let paid = 0
    let unpaid = 0

    members.forEach((member) => {
      if (member.membership?.payment_status === 'paid') {
        paid += 1
      } else {
        unpaid += 1
      }
    })

    return [
      { name: 'paid', count: paid, fill: 'var(--color-paid)' },
      { name: 'unpaid', count: unpaid, fill: 'var(--color-unpaid)' },
    ]
  }, [members])

  const totalMemberships = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [chartData])

  return (
    <Card
      className="@container/card border-none shadow-none"
      style={{
        boxShadow: '0px 0px 10px 0px #88888820',
      }}
    >
      <CardHeader className="items-center pb-0">
        <CardTitle>Membership Payments</CardTitle>
        <CardDescription>Paid vs Unpaid</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox))
                    return null

                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalMemberships}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy ? viewBox.cy + 20 : 50}
                        className="fill-muted-foreground text-xs"
                      >
                        Memberships
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Payment overview <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing all memberships
        </div>
      </CardFooter>
    </Card>
  )
}
