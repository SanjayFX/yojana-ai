import { createClient } from '@supabase/supabase-js'

const TOP_STATES = [
  'Uttar Pradesh', 'Maharashtra', 'Bihar',
  'West Bengal', 'Madhya Pradesh', 'Rajasthan',
  'Tamil Nadu', 'Karnataka', 'Gujarat',
  'Andhra Pradesh', 'Odisha', 'Telangana',
  'Kerala', 'Jharkhand', 'Assam', 'Punjab',
  'Chhattisgarh', 'Haryana', 'Delhi',
  'Uttarakhand'
]

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
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
    && process.env.NODE_ENV === 'production'
  ) {
    return Response.json(
      { error: 'Unauthorized' }, { status: 401 }
    )
  }

  const baseUrl = getBaseUrl(req)

  const results: Record<string, unknown>[] = []

  for (const state of TOP_STATES) {
    try {
      const res = await fetch(
        `${baseUrl}/api/schemes/auto-update`,
        {
          method: 'POST',
          headers:
            { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state })
        }
      )
      const data = await res.json()
      results.push({ state, ...data })

      // 2 second delay between states
      // to avoid Gemini rate limits
      await new Promise(r => setTimeout(r, 2000))
    } catch (err) {
      results.push({
        state,
        error: String(err)
      })
    }
  }

  const totalAdded = results.reduce(
    (sum, r) =>
      sum + ((r.schemes_added as number) ?? 0),
    0
  )

  try {
    const statsRes = await fetch(`${baseUrl}/api/schemes/stats`)
    const stats = await statsRes.json()
    const totalSchemes = stats.total_schemes ?? 500
    const validateRes = await fetch(
      `${baseUrl}/api/schemes/validate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEED_SECRET}`,
        },
        body: JSON.stringify({
          limit: 50,
          offset: Math.floor(
            Math.random() * Math.max(1, totalSchemes - 50)
          ),
        }),
      }
    )
    const validateData = await validateRes.json()

    return Response.json({
      cron_run: new Date().toISOString(),
      states_processed: TOP_STATES.length,
      total_schemes_added: totalAdded,
      validation: {
        schemes_checked: validateData.checked,
        urls_fixed: validateData.url_fixed,
        marked_inactive: validateData.marked_inactive,
      },
      results,
    })
  } catch {
    return Response.json({
      cron_run: new Date().toISOString(),
      states_processed: TOP_STATES.length,
      total_schemes_added: totalAdded,
      results,
    })
  }
}
