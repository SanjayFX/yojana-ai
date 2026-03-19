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
    .select('id, name, benefit, category, apply_url')
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

  return Response.json({ results: data ?? [] })
}

export function POST() {
  return Response.json(
    { error: 'Use GET' }, { status: 405 }
  )
}
