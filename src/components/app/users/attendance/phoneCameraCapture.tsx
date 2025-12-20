/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRef, useEffect, useState } from 'react'
import axios from 'axios'
import {
  Camera,
  UserCheck,
  CheckCircle,
  XCircle,
  Loader2,
  UserPlus,
  Check,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { IconSettings } from '@tabler/icons-react'
import { CardTitle } from '@/components/ui/card'

type Mode = 'register' | 'checkin' | 'checkout'
type CameraState = 'loading' | 'ready' | 'denied' | 'error'

export default function FaceAttendance() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mode, setMode] = useState<Mode>('checkin')
  const [userId, setUserId] = useState('')
  const [status, setStatus] = useState<React.ReactNode>('Starting camera...')
  const [isProcessing, setIsProcessing] = useState(false)

  const [cameraState, setCameraState] = useState<CameraState>('loading')
  const pathname = usePathname()

  const streamRef = useRef<MediaStream | null>(null)

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  const loadVideoDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cams = devices.filter((d) => d.kind === 'videoinput')
    setVideoDevices(cams)

    // auto-select first camera
    if (cams.length && !selectedDeviceId) {
      setSelectedDeviceId(cams[0].deviceId)
    }
  }

  const startCamera = async (deviceId?: string) => {
    try {
      // stop previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraState('ready')
      setStatus('Camera ready! Look straight at the camera')
    } catch (err) {
      console.error(err)
      setCameraState('error')
      setStatus('Failed to access camera')
    }
  }

  useEffect(() => {
    loadVideoDevices()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [])

  const captureAndSend = async () => {
    if (!videoRef.current || isProcessing) return

    setIsProcessing(true)
    setStatus(<Loader2 className="mx-auto h-12 w-12 animate-spin" />)

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.95)

    try {
      let res

      if (mode === 'register') {
        if (!userId.trim()) {
          setStatus('Please enter your User ID')
          setIsProcessing(false)
          return
        }

        res = await axios.post('/api/attendance/face/register/', {
          user_id: parseInt(userId),
          image: imageBase64,
        })

        setStatus(
          <div className="text-center">
            <CheckCircle className="mx-auto mb-4 size-12 text-green-500 md:size-12" />
            <div className="text-lg font-bold text-green-600 md:text-2xl">
              Registered Successfully!
            </div>
            <div className="mt-2 text-lg">{res.data.user || 'User'}</div>
          </div>
        )
      } else {
        res = await axios.post('/api/attendance/checkin_checkout/', {
          action: mode, // 'checkin' or 'checkout'
          image: imageBase64,
          method: 'face',
        })

        const isCheckIn = res.data.message.includes('In')
        const confidence = res.data.confidence
          ? `${(parseFloat(res.data.confidence) * 100).toFixed(1)}%`
          : 'High'

        setStatus(
          <div className="p-2 text-center">
            {isCheckIn ? (
              <Check className="border-primary bg-primary mx-auto mb-4 size-12 rounded-full border p-2 text-white md:size-12" />
            ) : (
              <UserCheck className="mx-auto mb-4 size-12 rounded-full border border-blue-500 bg-blue-500 p-2 text-white md:size-12" />
            )}
            <div
              className={`mt-2 rounded-full px-2 py-1 text-base font-bold capitalize md:text-xl lg:text-2xl ${isCheckIn ? 'text-primary' : 'text-blue-500'}`}
            >
              {res.data.user}
            </div>
            <div className="text-muted-foreground text-lg font-medium md:text-xl">
              {res.data.message}
            </div>
            {res.data.duration && (
              <div className="text-foreground mt-2 text-sm">
                Duration: {res.data.duration}
              </div>
            )}
            <div className="text-foreground mt-2 text-sm">
              Confidence: {confidence}
            </div>
          </div>
        )
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Operation failed. Try again.'
      setStatus(
        <div className="p-2 text-center">
          <XCircle className="mx-auto mb-4 size-12 text-red-500 md:size-12" />
          <div className="text-base font-medium text-red-600 md:text-xl">
            {msg}
          </div>
        </div>
      )
    }

    setIsProcessing(false)
  }

  useEffect(() => {
    if (selectedDeviceId) {
      startCamera(selectedDeviceId)
    }
  }, [selectedDeviceId])

  return (
    <>
      <header className="flex h-[60px] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[60px]">
        <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
          <div className="flex items-center">
            <div className="flex md:hidden">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4"
              />
            </div>
            <h1 className="text-base font-semibold capitalize md:text-lg">
              Checkin Checkout
            </h1>
          </div>
          <div className="h-max!">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-10 w-10 sm:w-max"
                >
                  <IconSettings />
                  <span className="hidden sm:flex">Settings</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="space-y-4">
                <CardTitle>Change camera</CardTitle>
                {videoDevices.length > 0 && (
                  <Select
                    value={selectedDeviceId ?? ''}
                    onValueChange={(value) => setSelectedDeviceId(value)}
                  >
                    <SelectTrigger className="h-10! w-full rounded-full">
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>

                    <SelectContent>
                      {videoDevices.map((device, index) => (
                        <SelectItem
                          key={device.deviceId}
                          value={device.deviceId}
                        >
                          {device.label || `Camera ${index + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="mx-auto h-full max-w-4xl space-y-4">
            {/* Title */}
            {/* <div className="mb-8 text-center">
          <h1 className="text-foreground mb-3 text-5xl font-bold">
            Facial Attendance
          </h1>
          <p className="text-foreground text-lg">
            Use your phone as camera • High accuracy • Instant results
          </p>
        </div> */}

            {/* Mode Selector */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => setMode('register')}
                className="rounded-full text-sm!"
                size={'sm'}
                variant={mode === 'register' ? 'default' : 'secondary'}
              >
                <UserPlus className="size-4" /> Register Face
              </Button>
              <Button
                onClick={() => setMode('checkin')}
                className="rounded-full text-sm!"
                size={'sm'}
                variant={mode === 'checkin' ? 'default' : 'secondary'}
              >
                <CheckCircle className="size-4" /> Checkin/Checkout
              </Button>
              {/* <Button
            onClick={() => setMode('checkout')}
            className="rounded-full text-sm! px-5!"
            variant={mode === 'checkout' ? 'default' : 'secondary'}
          >
            <UserCheck className="h-6 w-6" /> Check Out
          </Button> */}
            </div>

            {/* User ID for Registration */}
            {mode === 'register' && (
              <div className="mx-auto mb-8 max-w-md">
                <Input
                  type="text"
                  placeholder="Enter User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="rounded-full text-center"
                />
              </div>
            )}

            {/* Camera */}

            {/* {cameraState === 'ready' && (
        )} */}
            <div className="relative mx-auto min-h-96 w-full overflow-hidden rounded-3xl bg-black shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-92 w-72 rounded-[40%] border-4 border-dashed border-green-400 opacity-60"></div>
              </div>
              <span className="bg-opacity-70 bg-primary absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-center text-sm font-medium text-white">
                Align face in oval
              </span>
            </div>

            {cameraState === 'denied' && (
              <div className="px-3 py-8 text-center text-red-600 sm:py-10">
                <XCircle className="mx-auto mb-3 size-12 md:size-12" />
                <p className="text-xl font-semibold">Camera access denied</p>
                <p className="mt-2 text-sm">
                  Enable camera permission and reload the page
                </p>
              </div>
            )}

            {cameraState === 'error' && (
              <div className="px-3 py-8 text-center text-red-600 sm:py-10">
                <XCircle className="mx-auto mb-3 size-12 md:size-12" />
                <p className="text-xl font-semibold">Camera not available</p>
              </div>
            )}

            <div className="mt-4 text-center">
              <Button
                onClick={captureAndSend}
                disabled={
                  isProcessing || (mode === 'register' && !userId.trim())
                }
                className={`mx-auto flex transform items-center gap-2 rounded-full px-6! text-sm font-bold text-white shadow-2xl transition-all hover:scale-105 ${
                  isProcessing || (mode === 'register' && !userId.trim())
                    ? 'cursor-not-allowed bg-gray-400'
                    : mode === 'register'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : mode === 'checkin'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'hover:'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-8 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="size-5" />
                    {mode === 'register'
                      ? 'Register Face'
                      : mode === 'checkin'
                        ? 'Checkin/Checkout'
                        : 'Check Out Now'}
                  </>
                )}
              </Button>
            </div>

            {/* Status */}
            <div className="mt-4 text-center">
              <div className="bg-popover inline-block rounded-2xl p-2 px-4 text-sm shadow-lg md:text-base">
                {typeof status === 'string' ? (
                  <p className="text-foreground">{status}</p>
                ) : (
                  status
                )}
              </div>
            </div>

            {/* Capture Button */}
          </div>
        </div>
      </div>
    </>
  )
}
