import ThemeToggle from '@/components/app/theme/theme-toggle'
import Image from 'next/image'
import React from 'react'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-[100dvh] w-full flex-col md:flex-row md:gap-4">
      <div className="flex h-[250px] flex-col overflow-hidden bg-[url('/images/auth-bg-2.jpg')] bg-cover bg-center sm:h-[300px] md:h-full md:w-1/2 md:rounded-r-[50px] lg:w-3/5">
        <div className="flex justify-between bg-black/70 p-2 md:bg-transparent xl:p-4">
          <ThemeToggle />
        </div>
        <div className="flex flex-1 flex-col items-center justify-end gap-4 bg-black/70 from-transparent to-black md:bg-transparent md:bg-gradient-to-b">
          <div className="flex flex-col items-center gap-1 sm:gap-2 sm:p-6 md:gap-4">
            <Image
              src={'/govt-of-punjab-logo.png'}
              alt="govt-of-punjab-logo"
              width={100}
              height={100}
              className="size-16 rounded-full sm:size-20 md:size-24 lg:size-32"
            />
            <h2 className="text-center text-3xl font-bold text-white lg:text-4xl">
              E-Library
            </h2>
            <p className="text-center text-white/80">
              Transforming public libraries through secure digital solutions.
            </p>
          </div>
          <div className="flex h-8 w-full rounded-t-[50px] bg-white sm:h-10 md:hidden dark:bg-neutral-950" />
        </div>
      </div>
      <div className="customscroll h-[calc(100dvh-300px)] flex-1 rounded-3xl md:mt-0 md:h-full">
        <>{children}</>
      </div>
    </div>
  )
}

export default AuthLayout
