'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProfile } from '@/zustand/profile'

export const updateProfileSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  username: z.string().optional(),
  phone_no: z.string().min(10, 'Enter valid phone number'),
  city: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string(),
  about: z.string().max(1024).optional(),
  cnic: z
    .string()
    .regex(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, 'Invalid CNIC format')
    .optional(),
  photo: z.any().optional(),
  cnic_front: z.any().optional(),
  cnic_back: z.any().optional(),
})

type FormValues = z.infer<typeof updateProfileSchema>

export default function UpdateProfileForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { profile } = useProfile()

  const form = useForm<FormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      username: '',
      phone_no: '',
      city: '',
      country: '',
      address: '',
      timezone: 'UTC',
      about: '',
      cnic: '',
    },
  })

  useEffect(() => {
    form.reset({
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      username: profile?.username ?? '',
      phone_no: profile?.phone_no,
      city: profile?.city ?? '',
      country: profile?.country ?? '',
      address: profile?.address ?? '',
      timezone: profile?.timezone ?? 'UTC',
      about: profile?.about ?? '',
      cnic: profile?.cnic ?? '',
    })
  }, [profile])

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)

    try {
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value as any)
      })

      await axios.patch('/api/users/profile/', formData)

      toast.success('Profile updated successfully')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:gap-6">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10!" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10!" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10!" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_no"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10!" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="h-10! w-max"
                size={'lg'}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Update Profile'}
              </Button>{' '}
            </div>
            {/* <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <FormLabel>About</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                </FormItem>
              )}
            /> */}
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
