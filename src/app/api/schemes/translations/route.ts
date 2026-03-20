import { createClient } from '@supabase/supabase-js'
import {
  buildTranslationsMap,
  parseTranslationIds,
  type TranslationSelectRow,
} from './shared'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ids = parseTranslationIds(searchParams.get('ids'))
  const lang = searchParams.get('lang') ?? 'hi'

  if (!ids.length) {
    return Response.json({ translations: {} })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('scheme_translations')
    .select('scheme_id,name,benefit')
    .in('scheme_id', ids.slice(0, 30))
    .eq('lang', lang)

  return Response.json({
    translations: buildTranslationsMap(
      (data ?? []) as TranslationSelectRow[]
    )
  })
}
