/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { registerNewMember } from '@/lib/api'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Loader2, Plus, XCircle } from 'lucide-react'
import Image from 'next/image'
import axios from 'axios'
import { SearchableSelect } from '@/components/ui/search-select'
import { useMemberStore } from '@/zustand/members'
import { IoCamera } from 'react-icons/io5'

const categoryOptions = [
  { label: 'Student', value: 'student' },
  { label: 'Teacher', value: 'teacher' },
  { label: 'Researcher', value: 'researcher' },
  { label: 'Senior Citizen', value: 'senior_citizen' },
  { label: 'House Wife', value: 'house_wife' },
  { label: 'Business Person', value: 'business_person' },
  { label: 'Govt. Employee', value: 'govt_employee' },
  { label: 'Private Employee', value: 'private_employee' },
  { label: 'Farmer', value: 'farmer' },
  { label: 'Shopkeeper', value: 'shopkeeper' },
  { label: 'Industrialist', value: 'industrialist' },
  { label: 'Craftsmen', value: 'craftsmen' },
  { label: 'Sportsmen', value: 'sportsmen' },
  { label: 'Men of Letters', value: 'men_of_letters' },
  { label: 'Artist', value: 'artist' },
  { label: 'Social Worker', value: 'social_worker' },
  { label: 'Public Representative', value: 'public_representative' },
  { label: 'Professional', value: 'professional' },
  { label: 'Special Person', value: 'special_person' },
]

const ageGroupOptions = [
  { label: 'Less than 10 years', value: '<10' },
  { label: '10–15 years', value: '10-15' },
  { label: '16–25 years', value: '16-25' },
  { label: '26–35 years', value: '26-35' },
  { label: '36–45 years', value: '36-45' },
  { label: '46–60 years', value: '46-60' },
  { label: '61 years and above', value: '61+' },
]

export const addUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  phone_no: z
    .string()
    .regex(/^(\+92|0)?3\d{9}$/, 'Invalid phone number (e.g. 03XXXXXXXXX)'),
  category: z.string().min(1, 'Category is required'),
  age_group: z.string().min(1, 'Age group is required'),
  gender: z.enum(['male', 'female']).optional(),
  cnic: z
    .string()
    .regex(/^\d{5}-\d{7}-\d$/, 'CNIC must be in xxxxx-xxxxxxx-x format'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address is required'),
  country: z.string().min(2, 'Country is required'),
})
type AddUserFormValues = z.infer<typeof addUserSchema>

