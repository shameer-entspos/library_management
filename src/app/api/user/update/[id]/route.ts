import { NextResponse } from 'next/server'

interface Params {
  params: { id: string }
}

export async function PUT(request: Request, params: Params) {
  const { id } = await params.params
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')

    // Forward the request to your backend
    const backendResponse = await fetch(
      `${process.env.API_URL_PREFIX}/api/user/update/${id}/`,
      {
        method: 'PUT', // match the axios method
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
    console.error('Proxy error (user update):', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, params: Params) {
  const { id } = await params.params

  try {
    const authHeader = request.headers.get('authorization')

    const backendResponse = await fetch(
      `${process.env.API_URL_PREFIX}/api/user/delete/${id}/`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
        },
      }
    )

    const data = await backendResponse.json()
    return NextResponse.json(data, { status: backendResponse.status })
  } catch (error) {
    console.error('Proxy error (user delete):', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
