// app/api/user/register/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const authHeader = request.headers.get('authorization')

    const backendResponse = await fetch(
      'http://13.49.136.84:8000/api/user/register/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
        },
        body: JSON.stringify(body),
      }
    )

    const data = await backendResponse.json()

    return NextResponse.json(data, { status: backendResponse.status })
  } catch (error) {
    console.error('Proxy error (user register):', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
