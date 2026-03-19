import { createClient } from '@supabase/supabase-js'
import { callAI, FLASH } from '@/lib/ai'

type SchemeRecord = {
  id: string
  name: string
  benefit: string
  ministry: string
  apply_url: string
  is_active: boolean
}

function getSupabaseAdmin() {
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

async function checkUrl(
  url: string
): Promise<'ok' | 'dead' | 'redirect' | 'unknown'> {
  if (!url?.startsWith('https://')) return 'dead'

  const alwaysValid = [
    'myscheme.gov.in',
    'scholarships.gov.in',
    'pmkisan.gov.in',
    'pmjay.gov.in',
    'nrega.nic.in',
    'pmaymis.gov.in',
  ]

  if (alwaysValid.some((domain) => url.includes(domain))) {
    return 'ok'
  }

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
      headers: {
        'User-Agent': 'Mozilla/5.0 YojanaAI-Validator',
      },
    })
    if (res.status === 200) return 'ok'
    if (res.status >= 300 && res.status < 400) return 'redirect'
    if (res.status === 404) return 'dead'
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

async function validateSchemeActive(
  schemes: Array<{
    id: string
    name: string
    benefit: string
    ministry: string
  }>
): Promise<Record<string, boolean>> {
  const prompt = `You are a government scheme
researcher for India. For each scheme below,
determine if it is CURRENTLY ACTIVE in 2026.

A scheme is inactive if:
- It was discontinued or replaced
- The ministry officially closed it
- It was merged into another scheme
- It was a one-time scheme that ended

SCHEMES TO CHECK:
${JSON.stringify(schemes, null, 2)}

Return ONLY valid JSON:
{
  "[scheme_id]": true
}

Use false when inactive.
If you are not sure, return true (assume active).
Return ONLY the JSON object. No explanation.`

  try {
    const raw = await callAI(FLASH, prompt)
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned) as Record<string, boolean>
  } catch {
    const result: Record<string, boolean> = {}
    schemes.forEach((scheme) => {
      result[scheme.id] = true
    })
    return result
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== 'Bearer ' + process.env.SEED_SECRET) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { limit = 20, offset = 0 } = await req.json().catch(() => ({}))
    const supabase = getSupabaseAdmin()

    const { data: schemes, error } = await supabase
      .from('schemes')
      .select('id, name, benefit, ministry, apply_url, is_active')
      .range(offset, offset + limit - 1)
      .order('last_updated', { ascending: true })

    if (error || !schemes) {
      return Response.json(
        { error: 'Failed to fetch schemes' },
        { status: 500 }
      )
    }

    const typedSchemes = schemes as SchemeRecord[]
    const results = {
      checked: 0,
      url_fixed: 0,
      marked_inactive: 0,
      errors: 0,
      details: [] as Array<{
        id: string
        url_status: string
        is_active: boolean
        action_taken: string
      }>,
    }

    const urlChecks = await Promise.all(
      typedSchemes.map(async (scheme) => ({
        id: scheme.id,
        url: scheme.apply_url,
        status: await checkUrl(scheme.apply_url),
      }))
    )

    const activeStatus = await validateSchemeActive(
      typedSchemes.map((scheme) => ({
        id: scheme.id,
        name: scheme.name,
        benefit: scheme.benefit,
        ministry: scheme.ministry,
      }))
    )

    for (const scheme of typedSchemes) {
      try {
        const urlCheck = urlChecks.find((entry) => entry.id === scheme.id)
        const isActive = activeStatus[scheme.id] ?? true
        let actionTaken = 'no_change'

        if (urlCheck?.status === 'dead') {
          const schemeName = scheme.name.replace(/\(.*?\)/g, '').trim()
          const fixedUrl =
            'https://www.myscheme.gov.in/search' +
            `?keyword=${encodeURIComponent(schemeName)}`

          await supabase
            .from('schemes')
            .update({
              apply_url: fixedUrl,
              last_updated: new Date().toISOString(),
            })
            .eq('id', scheme.id)

          results.url_fixed++
          actionTaken = 'url_fixed_to_myscheme'
        }

        if (!isActive && scheme.is_active) {
          await supabase
            .from('schemes')
            .update({
              is_active: false,
              last_updated: new Date().toISOString(),
            })
            .eq('id', scheme.id)

          results.marked_inactive++
          actionTaken = 'marked_inactive'
        }

        results.checked++
        results.details.push({
          id: scheme.id,
          url_status: urlCheck?.status ?? 'unknown',
          is_active: isActive,
          action_taken: actionTaken,
        })
      } catch {
        results.errors++
      }
    }

    return Response.json({
      success: true,
      offset,
      limit,
      ...results,
    })
  } catch (err) {
    return Response.json(
      {
        error: 'Validation failed',
        details: String(err),
      },
      { status: 500 }
    )
  }
}

export function GET() {
  return Response.json(
    { error: 'Use POST' },
    { status: 405 }
  )
}
