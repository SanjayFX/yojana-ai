export type TranslationMap = Record<string, {
  name: string
  benefit: string
}>

export type TranslationSelectRow = {
  scheme_id: string
  name: string | null
  benefit: string | null
}

export function parseTranslationIds(ids: string | null): string[] {
  return ids?.split(',').filter(Boolean) ?? []
}

export function buildTranslationsMap(
  rows: TranslationSelectRow[]
): TranslationMap {
  const translations: TranslationMap = {}

  for (const row of rows) {
    translations[row.scheme_id] = {
      name: row.name ?? '',
      benefit: row.benefit ?? ''
    }
  }

  return translations
}
