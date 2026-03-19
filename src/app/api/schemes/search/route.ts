import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''

  if (q.length < 2) {
    return Response.json({ results: [] })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('schemes')
    .select('id, name, benefit, category, apply_url, eligible_states')
    .or(
      `name.ilike.%${q}%,` +
      `benefit.ilike.%${q}%,` +
      `ministry.ilike.%${q}%`
    )
    .eq('is_active', true)
    .order('hit_count', { ascending: false })
    .limit(6)

  if (error) {
    return Response.json({ results: [] })
  }

  const sanitize = (id: string, url: string) => {
    const fake = [
      '/scheme/data_view/',
      '/view/',
      'localhost',
      '/schemes/view',
    ]
    if (!url?.startsWith('http')) {
      return `https://www.myscheme.gov.in/search?keyword=${encodeURIComponent(id)}`
    }
    if (fake.some(p => url.includes(p))) {
      return `https://www.myscheme.gov.in/search?keyword=${encodeURIComponent(id)}`
    }
    return url
  }

  return Response.json({
    results: (data ?? []).map(s => ({
      ...s,
      apply_url: sanitize((s as { id: string }).id, (s as { apply_url: string }).apply_url)
    }))
  })
}

export function POST() {
  return Response.json(
    { error: 'Use GET' }, { status: 405 }
  )
}
