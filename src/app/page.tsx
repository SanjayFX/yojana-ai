'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { SUPPORTED_LANGS, type LangCode } from '@/lib/i18n/translations'
import { useLang } from '@/lib/context/LanguageContext'

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
    resultsIntro: 'Aapko',
  },
  en: {
    heroBadge: 'AI-powered • Free • No login',
    searchPlaceholder: 'Type to search state',
    showMore: 'Read more',
    showLess: 'Show less',
    showDetails: 'Show details',
    hideDetails: 'Hide details',
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

export default function YojanaAIPage() {
  const { lang, setLang, t } = useLang()
  const [screen, setScreen] = useState<Screen>('hero')
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [results, setResults] = useState<any>(null)
  const [schemeCount, setSchemeCount] = useState<number>(558)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{
    id: string
    name: string
    benefit: string
    category: string
    apply_url: string
  }>>([])
  const [searching, setSearching] = useState(false)
  
  const [activeWaitTimer, setActiveWaitTimer] = useState(0)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  const [pulseAnswerId, setPulseAnswerId] = useState<string | null>(null)
  const [stateSearchQuery, setStateSearchQuery] = useState('')
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  useEffect(() => {
    fetch('/api/schemes/stats')
      .then(r => r.json())
      .then(data => {
        if (data.total_schemes) {
          setSchemeCount(data.total_schemes)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.scheme-search-wrap')) {
        setSearchResults([])
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const formatCount = (n: number): string => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`
    if (n >= 100) return `${Math.floor(n / 10) * 10}+`
    return `${n}+`
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (query.trim().length < 2) {
      setSearchResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/schemes/search?q=${encodeURIComponent(query.trim())}`
        )
        const data = await res.json()
        setSearchResults(data.results ?? [])
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
  }

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
  
  const resetToHome = useCallback(() => {
    setScreen('hero')
    setAnswers({})
    setExpandedCards({})
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

  const handleStateSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setStateSearchQuery(event.target.value)
  }, [])

  const handleAnswerSelect = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const questionId = event.currentTarget.dataset.questionId
    const value = event.currentTarget.dataset.optionValue
    if (!questionId || !value) return
    setPulseAnswerId(value)
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    // Automatically proceed to next question for select inputs to save clicks
    setTimeout(() => {
      setPulseAnswerId(null)
    }, 200)
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

  const getApplyUrl = (schemeId: string): string => {
    const VERIFIED_URLS: Record<string, string> = {
      pm_kisan: 'https://pmkisan.gov.in',
      ab_pmjay: 'https://pmjay.gov.in',
      pmay_urban: 'https://pmaymis.gov.in',
      pmay_rural: 'https://pmayg.nic.in',
      mgnrega: 'https://nrega.nic.in',
      kisan_credit_card: 'https://www.nabard.org',
      pm_mudra: 'https://www.mudra.org.in',
      pm_fasal_bima: 'https://pmfby.gov.in',
      pm_ujjwala: 'https://pmuy.gov.in',
      pm_jan_dhan: 'https://pmjdy.gov.in',
      atal_pension: 'https://npscra.nsdl.co.in',
      pm_jeevan_jyoti: 'https://jansuraksha.gov.in',
      pm_suraksha_bima: 'https://jansuraksha.gov.in',
      stand_up_india: 'https://www.standupmitra.in',
      pm_vishwakarma: 'https://pmvishwakarma.gov.in',
      national_scholarship: 'https://scholarships.gov.in',
      pm_scholarship_capf: 'https://scholarships.gov.in',
      pmkvy: 'https://www.pmkvyofficial.org',
      pm_surya_ghar: 'https://pmsuryaghar.gov.in',
      sukanya_samriddhi: 'https://www.indiapost.gov.in',
      pm_svnidhi: 'https://pmsvanidhi.mohua.gov.in',
      pm_awas_urban: 'https://pmaymis.gov.in',
      pm_awas_rural: 'https://pmayg.nic.in',
      mnrega: 'https://nrega.nic.in',

      pudhumai_penn: 'https://pudumaipenn.tn.gov.in',
      'pudhumai-penn-scheme':
        'https://pudumaipenn.tn.gov.in',
      cm_breakfast: 'https://mdm.tn.gov.in',
      'cm-breakfast-scheme': 'https://mdm.tn.gov.in',
      naan_mudhalvan: 'https://naanmudhalvan.tn.gov.in',
      'naan-mudhalvan-scheme':
        'https://naanmudhalvan.tn.gov.in',
      kalaignar_magalir: 'https://www.maws.tn.gov.in',
      'kalaignar-magalir-urimai-thogai-scheme':
        'https://www.maws.tn.gov.in',
      makkalai_thedi: 'https://www.tnhealth.tn.gov.in',
      'makkalai-thedi-maruthuvam':
        'https://www.tnhealth.tn.gov.in',

      up_kanya_sumangala: 'https://mksy.up.gov.in',
      'up-kanya-sumangala-yojana': 'https://mksy.up.gov.in',
      up_jan_arogya: 'https://sects.up.gov.in',
      'up-mukhyamantri-jan-arogya-yojana':
        'https://sects.up.gov.in',

      karnataka_yuvanidhi:
        'https://sevasindhu.karnataka.gov.in',
      'karnataka-yuvanidhi-scheme':
        'https://sevasindhu.karnataka.gov.in',
      karnataka_gruha_lakshmi:
        'https://sevasindhu.karnataka.gov.in',
      karnataka_gruha_jyoti:
        'https://sevasindhu.karnataka.gov.in',
      karnataka_anna_bhagya:
        'https://ahara.kar.nic.in',

      bihar_student_credit_card:
        'https://www.7nishchay-yuvaupmission.bihar.gov.in',
      'bihar-student-credit-card-scheme':
        'https://www.7nishchay-yuvaupmission.bihar.gov.in',
      mukhyamantri_kanya_utthan:
        'https://medhasoft.bih.nic.in',
      'mukhyamantri-kanya-utthan-yojana':
        'https://medhasoft.bih.nic.in',

      ladki_bahin:
        'https://ladakibahin.maharashtra.gov.in',
      mjpjay: 'https://www.jeevandayee.gov.in',

      west_bengal_lakshmir_bhandar:
        'https://socialsecurity.wb.gov.in',
      kanyashree: 'https://wbkanyashree.gov.in',
    }

    if (VERIFIED_URLS[schemeId]) {
      return VERIFIED_URLS[schemeId]
    }

    const action = results?.actions?.[schemeId]
    const actionUrl = action?.portal_url
      ?? (action as { apply_url?: string })?.apply_url

    const isLikelyFake = (url: string) => {
      if (!url.startsWith('https://')) return true
      return (
        url.includes('/scheme/data_view/') ||
        url.includes('/view/') ||
        url.includes('/schemes/view') ||
        /\/\d{3,}(?:[/?#]|$)/.test(url) ||
        url.includes('tn.gov.in/scheme')
      )
    }

    if (actionUrl && !isLikelyFake(actionUrl)) {
      return actionUrl
    }

    const schemeName =
      results?.matched_schemes?.find(
        (r: { id: string; name?: string }) =>
          r.id === schemeId
      )?.name ?? schemeId
    return `https://www.myscheme.gov.in/search?keyword=${encodeURIComponent(
      schemeName
    )}`
  }

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <main id="main">
        {screen === 'hero' && (
          <div className="hero-wrap">
            <div className="blob blob-1"/>
            <div className="blob blob-2"/>
            <div className="blob blob-3"/>
            <div className="tricolor"/>
          
            <nav className="navbar-pill no-print">
              <span className="nav-logo"
                onClick={() => setScreen('hero')}>
                🇮🇳 YojanaAI
              </span>
              <div className="lang-row"
                aria-label="Select language">
                {SUPPORTED_LANGS.map(l => (
                  <button key={l}
                    className={`lang-pill${lang===l?' active':''}`}
                    onClick={() => setLang(l as LangCode)}>
                    {langLabels[l]}
                  </button>
                ))}
              </div>
            </nav>
          
            <div className="hero-content">
              <svg className="ornament" viewBox="0 0 72 20">
                <path d="M34 10C27 3 15 1 7 7c8 0 20 2 27 3z"
                  fill="#F97316" opacity="0.6"/>
                <path d="M34 10C27 17 15 19 7 13c8 0 20-2 27-3z"
                  fill="#F97316" opacity="0.35"/>
                <circle cx="36" cy="10" r="2.5"
                  fill="#F97316"/>
                <path d="M38 10C45 3 57 1 65 7c-8 0-20 2-27 3z"
                  fill="#F97316" opacity="0.6"/>
                <path d="M38 10C45 17 57 19 65 13c-8 0-20-2-27-3z"
                  fill="#F97316" opacity="0.35"/>
              </svg>
          
              <div className="hero-badge a-fade-up"
                style={{animationDelay:'0.05s'}}>
                ✦ {uiCopy.heroBadge}
              </div>
          
              <h1 className="hero-display a-fade-up"
                style={{animationDelay:'0.1s'}}>
                {(t as any).tagline_line1 || t.tagline}{' '}
                {((t as any).tagline_line2) && (
                  <span className="hero-display-accent">
                    {(t as any).tagline_line2}
                  </span>
                )}
              </h1>
          
              <p className="hero-body a-fade-up"
                style={{animationDelay:'0.15s'}}>
                {t.subtagline}
              </p>
          
              <button className="btn-cta a-fade-up"
                style={{animationDelay:'0.2s'}}
                onClick={() => setScreen('form')}>
                {t.start_btn}
              </button>
          
              <p className="hero-note a-fade-up"
                style={{animationDelay:'0.25s'}}>
                {t.free_note}
              </p>

              <div className="scheme-search-wrap"
                style={{
                  width: '100%',
                  maxWidth: '420px',
                  marginTop: '28px',
                  position: 'relative'
                }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: '16px',
                    fontSize: '16px',
                    pointerEvents: 'none',
                    opacity: 0.4
                  }}>🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder={
                      lang === 'en'
                        ? 'Search any scheme... e.g. PM Kisan'
                        : 'Koi bhi yojana dhundho...'
                    }
                    style={{
                      width: '100%',
                      height: '50px',
                      paddingLeft: '44px',
                      paddingRight: '16px',
                      border: '1.5px solid var(--border-mid)',
                      borderRadius: 'var(--r-full)',
                      fontSize: '14px',
                      color: 'var(--ink)',
                      background: 'rgba(255,255,255,0.85)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      outline: 'none',
                      letterSpacing: '-0.005em',
                      boxShadow: '0 2px 12px rgba(10,15,30,0.06)'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor =
                        'var(--saffron)'
                      e.target.style.boxShadow =
                        '0 0 0 3px var(--saffron-soft)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor =
                        'var(--border-mid)'
                      e.target.style.boxShadow =
                        '0 2px 12px rgba(10,15,30,0.06)'
                    }}
                  />
                  {searching && (
                    <span style={{
                      position: 'absolute',
                      right: '16px',
                      fontSize: '12px',
                      color: 'var(--subtle)'
                    }}>...</span>
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '54px',
                    left: 0,
                    right: 0,
                    background: 'var(--surface)',
                    border: '1px solid var(--border-mid)',
                    borderRadius: 'var(--r-xl)',
                    boxShadow: '0 8px 32px rgba(10,15,30,0.12)',
                    zIndex: 200,
                    overflow: 'hidden',
                    maxHeight: '320px',
                    overflowY: 'auto'
                  }}>
                    {searchResults.map((scheme, i) => {
                      const categoryIcons: Record<string, string> = {
                        agriculture: '🌾',
                        health: '🏥',
                        education: '📚',
                        housing: '🏠',
                        finance: '💰',
                        women: '👩',
                        disability: '♿',
                        elderly: '👴',
                        employment: '💼'
                      }
                      const icon = categoryIcons[scheme.category] ?? '📋'

                      return (
                        <div
                          key={scheme.id}
                          onClick={() => {
                            setSearchResults([])
                            setSearchQuery('')
                            window.open(
                              scheme.apply_url ||
                              'https://www.myscheme.gov.in/search',
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }}
                          style={{
                            padding: '14px 16px',
                            borderBottom: i < searchResults.length - 1
                              ? '1px solid var(--border)'
                              : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            textAlign: 'left',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            ;(e.currentTarget as HTMLDivElement).style.background =
                              'var(--saffron-soft)'
                          }}
                          onMouseLeave={e => {
                            ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
                          }}
                        >
                          <span style={{
                            fontSize: '20px',
                            flexShrink: 0,
                            marginTop: '1px'
                          }}>
                            {icon}
                          </span>
                          <div>
                            <div style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: 'var(--ink)',
                              lineHeight: 1.3,
                              letterSpacing: '-0.01em',
                              marginBottom: '3px'
                            }}>
                              {scheme.name}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: 'var(--muted)',
                              letterSpacing: '-0.005em'
                            }}>
                              {scheme.benefit.length > 60
                                ? scheme.benefit.slice(0, 60)+'...'
                                : scheme.benefit}
                            </div>
                          </div>
                          <span style={{
                            fontSize: '11px',
                            color: 'var(--saffron)',
                            fontWeight: 600,
                            marginLeft: 'auto',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            Apply →
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {searchQuery.length >= 2 &&
                  !searching &&
                  searchResults.length === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '54px',
                      left: 0,
                      right: 0,
                      background: 'var(--surface)',
                      border: '1px solid var(--border-mid)',
                      borderRadius: 'var(--r-xl)',
                      padding: '20px',
                      textAlign: 'center',
                      fontSize: '13px',
                      color: 'var(--subtle)',
                      zIndex: 200,
                      boxShadow:
                        '0 8px 32px rgba(10,15,30,0.08)'
                    }}>
                      No schemes found for "{searchQuery}"
                    </div>
                  )}
              </div>

              <div className="stats-row a-fade-up"
                style={{animationDelay:'0.3s'}}>
                <div className="stat-card">
                  <div className="stat-num">{formatCount(schemeCount)}</div>
                  <div className="stat-label">
                    {t.stat1_label}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{t.stat2_num}</div>
                  <div className="stat-label">
                    {t.stat2_label}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{t.stat3_num}</div>
                  <div className="stat-label">
                    {t.stat3_label}
                  </div>
                </div>
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
            <div className="form-screen">
              <div className="tricolor"/>
              <nav className="navbar no-print">
                <div className="navbar-left">
                  <button className="nav-back-btn" onClick={handleFormBack}>
                    ← {t.back_btn}
                  </button>
                </div>
                <div className="navbar-center">
                  {t.step_label} {currentStep+1} {t.step_of} 6
                </div>
                <div className="navbar-right">
                  <span className="nav-logo"
                    style={{fontSize:'13px'}}
                    onClick={() => setScreen('hero')}>
                    YojanaAI
                  </span>
                </div>
              </nav>
              <div className="progress-track">
                <div className="progress-fill"
                  style={{width:`${(currentStep/6)*100}%`}}/>
              </div>
              <div className="form-body">
                <div className="form-inner a-slide-left"
                  key={currentStep}>
                <div className="q-header-row">
                  <div className="q-header-left">
                    <span className="q-eyebrow">
                      Q{currentStep+1}
                    </span>
                      <h2 className="q-heading">
                        {lang !== 'en' ? qText : q.en}
                      </h2>
                      <p className="q-sub">
                        {lang!=='en' ? q.en : ''}
                      </p>
                    </div>
                  </div>
                  
                  {q.id === 'state' && (
                    <div className="search-wrap">
                      <input
                        type="text"
                        autoFocus
                        className="search-input"
                        aria-label={qText as string}
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
                        className={`opt-btn ${isSelected ? 'selected' : ''}`}
                        data-question-id={q.id}
                        data-option-value={opt}
                        aria-pressed={isSelected}
                        onClick={handleAnswerSelect}
                      >
                        <span style={{ minWidth: 0 }}>{text}</span>
                        {isSelected && <span className="opt-check" aria-hidden="true">✓</span>}
                      </button>
                    )
                  })}

                  {q.type === 'number' && (
                    <div className="num-row">
                      <input
                        type="number"
                        className="num-input"
                        aria-label={t.q_age_hi || q.en}
                        value={answers[q.id] || ''}
                        onChange={handleAgeChange}
                        placeholder={q.placeholder}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="bottom-bar no-print">
                <button className="btn-cta"
                  style={{ maxWidth: '100%', width: '100%' }}
                  disabled={!hasAnswer}
                  onClick={handleNext}>
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
            <div className="loading-screen">
              <div className="spinner">
                <div className="spinner-core"/>
              </div>
              <h2 className="loading-title">
                {t.loading_title}
              </h2>
              <p className="loading-sub">
                {t.loading_sub}
              </p>
              <div className="status-list"
                aria-live="polite">
                {agentRows.map((row,i) => (
                  <div key={i} className="status-item">
                    <div className={
                      `status-dot ${row.status}`}>
                      {row.status==='done'?'✓':''}
                    </div>
                    <span className={
                      `status-label ${row.status}`}>
                      {row.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="load-track">
                <div className="load-fill"/>
              </div>
            </div>
          )
        })()}

        {screen === 'results' && results && (
          <div className="results-screen">
            <div className="tricolor"/>
            <nav className="navbar no-print">
              <div className="navbar-left">
                <button className="nav-back-btn"
                  onClick={()=>{
                    setScreen('hero')
                    setResults(null)
                  }}>
                  ← {t.back_btn}
                </button>
              </div>
              <div className="navbar-right">
                <span className="nav-logo"
                  style={{fontSize:'13px'}}
                  onClick={() => {
                    setScreen('hero')
                    setResults(null)
                  }}>
                  YojanaAI
                </span>
              </div>
            </nav>
            <div className="results-banner">
              <div className="results-banner-content">
                <p className="results-eyebrow">
                  Results
                </p>
                <h2 className="results-heading">
                  🎉 {results.matched_schemes.length}{' '}
                  {t.schemes_found}
                </h2>
                <p className="results-benefit-text">
                  {t.total_benefit_label}{' '}
                  {results.total_annual_benefit.length>90
                    ? results.total_annual_benefit
                        .slice(0,90)+'...'
                    : results.total_annual_benefit}
                </p>
              </div>
            </div>
            <div className="cards-wrap">
              {results.matched_schemes.map((s: any, i: number) => {
                const schemeDocs = results.documents?.[s.id] || []
                const schemeAction = results.actions?.[s.id] || {}
                const isExpanded = expandedCards[i.toString()]
                
                const derivedName = s.name || s.id
                const schemeReason = s.reason || s.reasoning || ''
                const categoryIcon = getCategoryIcon(derivedName, schemeReason)
                const isHighConfidence = typeof s.confidence === 'number' ? s.confidence >= 0.85 : s.confidence === 'high'

                return (
                  <div key={s.id}
                    className={`scheme-card ${
                      s.confidence==='high'
                        ?'high':'medium'
                    } a-fade-up`}
                    style={{
                      animationDelay:`${i*70}ms`
                    }}>
                    
                    <div className="card-top">
                      <div className="card-name-wrap">
                        <span className="card-icon" aria-hidden="true">{categoryIcon}</span>
                        <h3 className="card-name">{derivedName}</h3>
                      </div>
                      <div className="benefit-chip">
                        {s.estimated_benefit}
                      </div>
                    </div>

                    <div className={`confidence-chip ${isHighConfidence ? 'high' : 'medium'}`}>
                      {isHighConfidence ? t.confidence_high : t.confidence_medium}
                    </div>

                    <p className="reason">
                      {schemeReason}
                    </p>

                    <button 
                      className="expand-trigger"
                      data-expand-id={i.toString()}
                      aria-expanded={isExpanded}
                      onClick={handleToggleExpand}
                    >
                      {isExpanded ? t.hide_details : t.show_details}
                      <span className={`expand-caret ${isExpanded ? 'open' : ''}`}>▼</span>
                    </button>
                    
                    <div className={`expand-body ${isExpanded ? 'open' : ''}`}>
                      <div style={{ paddingTop: '10px', paddingBottom: '16px' }}>
                        <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          📄 {t.docs_needed} ({schemeDocs.length})
                        </h4>
                        <div style={{ paddingBottom: '16px' }}>
                          {schemeDocs.map((doc: string, dIdx: number) => (
                            <div key={dIdx} className="doc-row">
                              <div className="doc-dot"></div>
                              {doc}
                            </div>
                          ))}
                        </div>

                        <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          📋 {t.how_to_apply}
                        </h4>
                        <div>
                          {schemeAction.steps?.map((step: string, sIdx: number) => (
                            <div key={sIdx} className="step-row">
                              <div className="step-badge">{sIdx + 1}</div>
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
                          getApplyUrl(s.id),
                          '_blank',
                          'noopener,noreferrer'
                        )}
                      >
                        {t.apply_btn}
                      </button>
                      <button 
                        className="btn-wa"
                        data-scheme-name={derivedName}
                        data-scheme-benefit={s.estimated_benefit}
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
              <div style={{marginTop:'8px'}}>
                <button className="btn-ghost no-print"
                  onClick={()=>{
                    setScreen('hero')
                    setResults(null)
                  }}>
                  🔄 {t.retry_btn}
                </button>
                <button className="btn-ghost no-print"
                  onClick={()=>window.print()}>
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
