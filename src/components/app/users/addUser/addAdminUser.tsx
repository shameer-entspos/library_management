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
import { SearchableSelect } from '@/components/ui/search-select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLibraryStore } from '@/zustand/libraries'
import { PasswordInput } from '@/components/ui/password-input'
import { useMemberStore } from '@/zustand/members'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'

// Replace this with your actual API call
// import { createSuperAdmin } from '@/lib/api'

const superAdminSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone_no: z
    .string()
    .regex(/^(\+92|0)?3\d{9}$/, 'Invalid Pakistani phone number')
    .or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  library_id: z.string().min(1, 'Select one library'),
})

type SuperAdminFormValues = z.infer<typeof superAdminSchema>

export default function AdminCreateForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { data: session }: any = useSession()
  const { libraries } = useLibraryStore()
  const { members } = useMemberStore()
  const queryClient = useQueryClient()

  const form = useForm<SuperAdminFormValues>({
    resolver: zodResolver(superAdminSchema),
    defaultValues: {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_no: '',
      password: '',
      library_id: '',
    },
  })

  const libraryOptions =
    libraries.length > 0 &&
    libraries
      .filter((lib) => !lib.has_admin)
      .map((lib) => ({
        value: lib.id?.toString() || '',
        label: `${lib.name} (${lib.code})`,
      }))

  async function onSubmit(values: SuperAdminFormValues) {
    setLoading(true)
    const token = session?.user?.access

    try {
      const res = await axios.post('/api/user/create-admin/', values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(res.data)
      form.reset()

      if (res.status === 201) {
        toast.success('Admin created successfully!')
      }

      form.reset()
      setOpen(false)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create super admin')
    } finally {
      setLoading(false)
      queryClient.refetchQueries({ queryKey: ['members'] })
    }
  }

  useEffect(() => {
    let id = '1'

    if (members && members.length > 0) {
      const maxId = Math.max(...members.map((m) => Number(m.id || 0)))
      id = (maxId + 1).toString()
    }

    const subscription = form.watch((value, { name }) => {
      if (name === 'email' && value.email) {
        const base = value.email.split('@')[0]

        form.setValue('username', `${base}${id}`)

        form.setValue('password', `${base}@Lib${id}`)
      }
    })

    return () => subscription.unsubscribe()
  }, [form, members]) // Add dependencies

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size={'lg'} className="h-9!">
          <Plus />
          <span className="hidden sm:inline">Create Admin</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Library Admin</DialogTitle>
          <DialogDescription>
            Create a new super admin account and assign them to one or more
            libraries.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 md:space-y-6"
          >
            {/* Assign Libraries */}
            <FormField
              control={form.control}
              name="library_id"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Assign to Library</FormLabel>
                    <Link href={'/libraries'}>
                      <Button
                        size={'sm'}
                        onClick={() => setOpen(false)}
                        variant={'ghost'}
                      >
                        <Plus />
                        New
                      </Button>
                    </Link>
                  </div>
                  <FormControl>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={libraryOptions || []}
                      placeholder="Search and select libraries..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Name Fields */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
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
                      <Input placeholder="Enter last name" {...field} />
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
                        placeholder="admin@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="03001234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Autogenerated" readOnly {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder="Autogenerated"
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size={'lg'}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button size={'lg'} type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Admin'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
