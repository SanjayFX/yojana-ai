'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { SUPPORTED_LANGS, type LangCode } from '@/lib/i18n/translations'
import { useLang } from '@/lib/context/LanguageContext'
import { speak, stopSpeaking } from '@/lib/speech'

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

type Screen = 'hero' | 'form' | 'loading' | 'results'

const QUESTIONS_DATA = [
  { id:"state", hi:"Aap kahan rehte hain?", en:"Which state?",
    type:"select", options:["Andhra Pradesh","Arunachal Pradesh",
    "Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
    "Himachal Pradesh","Jharkhand","Karnataka","Kerala",
    "Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
    "Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim",
    "Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
    "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir"] },
  { id:"age", hi:"Aapki umar kya hai?", en:"What is your age?",
    type:"number", placeholder:"Jaise: 35" },
  { id:"income", hi:"Saal bhar ki kamai?", en:"Annual income?",
    type:"select", options:["0 – 1 lakh","1 – 3 lakh",
    "3 – 6 lakh","6 lakh se zyada"] },
  { id:"category", hi:"Aapka category?", en:"Your category?",
    type:"select", options:["General","OBC","SC","ST","EWS"] },
  { id:"occupation", hi:"Aap kya kaam karte hain?",
    en:"Your occupation?", type:"select",
    options:["Kisan (Farmer)","Student",
    "Sarkari Naukri (Govt Job)","Private Job",
    "Business","Kaam nahi (Unemployed)"] },
  { id:"gender", hi:"Aapka gender?", en:"Your gender?",
    type:"select", options:["Male","Female","Other"] }
]

const mapOccupation = (val: string) => {
  if (val.includes("Kisan (Farmer)")) return "farmer"
  if (val.includes("Student")) return "student"
  if (val.includes("Sarkari Naukri")) return "govt_employee"
  if (val.includes("Private Job")) return "private_job"
  if (val.includes("Business")) return "business"
  if (val.includes("Kaam nahi")) return "unemployed"
  return val
}

const langLabels: Record<LangCode, string> = {
  hi: 'हिं',
  en: 'EN',
  bn: 'বাং',
  te: 'తె',
  mr: 'मर',
  ta: 'தமி',
  gu: 'ગુ',
  kn: 'ಕನ್'
}

const langCodeMap: Record<LangCode, string> = {
  hi: 'hi-IN', en: 'en-IN', bn: 'bn-IN', te: 'te-IN',
  mr: 'mr-IN', ta: 'ta-IN', gu: 'gu-IN', kn: 'kn-IN'
}

const FALLBACK_COPY = {
  hi: {
    heroBadge: 'AI-powered • Free • No login',
    searchPlaceholder: 'Rajya type karke khojiye',
    showMore: 'Aur padhein',
    showLess: 'Kam dikhayein',
    showDetails: 'Details dekhein',
    hideDetails: 'Details chhupayein',
    listenResults: 'Sunein',
    stopAudio: 'Band Karein',
    resultsIntro: 'Aapko',
  },
  en: {
    heroBadge: 'AI-powered • Free • No login',
    searchPlaceholder: 'Type to search state',
    showMore: 'Read more',
    showLess: 'Show less',
    showDetails: 'Show details',
    hideDetails: 'Hide details',
    listenResults: 'Listen',
    stopAudio: 'Stop',
    resultsIntro: 'You found',
  }
} as const

function getCategoryIcon(name: string, reason: string): string {
  const txt = (name + " " + reason).toLowerCase()
  if (txt.includes('kisan') || txt.includes('farmer') || txt.includes('krishi') || txt.includes('agriculture')) return '🌾'
  if (txt.includes('svasthya') || txt.includes('health') || txt.includes('medical') || txt.includes('chiranjeevi')) return '🏥'
  if (txt.includes('shiksha') || txt.includes('student') || txt.includes('laptop') || txt.includes('education') || txt.includes('vidya')) return '📚'
  if (txt.includes('awas') || txt.includes('housing') || txt.includes('home')) return '🏠'
  if (txt.includes('pension') || txt.includes('vridh') || txt.includes('elderly')) return '👴'
  if (txt.includes('mahila') || txt.includes('women') || txt.includes('kanya') || txt.includes('lakshmi') || txt.includes('ladki') || txt.includes('matritva')) return '👩'
  if (txt.includes('rozgar') || txt.includes('employment') || txt.includes('job')) return '💼'
  if (txt.includes('viklang') || txt.includes('divyang') || txt.includes('disability')) return '♿'
  return '💰'
}

