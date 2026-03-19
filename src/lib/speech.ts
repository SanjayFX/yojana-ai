export function speak(text: string, lang = 'hi-IN') {
  if (typeof window === 'undefined') return
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang
  utt.rate = 0.9
  utt.pitch = 1
  window.speechSynthesis.speak(utt)
}

export function stopSpeaking() {
  if (typeof window === 'undefined') return
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}
