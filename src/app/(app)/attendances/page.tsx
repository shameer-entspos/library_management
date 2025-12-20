import AttendanceList from '@/components/app/users/attendance/list/attendanceList'
import React from 'react'

type Mode = 'phone' | 'ip'

const AttendancesPage = () => {
  return (
    <div className="flex h-full py-4 md:gap-6 md:py-6">
      <AttendanceList />
    </div>
  )
}

export default AttendancesPage
