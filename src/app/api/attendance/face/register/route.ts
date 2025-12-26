import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Forward the request to your actual backend
    const backendResponse = await fetch(
      `${process.env.API_URL_PREFIX}/api/attendance/face/register/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.get('authorization') || '',
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
