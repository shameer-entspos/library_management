/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  Camera,
  UserCheck,
  CheckCircle,
  XCircle,
  Loader2,
  UserPlus,
  Check,
  CloudCog,
  Settings,
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
import { IconCamera, IconMenu, IconSettings } from '@tabler/icons-react'
import { CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SearchableSelect } from '@/components/ui/search-select'
import { useMemberStore } from '@/zustand/members'
import { IoCamera } from 'react-icons/io5'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import Image from 'next/image'
import { useProfile } from '@/zustand/profile'

type Mode = 'register' | 'checkin' | 'checkout'
type CameraState = 'loading' | 'ready' | 'denied' | 'error'

const getLatestAttendance = (attendances: any[]) => {
  if (!attendances?.length) return null

  return attendances.reduce((latest, curr) =>
    new Date(curr.check_in) > new Date(latest.check_in) ? curr : latest
  )
}

function getLatestAction(attendance: any): string | null {
  if (!attendance?.check_in && !attendance?.check_out) {
    return null
  }

  if (attendance.check_in && !attendance.check_out) {
    return attendance.check_in
  }

  if (!attendance.check_in && attendance.check_out) {
    return attendance.check_out
  }

  const checkInTime = new Date(attendance.check_in).getTime()
  const checkOutTime = new Date(attendance.check_out).getTime()

  return checkOutTime > checkInTime ? attendance.check_out : attendance.check_in
}

