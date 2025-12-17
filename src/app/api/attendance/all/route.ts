// app/api/user/all/route.ts
export async function GET(request: Request) {
  const res = await fetch(
    `${process.env.API_URL_PREFIX}/api/attendance/all/`,
    {}
  )

  const data = await res.json()
  return Response.json(data)
}
