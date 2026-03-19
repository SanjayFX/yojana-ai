function getBaseUrl(req: Request) {
  if (process.env.NODE_ENV === 'development') {
    const host = req.headers.get('host') ?? 'localhost:3000'
    const proto = req.headers.get('x-forwarded-proto') ?? 'http'
    return `${proto}://${host}`
  }

  return process.env.NEXT_PUBLIC_BASE_URL
    ?? 'http://localhost:3000'
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    process.env.NODE_ENV === 'production'
  ) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const baseUrl = getBaseUrl(req)

  const statsRes = await fetch(`${baseUrl}/api/schemes/stats`)
  const stats = await statsRes.json()
  const total = stats.total_schemes ?? 500

  const offset = Math.floor(
    Math.random() * Math.max(1, total - 50)
  )

  const res = await fetch(
    `${baseUrl}/api/schemes/validate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEED_SECRET}`,
      },
      body: JSON.stringify({ limit: 50, offset }),
    }
  )

  const data = await res.json()

  return Response.json({
    cron_run: new Date().toISOString(),
    total_schemes_in_db: total,
    validated_offset: offset,
    ...data,
  })
}
