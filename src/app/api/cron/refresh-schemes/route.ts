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
    { auth: {
      autoRefreshToken: false,
      persistSession: false,
    } }
  )
}

async function processState(
  state: string
): Promise<number> {
  const supabase = getAdmin()

  const { data: queue } = await supabase
    .from('update_queue')
    .select('last_updated, is_processing')
    .eq('state', state)
    .maybeSingle()

  const now = new Date()
  const last = queue?.last_updated
    ? new Date(queue.last_updated)
    : new Date(0)
  const hoursSince =
    (now.getTime() - last.getTime()) / 3600000

  if (hoursSince < 168 || queue?.is_processing) {
    return 0
  }

  const { data: existing } = await supabase
    .from('schemes')
    .select('id')
    .or(
      `eligible_states.cs.{"${state}"},` +
      `eligible_states.cs.{"All"}`
    )
    .limit(50)

  const existingIds =
    (existing ?? []).map((s: { id: string }) => s.id)

  const prompt =
    `List up to 5 NEW Indian government welfare
    schemes for ${state} from 2024-2026.
    Exclude these IDs: ${existingIds.slice(0, 15).join(',')}
    Return ONLY a JSON array. Each item must have:
    id (kebab-case), name, ministry, category,
    benefit, eligibility (object with min_age null,
    max_age null, gender Any, caste_categories [Any],
    occupations [Any], max_annual_income_inr null,
    requires_bpl_card false, requires_land false,
    eligible_states ["${state}"],
    special_conditions null),
    documents_required (array),
    apply_url (use https://www.myscheme.gov.in/search
    if unsure), apply_modes (array), helpline null.
    Return [] if none found. No markdown.`

  try {
    const raw = await callAI(FLASH, prompt)
    const cleaned = raw
      .replace(/\`\`\`json|\`\`\`/g, '')
      .trim()
    const schemes = JSON.parse(cleaned)
    if (!Array.isArray(schemes) || schemes.length === 0) return 0

    await supabase
      .from('schemes')
      .upsert(schemes, { onConflict: 'id' })

    await supabase
      .from('update_queue')
      .upsert({
        state,
        last_updated: now.toISOString(),
        is_processing: false
      }, { onConflict: 'state' })

    return schemes.length
  } catch {
    return 0
  }
}

async function triggerTranslationSeed(
  baseUrl: string,
  now: Date
) {
  const CRON_LANGS =
    ['hi', 'ta', 'bn', 'te', 'mr', 'gu', 'kn']
  const cronLang =
    CRON_LANGS[now.getUTCDay() % CRON_LANGS.length]

  await fetch(`${baseUrl}/api/schemes/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization':
        `Bearer ${process.env.SEED_SECRET ??
          'yojana2026secret'}`
    },
    body: JSON.stringify({
      offset: Math.floor(Math.random() * 200),
      limit: 10,
      lang: cronLang
    })
  }).catch(() => {})
}

function getBaseUrl(req: Request): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL.startsWith('http')
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`
  }

  return new URL(req.url).origin
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization') ?? ''
  const cronSecret =
    process.env.CRON_SECRET ?? 'yojanacron2026'

  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${cronSecret}`
  ) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const now = new Date()
  const dayGroup =
    now.getUTCDay() % STATE_GROUPS.length
  const todayStates = STATE_GROUPS[dayGroup]

  // KEY FIX: Use waitUntil if available (Vercel)
  // This lets us respond immediately and continue
  // processing in background
  const responseData = {
    cron_run: now.toISOString(),
    day_group: dayGroup,
    states_queued: todayStates,
    status: 'processing_in_background'
  }

  const ctx = req as unknown as {
    waitUntil?: (p: Promise<unknown>) => void
  }

  const backgroundWork = async () => {
    for (const state of todayStates) {
      try {
        await processState(state)
      } catch {
        // silent
      }
    }

    await triggerTranslationSeed(getBaseUrl(req), now)
  }

  if (ctx.waitUntil) {
    ctx.waitUntil(backgroundWork())
  } else {
    // Fallback for runtimes without waitUntil:
    // return immediately and continue work in background.
    void backgroundWork()
    return Response.json({
      ...responseData,
      status: 'processing_in_background_no_waituntil'
    })
  }

  return Response.json(responseData)
}
