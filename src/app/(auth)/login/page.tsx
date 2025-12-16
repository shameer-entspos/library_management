import LoginPreview from '@/components/app/auth/login/login'
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - E-Library',
  description: 'Login to access your E-Library account',
}

const LoginPage = () => {
  return (
    <div className="mx-auto h-full 2xl:max-w-3/4">
      <LoginPreview />
    </div>
  )
}

export default LoginPage
