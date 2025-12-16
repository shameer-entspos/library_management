import RegisterForm from '@/components/app/auth/register/register'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Register - E-Library',
  description: 'Register to access your E-Library account',
}

const RegisterPage = () => {
  return (
    <>
      <RegisterForm />
    </>
  )
}

export default RegisterPage
