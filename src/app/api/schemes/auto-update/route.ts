import { createClient } from '@supabase/supabase-js'
import { callAI, FLASH } from '@/lib/ai'

const REFRESH_INTERVAL_HOURS = 168
// 7 days — schemes dont change that fast

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function POST(req: Request) {
  try {
    const { state } = await req.json().catch(() => ({} as { state?: string }))
    if (!state) {
      return Response.json(
        { skipped: true, reason: 'no state' }
      )
    }

    const supabase = getSupabaseAdmin()

    // Check when state was last updated
    const { data: queueEntry } = await supabase
      .from('update_queue')
      .select('*')
      .eq('state', state)
      .single()

    const now = new Date()
    const lastUpdated = queueEntry?.last_updated
      ? new Date(queueEntry.last_updated)
      : new Date(0)

    const hoursSince =
      (now.getTime() - lastUpdated.getTime())
      / (1000 * 60 * 60)

    // Skip if updated recently or already processing
    if (
      hoursSince < REFRESH_INTERVAL_HOURS ||
      queueEntry?.is_processing
    ) {
      return Response.json({
        skipped: true,
        reason: hoursSince < REFRESH_INTERVAL_HOURS
          ? `Updated ${Math.floor(hoursSince)}h ago`
          : 'already processing',
        next_update_in_hours: Math.floor(
          REFRESH_INTERVAL_HOURS - hoursSince
        )
      })
    }

    // Mark as processing
    await supabase.from('update_queue').upsert({
      state,
      is_processing: true,
      last_updated: queueEntry?.last_updated
        ?? new Date(0).toISOString()
    }, { onConflict: 'state' })

    // Get existing scheme IDs for this state
    const { data: existingSchemes } = await supabase
      .from('schemes')
      .select('id, name')
      .or(
        `eligible_states.cs.{"${state}"},` +
        `eligible_states.cs.{"All"}`
      )

    const existingIds = (existingSchemes ?? [])
      .map(s => s.id)

    // AI research prompt for new schemes
    const prompt = `You are a government scheme researcher
for India. Find NEW or RECENTLY UPDATED government
schemes for ${state} state that were announced or
modified in 2024-2026.

EXISTING SCHEME IDs (do NOT include these):
${JSON.stringify(existingIds)}

Focus on:
- Schemes announced in last 12 months
- Recently enhanced/updated existing schemes
- State budget 2025-26 new schemes
- Central schemes with state-specific components

Return up to 8 NEW schemes not in the existing list.
Each must follow this exact schema:
{
  "id": "unique-kebab-case-id",
  "name": "Official scheme name",
  "ministry": "Ministry or Department name",
  "category": "agriculture|health|education|housing|finance|women|disability|elderly|employment",
  "benefit": "Specific benefit amount or service",
  "eligibility": {
    "min_age": null,
    "max_age": null,
    "gender": "Any",
    "caste_categories": ["Any"],
    "occupations": ["Any"],
    "max_annual_income_inr": null,
    "requires_bpl_card": false,
    "requires_land": false,
    "eligible_states": ["${state}"],
    "special_conditions": null
  },
  "documents_required": ["Aadhaar Card"],
  "apply_url": "official URL",
  "apply_modes": ["online"],
  "helpline": null
}

If no new schemes found, return empty array [].
Return ONLY valid JSON array. No markdown.`

    const raw = await callAI(FLASH, prompt)
    const cleaned = raw
      .replace(/\`\`\`json|\`\`\`/g, '')
      .trim()

    let newSchemes: object[] = []
    try {
      const parsed = JSON.parse(cleaned)
      newSchemes = Array.isArray(parsed) ? parsed : []
    } catch {
      newSchemes = []
    }

    let added = 0
    if (newSchemes.length > 0) {
      const { error } = await supabase
        .from('schemes')
        .upsert(newSchemes, { onConflict: 'id' })
      if (!error) added = newSchemes.length
    }

    // Update queue — mark done with new timestamp
    await supabase.from('update_queue').upsert({
      state,
      last_updated: now.toISOString(),
      is_processing: false
    }, { onConflict: 'state' })

    // Log the update
    await supabase.from('scheme_updates').insert({
      state,
      update_type: 'auto',
      schemes_added: added,
      schemes_updated: 0,
      triggered_by: 'user_search'
    })

    return Response.json({
      updated: true,
      state,
      schemes_added: added,
      new_scheme_ids: newSchemes
        .map((s: object) =>
          (s as {id:string}).id)
    })
  } catch (err) {
    return Response.json({
      error: 'Auto-update failed',
      details: String(err)
    }, { status: 500 })
  }
}

export function GET() {
  return Response.json(
    { error: 'Use POST' }, { status: 405 }
  )
}
