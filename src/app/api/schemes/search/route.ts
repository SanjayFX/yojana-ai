import { createClient } from '@supabase/supabase-js'

const REGIONAL_TERMS: Record<string, string> = {
  'किसान': 'farmer kisan',
  'खेती': 'agriculture farmer',
  'स्वास्थ्य': 'health',
  'शिक्षा': 'education scholarship',
  'आवास': 'housing home',
  'रोजगार': 'employment',
  'महिला': 'women',
  'वृद्ध': 'elderly pension',
  'विकलांग': 'disability',
  'छात्र': 'student scholarship',
  'কৃষক': 'farmer kisan',
  'স্বাস্থ্য': 'health',
  'শিক্ষা': 'education',
  'రైతు': 'farmer kisan',
  'ఆరోగ్యం': 'health',
  'விவசாயி': 'farmer kisan',
  'ஆரோக்கியம்': 'health',
  'ರೈತ': 'farmer kisan',
  'ಆರೋಗ್ಯ': 'health',
  'ખેડૂત': 'farmer kisan',
  'આરોગ્ય': 'health',
  'शेतकरी': 'farmer kisan',
  'आरोग्य': 'health',
  'pension': 'pension elderly',
  'loan': 'loan finance mudra',
  'bima': 'insurance bima',
  'yojana': 'scheme yojana',
}

export function translateQuery(q: string): string {
  let translated = q
  for (const [regional, english] of Object.entries(REGIONAL_TERMS)) {
    if (q.toLowerCase().includes(
      regional.toLowerCase())) {
      translated = english
      break
    }
  }
  return translated
}

export function buildSchemeSearchTerms(rawQuery: string): string[] {
  const translated = translateQuery(rawQuery)

  if (translated === rawQuery) {
    return [rawQuery]
  }

  const translatedTokens = translated
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)

  return translated === rawQuery
    ? [rawQuery]
    : Array.from(new Set([rawQuery, translated, ...translatedTokens]))
}

export function buildSchemeSearchOrClause(searchTerms: string[]): string {
  return searchTerms
    .flatMap((term) => {
      const safeTerm = term.replace(/,/g, ' ').trim()
      return [
        `name.ilike.%${safeTerm}%`,
        `benefit.ilike.%${safeTerm}%`,
        `ministry.ilike.%${safeTerm}%`,
        `category.ilike.%${safeTerm}%`,
      ]
    })
    .join(',')
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawQuery = searchParams.get('q')?.trim() ?? ''

  if (rawQuery.length < 1) {
    return Response.json({ results: [] })
  }
  const searchTerms = buildSchemeSearchTerms(rawQuery)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('schemes')
    .select('id, name, benefit, category, apply_url, eligible_states')
    .or(buildSchemeSearchOrClause(searchTerms))
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
