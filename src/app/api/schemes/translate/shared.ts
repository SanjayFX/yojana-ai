export const LANGS = ['hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn'] as const
export type TranslationLang = (typeof LANGS)[number]

export const LANG_NAMES: Record<TranslationLang, string> = {
  hi: 'Hindi (Devanagari script)',
  bn: 'Bengali (Bengali script)',
  te: 'Telugu (Telugu script)',
  mr: 'Marathi (Devanagari script)',
  ta: 'Tamil (Tamil script)',
  gu: 'Gujarati (Gujarati script)',
  kn: 'Kannada (Kannada script)',
}

export type SchemeRow = {
  id: string
  name: string
  benefit: string | null
}

export type TranslationRow = {
  id: string
  name?: string
  benefit?: string
}

export function isSupportedTranslationLang(
  lang: string
): lang is TranslationLang {
  return LANGS.includes(lang as TranslationLang)
}

export function buildTranslationPrompt(
  lang: TranslationLang,
  schemes: SchemeRow[]
): string {
  return `Translate these Indian govt
scheme details to ${LANG_NAMES[lang]}.
Rules:
- Keep abbreviations in English (PM,PMAY etc)
- Keep numbers/amounts as is
- Sound natural not robotic
- benefit = 1-2 sentences max

${JSON.stringify(schemes.map((s) => ({
  id: s.id,
  name: s.name,
  benefit: s.benefit,
})))}

Return ONLY JSON array:
[{"id":"...","name":"...","benefit":"..."}]
No markdown.`
}

export function stripJsonFence(raw: string): string {
  return raw.replace(/\`\`\`json|\`\`\`/g, '').trim()
}

export function parseTranslationPayload(raw: string): TranslationRow[] {
  const parsed = JSON.parse(stripJsonFence(raw)) as unknown
  return Array.isArray(parsed)
    ? parsed as TranslationRow[]
    : []
}
