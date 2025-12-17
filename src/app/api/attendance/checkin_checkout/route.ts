// app/api/attendance/checkin_checkout/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Forward to your backend
    const backendResponse = await fetch(
      'http://13.49.136.84:8000/api/attendance/checkin_checkout/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body), // contains { action: 'checkin'|'checkout', image, method: 'face' }
      }
    )

    const data = await backendResponse.json()

    return NextResponse.json(data, { status: backendResponse.status })
  } catch (error) {
    console.error('Proxy error (checkin/checkout):', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
