export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Forward the request to your backend
    const res = await fetch(`${process.env.API_URL_PREFIX}/api/user/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You can forward other headers if needed
      },
      body: JSON.stringify(body), // ← Very important: forward the body
    })

    // Optional: handle non-200 responses
    if (!res.ok) {
      // Forward the error from backend
      return new Response(await res.text(), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await res.json()
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
