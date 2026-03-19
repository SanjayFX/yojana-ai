type SpeechRecognitionLike = {
  start: () => void
  stop: () => void
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | ((event: { error?: unknown }) => void) | null
}

type SpeechRecognitionEventLike = {
  results: ArrayLike<{ 0: { transcript: string } }>
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

const LANG_MAP: Record<string, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
}

export function speak(
  text: string,
  langCode = 'hi'
): void {
  if (typeof window === 'undefined') return
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = LANG_MAP[langCode] ?? 'hi-IN'
  utt.rate = 0.85
  utt.pitch = 1.0
  utt.volume = 1.0
  utt.onerror = (e) => console.warn('Speech error:', e)
  window.speechSynthesis.speak(utt)
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined') return false
  return window.speechSynthesis?.speaking ?? false
}

export function startVoiceInput(
  langCode: string,
  onResult: (text: string) => void,
  onEnd: () => void
): (() => void) | null {
  if (typeof window === 'undefined') return null

  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }

  const SR = win.SpeechRecognition
    ?? win.webkitSpeechRecognition

  if (!SR) {
    console.warn('SpeechRecognition not supported')
    onEnd()
    return null
  }

  const rec = new SR()
  rec.lang = LANG_MAP[langCode] ?? 'hi-IN'
  rec.continuous = false
  rec.interimResults = false
  rec.maxAlternatives = 1

  rec.onresult = (e: SpeechRecognitionEventLike) => {
    const spoken = e.results[0]?.[0]?.transcript ?? ''
    onResult(spoken)
  }
  rec.onend = onEnd
  rec.onerror = () => onEnd()

  try {
    rec.start()
  } catch (err) {
    console.warn('Voice start failed:', err)
    onEnd()
    return null
  }

  return () => {
    try { rec.stop() } catch {}
  }
}