export default function AddUserForm() {
  const queryClient = useQueryClient()
  const { members } = useMemberStore()
  const [registered, setRegistered] = useState<{
    success: boolean
    tab: 'scan_image' | 'register' | 'qr_code'
    qrUrl: string | null
    pdfGenerated: boolean
  }>({
    success: false,
    tab: 'register',
    qrUrl: null,
    pdfGenerated: false,
  })

  const [open, setOpen] = useState(false)
  const { data: session }: any = useSession()
  const [loading, setLoading] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)

  const [userId, setUserId] = useState('')
  const streamRef = useRef<MediaStream | null>(null)
  const [user, setUser] = useState<any>(null)
  const [status, setStatus] = useState<React.ReactNode>(
    'Enter phone IP and connect...'
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [image, setImage] = useState('')
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone_no: '',
      city: '',
      address: '',
      country: 'Pakistan',
      gender: 'male',
      cnic: '',
    },
  })

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

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setStatus('Camera ready! Look straight at the camera')
    } catch (err: any) {
      console.error(err)

      if (err.name === 'NotAllowedError') {
        setStatus('Camera permission denied')
      } else {
        setStatus('Camera not available')
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // useEffect(() => {
  //   const subscription = form.watch((value, { name }) => {
  //     if (name === 'email' && value.email) {
  //       const username = value.email.split('@')[0]
  //       form.setValue('username', username)
  //     }
  //   })

  //   return () => subscription.unsubscribe()
  // }, [form])

  useEffect(() => {
    if (registered.tab === 'scan_image') {
      startCamera()
    }
  }, [registered.tab, open])

  useEffect(() => {
    stopCamera()
  }, [])

  useEffect(() => {
    // get latest member id
    if (members.length > 0) {
      const id = members.length + 1
      console.log(id)

      form.setValue('username', `NWL-${id}`)
    } else {
      form.setValue('username', `NWL-1`)
    }
  }, [open])

  async function onSubmit(values: AddUserFormValues) {
    const token = session?.user?.access
    setLoading(true)

    try {
      const res = await registerNewMember(token, values)

      if (res.status === 201) {
        toast.success('Member registered successfully!')

        setRegistered({
          success: true,
          tab: 'scan_image',
          qrUrl: null,
          pdfGenerated: false,
        })

        const { user } = res.data

        setUser(user)
        setUserId(user.id.toString())
      } else if (res.status === 200) {
        toast.error(res.data.message || 'Email or username already exists.')
      } else {
        toast.error('Unexpected error. Please try again.')
      }
    } catch (error) {
      console.error('Form submission error', error)
      toast.error('Failed to register. Check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  const captureAndSend = async () => {
    if (!videoRef.current || isProcessing) return

    setIsProcessing(true)
    setStatus(<Loader2 className="mx-auto h-12 w-12 animate-spin" />)

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

    try {
      if (!userId.trim()) {
        setStatus('Please enter your User ID')
        setIsProcessing(false)
        return
      }

      const res = await axios.post('/api/attendance/face/register/', {
        user_id: parseInt(userId),
        image: imageBase64,
      })

      setRegistered({
        success: true,
        tab: 'qr_code',
        qrUrl: res.data.qr_url,
        pdfGenerated: res.data.pdf_generated,
      })

      stopCamera()

      setStatus(
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <div className="text-2xl font-bold text-green-600">
            Registered Successfully!
          </div>
          <div className="mt-2 text-lg">{res.data.user || 'User'}</div>
        </div>
      )
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Operation failed. Try again.'
      setStatus(
        <div className="text-center">
          <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <div className="text-xl font-bold text-red-600">{msg}</div>
        </div>
      )
    } finally {
      queryClient.refetchQueries({ queryKey: ['members'] })
    }

    setIsProcessing(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)

        if (!isOpen) {
          stopCamera()
        }

        if (!isOpen && registered.success) {
          setTimeout(() => {
            setRegistered({
              success: false,
              tab: 'register',
              qrUrl: null,
              pdfGenerated: false,
            })
            form.reset()
            setLoading(false)
          }, 200)
        }
      }}
    >
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        <Button variant="default" className="h-9! text-white">
          <Plus />
          <span className="hidden sm:inline-block">Add Member</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className={` ${registered.tab === 'scan_image' && 'max-h-[96vh]! sm:max-w-2xl!'} px-4! md:px-6!`}
      >
        <DialogHeader>
          <DialogTitle>
            {registered.success && registered.tab === 'qr_code'
              ? 'Registration Complete'
              : registered.success && registered.tab === 'scan_image'
                ? `Register Face for ${user?.first_name || 'Member'}`
                : 'Add New Member'}
          </DialogTitle>
          <DialogDescription>
            {registered.success && registered.tab === 'qr_code'
              ? 'Scan the QR code below to access their membership.'
              : registered.success && registered.tab === 'scan_image'
                ? 'Use the camera to capture and register the member’s face.'
                : 'Fill the form to register a new member.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-full w-full flex-col items-center overflow-auto xl:justify-center">
          <div className="w-full">
            {registered.tab === 'register' ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Username & Email */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Member ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Auto generated" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* First & Last Name */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Phone & Gender */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="phone_no"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="03XXXXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10! w-full">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Category & Age Group */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <SearchableSelect
                            value={field.value}
                            onChange={field.onChange}
                            options={categoryOptions}
                            placeholder="Select category"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age_group"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age Group</FormLabel>
                          <SearchableSelect
                            value={field.value}
                            onChange={field.onChange}
                            options={ageGroupOptions}
                            placeholder="Select age group"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* City & Country (INPUT) */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Pakistan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* CNIC */}
                  <FormField
                    control={form.control}
                    name="cnic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNIC</FormLabel>
                        <FormControl>
                          <Input placeholder="xxxxx-xxxxxxx-x" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mailing Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Footer */}
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" size="lg">
                        Close
                      </Button>
                    </DialogClose>

                    <Button type="submit" size="lg">
                      {loading ? 'Adding...' : 'Add Member'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            ) : registered.tab === 'scan_image' ? (
              <div className="flex flex-col gap-4">
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
                <div className="relative mx-auto h-[350px] w-full max-w-2xl rounded-3xl bg-black sm:h-[550px] sm:w-[406px]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full rounded-3xl object-cover"
                  />
                  <Button
                    size={'lg'}
                    onClick={captureAndSend}
                    className="absolute -bottom-7 left-1/2 mx-auto flex size-14 -translate-x-1/2 transform items-center gap-2 rounded-3xl rounded-full bg-linear-to-br text-sm font-bold text-white backdrop-blur-sm transition-all hover:scale-105"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-12 w-12 animate-spin" />
                      </>
                    ) : (
                      <IoCamera className="size-8" />
                    )}
                  </Button>
                </div>{' '}
                {/* Status */}
                <div className="mx-auto mt-5 inline-block rounded-2xl">
                  <>
                    {typeof status === 'string' ? (
                      <p className="text-foreground text-sm md:text-lg">
                        {status}
                      </p>
                    ) : (
                      status
                    )}
                  </>
                </div>
              </div>
            ) : registered.tab === 'qr_code' ? (
              <>
                <div className="flex flex-col justify-center gap-4 text-center">
                  {registered.qrUrl ? (
                    <>
                      <Image
                        src={`${process.env.API_URL_PREFIX}${registered.qrUrl}`}
                        alt="Member QR Code"
                        className="h-64 w-64 object-contain"
                        width={256}
                        height={256}
                      />
                    </>
                  ) : (
                    <p>No QR available (PDF generation failed).</p>
                  )}
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" size="lg">
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </>
            ) : (
              <>
                {(() =>
                  setRegistered({
                    success: false,
                    tab: 'register',
                    qrUrl: null,
                    pdfGenerated: false,
                  }))()}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
