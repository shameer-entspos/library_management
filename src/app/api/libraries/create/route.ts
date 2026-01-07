import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const authHeader = request.headers.get('authorization')

    const backendResponse = await fetch(
      `${process.env.API_URL_PREFIX}/api/user/library/create/`,
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
