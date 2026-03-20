'use client'
import { useEffect } from 'react'

const TITLES = [
  'YojanaAI — सरकारी योजनाएं खोजें',
  'YojanaAI — Find Government Schemes',
  'YojanaAI — அரசு திட்டங்கள் கண்டறியுங்கள்',
  'YojanaAI — সরকারি প্রকল্প খুঁজুন',
  'YojanaAI — ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ',
  'YojanaAI — సర్కారీ పథకాలు వెతకండి',
  'YojanaAI — સરકારી યોજનાઓ શોધો',
  'YojanaAI — सरकारी योजना शोधा',
]

export default function DynamicTitle() {
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % TITLES.length
      document.title = TITLES[i]
    }, 3000)
    return () => clearInterval(interval)
  }, [])
  return null
}
