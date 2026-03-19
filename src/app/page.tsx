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
        width: '44px', height: '44px', borderRadius: '50%',
        border: '1px solid var(--border)', background: isPlaying ? 'var(--saffron)' : 'var(--white)',
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

  // Micro-interactions and accessibility
  const [pulseAnswerId, setPulseAnswerId] = useState<string | null>(null)
  const [isListeningForAge, setIsListeningForAge] = useState(false)
  const [isReadingResults, setIsReadingResults] = useState(false)
  const [loadingProgressFill, setLoadingProgressFill] = useState(0)
  const [stateSearchQuery, setStateSearchQuery] = useState('')
  const uiCopy = lang === 'en' ? FALLBACK_COPY.en : FALLBACK_COPY.hi
  const currentQuestion = QUESTIONS_DATA[currentStep]
  const filteredQuestionOptions = useMemo(() => {
    if (!currentQuestion.options) return []
    if (currentQuestion.id !== 'state' || !stateSearchQuery.trim()) {
      return currentQuestion.options
    }

    return currentQuestion.options.filter((opt) =>
      opt.toLowerCase().includes(stateSearchQuery.toLowerCase())
    )
  }, [currentQuestion, stateSearchQuery])
  const heroStats = useMemo(() => ([
    { top: t.stat1_num, bottom: t.stat1_label, d: '0.1s' },
    { top: t.stat2_num, bottom: t.stat2_label, d: '0.2s' },
    { top: t.stat3_num, bottom: t.stat3_label, d: '0.3s' }
  ]), [t])

  useEffect(() => {
    let interval: any;
    if (screen === 'loading') {
      setActiveWaitTimer(0)
      setLoadingProgressFill(0)
      
      // Setup fake times and progress bar
      let passed = 0
      interval = setInterval(() => {
        passed += 1
        setActiveWaitTimer(passed)
      }, 1000)
      
      // Animate progress bar linearly over 13s
      setTimeout(() => {
        setLoadingProgressFill(100)
      }, 50)
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
      // Read all schemes 
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

  const containerStyle = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const
  }

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <div style={{ width: '100%', height: '3px', background: 'linear-gradient(90deg, #FF9933 33%, #FFFFFF 33% 66%, #138808 66%)' }}></div>
      
      <main id="main" style={containerStyle}>
        {screen === 'hero' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0, zIndex: -2,
              background: 'radial-gradient(ellipse at 20% 50%, rgba(255,153,51,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(19,136,8,0.06) 0%, transparent 50%), #FFFFFF'
            }} />
            <div className="pulse" style={{
              position: 'absolute', zIndex: -1, width: '400px', height: '400px',
              borderRadius: '50%', background: 'rgba(255,153,51,0.05)',
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', gap: '12px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '20px', color: 'var(--navy)' }}>🇮🇳 {t.app_name}</div>
              
              <div
                className="lang-pills"
                aria-label="Select language"
                style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '60%', scrollBehavior: 'smooth' }}
              >
                {SUPPORTED_LANGS.map(l => (
                  <button
                    key={l}
                    role="button"
                    className="lang-pill-btn"
                    data-lang={l}
                    aria-label={`Switch language to ${langLabels[l] || l}`}
                    onClick={handleLanguageSelect}
                    style={{
                      minHeight: '44px', borderRadius: '20px', padding: '8px 12px',
                      border: lang === l ? 'none' : '1px solid var(--border)',
                      backgroundColor: lang === l ? 'var(--saffron)' : 'var(--white)',
                      color: lang === l ? 'var(--white)' : 'var(--gray)',
                      fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {langLabels[l] || l}
                  </button>
                ))}
              </div>
            </div>

            <div className="hero-shell" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ 
                borderRadius: '9999px', backgroundColor: 'var(--saffron)', color: 'var(--white)', 
                fontSize: '12px', padding: '6px 16px', marginBottom: '24px', display: 'inline-block' 
              }}>
                {uiCopy.heroBadge}
              </div>
              
              <h1 style={{ fontSize: 'clamp(36px, 8vw, 48px)', color: 'var(--navy)', fontWeight: 'bold', lineHeight: '1.2', marginBottom: '16px', zIndex: 1 }}>
                {t.tagline}
              </h1>
              
              <p className="hero-subtitle" style={{ fontSize: '18px', color: 'var(--gray)', marginBottom: '32px', zIndex: 1 }}>
                {t.subtagline}
              </p>

              <button 
                role="button"
                className="hero-cta"
                onClick={handleStart}
                style={{
                  width: '100%', maxWidth: '320px', height: '56px', borderRadius: '12px',
                  background: 'linear-gradient(to right, var(--saffron), var(--saffron-dark))',
                  color: 'var(--white)', fontSize: '18px', fontWeight: 'bold', border: 'none',
                  cursor: 'pointer', marginBottom: '16px', transition: 'all 0.2s', zIndex: 1
                }}
              >
                {t.start_btn}
              </button>
              
              <div style={{ fontSize: '12px', color: 'var(--gray)' }}>
                {t.free_note}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '48px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {heroStats.map((stat, i) => (
                  <div key={i} className="fade-in-up" style={{ 
                    backgroundColor: 'var(--white)', border: '1px solid var(--border)', 
                    borderRadius: '8px', padding: '16px', minWidth: '100px', animationDelay: stat.d, opacity: 0
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--navy)', marginBottom: '4px' }}>{stat.top}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray)' }}>{stat.bottom}</div>
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
            <div style={{ flex: 1, backgroundColor: 'var(--white)', paddingBottom: '96px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: 'var(--white)' }}>
                <button 
                  role="button"
                  aria-label="Go back"
                  onClick={handleFormBack}
                  style={{ background: 'none', border: 'none', fontSize: '16px', color: 'var(--navy)', cursor: 'pointer', minHeight: '48px', minWidth: '48px', display: 'flex', alignItems: 'center' }}>
                  {t.back_btn}
                </button>
                <div style={{ fontSize: '14px', color: 'var(--gray)' }}>{t.step_label} {currentStep + 1} {t.step_of} 6</div>
                <button
                  onClick={resetToHome} 
                  style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 'bold', color: 'var(--navy)', cursor: 'pointer' }}
                >YojanaAI</button>
              </div>
              
              <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border)' }}>
                <div style={{ 
                  width: `${((currentStep) / 6) * 100}%`, 
                  height: '100%', backgroundColor: 'var(--saffron)', 
                  transition: 'width 0.3s ease',
                  boxShadow: '0 0 8px rgba(255,153,51,0.4)'
                }}></div>
              </div>

              <div key={currentStep} className="slide-in question-shell" style={{ padding: '32px 20px', maxWidth: '480px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ backgroundColor: 'var(--saffron)', color: 'var(--white)', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>
                    Q{currentStep + 1}
                  </div>
                  <SpeakerBtn text={qText} />
                </div>
                
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--navy)', marginBottom: '8px' }}>
                  {lang !== 'en' ? qText : q.en}
                </h2>
                {lang !== 'en' && <div style={{ fontSize: '16px', color: 'var(--gray)', marginBottom: '24px' }}>{qEn}</div>}
                {lang === 'en' && <div style={{ height: '24px' }}></div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
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
                        width: '100%', height: '40px', borderRadius: '8px', padding: '0 12px',
                        border: '1px solid var(--border)', fontSize: '14px', marginBottom: '8px',
                        outline: 'none', backgroundColor: 'var(--white)', color: 'var(--navy)'
                      }}
                    />
                  )}

                  {q.type === 'select' && filteredQuestionOptions.map((opt, idx) => {
                    const isSelected = answers[q.id] === opt
                    const text = getTranslatedOption(opt)
                    const isPulsing = pulseAnswerId === opt
                    
                    return (
                      <button
                        key={idx}
                        role="button"
                        className="option-button"
                        data-question-id={q.id}
                        data-option-value={opt}
                        aria-pressed={isSelected}
                        onClick={handleAnswerSelect}
                        style={{
                          width: '100%', minHeight: '52px', padding: '12px 16px', textAlign: 'left',
                          borderRadius: '10px', fontSize: '16px', cursor: 'pointer',
                          transition: 'all 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          backgroundColor: isSelected ? 'var(--saffron-light)' : 'var(--white)',
                          border: '1px solid var(--border)',
                          borderLeft: isSelected ? '4px solid var(--saffron)' : '1px solid var(--border)',
                          color: isSelected ? 'var(--saffron-dark)' : 'var(--navy)',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          transform: isPulsing ? 'scale(0.97)' : 'scale(1)'
                        }}
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
                          flex: 1, height: '56px', borderRadius: '10px', fontSize: '20px',
                          textAlign: 'center', border: '2px solid var(--border)', backgroundColor: 'var(--white)',
                          color: 'var(--navy)', outline: 'none'
                        }}
                      />
                      {q.id === 'age' && (
                        <button
                          type="button"
                          role="button"
                          aria-label="Speak age"
                          onClick={startVoiceInputAge}
                          style={{
                            width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                            backgroundColor: isListeningForAge ? 'var(--saffron)' : 'var(--white)',
                            border: '1px solid var(--border)',
                            color: isListeningForAge ? 'var(--white)' : 'var(--gray)',
                            fontSize: '20px', cursor: 'pointer', transition: 'all 0.2s ease',
                          }}
                        >
                          <span aria-hidden="true">🎤</span>
                        </button>
                      )}
                    </div>
                  )}
                  {isListeningForAge && <div style={{ fontSize: '13px', color: 'var(--saffron)', textAlign: 'center' }}>Bol ke batao...</div>}
                </div>
              </div>

              <div className="sticky-next-bar" style={{ 
                position: 'fixed', bottom: 0, left: 0, right: 0, 
                backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                borderTop: '1px solid var(--border)', padding: '16px', zIndex: 100
              }}>
                <button
                  role="button"
                  className="sticky-next-btn"
                  aria-label={t.next_btn}
                  onClick={handleNext}
                  disabled={!hasAnswer}
                  style={{
                    width: '100%', maxWidth: '480px', margin: '0 auto', display: 'block',
                    height: '52px', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold',
                    backgroundColor: hasAnswer ? 'var(--saffron)' : '#D1D5DB',
                    color: 'var(--white)', border: 'none', cursor: hasAnswer ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  {t.next_btn}
                </button>
              </div>
            </div>
          )
        })()}

        {screen === 'loading' && (
          <div aria-live="polite" aria-label="Loading results" style={{ 
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '20px', backgroundColor: 'var(--offwhite)',
            background: 'radial-gradient(circle at center, rgba(255,153,51,0.05) 0%, var(--offwhite) 70%)'
          }}>
            <div style={{ maxWidth: '360px', width: '100%', position: 'relative' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', 
                  border: '4px solid var(--saffron-light)', borderTopColor: 'var(--saffron)',
                  margin: '0 auto 24px', animation: 'spin 1s linear infinite'
                }}>
                  <div className="pulse" style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--saffron)',
                    margin: '12px auto'
                  }}></div>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--navy)', marginBottom: '8px' }}>
                  {t.loading_title}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--gray)' }}>{t.loading_sub}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                    <div key={i} style={{ 
                      height: '52px', display: 'flex', alignItems: 'center', gap: '16px',
                      color: isDone ? 'var(--green)' : isActive ? 'var(--saffron)' : 'var(--gray)',
                      opacity: isPending ? 0.5 : 1
                    }}>
                      <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                        {isPending && <span style={{ fontSize: '18px' }}>○</span>}
                        {isActive && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--saffron)' }} className="pulse-dot" />}
                        {isDone && <span style={{ fontSize: '18px', animation: 'checkPop 0.4s ease' }}>✓</span>}
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: isActive ? 'bold' : 'normal' }}>
                        {step.text}
                      </span>
                    </div>
                  )
                })}
              </div>
              
              <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '4px', background: 'var(--border)' }}>
                <div style={{ 
                  height: '100%', background: 'var(--saffron)',
                  width: `${loadingProgressFill}%`, transition: 'width 13s linear'
                }} />
              </div>
            </div>
            <style dangerouslySetInnerHTML={{__html:`@keyframes spin { 100% { transform: rotate(360deg); } }`}}/>
          </div>
        )}

        {screen === 'results' && results && (
          <div aria-label="Scheme results" role="region" style={{ flex: 1, backgroundColor: 'var(--offwhite)', paddingBottom: '32px', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: 'var(--white)' }}>
              <button 
                role="button"
                onClick={resetToHome} 
                style={{ background: 'none', border: 'none', fontSize: '16px', color: 'var(--navy)', cursor: 'pointer', minHeight: '48px', minWidth: '48px', display: 'flex', alignItems: 'center' }}>
                {t.back_btn}
              </button>
              <div style={{ fontSize: '14px', color: 'var(--gray)', fontWeight: 'bold' }}>{results.matched_schemes?.length || 0} {t.results_title}</div>
              <button
                onClick={resetToHome} 
                style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 'bold', color: 'var(--navy)', cursor: 'pointer' }}
              >YojanaAI</button>
            </div>
            
            <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--saffron)', boxShadow: '0 0 8px rgba(255,153,51,0.4)' }}></div>

            <div className="top-banner" style={{ 
              backgroundColor: 'var(--saffron)', padding: '24px', color: 'var(--white)',
              position: 'relative', overflow: 'hidden'
            }}>
              <style dangerouslySetInnerHTML={{ __html:`
                .top-banner::before {
                  content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0.2;
                  background-image: radial-gradient(white 2px, transparent 2px); background-size: 24px 24px;
                }
              `}}/>
              <div className="results-banner-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
                    <span aria-hidden="true">🎉 </span>{uiCopy.resultsIntro} {results.matched_schemes?.length || 0} {t.results_title}
                  </h2>
                  <p className="results-benefit-text" style={{ fontSize: '16px', lineHeight: '1.5' }}>
                    {t.results_sub}{' '}
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
                        style={{ background: 'none', border: 'none', color: 'var(--white)', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px', marginLeft: '6px' }}
                      >
                        {expandedCards['benefit'] ? uiCopy.showLess : uiCopy.showMore}
                      </button>
                    )}
                  </p>
                </div>
                <button 
                  role="button"
                  className="results-toolbar-btn"
                  onClick={toggleReadAll}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.4)',
                    padding: '8px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                    minHeight: '48px', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px'
                  }}
                >
                  {isReadingResults ? `${uiCopy.stopAudio} 🔇` : `${uiCopy.listenResults} 🔊`}
                </button>
              </div>
            </div>

            <div className="results-shell" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
              {results.matched_schemes?.map((scheme: any, idx: number) => {
                const schemeDocs = results.documents?.[scheme.id] || []
                const schemeAction = results.actions?.[scheme.id] || {}
                const isExpanded = expandedCards[idx.toString()]
                
                const derivedName = scheme.name || scheme.id
                const schemeReason = scheme.reason || ''
                const categoryIcon = getCategoryIcon(derivedName, schemeReason)
                const isHighConfidence = typeof scheme.confidence === 'number' ? scheme.confidence >= 0.85 : scheme.confidence === 'high'

                return (
                  <div key={scheme.id} className="scheme-card fade-in-up" style={{ 
                    backgroundColor: 'var(--white)', border: '1px solid var(--border)', borderRadius: '16px', 
                    borderLeft: isHighConfidence ? '4px solid #138808' : '4px solid #FF9933',
                    padding: '20px', marginBottom: '16px', boxShadow: 'var(--card-shadow)',
                    animationDelay: `${idx * 100}ms`, opacity: 0
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flex: 1 }}>
                        <span aria-hidden="true" style={{ fontSize: '20px' }}>{categoryIcon}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--navy)' }}>{derivedName}</h3>
                            <SpeakerBtn text={derivedName} />
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        backgroundColor: 'var(--green-light)', color: 'var(--green)', padding: '4px 10px', 
                        borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', marginLeft: '12px', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '180px', textAlign: 'right'
                      }}>
                        {scheme.estimated_benefit}
                      </div>
                    </div>

                    <div style={{ marginTop: '8px' }}>
                      <span className={scheme.confidence === 'high' ? 'pulse-dot' : ''} style={{ 
                        display: 'inline-block', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: isHighConfidence ? 'var(--green-light)' : 'rgba(245, 158, 11, 0.1)',
                        color: isHighConfidence ? 'var(--green)' : '#d97706'
                      }}>
                        {isHighConfidence ? t.confidence_high : t.confidence_medium}
                      </span>
                    </div>

                    <p style={{ fontSize: '14px', color: 'var(--gray)', lineHeight: '1.6', marginTop: '12px' }}>
                      {schemeReason}
                    </p>

                    <div style={{ marginTop: '16px' }}>
                      <button 
                        role="button"
                        data-expand-id={idx.toString()}
                        aria-expanded={isExpanded}
                        onClick={handleToggleExpand}
                        style={{ 
                          width: '100%', textAlign: 'left', background: 'var(--offwhite)', border: '1px solid var(--border)',
                          borderRadius: '8px', padding: '12px',
                          fontSize: '14px', color: 'var(--navy)', fontWeight: 'bold', cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between', minHeight: '48px', alignItems: 'center'
                        }}
                      >
                        <span>{isExpanded ? `${uiCopy.hideDetails} ▲` : `${uiCopy.showDetails} ▼`}</span>
                      </button>
                      
                      <div style={{ 
                        overflow: 'hidden', transition: 'max-height 0.3s ease-in-out',
                        maxHeight: isExpanded ? '1000px' : '0'
                      }}>
                        <div style={{ paddingTop: '16px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--navy)', marginBottom: '8px' }}>
                            📄 {t.documents_label} ({schemeDocs.length})
                          </h4>
                          <div style={{ paddingBottom: '16px' }}>
                            {schemeDocs.map((doc: string, dIdx: number) => (
                              <div key={dIdx} style={{ fontSize: '14px', color: 'var(--gray)', padding: '4px 0', borderBottom: '1px dashed var(--border)' }}>
                                {doc}
                              </div>
                            ))}
                          </div>

                          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--navy)', marginBottom: '8px' }}>
                            📋 {t.apply_steps_label}
                          </h4>
                          <div style={{ paddingBottom: '12px' }}>
                            {schemeAction.steps?.map((step: string, sIdx: number) => (
                              <div key={sIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                                <div style={{ 
                                  width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--saffron-light)', 
                                  color: 'var(--saffron-dark)', fontSize: '12px', display: 'flex', alignItems: 'center', 
                                  justifyContent: 'center', flexShrink: 0, marginTop: '2px', fontWeight: 'bold'
                                }}>{sIdx + 1}</div>
                                <div style={{ fontSize: '14px', color: 'var(--gray)' }}>{step}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-actions no-print">
                      <button 
                        role="button"
                        className="card-action-btn"
                        data-url={schemeAction.portal_url || schemeAction.apply_url || scheme.apply_url || 'https://www.myscheme.gov.in'}
                        onClick={handleApplyClick}
                        style={{ 
                          flex: 1, minWidth: '140px', background: 'linear-gradient(135deg, var(--saffron), var(--saffron-dark))', color: 'var(--white)', border: 'none',
                          borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
                          minHeight: '48px', transition: 'all 0.2s', boxShadow: 'var(--card-shadow)'
                        }}
                      >
                        {t.apply_btn || 'Apply Karein →'}
                      </button>
                      <button 
                        role="button"
                        className="card-action-btn"
                        data-scheme-name={derivedName}
                        data-scheme-benefit={scheme.estimated_benefit}
                        onClick={handleShareClick}
                        style={{ 
                          flex: 1, minWidth: '140px', backgroundColor: 'var(--white)', color: '#25D366', border: '1px solid #25D366',
                          borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
                          minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                        </svg>
                        {t.share_btn}
                      </button>
                    </div>
                  </div>
                )
              })}

              <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
                <button 
                  role="button"
                  onClick={resetToHome}
                  style={{ 
                    width: '100%', minHeight: '48px', backgroundColor: 'var(--white)', color: 'var(--navy)', 
                    border: '1px solid var(--border)', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: 'var(--card-shadow)'
                  }}
                >
                  🔄 {t.retry_btn}
                </button>
                <button 
                  role="button"
                  onClick={handlePrint}
                  style={{ 
                    width: '100%', minHeight: '48px', backgroundColor: 'var(--white)', color: 'var(--navy)', 
                    border: '1px solid var(--border)', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: 'var(--card-shadow)'
                  }}
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
