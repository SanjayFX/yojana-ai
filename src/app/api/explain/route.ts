import { callAI, FLASH } from '@/lib/ai'
import type { UserProfile } from '@/lib/types'

export async function POST(req: Request) {
  const start = Date.now()

  try {
    const {
      scheme_id,
      scheme_name,
      benefit,
      profile,
      ui_lang,
    } = await req.json()

    if (!scheme_id || !profile) {
      return Response.json(
        { error: 'Missing fields' },
        { status: 400 }
      )
    }

    const lang = ui_lang
      ?? (profile as UserProfile).preferred_language
      ?? 'hi'

    const langInstruction =
      lang === 'en'
        ? 'Respond in clear simple English only. No Hindi. No Hinglish.'
        : lang === 'bn'
          ? 'Respond in Bengali mixed with English.'
          : lang === 'ta'
            ? 'Respond in Tamil mixed with English.'
            : lang === 'te'
              ? 'Respond in Telugu mixed with English.'
              : lang === 'mr'
                ? 'Respond in Marathi mixed with English.'
                : lang === 'gu'
                  ? 'Respond in Gujarati mixed with English.'
                  : lang === 'kn'
                    ? 'Respond in Kannada mixed with English.'
                    : 'Respond in Hinglish (Hindi + English mix).'

    const prompt = `You are an expert on Indian government welfare schemes helping a citizen understand how to successfully get this scheme.

CITIZEN PROFILE:
${JSON.stringify(profile, null, 2)}

SCHEME: ${scheme_name} (${scheme_id})
BENEFIT: ${benefit}

${langInstruction}

1. WHY YOU QUALIFY (2-3 sentences specific to their profile)
2. FIRST STEP (single most important action)
3. WATCH OUT FOR (1-2 common mistakes that cause rejection)
4. SUCCESS TIP (one insider tip)

Return ONLY JSON:
{
  "why_you_qualify": string,
  "first_step": string,
  "watch_out_for": string,
  "success_tip": string,
  "estimated_time": string,
  "difficulty": "easy" | "medium" | "hard"
}`

    const raw = await callAI(FLASH, prompt)
    const cleaned = raw
      .replace(/\`\`\`json|\`\`\`/g, '')
      .trim()
    const result = JSON.parse(cleaned)

    return Response.json(result, {
      headers: {
        'Content-Type': 'application/json',
        'X-Processing-Time': `${Date.now() - start}ms`,
      },
    })
  } catch {
    return Response.json(
      { error: 'Agent failed', fallback: true },
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
