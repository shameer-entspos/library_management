// app/api/user/all/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')

  const res = await fetch('http://13.49.136.84:8000/api/user/all/', {
    headers: {
      Authorization: authHeader || '',
    },
  })

  const data = await res.json()
  return Response.json(data)
}
