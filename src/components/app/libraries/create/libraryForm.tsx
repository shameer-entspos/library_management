import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Plus } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { toast } from 'sonner'
import { TimePicker } from '@/components/ui/date-timepicker'
import { SearchableSelect } from '@/components/ui/search-select'
import cities from '@/components/app/libraries/create/cities.json'
import { useSession } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'

const libraryFormSchema = z.object({
  name: z.string().min(2, 'Library name is required'),
  code: z.string().min(2, 'Library code is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  opening_time: z.string().optional(),
  closing_time: z.string().optional(),
})

type LibraryFormValues = z.infer<typeof libraryFormSchema>

const LibraryCreateForm = () => {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session }: any = useSession()
  const queryClient = useQueryClient()

  const form = useForm<LibraryFormValues>({
    resolver: zodResolver(libraryFormSchema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      opening_time: '09:00',
      closing_time: '17:00',
    },
  })

  const onSubmit = async (data: LibraryFormValues) => {
    setIsLoading(true)
    console.log('Submitted data:', data)

    const token = session?.user?.access

    try {
      const res = await axios.post('/api/libraries/create/', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      // form.reset()

      if (res.status === 201) {
        toast.success('Library created successfully!')
      }

      setOpen(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create library')
    } finally {
      setIsLoading(false)
      queryClient.refetchQueries({ queryKey: ['members'] })
    }
  }

  // Convert cities to options format expected by SearchableSelect
  const cityOptions = cities.map((city) => ({
    value: city.code,
    label: `${city.name} (${city.code})`,
  }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={'sm'} variant="secondary">
          <Plus />
          <span className="hidden sm:inline-block">Create Library</span>
        </Button>
      </DialogTrigger>

      <DialogContent showCloseButton={false} className="px-4 md:px-6">
        <DialogHeader>
          <DialogTitle>Create Library</DialogTitle>
          <DialogDescription>
            Fill the form below to create a new library
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 md:space-y-6"
          >
            <>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Library Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Central Library" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City / Location Code</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={cityOptions}
                        placeholder="Search and select a city..."
                        // searchPlaceholder="Type to search cities..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+92 300 1234567" {...field} />
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
                      <Input
                        type="email"
                        placeholder="library@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="opening_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Time</FormLabel>
                    <FormControl>
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closing_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Closing Time</FormLabel>
                    <FormControl>
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
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
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street, City, Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Library'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default LibraryCreateForm
