import LoginPreview from '@/components/app/auth/login/login'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="grid h-screen place-content-center bg-black">
      <Link href="/login">Login</Link>
    </div>
  )
}
