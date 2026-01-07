/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './auth'

const publicRoutes = ['/test', '/login', '/register', '/attendances']

export async function middleware(request: NextRequest) {
  const session: any = await auth()
  const { pathname, search } = request.nextUrl

  if (pathname === '/') {
    const url = new URL('/dashboard', request.url)
    url.search = search
    return NextResponse.redirect(url)
  }

  if (pathname === '/login' && session) {
    const url = new URL('/dashboard', request.url)
    url.search = search
    return NextResponse.redirect(url)
  }

  //   if (
  //     session &&
  //     pathname.startsWith('/dashboard') &&
  //     session?.user?.role !== 'admin' &&
  //     session?.user?.role !== 'super_admin'
  //   ) {
  //     const url = new URL('/channels', request.url)
  //     url.search = search
  //     return NextResponse.redirect(url)
  //   }

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.search = search
    loginUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|backend|.*\\..*).*)'],
}
