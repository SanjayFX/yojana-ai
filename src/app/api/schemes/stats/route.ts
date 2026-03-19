import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const [schemesRes, updatesRes, searchesRes] =
    await Promise.all([
      supabase
        .from('schemes')
        .select('id, category, eligible_states',
          { count: 'exact' }),
      supabase
        .from('scheme_updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('searches')
        .select('state, schemes_matched',
          { count: 'exact' })
    ])

  const byCategory = (schemesRes.data ?? [])
    .reduce((acc: Record<string,number>, s) => {
      acc[s.category] = (acc[s.category] ?? 0) + 1
      return acc
    }, {})

  return Response.json({
    total_schemes: schemesRes.count ?? 0,
    by_category: byCategory,
    total_searches: searchesRes.count ?? 0,
    recent_updates: updatesRes.data ?? [],
    last_updated: new Date().toISOString()
  })
}
