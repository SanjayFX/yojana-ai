import { createClient } from '@supabase/supabase-js'

import { callAI, FLASH } from '@/lib/ai'
import {
  buildTranslationPrompt,
  isSupportedTranslationLang,
  parseTranslationPayload,
  type SchemeRow,
} from './shared'

function getAdmin() {
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
  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${process.env.SEED_SECRET}`) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const {
    offset = 0,
    limit = 10,
    lang = 'hi'
  } = await req.json().catch(() => ({}))

  if (!isSupportedTranslationLang(lang)) {
    return Response.json(
      { error: 'Invalid lang' },
      { status: 400 }
    )
  }

  const supabase = getAdmin()
  const { data: schemes } = await supabase
    .from('schemes')
    .select('id,name,benefit')
    .range(offset, offset + limit - 1)
    .order('hit_count', { ascending: false })

  if (!schemes?.length) {
    return Response.json({ done: true, translated: 0 })
  }

  const prompt = buildTranslationPrompt(
    lang,
    schemes as SchemeRow[]
  )

  let translated = 0

  try {
    const raw = await callAI(FLASH, prompt)
    const results = parseTranslationPayload(raw)

    for (const item of results) {
      if (!item.id) continue

      const { error } = await supabase
        .from('scheme_translations')
        .upsert({
          scheme_id: item.id,
          lang,
          name: item.name ?? null,
          benefit: item.benefit ?? null,
        }, { onConflict: 'scheme_id,lang' })

      if (!error) {
        translated += 1
      }
    }
  } catch (e) {
    console.error('Translation error:', e)
  }

  return Response.json({
    done: false,
    lang,
    offset,
    translated,
    next_offset: offset + limit
  })
}

export function GET() {
  return Response.json(
    { error: 'Use POST' },
    { status: 405 }
  )
}
