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
import { SearchableSelect } from '@/components/ui/search-select'

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

export default function UpdateUserForm({
  member,
  open,
  setOpen,
}: {
  member: any
  open: boolean
  setOpen: (open: boolean) => void
}) {
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

  const { data: session }: any = useSession()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [user, setUser] = useState<any>(null)

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      username: member.username,
      email: member.email,
      first_name: member.first_name,
      last_name: member.last_name,
      phone_no: member.phone_no,
      city: member.city,
      address: member.address,
      age_group: member.age_group,
      category: member.category,
      country: 'Pakistan',
      gender: member.gender,
      cnic: member.cnic,
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
      const res = await axios.put(`/api/user/update/${member?.id}/`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 200) {
        toast.success('Member updated successfully!')

        const { user } = res.data

        setUser(user)
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          readOnly
                          placeholder="Auto generated"
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
                  {loading ? 'Adding...' : 'Update'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