const SpeakerBtn = ({ text }: { text: string }) => {
  const { lang } = useLang()
  const [isPlaying, setIsPlaying] = useState(false)
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    speak(text, langCodeMap[lang])
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), 2000)
  }, [lang, text])

  return (
    <button 
      type="button"
      role="button"
      aria-label="Listen"
      className="speaker-btn"
      onClick={handleClick}
      style={{
        width: '32px', height: '32px', borderRadius: '50%',
        border: '1px solid var(--gray-200)', background: isPlaying ? 'var(--saffron)' : 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        transition: 'all 0.2s ease', position: 'relative', zIndex: 10
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '14px' }}>🔊</span>
    </button>
  )
}

export default function YojanaAIPage() {
  const { lang, setLang, t } = useLang()
  const [screen, setScreen] = useState<Screen>('hero')
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [results, setResults] = useState<any>(null)
  
  const [activeWaitTimer, setActiveWaitTimer] = useState(0)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  const [pulseAnswerId, setPulseAnswerId] = useState<string | null>(null)
  const [isListeningForAge, setIsListeningForAge] = useState(false)
  const [isReadingResults, setIsReadingResults] = useState(false)
  const [loadingProgressFill, setLoadingProgressFill] = useState(0)
  const [stateSearchQuery, setStateSearchQuery] = useState('')

  const uiCopy = lang === 'en' ? FALLBACK_COPY.en : FALLBACK_COPY.hi
  const currentQuestion = QUESTIONS_DATA[currentStep]
  const filteredQuestionOptions = useMemo(() => {
    if (!currentQuestion?.options) return []
    if (currentQuestion.id !== 'state' || !stateSearchQuery.trim()) {
      return currentQuestion.options
    }
    return currentQuestion.options.filter((opt) =>
      opt.toLowerCase().includes(stateSearchQuery.toLowerCase())
    )
  }, [currentQuestion, stateSearchQuery])
  
  const heroStats = useMemo(() => ([
    { top: "50+", bottom: t.stat1_label, d: '0.1s' },
    { top: "6", bottom: t.stat2_label, d: '0.2s' },
    { top: "60s", bottom: t.stat3_label, d: '0.3s' }
  ]), [t])

  useEffect(() => {
    let interval: any;
    if (screen === 'loading') {
      setActiveWaitTimer(0)
      setLoadingProgressFill(0)
      let passed = 0
      interval = setInterval(() => {
        passed += 1
        setActiveWaitTimer(passed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [screen])

  const submitForm = useCallback(async (finalAnswers: Record<string, any>) => {
    setScreen('loading')
    
    const formattedAnswers = { ...finalAnswers }
    if (formattedAnswers.occupation) {
      formattedAnswers.occupation = mapOccupation(formattedAnswers.occupation)
    }
  
    try {
      const response = await fetch('/api/find-schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formattedAnswers })
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("API Error", error)
    } finally {
      setScreen('results')
    }
  }, [])

  const handleStart = useCallback(() => {
    stopSpeaking()
    setResults(null)
    setAnswers({})
    setExpandedCards({})
    setCurrentStep(0)
    setStateSearchQuery('')
    setScreen('form')
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < QUESTIONS_DATA.length - 1) {
      setCurrentStep(currentStep + 1)
      setStateSearchQuery('')
    } else {
      submitForm(answers)
    }
  }, [answers, currentStep, submitForm])

  const toggleExpand = useCallback((idKey: string) => {
    setExpandedCards(prev => ({ ...prev, [idKey]: !prev[idKey] }))
  }, [])

  const handleToggleExpand = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const expandId = event.currentTarget.dataset.expandId
    if (expandId) {
      toggleExpand(expandId)
    }
  }, [toggleExpand])

  const startVoiceInputAge = useCallback(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) return
      
      const recognition = new SpeechRecognition()
      recognition.lang = langCodeMap[lang] || 'hi-IN'
      recognition.onstart = () => setIsListeningForAge(true)
      recognition.onend = () => setIsListeningForAge(false)
      recognition.onresult = (e: any) => {
        const spoken = e.results[0][0].transcript
        const num = spoken.replace(/[^0-9]/g, '')
        if (num) {
          setAnswers(prev => ({ ...prev, age: num }))
        }
      }
      recognition.start()
    } catch (err) {
      console.error("Speech recognition error:", err)
      setIsListeningForAge(false)
    }
  }, [lang])
  
  const toggleReadAll = useCallback(() => {
    if (isReadingResults) {
      stopSpeaking()
      setIsReadingResults(false)
    } else {
      setIsReadingResults(true)
      if (results && results.matched_schemes) {
        let sentence = `${t.results_title} ${results.total_annual_benefit}. `
        results.matched_schemes.forEach((s: any) => {
          const derivedName = s.name || s.id
          sentence += `${derivedName}. Benefit: ${s.estimated_benefit}. `
        })
        speak(sentence, langCodeMap[lang])
        setTimeout(() => setIsReadingResults(false), 20000)
      }
    }
  }, [isReadingResults, lang, results, t.results_title])
  
  const resetToHome = useCallback(() => {
    setScreen('hero')
    setAnswers({})
    setExpandedCards({})
    stopSpeaking()
    setIsReadingResults(false)
    setResults(null)
    setCurrentStep(0)
    setStateSearchQuery('')
  }, [])

  const handleFormBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      return
    }
    resetToHome()
  }, [currentStep, resetToHome])

  const handleLanguageSelect = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const nextLang = event.currentTarget.dataset.lang as LangCode | undefined
    if (nextLang) {
      setLang(nextLang)
    }
  }, [setLang])

  const handleStateSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setStateSearchQuery(event.target.value)
  }, [])

  const handleAnswerSelect = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const questionId = event.currentTarget.dataset.questionId
    const value = event.currentTarget.dataset.optionValue
    if (!questionId || !value) return
    setPulseAnswerId(value)
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setTimeout(() => setPulseAnswerId(null), 200)
  }, [])

  const handleAgeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setAnswers((prev) => ({ ...prev, age: value }))
  }, [])

  const handleApplyClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const url = event.currentTarget.dataset.url || 'https://www.myscheme.gov.in'
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  const handleShareClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const schemeName = event.currentTarget.dataset.schemeName || ''
    const benefit = event.currentTarget.dataset.schemeBenefit || ''
    const msg = t.share_msg.replace('{scheme}', schemeName).replace('{benefit}', benefit)
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }, [t.share_msg])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const navBarStyle = {
    height: '64px',
    background: 'rgba(250,250,248,0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px'
  }

  const renderLangPills = () => (
    <div className="lang-pills" aria-label="Select language" style={{ display: 'flex', gap: '6px' }}>
      {SUPPORTED_LANGS.map(l => (
        <button
          key={l}
          data-lang={l}
          onClick={handleLanguageSelect}
          className={`lang-pill ${lang === l ? 'active' : ''}`}
        >
          {langLabels[l] || l}
        </button>
      ))}
    </div>
  )

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <main id="main">
        {screen === 'hero' && (
          <div className="hero-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="tricolor-bar" />
            <nav style={navBarStyle}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)' }}>🇮🇳 YojanaAI</div>
              {renderLangPills()}
            </nav>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '15vh', paddingBottom: '40px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
              <div className="motif fade-in">
                <svg viewBox="0 0 80 24" fill="none">
                  <path d="M38 12 C30 4 16 2 8 8 C16 8 28 10 38 12Z" fill="#F97316" opacity="0.6"/>
                  <path d="M38 12 C30 20 16 22 8 16 C16 16 28 14 38 12Z" fill="#F97316" opacity="0.4"/>
                  <circle cx="40" cy="12" r="2.5" fill="#F97316"/>
                  <path d="M42 12 C50 4 64 2 72 8 C64 8 52 10 42 12Z" fill="#F97316" opacity="0.6"/>
                  <path d="M42 12 C50 20 64 22 72 16 C64 16 52 14 42 12Z" fill="#F97316" opacity="0.4"/>
                </svg>
              </div>
              <div className="fade-in-up" style={{ animationDelay: '0.1s', display: 'inline-block', background: 'var(--saffron-light)', color: 'var(--saffron)', border: '1px solid rgba(249,115,22,0.2)', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 500, marginBottom: '24px' }}>
                {uiCopy.heroBadge}
              </div>
              <h1 className="fade-in-up" style={{ animationDelay: '0.2s', fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 700, lineHeight: 1.15, color: 'var(--navy)', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                {t.tagline}
              </h1>
              <p className="fade-in-up" style={{ animationDelay: '0.3s', fontSize: '18px', color: 'var(--gray-600)', lineHeight: 1.6, margin: '0 0 32px 0' }}>
                {t.subtagline}
              </p>
              <button role="button" className="btn-primary fade-in-up" onClick={handleStart} style={{ animationDelay: '0.4s', width: 'min(100%, 320px)', height: '56px', fontSize: '17px', margin: '0 auto 16px auto' }}>
                {t.start_btn}
              </button>
              <div className="fade-in-up" style={{ animationDelay: '0.5s', fontSize: '12px', color: 'var(--gray-400)', margin: '0 0 48px 0' }}>
                {t.free_note}
              </div>
              <div className="fade-in-up" style={{ animationDelay: '0.6s', maxWidth: '360px', width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {heroStats.map((stat, i) => (
                  <div key={i} className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--saffron)' }}>{stat.top}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px' }}>{stat.bottom}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {screen === 'form' && (() => {
          const q = currentQuestion
          const qTextKey = `q_${q.id}_hi` as keyof typeof t
          const qText = lang === 'en' ? q.en : t[qTextKey] || q.hi || q.en
          const qEn = q.en
          
          const getTranslatedOption = (opt: string) => {
            if (q.id === 'income') {
              if (opt.includes("0 – 1")) return t.income_opt1 || opt
              if (opt.includes("1 – 3")) return t.income_opt2 || opt
              if (opt.includes("3 – 6")) return t.income_opt3 || opt
              if (opt.includes("6 lakh")) return t.income_opt4 || opt
            }
            if (q.id === 'occupation') {
              if (opt.includes("Kisan")) return t.occ_farmer || opt
              if (opt.includes("Student")) return t.occ_student || opt
              if (opt.includes("Sarkari")) return t.occ_govt || opt
              if (opt.includes("Private")) return t.occ_private || opt
              if (opt.includes("Business")) return t.occ_business || opt
              if (opt.includes("Kaam nahi")) return t.occ_unemployed || opt
            }
            return opt
          }

          const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== ''

          return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
              <nav style={navBarStyle}>
                <button onClick={handleFormBack} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--navy)' }}>←</button>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--gray-600)' }}>
                  {t.step_label} {currentStep + 1} {t.step_of} 6
                </div>
                <div role="button" onClick={resetToHome} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', cursor: 'pointer' }}>
                  YojanaAI
                </div>
              </nav>
              
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(currentStep / 6) * 100}%` }} />
              </div>

              <div key={currentStep} className="fade-in-up" style={{ padding: '32px 20px 120px', maxWidth: '480px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ background: 'var(--saffron-light)', color: 'var(--saffron)', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                    Q{currentStep + 1}
                  </div>
                  <SpeakerBtn text={qText} />
                </div>
                
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--navy)', marginTop: '8px', marginBottom: '4px' }}>
                  {lang !== 'en' ? qText : q.en}
                </h2>
                {lang !== 'en' && <div style={{ fontSize: '14px', color: 'var(--gray-400)', marginBottom: '24px' }}>{qEn}</div>}
                {lang === 'en' && <div style={{ height: '24px' }}></div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.id === 'state' && (
                    <input
                      type="text"
                      autoFocus
                      aria-label={qText}
                      aria-required="true"
                      placeholder={uiCopy.searchPlaceholder}
                      value={stateSearchQuery}
                      onChange={handleStateSearchChange}
                      style={{
                        width: '100%', height: '44px', borderRadius: 'var(--radius-md)', padding: '0 16px',
                        border: '1.5px solid var(--gray-200)', fontSize: '15px', marginBottom: '8px',
                        outline: 'none', color: 'var(--navy)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--saffron)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
                    />
                  )}

                  {q.type === 'select' && filteredQuestionOptions.map((opt, idx) => {
                    const isSelected = answers[q.id] === opt
                    const text = getTranslatedOption(opt)
                    
                    return (
                      <button
                        key={idx}
                        role="button"
                        className={`option-btn ${isSelected ? 'selected' : ''}`}
                        data-question-id={q.id}
                        data-option-value={opt}
                        aria-pressed={isSelected}
                        onClick={handleAnswerSelect}
                      >
                        <span style={{ minWidth: 0 }}>{text}</span>
                        {isSelected && <span aria-hidden="true" style={{ animation: 'checkPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>✓</span>}
                      </button>
                    )
                  })}

                  {q.type === 'number' && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        aria-required="true"
                        aria-label={t.q_age_hi || q.en}
                        value={answers[q.id] || ''}
                        onChange={handleAgeChange}
                        placeholder={q.placeholder}
                        style={{
                          flex: 1, height: '64px', borderRadius: 'var(--radius-lg)', fontSize: '28px',
                          textAlign: 'center', border: '2px solid var(--gray-200)',
                          color: 'var(--navy)', outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--saffron)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
                      />
                      {q.id === 'age' && (
                        <button
                          type="button"
                          role="button"
                          aria-label="Speak age"
                          onClick={startVoiceInputAge}
                          style={{
                            width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                            backgroundColor: isListeningForAge ? 'var(--saffron)' : 'var(--white)',
                            border: '1px solid var(--border)',
                            color: isListeningForAge ? 'var(--white)' : 'var(--gray-600)',
                            fontSize: '20px', cursor: 'pointer', transition: 'all 0.2s ease',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <span aria-hidden="true">🎤</span>
                        </button>
                      )}
                    </div>
                  )}
                  {isListeningForAge && <div style={{ fontSize: '13px', color: 'var(--saffron)', textAlign: 'center' }}>Listening...</div>}
                </div>
              </div>

              <div style={{ 
                position: 'fixed', bottom: 0, left: 0, right: 0, 
                backgroundColor: 'rgba(250,250,248,0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                borderTop: '1px solid var(--border)', padding: '16px 20px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', zIndex: 100
              }}>
                <button
                  role="button"
                  className="btn-primary"
                  aria-label={t.next_btn}
                  onClick={handleNext}
                  disabled={!hasAnswer}
                  style={{
                    width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', height: '52px'
                  }}
                >
                  {t.next_btn}
                </button>
              </div>
            </div>
          )
        })()}

        {screen === 'loading' && (
          <div className="fade-in" aria-live="polite" aria-label="Loading results" style={{ 
            minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '20px', backgroundColor: 'var(--bg-primary)'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid var(--gray-200)', borderTop: '3px solid var(--saffron)', animation: 'spin 0.8s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--saffron)', animation: 'pulse 1.5s infinite' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--navy)', marginTop: '24px', textAlign: 'center' }}>
              {t.loading_title}
            </h2>
            <div style={{ fontSize: '14px', color: 'var(--gray-400)', marginTop: '8px', textAlign: 'center' }}>{t.loading_sub}</div>

            <div style={{ marginTop: '40px', maxWidth: '320px', width: '100%', display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { time: 0, doneTime: 3, text: t.agent1 },
                { time: 3, doneTime: 8, text: t.agent2 },
                { time: 8, doneTime: 11, text: t.agent3 },
                { time: 11, doneTime: 999, text: t.agent4 }
              ].map((step, i) => {
                const isActive = activeWaitTimer >= step.time && activeWaitTimer < step.doneTime
                const isDone = activeWaitTimer >= step.doneTime
                const isPending = activeWaitTimer < step.time
                
                return (
                  <div key={i} style={{ height: '48px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {isPending && <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--gray-200)' }} />}
                      {isActive && <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--saffron)', animation: 'pulse 1s infinite' }} />}
                      {isDone && (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'checkPop 0.4s ease' }}>
                          <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: isActive ? 500 : 'normal', color: isDone ? 'var(--green)' : isActive ? 'var(--saffron)' : 'var(--gray-400)' }}>
                      {step.text}
                    </span>
                  </div>
                )
              })}
            </div>
            
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--gray-200)' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #F97316, #EA580C)', animation: 'loadProgress 14s linear forwards' }} />
            </div>
          </div>
        )}

        {screen === 'results' && results && (
          <div aria-label="Scheme results" role="region" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            
            <nav style={navBarStyle}>
              <button 
                role="button"
                onClick={resetToHome} 
                style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--navy)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                ←
              </button>
              <div style={{ fontSize: '14px', color: 'var(--gray-600)', fontWeight: 500 }}>
                {results.matched_schemes?.length || 0} {t.results_title}
              </div>
              <button
                onClick={resetToHome} 
                style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 600, color: 'var(--navy)', cursor: 'pointer' }}
              >YojanaAI</button>
            </nav>

            <div className="confetti-dots" style={{ 
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)', 
              padding: '32px 20px', borderRadius: '0 0 24px 24px', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '8px', lineHeight: 1.3 }}>
                    <span aria-hidden="true">🎉 </span>{results.matched_schemes?.length || 0} schemes mile!
                  </h2>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    Total benefit:{' '}
                    <strong>
                      {expandedCards['benefit'] 
                        ? results.total_annual_benefit 
                        : (results.total_annual_benefit?.length > 80 
                            ? results.total_annual_benefit.substring(0, 80) + '...' 
                            : results.total_annual_benefit)}
                    </strong>
                    {results.total_annual_benefit?.length > 80 && (
                      <button 
                        data-expand-id="benefit"
                        onClick={handleToggleExpand}
                        style={{ background: 'none', border: 'none', color: 'white', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px', marginLeft: '6px' }}
                      >
                        {expandedCards['benefit'] ? uiCopy.showLess : uiCopy.showMore}
                      </button>
                    )}
                  </p>
                </div>
                <button 
                  role="button"
                  onClick={toggleReadAll}
                  style={{
                    backgroundColor: 'var(--saffron)', color: 'white', border: 'none',
                    padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px'
                  }}
                >
                  {isReadingResults ? `${uiCopy.stopAudio} 🔇` : `${uiCopy.listenResults} 🔊`}
                </button>
              </div>
            </div>

            <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
              {results.matched_schemes?.map((scheme: any, idx: number) => {
                const schemeDocs = results.documents?.[scheme.id] || []
                const schemeAction = results.actions?.[scheme.id] || {}
                const isExpanded = expandedCards[idx.toString()]
                
                const derivedName = scheme.name || scheme.id
                const schemeReason = scheme.reason || ''
                const categoryIcon = getCategoryIcon(derivedName, schemeReason)
                const isHighConfidence = typeof scheme.confidence === 'number' ? scheme.confidence >= 0.85 : scheme.confidence === 'high'

                return (
                  <div key={scheme.id} className={`scheme-card fade-in-up ${isHighConfidence ? 'high' : 'medium'}`} style={{ animationDelay: `${idx * 100}ms`, opacity: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flex: 1 }}>
                        <span aria-hidden="true" style={{ fontSize: '20px' }}>{categoryIcon}</span>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)' }}>{derivedName}</h3>
                        </div>
                      </div>
                      <div style={{ 
                        backgroundColor: 'var(--green-light)', color: 'var(--green)', padding: '4px 10px', 
                        borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 500, marginLeft: '12px', 
                        border: '1px solid rgba(22,163,74,0.2)', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {scheme.estimated_benefit}
                      </div>
                    </div>

                    <div style={{ marginTop: '8px' }}>
                      <span style={{ 
                        display: 'inline-block', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 500,
                        backgroundColor: isHighConfidence ? 'var(--green-light)' : 'var(--saffron-light)',
                        color: isHighConfidence ? 'var(--green)' : 'var(--saffron)',
                        border: isHighConfidence ? '1px solid rgba(22,163,74,0.2)' : '1px solid rgba(249,115,22,0.2)'
                      }}>
                        {isHighConfidence ? (t.confidence_high || '✓ Pakka Eligible') : (t.confidence_medium || '~ Shayad Eligible')}
                      </span>
                    </div>

                    <p style={{ fontSize: '14px', color: 'var(--gray-600)', lineHeight: '1.7', marginTop: '12px' }}>
                      {schemeReason || scheme.reasoning}
                    </p>

                    <div style={{ borderTop: '1px solid var(--gray-100)', marginTop: '16px', paddingTop: '8px' }}>
                      <button 
                        role="button"
                        data-expand-id={idx.toString()}
                        aria-expanded={isExpanded}
                        onClick={handleToggleExpand}
                        style={{ 
                          width: '100%', textAlign: 'left', background: 'none', border: 'none',
                          padding: '0', fontSize: '13px', color: 'var(--navy-soft)', fontWeight: 500, cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '40px'
                        }}
                      >
                        <span>{isExpanded ? uiCopy.hideDetails : uiCopy.showDetails}</span>
                        <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>▼</span>
                      </button>
                      
                      <div className={`expandable-content ${isExpanded ? 'open' : ''}`}>
                        <div style={{ paddingTop: '8px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                            📄 {t.documents_label} ({schemeDocs.length})
                          </h4>
                          <div style={{ paddingBottom: '16px' }}>
                            {schemeDocs.map((doc: string, dIdx: number) => (
                              <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--gray-600)', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                                <div style={{ color: 'var(--gray-200)', fontSize: '16px' }}>○</div>
                                {doc}
                              </div>
                            ))}
                          </div>

                          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                            📋 {t.apply_steps_label}
                          </h4>
                          <div style={{ paddingBottom: '12px' }}>
                            {schemeAction.steps?.map((step: string, sIdx: number) => (
                              <div key={sIdx} style={{ display: 'flex', gap: '12px', padding: '10px 0' }}>
                                <div style={{ 
                                  width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--saffron)', 
                                  color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', 
                                  justifyContent: 'center', flexShrink: 0, fontWeight: 600
                                }}>{sIdx + 1}</div>
                                <div style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.5' }}>{step}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-actions no-print">
                      <button 
                        role="button"
                        className="btn-primary card-action-btn"
                        data-url={schemeAction.portal_url || schemeAction.apply_url || scheme.apply_url || 'https://www.myscheme.gov.in'}
                        onClick={handleApplyClick}
                        style={{ flex: 1, minHeight: '44px', borderRadius: 'var(--radius-md)', fontSize: '14px', padding: '0 16px' }}
                      >
                        {t.apply_btn || 'Apply Karein →'}
                      </button>
                      <button 
                        role="button"
                        data-scheme-name={derivedName}
                        data-scheme-benefit={scheme.estimated_benefit}
                        onClick={handleShareClick}
                        style={{ 
                          flex: 1, minHeight: '44px', backgroundColor: '#25D366', color: 'white', border: 'none',
                          borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          boxShadow: '0 2px 8px rgba(37,211,102,0.3)'
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                        </svg>
                        {t.share_btn}
                      </button>
                    </div>
                  </div>
                )
              })}

              <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px 16px' }}>
                <button 
                  role="button"
                  onClick={resetToHome}
                  style={{ 
                    width: '100%', height: '48px', backgroundColor: 'white', color: 'var(--navy-soft)', 
                    border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--saffron)'; e.currentTarget.style.color = 'var(--saffron)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--navy-soft)'; }}
                >
                  🔄 {t.retry_btn}
                </button>
                <button 
                  role="button"
                  onClick={handlePrint}
                  style={{ 
                    width: '100%', height: '48px', backgroundColor: 'white', color: 'var(--navy-soft)', 
                    border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--saffron)'; e.currentTarget.style.color = 'var(--saffron)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--navy-soft)'; }}
                >
                  💾 {t.pdf_btn}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
