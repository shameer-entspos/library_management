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

  // const loadVideoDevices = async () => {
  //   const devices = await navigator.mediaDevices.enumerateDevices()
  //   console.log(devices)
  //   const cams = devices.filter((d) => d.kind === 'videoinput')
  //   setVideoDevices(cams)

  //   // auto-select first camera
  //   if (cams.length && !selectedDeviceId) {
  //     setSelectedDeviceId(cams[0].deviceId)
  //   }
  // }

  const loadVideoDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    setVideoDevices(devices.filter((d) => d.kind === 'videoinput'))
  }

  // const startCamera = async (deviceId?: string) => {
  //   try {
  //     // stop previous stream
  //     if (streamRef.current) {
  //       streamRef.current.getTracks().forEach((t) => t.stop())
  //       streamRef.current = null
  //     }

  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: {
  //         deviceId: deviceId ? { exact: deviceId } : undefined,
  //         width: { ideal: 1280 },
  //         height: { ideal: 720 },
  //         frameRate: { ideal: 30 },
  //       },
  //     })

  //     streamRef.current = stream

  //     if (videoRef.current) {
  //       videoRef.current.srcObject = stream
  //       await videoRef.current.play()
  //     }

  //     setCameraState('ready')
  //     setStatus('Camera ready! Look straight at the camera')
  //   } catch (err) {
  //     console.error(err)
  //     setCameraState('error')
  //     setStatus('Failed to access camera')
  //   }
  // }

  const startCamera = async () => {
    try {
      // stop previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      // IMPORTANT: no deviceId at all
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      })
      const devices = await navigator.mediaDevices.enumerateDevices()

      // Filter only video input devices (cameras)
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput'
      )

      console.log('All devices:', devices)
      console.log('Video input devices:', videoDevices)

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraState('ready')
      setStatus('Camera ready! Look straight at the camera')
    } catch (err: any) {
      console.error(err)

      if (err.name === 'NotAllowedError') {
        setCameraState('denied')
        setStatus('Camera permission denied')
      } else {
        setCameraState('error')
        setStatus('Camera not available')
      }
    }
  }

  // useEffect(() => {
  //   loadVideoDevices()

  //   return () => {
  //     if (streamRef.current) {
  //       streamRef.current.getTracks().forEach((t) => t.stop())
  //       streamRef.current = null
  //     }
  //   }
  // }, [])

  useEffect(() => {
    startCamera()

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

      <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="h-full px-4 lg:px-6">
          <>
            <div className="mx-auto h-full space-y-2">
              {/* User ID for Registration */}
              {mode === 'register' ? (
                <div className="mx-auto max-w-md">
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
                <div className="flex w-full flex-col items-center justify-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        variant={'outline'}
                        className="mx-auto w-max text-wrap wrap-break-word"
                      >
                        Select Member
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4">
                      <div className="flex">
                        <CardTitle className="mb-2 flex-shrink-0 text-sm">
                          Members
                        </CardTitle>
                      </div>
                      <Input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        className="mb-2 h-8 flex-1 text-xs!"
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <div className="max-h-96 space-y-1 overflow-y-auto">
                        {filtered ? (
                          filtered.map((member) => {
                            const lastAttendance = getLatestAttendance(
                              member.attendances
                            )
                            const lastAction = getLatestAction(lastAttendance)
                            return (
                              <Button
                                key={member.id}
                                variant="outline"
                                className="w-full justify-start px-2!"
                                onClick={async () => {
                                  setIsProcessing(true)
                                  setOpen(true)
                                  setStatus(
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                                  )

                                  try {
                                    if (!profile?.access) {
                                      toast.error('You are not logged in.')
                                      return
                                    }
                                    const token = profile?.access
                                    if (!token) throw new Error('No auth token')

                                    const res = await axios.post(
                                      `http://127.0.0.1:8000/api/attendance/checkin_checkout/${member.id}/`,
                                      {},
                                      {
                                        headers: {
                                          Authorization: `Bearer ${token}`,
                                        },
                                      }
                                    )

                                    const isCheckIn =
                                      res.data.message.includes('In')
                                    setBestUserId(member.id)
                                    setStatus(
                                      <div className="text-center">
                                        <div
                                          className={`text-lg font-bold ${
                                            isCheckIn
                                              ? 'text-green-600'
                                              : 'text-blue-500'
                                          }`}
                                        >
                                          {res.data.user}
                                        </div>
                                        <div className="text-muted-foreground mt-1 text-sm">
                                          {res.data.message}
                                        </div>
                                        {res.data.duration && (
                                          <div className="text-foreground mt-1 text-sm">
                                            Duration: {res.data.duration}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  } catch (err: any) {
                                    const msg =
                                      err.response?.data?.error ||
                                      'Operation failed. Try again.'
                                    setStatus(
                                      <div className="text-center text-red-600">
                                        {msg}
                                      </div>
                                    )
                                  } finally {
                                    setIsProcessing(false)
                                  }
                                }}
                              >
                                <Image
                                  src={`${process.env.API_URL_PREFIX}${member.photo}`}
                                  alt={
                                    member.first_name + ' ' + member.last_name
                                  }
                                  className="size-8 rounded-full object-cover"
                                  width={32}
                                  height={32}
                                />
                                <div className="flex flex-col items-start">
                                  <span>
                                    {member.first_name} {member.last_name}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {lastAction
                                      ? new Date(lastAction)?.toLocaleString()
                                      : '-'}
                                  </span>
                                </div>
                              </Button>
                            )
                          })
                        ) : (
                          <span className="text-muted-foreground w-full text-center text-sm">
                            No members
                          </span>
                        )}
                      </div>

                      {status &&
                      status === 'Camera ready! Look straight at the camera' ? (
                        ''
                      ) : (
                        <div className="text-foreground mt-4 rounded-lg bg-gray-100 p-2 text-center text-sm">
                          {status}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <p className="mt-4 w-full text-center">OR</p>
                </div>
              )}

              <div className="text-foreground/80 mx-auto w-full text-center">
                {'Click capture button to '}
                {mode === 'register'
                  ? 'Register Face'
                  : mode === 'checkin'
                    ? 'Checkin/Checkout'
                    : 'Check Out Now'}
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
                  className={`absolute -bottom-7 left-1/2 mx-auto flex size-14 -translate-x-1/2 transform items-center gap-2 rounded-3xl bg-linear-to-br text-sm font-bold text-white backdrop-blur-sm transition-all hover:scale-105 ${
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
