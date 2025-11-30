/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { useState } from 'react'
import { getUserProfileDataAPI, loginAPI } from '@/lib/api'
import { signIn } from '@/auth'
import { useRouter } from 'next/navigation'

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const formSchema = loginFormSchema

export default function LoginPreview() {
  const [isLoading, setIsLoading] = useState(false)
  const [accountRecovery, setAccountRecovery] = useState<{
    show: boolean
    message: string
  }>({ show: false, message: '' })
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const response = await loginAPI(data)

      if (response.status === 200 && response.data?.deleted) {
        setAccountRecovery({
          show: true,
          message: response.data.message,
        })
      } else if (response.status === 200) {
        console.log(response.data)
        toast.success('Login successful!')
        return
        const { access, refresh } = response.data
        const res = await getUserProfileDataAPI(response.data.access)

        if (res.status === 200) {
          const loginRes = await signIn('credentials', {
            email: data.email,
            access: access,
            refresh: refresh,
            role: res?.data?.role || '',
            redirect: false,
          })
          if (loginRes?.error) {
            toast.error(loginRes.error)
            return
          }
          if (loginRes?.ok) {
            toast.success('Login successful!')
            router.push('/channels')
          }
        }
      }
    } catch (error: any) {
      console.log(error?.response)
      toast.error(`Login Error '${error?.response?.data?.message}'`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col items-center md:min-h-[50vh] md:justify-center lg:px-4">
      <div className="w-full">
        <CardHeader className="mb-6 space-y-1 md:text-center">
          <CardTitle className="text-3xl lg:text-4xl">Login</CardTitle>
          <CardDescription>
            Enter your email and password to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="johndoe@mail.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <Link
                          href="#"
                          className="ml-auto inline-block text-sm underline"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <FormControl>
                        <PasswordInput
                          id="password"
                          placeholder="******"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="mx-auto w-full md:w-[150px]">
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            Not a member?{' '}
            <Link href="/register" className="underline">
              Register
            </Link>
          </div>
        </CardContent>
      </div>
    </div>
  )
}
