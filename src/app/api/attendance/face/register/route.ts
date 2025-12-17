import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Forward the request to your actual backend
    const backendResponse = await fetch(
      'http://13.49.136.84:8000/api/attendance/face/register/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    const data = await backendResponse.json()

    // Forward the status and data from backend
    return NextResponse.json(data, { status: backendResponse.status })
  } catch (error) {
    console.error('Proxy error (face register):', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