export default function FaceAttendance() {
  const { data: session }: any = useSession()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mode, setMode] = useState<Mode>('checkin')
  const [userId, setUserId] = useState('')
  const [status, setStatus] = useState<React.ReactNode>('Starting camera...')
  const [isProcessing, setIsProcessing] = useState(false)

  const [cameraState, setCameraState] = useState<CameraState>('loading')
  const pathname = usePathname()

  const streamRef = useRef<MediaStream | null>(null)

  const { members } = useMemberStore()
  const [image, setImage] = useState<any>('')
  const { profile } = useProfile()

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const [bestUserId, setBestUserId] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadVideoDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cams = devices.filter((d) => d.kind === 'videoinput')

    const reversedCams = [...cams].reverse()
    setVideoDevices(reversedCams)

    if (reversedCams.length) {
      const firstDeviceId = reversedCams[0].deviceId
      setSelectedDeviceId(firstDeviceId)
      return firstDeviceId
    }

    return null
  }

  const startCamera = async (deviceId?: string) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraState('ready')
      setStatus('Camera ready')
    } catch (err) {
      console.error(err)
      setCameraState('error')
      setStatus('Camera not available')
    }
  }

  useEffect(() => {
    const initCamera = async () => {
      const firstDeviceId = await loadVideoDevices()
      await startCamera(firstDeviceId || undefined)
    }

    initCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const captureAndSend = async () => {
    if (!videoRef.current || isProcessing) return

    setIsProcessing(true)
    setStatus(<Loader2 className="mx-auto h-12 w-12 animate-spin" />)
    setOpen(true) // open dialog immediately

    const video = videoRef.current!
    const containerWidth = 466
    const containerHeight = 600

    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight

    const videoAspect = videoWidth / videoHeight
    const containerAspect = containerWidth / containerHeight

    let sx = 0
    let sy = 0
    let sWidth = videoWidth
    let sHeight = videoHeight

    if (videoAspect > containerAspect) {
      sWidth = videoHeight * containerAspect
      sx = (videoWidth - sWidth) / 2
    } else {
      sHeight = videoWidth / containerAspect
      sy = (videoHeight - sHeight) / 2
    }

    const canvas = document.createElement('canvas')
    canvas.width = containerWidth
    canvas.height = containerHeight

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(
      video,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      containerWidth,
      containerHeight
    )

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.95)
    setImage(imageBase64)

    if (!profile?.access) {
      toast.error('You are not logged in.')
      return
    }
    const token = profile?.access

    if (!token) {
      setStatus('Failed to capture image')
      setIsProcessing(false)
      return
    }

    try {
      let res

      if (mode === 'register') {
        if (!userId.trim()) {
          setStatus('Please enter your User ID')
          setIsProcessing(false)
          return
        }

        res = await axios.post(
          'http://127.0.0.1:8000/api/attendance/face/register/',
          {
            user_id: parseInt(userId),
            image: imageBase64,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

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
        res = await axios.post(
          'http://127.0.0.1:8000/api/attendance/checkin_checkout/',
          {
            action: mode,
            image: imageBase64,
            method: 'face',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const isCheckIn = res.data.message.includes('In')
        const confidence = res.data.confidence
          ? `${(parseFloat(res.data.confidence) * 100).toFixed(1)}%`
          : 'High'

        setBestUserId(res.data.user_id)

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
    } finally {
      setIsProcessing(false)
      queryClient.refetchQueries({ queryKey: ['members'] })
    }

    setIsProcessing(false)
  }

  const undoAttendance = async () => {
    if (!profile?.access) {
      toast.error('You are not logged in.')
      return
    }
    const token = profile?.access

    if (!token) {
      setStatus('Failed to undo attendance')
      return
    }

    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/attendance/undo/',
        {
          user_id: bestUserId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setStatus(res.data.message)
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Operation failed. Try again.'
      setStatus(msg)
    } finally {
      setIsProcessing(false)
      setBestUserId(0)

      queryClient.refetchQueries({ queryKey: ['members'] })
    }
  }

  const filtered = useMemo(() => {
    // filter members by search query
    return members.filter((member) => {
      return (
        member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.last_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [members, searchQuery])

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" className="lg:hidden">
                <IconMenu />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setMode('register')}>
                <UserPlus className="size-4" /> Register Face
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMode('checkin')}>
                <CheckCircle className="size-4" /> Checkin/Checkout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden flex-wrap justify-center gap-4 lg:flex">
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
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 py-4 pt-0! md:gap-6 md:py-6">
        <div className="h-full px-4 lg:px-6">
          <>
            <div className="mx-auto h-full space-y-2">
              {/* User ID for Registration */}
              {mode === 'register' ? (
                <div className="mx-auto mt-2 max-w-md">
                  <SearchableSelect
                    value={userId}
                    onChange={(value) => setUserId(value as string)}
                    options={members.map((member) => ({
                      value: String(member.id),
                      label: member.first_name + ' ' + member.last_name,
                    }))}
                    placeholder="Select a member"
                  />{' '}
                </div>
              ) : (
                <div className="flex w-full flex-col items-center justify-center"></div>
              )}

              <div className="text-foreground/80 mx-auto flex w-full items-center justify-center text-center">
                {'Click capture button to '}
                {mode === 'register'
                  ? 'Register Face'
                  : mode === 'checkin'
                    ? 'Checkin/Checkout'
                    : 'Check Out Now'}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size={'icon'}
                      variant="ghost"
                      className="ml-2 flex gap-2"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start" className="w-64">
                    {videoDevices.map((device, index) => (
                      <DropdownMenuItem
                        key={device.deviceId}
                        onClick={() => {
                          setSelectedDeviceId(device.deviceId)
                          startCamera(device.deviceId)
                        }}
                        className="flex justify-between"
                      >
                        <span className="truncate">
                          {device.label || `Camera ${index + 1}`}
                        </span>

                        {selectedDeviceId === device.deviceId && (
                          <Check className="h-4 w-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="relative mx-auto h-[500px] min-h-96 w-full max-w-2xl rounded-3xl bg-black sm:h-[600px] sm:w-[466px]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full rounded-3xl object-cover"
                />

                <Button
                  onClick={captureAndSend}
                  disabled={
                    isProcessing || (mode === 'register' && !userId.trim())
                  }
                  className={`absolute bottom-8 left-1/2 mx-auto flex size-14 -translate-x-1/2 transform items-center gap-2 rounded-full bg-linear-to-br text-sm font-bold text-white backdrop-blur-sm transition-all hover:scale-105 ${
                    isProcessing || (mode === 'register' && !userId.trim())
                      ? 'cursor-not-allowed from-gray-600 to-gray-800'
                      : mode === 'register'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : mode === 'checkin'
                          ? 'from-green-600/50 to-green-300/50 hover:bg-green-600'
                          : 'hover:'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="size-8 animate-spin" />
                    </>
                  ) : (
                    <>
                      <IoCamera className="size-8" />
                    </>
                  )}
                </Button>
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

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Attendance Status</DialogTitle>
                  </DialogHeader>
                  {/* Status */}
                  <div className="mt-4 text-center">
                    <div className="bg-popover inline-block rounded-2xl text-sm md:text-base">
                      {typeof status === 'string' ? (
                        <p className="text-foreground">{status}</p>
                      ) : (
                        status
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose>
                      <Button className="" size={'sm'} variant={'outline'}>
                        Close
                      </Button>
                    </DialogClose>

                    <Button
                      className=""
                      size={'sm'}
                      variant={'ghost'}
                      onClick={undoAttendance}
                    >
                      Undo
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Capture Button */}
            </div>
          </>
        </div>
      </div>
    </>
  )
}
