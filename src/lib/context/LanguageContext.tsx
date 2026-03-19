'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type LangCode, SUPPORTED_LANGS } from '@/lib/i18n/translations'

type LangCtx = {
  lang: LangCode
  setLang: (l: LangCode) => void
  t: typeof translations.hi
}

const Ctx = createContext<LangCtx>({} as LangCtx)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('hi')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yojana_lang') as LangCode
      if (saved && SUPPORTED_LANGS.includes(saved)) {
        setLangState(saved)
      }
    }
  }, [])

  const setLang = (l: LangCode) => {
    setLangState(l)
    if (typeof window !== 'undefined') {
      localStorage.setItem('yojana_lang', l)
    }
  }

  return (
    <Ctx.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </Ctx.Provider>
  )
}

export const useLang = () => useContext(Ctx)
