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
  FormDescription,
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
import { useState } from 'react'
import { getUserProfileDataAPI, loginAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import axios from 'axios'
import { useProfile } from '@/zustand/profile'

const tokenRegisterSchema = z.object({
  token: z.string().min(10, 'Token is required'),
})

const formSchema = tokenRegisterSchema

export default function TokenRegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [user, setUser] = useState({
    email: '',
    password: '',
  })
  const { profile, setUserProfile, updateProfile } = useProfile()

  const [accountRecovery, setAccountRecovery] = useState<{
    show: boolean
    message: string
  }>({ show: false, message: '' })
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/user/register-token/',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      console.log(response.data)

      if (response.status === 201) {
        toast.success('Admin registered!')
        setIsSuccess(true)

        setUser(response.data.user)
      }
    } catch (error: any) {
      console.log(error?.response)
      toast.error(`Register Error ${error?.response?.data?.message ?? ''}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col items-center md:min-h-[50vh] md:justify-center lg:px-4">
      <div className="w-full">
        <CardHeader className="mb-6 space-y-1 md:text-center">
          <CardTitle className="text-2xl md:text-3xl lg:text-4xl">
            Login
          </CardTitle>
          <CardDescription>
            Enter your email and password to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div>
              <p className="text-muted-foreground">
                Use these credentials to login
              </p>

              <div className="flex flex-col gap-4 p-2">
                <p className="flex gap-1">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{user.email}</span>
                </p>
                <p className="flex gap-1">
                  <span className="text-muted-foreground">Password:</span>
                  <span>{user.password}</span>
                </p>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormControl>
                          <Input
                            className="h-12!"
                            id="token"
                            placeholder="Enter token"
                            type="text"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />

                        <FormDescription>
                          Get token from{' '}
                          <span className="text-white!">
                            https://e-library-narowal.vercel.app
                          </span>
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="mx-auto h-10! w-full md:w-[150px]"
                  >
                    {isLoading ? 'Registering...' : 'Register'}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* <div className="mt-4 text-center text-sm">
            Not a member?{' '}
            <Link href="/register" className="underline">
              Register
            </Link>
          </div> */}
          <div className="flex justify-center p-2">
            <Link href={'/login'}>
              <Button variant={'link'}>Login</Button>
            </Link>
          </div>
        </CardContent>
      </div>
    </div>
  )
}
