'use client'
import FaceAttendanceIPCam from '@/components/app/users/attendance/ipCameraCapture'
import FaceAttendance from '@/components/app/users/attendance/phoneCameraCapture'
import { Button } from '@/components/ui/button'
import React from 'react'

type Mode = 'phone' | 'ip'

const AttendancesPage = () => {
  const [mode, setMode] = React.useState<Mode>('ip')
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-center gap-2">
        <Button
          className="rounded-full"
          size={'sm'}
          variant={mode === 'phone' ? 'default' : 'outline'}
          onClick={() => setMode('phone')}
        >
          Device Camera
        </Button>

        <Button
          className="rounded-full"
          size={'sm'}
          variant={mode === 'ip' ? 'default' : 'outline'}
          onClick={() => setMode('ip')}
        >
          IP Camera
        </Button>
      </div>
      <div className="px-4 lg:px-6">
        {mode === 'phone' ? <FaceAttendance /> : <FaceAttendanceIPCam />}
      </div>
    </div>
  )
}

export default AttendancesPage
