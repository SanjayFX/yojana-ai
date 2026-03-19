import { createClient } from '@supabase/supabase-js'
import { callAI, FLASH } from '@/lib/ai'

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
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: {
      autoRefreshToken: false,
      persistSession: false
    } }
  )

  const validationWork = async () => {
    const { count } = await supabase
      .from('schemes')
      .select('*', { count: 'exact', head: true })

    const total = count ?? 500
    const limit = 10
    const offset = Math.floor(
      Math.random() * Math.max(1, total - limit)
    )

    const { data: schemes } = await supabase
      .from('schemes')
      .select('id, name, benefit, ministry, apply_url')
      .range(offset, offset + limit - 1)

    if (!schemes || schemes.length === 0) {
      return {
        total_schemes: total,
        checked: 0,
        url_fixed: 0
      }
    }

    let urlFixed = 0

    const checks = await Promise.all(
      schemes.map(async (s) => {
        if (!s.apply_url?.startsWith('https://')) {
          return { id: s.id, dead: true }
        }
        const BAD = ['tnhb', 'tnscb', '/scheme/',
          '/view/', '/data_view/', 'localhost',
          'housing.tn', 'cmda.tn']
        if (BAD.some(b =>
          s.apply_url.toLowerCase().includes(b))) {
          return { id: s.id, dead: true }
        }
        try {
          const r = await fetch(s.apply_url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(1500),
            headers: {
              'User-Agent': 'YojanaAI/1.0'
            },
          })
          return {
            id: s.id,
            dead: r.status === 404 || r.status >= 500
          }
        } catch {
          return { id: s.id, dead: false }
        }
      })
    )

    for (const check of checks) {
      if (check.dead) {
        const scheme = schemes.find(s => s.id === check.id)
        const name = (scheme?.name ?? check.id)
          .replace(/\(.*?\)/g, '')
          .trim()
        const fixedUrl =
          `https://www.myscheme.gov.in/search?keyword=${encodeURIComponent(name)}`

        await supabase
          .from('schemes')
          .update({ apply_url: fixedUrl })
          .eq('id', check.id)

        urlFixed++
      }
    }

    const schemesToCheck = schemes.slice(0, 5)
    try {
      const prompt =
        `For each scheme, return true if active
        in 2026, false if discontinued.
        ${JSON.stringify(schemesToCheck.map(
          s => ({ id: s.id, name: s.name })
        ))}
        Return ONLY JSON: { "schemeId": boolean }`

      const raw = await Promise.race([
        callAI(FLASH, prompt),
        new Promise<string>((_, reject) =>
          setTimeout(
            () => reject(new Error('AI timeout')),
            2000
          )),
      ])

      const cleaned = raw
        .replace(/\`\`\`json|\`\`\`/g, '')
        .trim()
      const activeMap = JSON.parse(cleaned)

      for (const [id, active] of
        Object.entries(activeMap)) {
        if (!active) {
          await supabase
            .from('schemes')
            .update({ is_active: false })
            .eq('id', id)
        }
      }
    } catch {
      // Silent fail — validation still ran
    }

    return {
      total_schemes: total,
      checked: schemes.length,
      url_fixed: urlFixed
    }
  }

  const result = await Promise.race([
    validationWork(),
    new Promise<{ checked: number; url_fixed: number }>(
      resolve => setTimeout(
        () => resolve({ checked: 0, url_fixed: 0 }),
        8000
      )
    ),
  ])

  return Response.json({
    cron_run: new Date().toISOString(),
    ...result
  })
}
