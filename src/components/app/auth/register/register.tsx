'use client'

import Link from 'next/link'
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
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// -----------------------------
// Zod Schema
// -----------------------------

const registerSchema = z
  .object({
    name: z.string().min(3, 'Name is too short'),
    email: z.string().email(),
    phone: z.string().min(10, 'Invalid phone number'),
    gender: z.enum(['male', 'female', 'other']),
    // cnic: z.string().optional(),
    // profileImage: z.any().optional(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function RegisterForm() {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      gender: 'male',
      // cnic: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {
      console.log(values)
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      )
    } catch (error) {
      console.error('Form submission error', error)
      toast.error('Failed to register. Please try again.')
    }
  }

  return (
    <div className="flex h-full w-full flex-col items-center overflow-auto lg:px-4 xl:justify-center">
      <div className="w-full">
        <div className="hidden h-16 md:flex xl:hidden" />
        <CardHeader className="mb-6 space-y-1 md:text-center">
          <CardTitle className="text-3xl lg:text-4xl">Create Account</CardTitle>
          <CardDescription>
            Fill in the details to register a new user.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6">
                <div className="grid gap-4 xl:grid-cols-2">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            className="h-12!"
                            placeholder="John Doe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            className="h-12!"
                            type="email"
                            placeholder="johndoe@mail.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            className="h-12!"
                            type="text"
                            placeholder="0300-1234567"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Gender */}
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select gender" />
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
                {/* <div className="grid gap-4 xl:grid-cols-2"> */}
                {/* CNIC */}
                {/* <FormField
                    control={form.control}
                    name="cnic"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>CNIC (optional)</FormLabel>
                        <FormControl>
                          <Input
                          className='h-12!' placeholder="42101-1234567-1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                {/* Profile Picture */}
                {/* <FormField
                    control={form.control}
                    name="profileImage"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Profile Picture</FormLabel>
                        <FormControl>
                          <Input
                          className='h-12!'
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0])
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                {/* </div> */}
                <div className="grid gap-4 xl:grid-cols-2">
                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="******" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="mx-auto w-full md:w-[150px]">
                  Register
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
          <div className="h-6 md:hidden" />
        </CardContent>
      </div>
    </div>
  )
}
