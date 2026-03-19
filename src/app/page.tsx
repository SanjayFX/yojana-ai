'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { SUPPORTED_LANGS, type LangCode } from '@/lib/i18n/translations'
import { useLang } from '@/lib/context/LanguageContext'
import { speak, stopSpeaking, isSpeaking, startVoiceInput } from '@/lib/speech'

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

const SpeakerBtn = ({ onSpeak }: { onSpeak: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const handleClick = useCallback(() => {
    onSpeak()
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), 2000)
  }, [onSpeak])

  return (
    <button 
      type="button"
      role="button"
      aria-label="Listen"
      className={`mic-btn ${isPlaying ? 'listening' : ''}`}
      onClick={handleClick}
      style={{ width: '32px', height: '32px', fontSize: '14px' }}
    >
      <span aria-hidden="true">🔊</span>
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
  const [listening, setListening] = useState(false)
  const [stateSearchQuery, setStateSearchQuery] = useState('')
  const stopVoiceRef = useRef<(() => void) | null>(null)

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

  useEffect(() => {
    let interval: any;
    if (screen === 'loading') {
      setActiveWaitTimer(0)
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

  const handleMicClick = useCallback(() => {
    if (listening) {
      stopVoiceRef.current?.()
      setListening(false)
      return
    }

    setListening(true)
    const stop = startVoiceInput(
      lang,
      (spoken: string) => {
        const num = spoken.replace(/[^0-9]/g, '')
        const parsed = parseInt(num, 10)
        if (num && !isNaN(parsed) && parsed > 0 && parsed <= 120) {
          setAnswers(prev => ({ ...prev, age: num }))
        }
        setListening(false)
      },
      () => setListening(false)
    )
    stopVoiceRef.current = stop
  }, [lang, listening])
  
  const handleListenResults = useCallback(() => {
    if (isSpeaking()) {
      stopSpeaking()
      return
    }

    const allText = results?.matched_schemes
      ?.map((s: any, i: number) => {
        const name = s.name || s.id
        return `${i + 1}. ${name}. ${s.reason}`
      })
      .join('. ') ?? ''

    speak(allText, lang)
  }, [lang, results])
  
  const resetToHome = useCallback(() => {
    setScreen('hero')
    setAnswers({})
    setExpandedCards({})
    stopSpeaking()
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

  const handleShareClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const schemeName = event.currentTarget.dataset.schemeName || ''
    const benefit = event.currentTarget.dataset.schemeBenefit || ''
    const msg = t.share_msg.replace('{scheme}', schemeName).replace('{benefit}', benefit)
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }, [t.share_msg])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const getTranslatedOption = useCallback((q: any, opt: string) => {
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
  }, [t])

  const getApplyUrl = useCallback((schemeId: string): string => {
    const action = results?.actions?.[schemeId] as { portal_url?: string; apply_url?: string } | undefined

    if (action?.portal_url?.startsWith('http')) {
      return action.portal_url
    }
    if (action?.apply_url?.startsWith('http')) {
      return action.apply_url
    }

    const KNOWN_URLS: Record<string, string> = {
      pm_kisan: 'https://pmkisan.gov.in',
      ab_pmjay: 'https://pmjay.gov.in',
      pmay_urban: 'https://pmaymis.gov.in',
      mgnrega: 'https://nrega.nic.in',
      kisan_credit_card: 'https://www.nabard.org',
      pm_mudra: 'https://www.mudra.org.in',
      pm_fasal_bima: 'https://pmfby.gov.in',
      pm_ujjwala: 'https://pmuy.gov.in',
      stand_up_india: 'https://www.standupmitra.in',
      national_scholarship: 'https://scholarships.gov.in',
      pm_scholarship_capf: 'https://scholarships.gov.in',
      pudhumai_penn: 'https://pudumaipenn.tn.gov.in',
      'pudhumai-penn-scheme': 'https://pudumaipenn.tn.gov.in',
      cm_breakfast: 'https://www.tnschools.gov.in',
      'cm-breakfast-scheme': 'https://www.tnschools.gov.in',
      kalaignar_magalir: 'https://www.tn.gov.in',
      'kalaignar-magalir-urimai-thogai-scheme':
        'https://www.tn.gov.in',
      up_kanya_sumangala: 'https://mksy.up.gov.in',
      'up-kanya-sumangala-yojana': 'https://mksy.up.gov.in',
      karnataka_yuvanidhi: 'https://sevasindhu.karnataka.gov.in',
      'karnataka-yuvanidhi-scheme':
        'https://sevasindhu.karnataka.gov.in',
      bihar_student_credit_card:
        'https://www.7nishchay-yuvaupmission.bihar.gov.in',
      'bihar-student-credit-card-scheme':
        'https://www.7nishchay-yuvaupmission.bihar.gov.in',
      atal_pension: 'https://npscra.nsdl.co.in',
      pm_jeevan_jyoti: 'https://jansuraksha.gov.in',
      pm_suraksha_bima: 'https://jansuraksha.gov.in',
      sukanya_samriddhi: 'https://www.indiapost.gov.in',
    }

    return KNOWN_URLS[schemeId] ?? 'https://www.myscheme.gov.in/search'
  }, [results])

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <main id="main">
        {screen === 'hero' && (
          <div className="hero-wrap">
            <div className="hero-bg">
              <div className="hero-blob-1"/>
              <div className="hero-blob-2"/>
              <div className="hero-blob-3"/>
            </div>
            <div className="tricolor"/>
            <nav className="navbar glass no-print">
              <span className="nav-logo">🇮🇳 YojanaAI</span>
              <div className="lang-row" aria-label="Select language">
                {SUPPORTED_LANGS.map(l => (
                  <button key={l}
                    className={`lang-pill ${lang===l?'active':''}`}
                    onClick={() => setLang(l as LangCode)}>
                    {langLabels[l]}
                  </button>
                ))}
              </div>
            </nav>
            <div className="hero-content">
              <div className="motif anim-fade-in">
                <svg viewBox="0 0 80 24" fill="none" width="80" height="24">
                  <path d="M38 12 C30 4 16 2 8 8 C16 8 28 10 38 12Z" fill="#F97316" opacity="0.6"/>
                  <path d="M38 12 C30 20 16 22 8 16 C16 16 28 14 38 12Z" fill="#F97316" opacity="0.4"/>
                  <circle cx="40" cy="12" r="2.5" fill="#F97316"/>
                  <path d="M42 12 C50 4 64 2 72 8 C64 8 52 10 42 12Z" fill="#F97316" opacity="0.6"/>
                  <path d="M42 12 C50 20 64 22 72 16 C64 16 52 14 42 12Z" fill="#F97316" opacity="0.4"/>
                </svg>
              </div>
              <div className="hero-badge anim-fade-up"
                style={{animationDelay:'0.05s'}}>
                ✦ {uiCopy.heroBadge}
              </div>
              <h1 className="hero-heading anim-fade-up"
                style={{animationDelay:'0.1s'}}>
                <span>{(t as any).tagline_line1 || t.tagline}</span>{' '}
                {((t as any).tagline_line2) && (
                  <span className="hero-heading-accent">
                    {(t as any).tagline_line2}
                  </span>
                )}
              </h1>
              <p className="hero-sub anim-fade-up"
                style={{animationDelay:'0.15s'}}>
                {t.subtagline}
              </p>
              <button className="btn-primary anim-fade-up"
                style={{animationDelay:'0.2s'}}
                onClick={handleStart}>
                {t.start_btn}
              </button>
              <p className="hero-note anim-fade-up"
                style={{animationDelay:'0.25s'}}>
                {t.free_note}
              </p>
              <div className="stats-row anim-fade-up"
                style={{animationDelay:'0.3s'}}>
                {[
                  {num:'50+', label:t.stat1_label},
                  {num:'6',   label:t.stat2_label},
                  {num:'60s', label:t.stat3_label},
                ].map(s => (
                  <div key={s.num} className="stat-card glass">
                    <div className="stat-num">{s.num}</div>
                    <div className="stat-label">{s.label}</div>
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
          
          const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== ''

          return (
            <div style={{display:'flex',flexDirection:'column', minHeight:'100vh'}}>
              <div className="tricolor"/>
              <nav className="navbar glass no-print">
                <div className="navbar-left">
                  <button onClick={handleFormBack} className="nav-back-btn">
                    ← {t.back_btn}
                  </button>
                </div>
                <span className="navbar-center" aria-hidden="true">
                  {t.step_label} {currentStep+1} {t.step_of} 6
                </span>
                <div className="navbar-right">
                  <span className="nav-logo" onClick={resetToHome} style={{fontSize:'13px'}}>
                    YojanaAI
                  </span>
                </div>
              </nav>
              <div className="progress-track">
                <div className="progress-fill" style={{width:`${((currentStep)/6)*100}%`}}/>
              </div>
              <div className="form-wrap">
                <div className="form-inner anim-slide-right" key={currentStep}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div className="q-number">Q{currentStep + 1}</div>
                  <SpeakerBtn onSpeak={() => {
                    const questionText =
                      QUESTIONS_DATA[currentStep][
                        lang === 'en' ? 'en' : 'hi'
                      ] as string
                    speak(questionText, lang)
                  }} />
                  </div>
                  <h2 className="q-heading">{lang !== 'en' ? qText : q.en}</h2>
                  {lang !== 'en' && <div className="q-sub">{qEn}</div>}
                  {lang === 'en' && <div style={{ height: '24px' }}></div>}

                  {q.id === 'state' && (
                    <div className="search-wrap">
                      <input
                        type="text"
                        autoFocus
                        className="search-input"
                        aria-label={qText}
                        placeholder={uiCopy.searchPlaceholder}
                        value={stateSearchQuery}
                        onChange={handleStateSearchChange}
                      />
                      <span className="search-icon">🔍</span>
                    </div>
                  )}

                  {q.type === 'select' && filteredQuestionOptions.map((opt, idx) => {
                    const isSelected = answers[q.id] === opt
                    const text = getTranslatedOption(q, opt)
                    
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
                        {isSelected && <span className="option-check" aria-hidden="true">✓</span>}
                      </button>
                    )
                  })}

                  {q.type === 'number' && (
                    <div className="num-input-wrap">
                      <input
                        type="number"
                        className="num-input"
                        aria-label={t.q_age_hi || q.en}
                        value={answers[q.id] || ''}
                        onChange={handleAgeChange}
                        placeholder={q.placeholder}
                      />
                      {q.id === 'age' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <button
                            type="button"
                            role="button"
                            aria-label="Speak age"
                            className={`mic-btn ${listening ? 'listening' : ''}`}
                            onClick={handleMicClick}
                          >
                            <span aria-hidden="true" style={{ color: listening ? 'white' : 'var(--gray-600)' }}>🎤</span>
                          </button>
                          {listening && <span className="mic-hint">{t.listen_btn}</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="bottom-bar glass no-print">
                <button
                  className="btn-primary"
                  disabled={!hasAnswer}
                  onClick={handleNext}
                  style={{maxWidth:'100%'}}>
                  {t.next_btn}
                </button>
              </div>
            </div>
          )
        })()}

        {screen === 'loading' && (() => {
          const agentRows = [
            { time: 0, doneTime: 3, label: t.agent1 },
            { time: 3, doneTime: 8, label: t.agent2 },
            { time: 8, doneTime: 11, label: t.agent3 },
            { time: 11, doneTime: 999, label: t.agent4 }
          ].map(r => ({
            ...r,
            status: activeWaitTimer >= r.doneTime ? 'done' : activeWaitTimer >= r.time ? 'active' : 'pending'
          }))

          return (
            <div className="loading-wrap no-print">
              <div className="spinner-ring">
                <div className="spinner-dot"/>
              </div>
              <h2 className="loading-title">{t.loading_title}</h2>
              <p className="loading-sub">{t.loading_sub}</p>
              <div className="status-rows" aria-live="polite">
                {agentRows.map((row, i) => (
                  <div key={i} className="status-row">
                    <div className={`status-icon ${row.status}`}>
                      {row.status==='done' ? '✓' : ''}
                    </div>
                    <span className={`status-text ${row.status}`}>
                      {row.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="load-bar-track">
                <div className="load-bar-fill"/>
              </div>
            </div>
          )
        })()}

        {screen === 'results' && results && (
          <div style={{minHeight:'100vh', background:'var(--offwhite)'}}>
            <div className="tricolor"/>
              <nav className="navbar glass no-print">
              <div className="navbar-left">
                <button className="nav-back-btn" onClick={resetToHome}>
                  ← {t.back_btn}
                </button>
              </div>
              <div className="navbar-right">
                <span className="nav-logo" onClick={resetToHome} style={{fontSize:'13px'}}>
                  YojanaAI
                </span>
              </div>
            </nav>
            <div className="results-banner no-print">
              <div className="results-banner-inner">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start',gap:'12px'}}>
                  <div>
                    <h2 className="results-count">
                      🎉 {results.matched_schemes?.length || 0} {t.schemes_found}
                    </h2>
                    <p className="results-benefit">
                      {t.total_benefit_label}{' '}
                      {expandedCards['benefit'] 
                        ? (results.total_annual_benefit || '')
                        : ((results.total_annual_benefit || '').length > 80 
                            ? (results.total_annual_benefit || '').substring(0, 80) + '...' 
                            : (results.total_annual_benefit || ''))}
                      {(results.total_annual_benefit || '').length > 80 && (
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
                <button className="listen-btn" onClick={handleListenResults}>
                    {t.listen_btn}
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{padding:'16px 16px 32px', maxWidth: '640px', margin: '0 auto'}}>
              {results.matched_schemes?.map((scheme: any, i: number) => {
                const schemeDocs = results.documents?.[scheme.id] || []
                const schemeAction = results.actions?.[scheme.id] || {}
                const isExpanded = expandedCards[i.toString()]
                
                const derivedName = scheme.name || scheme.id
                const schemeReason = scheme.reason || scheme.reasoning || ''
                const categoryIcon = getCategoryIcon(derivedName, schemeReason)
                const isHighConfidence = typeof scheme.confidence === 'number' ? scheme.confidence >= 0.85 : scheme.confidence === 'high'

                return (
                  <div key={scheme.id}
                    className={`scheme-card ${isHighConfidence ? 'high' : 'medium'} anim-fade-up`}
                    style={{animationDelay:`${i*80}ms`}}>
                    
                    <div className="card-header">
                      <div className="card-name">
                        <span className="card-icon" aria-hidden="true">{categoryIcon}</span>
                        {derivedName}
                      </div>
                      <div className="benefit-badge" style={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        {scheme.estimated_benefit}
                      </div>
                    </div>

                    <div className={`confidence-badge ${isHighConfidence ? 'high' : 'medium'}`}>
                      {isHighConfidence ? t.confidence_high : t.confidence_medium}
                    </div>

                    <p className="reason-text">
                      {schemeReason}
                    </p>

                    <button 
                      className="expand-btn"
                      data-expand-id={i.toString()}
                      aria-expanded={isExpanded}
                      onClick={handleToggleExpand}
                    >
                      {isExpanded ? t.hide_details : t.show_details}
                      <span className={`expand-arrow ${isExpanded ? 'open' : ''}`}>▼</span>
                    </button>
                    
                    <div className={`expand-content ${isExpanded ? 'open' : ''}`}>
                      <div style={{ paddingTop: '10px', paddingBottom: '16px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          📄 {t.docs_needed} ({schemeDocs.length})
                        </h4>
                        <div style={{ paddingBottom: '16px' }}>
                          {schemeDocs.map((doc: string, dIdx: number) => (
                            <div key={dIdx} className="doc-item">
                              <div className="doc-dot"></div>
                              {doc}
                            </div>
                          ))}
                        </div>

                        <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          📋 {t.how_to_apply}
                        </h4>
                        <div>
                          {schemeAction.steps?.map((step: string, sIdx: number) => (
                            <div key={sIdx} className="step-item">
                              <div className="step-num">{sIdx + 1}</div>
                              <div className="step-text">{step}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="card-actions no-print">
                      <button 
                        className="btn-apply"
                        onClick={() => window.open(
                          getApplyUrl(scheme.id),
                          '_blank',
                          'noopener,noreferrer'
                        )}
                      >
                        {t.apply_btn}
                      </button>
                      <button 
                        className="btn-whatsapp"
                        data-scheme-name={derivedName}
                        data-scheme-benefit={scheme.estimated_benefit}
                        onClick={handleShareClick}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                        </svg>
                        {t.share_btn}
                      </button>
                    </div>

                  </div>
                )
              })}
              <div style={{marginTop:'8px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <button className="btn-outline no-print" onClick={resetToHome}>
                  🔄 {t.retry_btn}
                </button>
                <button className="btn-outline no-print" onClick={handlePrint}>
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
