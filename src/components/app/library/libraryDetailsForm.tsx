'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useEffectEvent, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimePicker } from '@/components/ui/date-timepicker'
import { useProfile } from '@/zustand/profile'

export const librarySchema = z.object({
  name: z.string().min(3, 'Library name is required'),
  code: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email('Invalid email'),
  opening_time: z.string(),
  closing_time: z.string(),
  is_active: z.boolean(),
})

type LibraryFormValues = z.infer<typeof librarySchema>

export default function LibraryForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { profile } = useProfile()

  const form = useForm<LibraryFormValues>({
    resolver: zodResolver(librarySchema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      opening_time: '',
      closing_time: '',
      is_active: true,
    },
  })

  useEffect(() => {
    form.reset({
      name: profile?.libraries[0]?.name ?? '',
      code: profile?.libraries[0]?.code ?? '',
      address: profile?.libraries[0]?.address ?? '',
      phone: profile?.libraries[0]?.phone ?? '',
      email: profile?.libraries[0]?.email ?? '',
      opening_time: profile?.libraries[0]?.opening_time ?? '',
      closing_time: profile?.libraries[0]?.closing_time ?? '',
      is_active: profile?.libraries[0]?.is_active ?? true,
    })
  }, [profile?.libraries[0]])

  const onSubmit = async (data: LibraryFormValues) => {
    setIsLoading(true)

    try {
      return
      setIsLoading(false)
      //   if (library) {
      //     await axios.patch(`/api/libraries/${library.id}/`, data)
      //     toast.success('Library updated successfully')
      //   } else {
      //     await axios.post('/api/libraries/', data)
      //     toast.success('Library created successfully')
      //   }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Operation failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Library Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Library Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10!" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Library Code</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10!" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10!" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10!" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              <FormField
                control={form.control}
                name="opening_time"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Opening Time</FormLabel>
                    <FormControl>
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closing_time"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Closing Time</FormLabel>
                    <FormControl>
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" size={'lg'} disabled={isLoading}>
              {isLoading
                ? 'Saving...'
                : profile?.libraries[0]?.id
                  ? 'Update Library'
                  : 'Create Library'}
            </Button>
          </CardContent>
        </Card>{' '}
      </form>
    </Form>
  )
}
