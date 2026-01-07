import LoginPreview from '@/components/app/auth/login/login'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function Home() {
  redirect("/login")

  return (
    <div className="grid h-screen place-content-center bg-black">
      <Link href="/login">Login</Link>
    </div>
  )
}
