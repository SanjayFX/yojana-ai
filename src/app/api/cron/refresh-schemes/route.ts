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
    ?? 'https://yojanai-rosy.vercel.app'
}

export async function GET(req: Request) {
  const authHeader =
    req.headers.get('authorization') ?? ''
  const cronSecret =
    process.env.CRON_SECRET ?? 'yojanacron2026'

  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${cronSecret}`
  ) {
    console.log('Auth failed. Got:', authHeader,
      'Expected: Bearer', cronSecret)
    return Response.json(
      { error: 'Unauthorized' }, { status: 401 }
    )
  }

  const baseUrl = getBaseUrl(req)

  const now = new Date()
  const dayOfWeek = now.getUTCDay()

  const STATE_GROUPS = [
    ['Uttar Pradesh', 'Maharashtra', 'Bihar',
     'West Bengal', 'Tamil Nadu'],
    ['Karnataka', 'Gujarat', 'Rajasthan',
     'Madhya Pradesh', 'Andhra Pradesh'],
    ['Odisha', 'Telangana', 'Kerala',
     'Jharkhand', 'Assam'],
    ['Punjab', 'Chhattisgarh', 'Haryana',
     'Delhi', 'Uttarakhand'],
  ]

  const todayStates =
    STATE_GROUPS[dayOfWeek % STATE_GROUPS.length]

  const results = await Promise.all(
    todayStates.map(async (state) => {
      try {
        const res = await fetch(
          `${baseUrl}/api/schemes/auto-update`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization':
                `Bearer ${process.env.SEED_SECRET
                  ?? 'yojana2026secret'}`
            },
            body: JSON.stringify({ state }),
            signal: AbortSignal.timeout(12000),
          }
        )
        const data = await res.json()
        return { state, ...data }
      } catch (err) {
        return {
          state,
          error: String(err)
        }
      }
    })
  )

  const totalAdded = results.reduce(
    (sum, r) =>
      sum + ((r.schemes_added as number) ?? 0),
    0
  )

  return Response.json({
    cron_run: new Date().toISOString(),
    day_group: dayOfWeek % STATE_GROUPS.length,
    states_processed: todayStates,
    total_schemes_added: totalAdded,
    results
  })
}
