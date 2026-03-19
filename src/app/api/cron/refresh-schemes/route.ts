import { createClient } from '@supabase/supabase-js'
import { callAI, FLASH } from '@/lib/ai'

const STATE_GROUPS = [
  ['Uttar Pradesh', 'Maharashtra', 'Bihar'],
  ['Karnataka', 'Tamil Nadu', 'Gujarat'],
  ['West Bengal', 'Rajasthan', 'Andhra Pradesh'],
  ['Odisha', 'Telangana', 'Kerala'],
  ['Delhi', 'Punjab', 'Chhattisgarh'],
  ['Madhya Pradesh', 'Haryana', 'Jharkhand'],
  ['Assam', 'Uttarakhand', 'Himachal Pradesh'],
]

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

async function updateState(
  state: string,
  supabase: ReturnType<typeof getAdmin>
): Promise<{ state: string; added: number; skipped?: boolean }> {
  const { data: queue } = await supabase
    .from('update_queue')
    .select('last_updated, is_processing')
    .eq('state', state)
    .single()

  const now = new Date()
  const last = queue?.last_updated
    ? new Date(queue.last_updated)
    : new Date(0)
  const hoursSince =
    (now.getTime() - last.getTime()) / 3600000

  if (hoursSince < 168 || queue?.is_processing) {
    return { state, added: 0, skipped: true }
  }

  const { data: existing } = await supabase
    .from('schemes')
    .select('id')
    .or(
      `eligible_states.cs.{"${state}"},` +
      `eligible_states.cs.{"All"}`
    )
    .limit(100)

  const existingIds =
    (existing ?? []).map((scheme) => scheme.id)

  const prompt =
    `List up to 5 NEW Indian government schemes
    for ${state} announced in 2024-2026.
    NOT in this list: ${existingIds.slice(0,20).join(',')}

    Return ONLY JSON array, each item:
    {"id":"kebab-id","name":"Name",
    "ministry":"Dept","category":"health",
    "benefit":"Amount","eligibility":{
    "min_age":null,"max_age":null,
    "gender":"Any","caste_categories":["Any"],
    "occupations":["Any"],
    "max_annual_income_inr":null,
    "requires_bpl_card":false,
    "requires_land":false,
    "eligible_states":["${state}"],
    "special_conditions":null},
    "documents_required":["Aadhaar"],
    "apply_url":"https://www.myscheme.gov.in/search",
    "apply_modes":["online"],
    "helpline":null}

    If none found return [].
    ONLY JSON. No markdown.`

  const raw = await callAI(FLASH, prompt)
  const cleaned = raw
    .replace(/\`\`\`json|\`\`\`/g, '')
    .trim()

  let schemes: object[] = []
  try {
    schemes = JSON.parse(cleaned)
    if (!Array.isArray(schemes)) schemes = []
  } catch {
    schemes = []
  }

  if (schemes.length > 0) {
    await supabase
      .from('schemes')
      .upsert(schemes, { onConflict: 'id' })
  }

  await supabase
    .from('update_queue')
    .upsert({
      state,
      last_updated: now.toISOString(),
      is_processing: false,
    }, { onConflict: 'state' })

  return { state, added: schemes.length }
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
    return Response.json(
      { error: 'Unauthorized' }, { status: 401 }
    )
  }

  const supabase = getAdmin()
  const now = new Date()
  const dayGroup = now.getUTCDay() %
    STATE_GROUPS.length
  const todayStates = STATE_GROUPS[dayGroup]

  const results = await Promise.all(
    todayStates.map(async (state) => {
      try {
        return await updateState(state, supabase)
      } catch (err) {
        return {
          state,
          added: 0,
          error: String(err)
        }
      }
    })
  )

  const totalAdded = results.reduce(
    (sum, result) => sum + result.added,
    0
  )

  return Response.json({
    cron_run: now.toISOString(),
    day_group: dayGroup,
    states_processed: todayStates,
    total_schemes_added: totalAdded,
    results
  })
}
