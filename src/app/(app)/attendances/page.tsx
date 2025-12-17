'use client'
import AttendanceList from '@/components/app/users/attendance/list/attendanceList'
import FaceAttendance from '@/components/app/users/attendance/phoneCameraCapture'
import { Button } from '@/components/ui/button'
import React from 'react'

type Mode = 'phone' | 'ip'

const AttendancesPage = () => {
  const [mode, setMode] = React.useState<Mode>('ip')
  const [tab, setTab] = React.useState<'mark' | 'list'>('list')
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-center gap-2">
        <Button
          className="rounded-full"
          size={'sm'}
          variant={tab === 'list' ? 'default' : 'outline'}
          onClick={() => setTab('list')}
        >
          List
        </Button>

        <Button
          className="rounded-full"
          size={'sm'}
          variant={tab === 'mark' ? 'default' : 'outline'}
          onClick={() => setTab('mark')}
        >
          Mark Attendance
        </Button>
      </div>
      {/* <div className="px-4 lg:px-6">
        {mode === 'phone' ? <FaceAttendance /> : <FaceAttendanceIPCam />}
      </div> */}

      <div className="px-4 lg:px-6">
        {tab === 'mark' ? <FaceAttendance /> : <AttendanceList />}
      </div>
    </div>
  )
}

export default AttendancesPage
