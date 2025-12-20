import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')

    const res = await fetch(`${process.env.API_URL_PREFIX}/api/user/profile/`, {
      headers: {
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    const contentType = res.headers.get('content-type') || ''

    let payload: any

    if (contentType.includes('application/json')) {
      payload = await res.json()
    } else {
      const text = await res.text()
      payload = {
        detail: 'Non-JSON response from backend',
        raw: text.slice(0, 300),
      }
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          error: payload?.detail || 'Backend error',
          status: res.status,
        },
        { status: res.status }
      )
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Profile API error:', error)

    return NextResponse.json(
      {
        error: 'Internal proxy error',
      },
      { status: 500 }
    )
  }
}
