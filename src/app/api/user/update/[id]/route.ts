import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // <-- Change here
) {
  const { id } = await params // <-- Await the promise here

  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')

    const backendResponse = await fetch(
      `${process.env.API_URL_PREFIX}/api/user/update/${id}/`,
      {
        method: 'PUT',
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // <-- Same change here
) {
  const { id } = await params // <-- Await here

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
