// app/api/user/all/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')

  const res = await fetch(`${process.env.API_URL_PREFIX}/api/user/dashboard/`, {
    headers: {
      Authorization: authHeader || '',
    },
  })

  const data = await res.json()
  return Response.json(data)
}
