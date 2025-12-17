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
import {
  CheckCircle,
  Loader2,
  Plus,
  RefreshCw,
  UserCheck,
  XCircle,
} from 'lucide-react'
import Image from 'next/image'
import axios from 'axios'
import { Card } from '@/components/ui/card'

const addUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  phone_no: z.string().min(10, 'Phone number must be at least 10 digits'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address is required'),
  country: z.string().min(2, 'Country is required'),
  gender: z.string().optional(),
  cnic: z.string().min(13, 'CNIC is required'),
})

type AddUserFormValues = z.infer<typeof addUserSchema>

export default function AddUserForm() {
  const queryClient = useQueryClient()

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

  const imgRef = useRef<HTMLImageElement>(null)
  const [userId, setUserId] = useState('')
  const [ipAddress, setIpAddress] = useState('192.168.100.8')
  const [user, setUser] = useState<any>(null)
  const [status, setStatus] = useState<React.ReactNode>(
    'Enter phone IP and connect...'
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [streamUrl, setStreamUrl] = useState('')

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
      gender: '',
      cnic: '',
    },
  })

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'email' && value.email) {
        const username = value.email.split('@')[0]
        form.setValue('username', username)
      }
    })

    return () => subscription.unsubscribe()
  }, [form])

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

        updateStream()
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
      queryClient.refetchQueries({ queryKey: ['members'] })
    }
  }

  // capture and send image

  // Update stream when IP changes
  const updateStream = () => {
    const url = `http://${ipAddress.trim()}:4747/mjpegfeed?1280x720`
    setStreamUrl(url)
    setStatus('Connecting to phone camera... Please wait.')
  }

  const captureAndSend = async () => {
    if (!imgRef.current || isProcessing || !imgRef.current.complete) {
      setStatus('Camera not ready or loading. Please wait.')
      return
    }

    setIsProcessing(true)
    setStatus(<Loader2 className="mx-auto h-12 w-12 animate-spin" />)

    const canvas = document.createElement('canvas')
    canvas.width = imgRef.current.naturalWidth || 1280
    canvas.height = imgRef.current.naturalHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setStatus('Failed to capture image')
      setIsProcessing(false)
      return
    }
    ctx.drawImage(imgRef.current, 0, 0)
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.95)

    try {
      if (!userId.trim()) {
        setStatus('Please enter your User ID')
        setIsProcessing(false)
        return
      }

      const res = await axios.post(`/backend/api/attendance/face/register/`, {
        user_id: parseInt(userId),
        image: imageBase64,
      })

      setRegistered({
        success: true,
        tab: 'qr_code',
        qrUrl: res.data.qr_url,
        pdfGenerated: res.data.pdf_generated,
      })

      setStatus(
        <div className="text-center">
          <CheckCircle className="mx-auto size-8 text-green-500" />
          <div className="font-bold text-green-500">
            Registered Successfully!
          </div>
          <div className="mt-2 text-lg font-medium">
            {res.data.user || 'User'}
          </div>
        </div>
      )
    } catch (err: any) {
      const msg =
        err.response?.data?.error || 'Failed. Check connection or try again.'
      setStatus(
        <div className="text-center">
          <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <div className="text-xl font-bold text-red-600">{msg}</div>
        </div>
      )
    }

    setIsProcessing(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)

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
          Add Member
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className={` ${registered.tab === 'scan_image' && 'max-h-[96vh]! sm:max-w-2xl!'}`}
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
                  <div className="grid gap-4">
                    {/* Username & Email */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Autogenerated"
                                readOnly
                                {...field}
                              />
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
                              <Input {...field} />
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
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10! w-full">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* City & Country */}
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
                              <Input {...field} />
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
                            <Input {...field} />
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
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant={'outline'} size={'lg'}>
                        Close
                      </Button>
                    </DialogClose>

                    <Button type="submit" size={'lg'}>
                      {loading ? 'Adding...' : 'Add Member'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            ) : registered.tab === 'scan_image' ? (
              <div className="flex flex-col gap-4">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex w-full flex-col gap-4 py-2 sm:flex-row"
                >
                  <Input
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="192.168.1.100"
                    className="rounded-full"
                  />
                  <Button
                    onClick={updateStream}
                    size="lg"
                    className="rounded-full"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" /> Connect
                  </Button>
                </form>

                {streamUrl && (
                  <Card className="relative overflow-hidden py-0!">
                    <img
                      ref={imgRef}
                      src={streamUrl}
                      alt="Phone Camera Stream"
                      className="w-full"
                      crossOrigin="anonymous"
                      onLoad={() => setStatus('Camera connected! Ready to use')}
                      onError={() =>
                        setStatus(
                          'Cannot connect. Check IP address and DroidCam Wi-Fi mode'
                        )
                      }
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-96 w-72 rounded-3xl border-4 border-dashed border-white opacity-60" />
                    </div>
                    <div className="bg-opacity-70 absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-black px-6 py-3 text-lg font-medium text-white">
                      Align face in oval
                    </div>
                  </Card>
                )}

                {/* Status */}
                <div className="mx-auto inline-block rounded-2xl">
                  <>
                    {typeof status === 'string' ? (
                      <p className="text-foreground text-xl">{status}</p>
                    ) : (
                      status
                    )}
                  </>
                </div>

                <div className="flex justify-center">
                  <Button
                    size={'lg'}
                    onClick={captureAndSend}
                    className="rounded-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-12 w-12 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Capture & Register Face'
                    )}
                  </Button>
                </div>
              </div>
            ) : registered.tab === 'qr_code' ? (
              <>
                <div className="flex flex-col justify-center gap-4 text-center">
                  <>{registered.qrUrl}</>
                  {registered.qrUrl ? (
                    <Image
                      src={`${registered.qrUrl}`}
                      alt="Member QR Code"
                      className="h-64 w-64 object-contain"
                      width={256}
                      height={256}
                    />
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
