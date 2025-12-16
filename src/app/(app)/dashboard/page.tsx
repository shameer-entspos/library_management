import { ChartAreaInteractive } from '@/components/app/dashboard/chart-area-interactive'
import { SectionCards } from '@/components/app/dashboard/section-cards'
import React from 'react'

const DashboardPage = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
