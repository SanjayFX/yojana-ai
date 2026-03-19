import { expect, test, type Page } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs/promises'

const BASE = '/'
const RESULTS_FILE = path.join(process.cwd(), 'tests/.e2e-full-results.json')

const LANG_LABELS: Record<string, string> = {
  hi: 'हिं',
  en: 'EN',
  bn: 'বাং',
  te: 'తె',
  mr: 'मर',
  ta: 'தமி',
  gu: 'ગુ',
  kn: 'ಕನ್',
}

type Persona = {
  id: string
  label: string
  lang: 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'kn'
  stateInput: string
  stateOption: string
  age: string
  incomeValue: string
  category: string
  occupationValue: string
  gender: 'Male' | 'Female' | 'Other'
  expectedTerms: string[]
  minSchemes: number
  requireTerm?: string
  searchState?: boolean
}

type PersonaRun = {
  personaId: string
  personaLabel: string
  lang: string
  schemeCount: number
  actionCount: number
  banner: string
  firstReason: string
  schemeNames: string[]
  applyUrl: string
  applyUrlStatus: number | 'skipped' | 'error'
  elapsedMs: number
  screenshotPath: string
  screenshotSaved: boolean
  expectedHits: string[]
  error?: string
}

const PERSONAS: Persona[] = [
  {
    id: 'P1',
    label: 'Hindi farmer (Bihar)',
    lang: 'hi',
    stateInput: 'Bihar',
    stateOption: 'Bihar',
    age: '45',
    incomeValue: '0 – 1 lakh',
    category: 'SC',
    occupationValue: 'Kisan (Farmer)',
    gender: 'Male',
    expectedTerms: ['PM Kisan', 'MNREGA', 'Ayushman Bharat'],
    minSchemes: 10,
  },
  {
    id: 'P2',
    label: 'Tamil student (Tamil Nadu)',
    lang: 'ta',
    stateInput: 'Tamil Nadu',
    stateOption: 'Tamil Nadu',
    age: '19',
    incomeValue: '0 – 1 lakh',
    category: 'General',
    occupationValue: 'Student',
    gender: 'Female',
    expectedTerms: ['Pudhumai Penn', 'Scholarship'],
    minSchemes: 8,
  },
  {
    id: 'P3',
    label: 'Bengali widow (West Bengal)',
    lang: 'bn',
    stateInput: 'West Bengal',
    stateOption: 'West Bengal',
    age: '52',
    incomeValue: '0 – 1 lakh',
    category: 'General',
    occupationValue: 'Kaam nahi (Unemployed)',
    gender: 'Female',
    expectedTerms: ['Lakshmir Bhandar', 'pension', 'housing'],
    minSchemes: 5,
    requireTerm: 'Lakshmir Bhandar',
  },
  {
    id: 'P4',
    label: 'Telugu farmer (Andhra Pradesh)',
    lang: 'te',
    stateInput: 'Andhra Pradesh',
    stateOption: 'Andhra Pradesh',
    age: '38',
    incomeValue: '1 – 3 lakh',
    category: 'OBC',
    occupationValue: 'Kisan (Farmer)',
    gender: 'Male',
    expectedTerms: ['PM Kisan', 'Kisan Credit Card', 'Fasal Bima'],
    minSchemes: 8,
  },
  {
    id: 'P5',
    label: 'Marathi small business (Maharashtra)',
    lang: 'mr',
    stateInput: 'Maharashtra',
    stateOption: 'Maharashtra',
    age: '32',
    incomeValue: '3 – 6 lakh',
    category: 'General',
    occupationValue: 'Business',
    gender: 'Male',
    expectedTerms: ['Mudra', 'Stand Up India'],
    minSchemes: 5,
  },
  {
    id: 'P6',
    label: 'Gujarati student (Gujarat)',
    lang: 'gu',
    stateInput: 'Gujarat',
    stateOption: 'Gujarat',
    age: '20',
    incomeValue: '1 – 3 lakh',
    category: 'EWS',
    occupationValue: 'Student',
    gender: 'Female',
    expectedTerms: ['Scholarship', 'Beti Bachao'],
    minSchemes: 6,
  },
  {
    id: 'P7',
    label: 'Kannada elderly (Karnataka)',
    lang: 'kn',
    stateInput: 'Karnataka',
    stateOption: 'Karnataka',
    age: '65',
    incomeValue: '0 – 1 lakh',
    category: 'ST',
    occupationValue: 'Kaam nahi (Unemployed)',
    gender: 'Male',
    expectedTerms: ['IGNOAPS', 'Ayushman', 'pension'],
    minSchemes: 5,
    requireTerm: 'pension',
  },
  {
    id: 'P8',
    label: 'Regional input (Hindi)',
    lang: 'hi',
    stateInput: 'उत्तर प्रदेश',
    stateOption: 'Uttar Pradesh',
    age: '28',
    incomeValue: '1 – 3 lakh',
    category: 'OBC',
    occupationValue: 'Private Job',
    gender: 'Female',
    expectedTerms: ['Uttar Pradesh', 'Kanya Sumangala', 'Jan Arogya'],
    minSchemes: 5,
    requireTerm: 'Uttar Pradesh',
    searchState: true,
  },
]

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function loadPersistedRuns(): Promise<PersonaRun[]> {
  try {
    const raw = await fs.readFile(RESULTS_FILE, 'utf8')
    return JSON.parse(raw) as PersonaRun[]
  } catch {
    return []
  }
}

async function persistRun(run: PersonaRun): Promise<void> {
  const existing = await loadPersistedRuns()
  const next = existing.filter(item => item.personaId !== run.personaId)
  next.push(run)
  next.sort(
    (a, b) =>
      PERSONAS.findIndex(persona => persona.id === a.personaId) -
      PERSONAS.findIndex(persona => persona.id === b.personaId)
  )
  await fs.writeFile(RESULTS_FILE, JSON.stringify(next, null, 2), 'utf8')
}

async function checkUrlStatus(url: string, timeoutMs = 10000): Promise<number | 'skipped' | 'error'> {
  if (!url || !url.startsWith('http')) return 'skipped'

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    })
    return response.status
  } catch {
    return 'error'
  } finally {
    clearTimeout(timeout)
  }
}

async function selectLanguage(page: Page, lang: Persona['lang']) {
  await page.getByRole('button', { name: LANG_LABELS[lang] }).click()
  await page.waitForTimeout(200)
}

async function selectOptionByValue(
  page: Page,
  questionId: string,
  optionValue: string
) {
  const option = page.locator(
    `[data-question-id="${questionId}"][data-option-value="${optionValue}"]`
  )
  await expect(option).toBeVisible({ timeout: 5000 })
  await option.click()
}

async function runPersona(page: Page, persona: Persona): Promise<PersonaRun> {
  await page.addInitScript(() => {
    const opened: string[] = []
    ;(window as unknown as { __openedUrls?: string[] }).__openedUrls = opened
    const originalOpen = window.open
    window.open = ((...args: Parameters<typeof window.open>) => {
      const url = args[0]
      if (typeof url === 'string') {
        opened.push(url)
      }
      return null
    }) as typeof window.open
    void originalOpen
  })

  const screenshotPath = path.join(
    'tests/screenshots',
    `${persona.id}-${persona.lang}-${slugify(persona.stateOption)}.png`
  )

  await fs.mkdir(path.dirname(screenshotPath), { recursive: true })

  const startedAt = Date.now()

  let schemeCount = 0
  let actionCount = 0
  let banner = ''
  let firstReason = ''
  let schemeNames: string[] = []
  let applyUrl = ''
  let applyUrlStatus: number | 'skipped' | 'error' = 'skipped'
  let screenshotSaved = false
  let error: string | undefined

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.btn-cta')).toBeVisible({ timeout: 10000 })

    await selectLanguage(page, persona.lang)

    await page.locator('.btn-cta').click()
    await expect(page.locator('.search-input')).toBeVisible({ timeout: 5000 })

    const stateInput = page.locator('.search-input')
    await stateInput.fill(persona.stateInput)
    await page.waitForTimeout(persona.searchState ? 500 : 300)

    const desiredState = page.locator(
      `[data-question-id="state"][data-option-value="${persona.stateOption}"]`
    )
    if (await desiredState.count()) {
      await desiredState.first().click()
    } else {
      const firstVisible = page.locator('.opt-btn').first()
      await expect(firstVisible).toBeVisible({ timeout: 5000 })
      await firstVisible.click()
    }

    await expect(page.locator('.btn-cta')).toBeEnabled({ timeout: 5000 })
    await page.locator('.btn-cta').click()

    await page.locator('.num-input').fill(persona.age)
    await expect(page.locator('.btn-cta')).toBeEnabled({ timeout: 5000 })
    await page.locator('.btn-cta').click()

    await selectOptionByValue(page, 'income', persona.incomeValue)
    await expect(page.locator('.btn-cta')).toBeEnabled({ timeout: 5000 })
    await page.locator('.btn-cta').click()

    await selectOptionByValue(page, 'category', persona.category)
    await expect(page.locator('.btn-cta')).toBeEnabled({ timeout: 5000 })
    await page.locator('.btn-cta').click()

    await selectOptionByValue(page, 'occupation', persona.occupationValue)
    await expect(page.locator('.btn-cta')).toBeEnabled({ timeout: 5000 })
    await page.locator('.btn-cta').click()

    await selectOptionByValue(page, 'gender', persona.gender)
    await expect(page.locator('.btn-cta')).toBeEnabled({ timeout: 5000 })
    await page.locator('.btn-cta').click()

    await expect(page.locator('.results-screen')).toBeVisible({ timeout: 45000 })
    await expect(page.locator('.scheme-card').first()).toBeVisible({ timeout: 30000 })

    schemeCount = await page.locator('.scheme-card').count()
    actionCount = await page.locator('.btn-apply').count()
    banner = (await page.locator('.results-heading').textContent()) ?? ''
    firstReason = (await page.locator('.reason').first().textContent()) ?? ''
    schemeNames = await page.locator('.card-name').allTextContents()

    const firstApply = page.locator('.btn-apply').first()
    if (await firstApply.count()) {
      await firstApply.click()
      const urls = await page.evaluate(
        () => (window as unknown as { __openedUrls?: string[] }).__openedUrls ?? []
      )
      applyUrl = urls[0] ?? ''
      applyUrlStatus = await checkUrlStatus(applyUrl)
    }
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught)
  } finally {
    try {
      await page.screenshot({
        path: screenshotPath,
        fullPage: false,
      })
      screenshotSaved = true
    } catch (caught) {
      if (!error) {
        error = caught instanceof Error ? caught.message : String(caught)
      }
    }
  }

  const elapsedMs = Date.now() - startedAt
  const expectedHits = persona.expectedTerms.filter(term =>
    schemeNames.some(name => name.toLowerCase().includes(term.toLowerCase()))
  )

  return {
    personaId: persona.id,
    personaLabel: persona.label,
    lang: persona.lang,
    schemeCount,
    actionCount,
    banner,
    firstReason,
    schemeNames,
    applyUrl,
    applyUrlStatus,
    elapsedMs,
    screenshotPath,
    screenshotSaved,
    expectedHits,
    error,
  }
}

function printReport(results: PersonaRun[]) {
  const passed = results.filter(result => {
    const persona = PERSONAS.find(p => p.id === result.personaId)
    if (!persona) return false

    const basePass = result.schemeCount >= persona.minSchemes && result.actionCount > 0

    if (persona.requireTerm) {
      const hasRequiredTerm = result.schemeNames.some(name =>
        name.toLowerCase().includes(persona.requireTerm!.toLowerCase())
      )
      if (!hasRequiredTerm) return false
    }

    if (persona.id === 'P8') {
      const hasUpSignal = result.schemeNames.some(name =>
        /uttar pradesh|kanya sumangala|jan arogya/i.test(name)
      )
      return basePass && hasUpSignal
    }

    return basePass
  })

  const averageSchemes = results.length
    ? results.reduce((sum, result) => sum + result.schemeCount, 0) / results.length
    : 0
  const averageProcessingTime = results.length
    ? results.reduce((sum, result) => sum + result.elapsedMs, 0) / results.length
    : 0

  const languageIssues = results
    .filter(result => !result.banner)
    .map(result => result.personaId)

  const apply404s = results
    .filter(result => result.applyUrlStatus === 404)
    .map(result => `${result.personaId}: ${result.applyUrl}`)

  const issues: string[] = []
  for (const result of results) {
    const persona = PERSONAS.find(p => p.id === result.personaId)
    if (!persona) continue

    if (result.schemeCount < persona.minSchemes) {
      issues.push(`${result.personaId} matched ${result.schemeCount} schemes`)
    }

    if (result.actionCount === 0) {
      issues.push(`${result.personaId} had no Apply actions`)
    }

    if (result.error) {
      issues.push(`${result.personaId} error: ${result.error}`)
    }

    if (persona.requireTerm) {
      const hasRequiredTerm = result.schemeNames.some(name =>
        name.toLowerCase().includes(persona.requireTerm!.toLowerCase())
      )
      if (!hasRequiredTerm) {
        issues.push(`${result.personaId} missing required term "${persona.requireTerm}"`)
      }
    }

    if (persona.id === 'P8') {
      const hasUpSignal = result.schemeNames.some(name =>
        /uttar pradesh|kanya sumangala|jan arogya/i.test(name)
      )
      if (!hasUpSignal) {
        issues.push(`${result.personaId} did not surface Uttar Pradesh-specific schemes`)
      }
    }
  }

  console.log('\nYOJANAAI QUALITY REPORT — March 2026')
  console.log('════════════════════════════════════════')
  console.log('Persona | Lang | Schemes | Actions | Pass')
  console.log('════════════════════════════════════════')

  for (const result of results) {
    const persona = PERSONAS.find(p => p.id === result.personaId)
    const pass =
      persona
        ? result.schemeCount >= persona.minSchemes &&
          result.actionCount > 0 &&
          (!persona.requireTerm ||
            result.schemeNames.some(name =>
              name.toLowerCase().includes(persona.requireTerm!.toLowerCase())
            )) &&
          (persona.id !== 'P8' ||
            result.schemeNames.some(name =>
              /uttar pradesh|kanya sumangala|jan arogya/i.test(name)
            ))
        : false
    console.log(
      `${result.personaId} ${result.personaLabel.padEnd(28)} | ${result.lang} | ${result.schemeCount} | ${result.actionCount} | ${pass ? '✅' : '❌'}`
    )
  }

  console.log('════════════════════════════════════════')
  console.log(`Overall: ${passed.length}/8 passed`)
  console.log(`Average schemes per persona: ${averageSchemes.toFixed(1)}`)
  console.log(`Average processing time: ${(averageProcessingTime / 1000).toFixed(1)}s`)
  console.log(
    `Any language where text was wrong: ${languageIssues.length ? languageIssues.join(', ') : 'None observed'}`
  )
  console.log(
    `Any 404s hit on Apply Now: ${apply404s.length ? apply404s.join(' | ') : 'None observed'}`
  )
  console.log(
    `Screenshots saved: ${results.every(result => result.screenshotSaved) ? 'yes' : 'no'}`
  )
  if (issues.length) {
    console.log('Issues found:')
    for (const issue of issues) {
      console.log(`- ${issue}`)
    }
  } else {
    console.log('Issues found: none')
  }
}

test.describe('YojanaAI Full E2E', () => {
  test.beforeAll(async () => {
    await fs.mkdir(path.dirname(RESULTS_FILE), { recursive: true })
  })

  test.afterAll(async () => {
    const results = await loadPersistedRuns()
    printReport(results)
  })

  for (const persona of PERSONAS) {
    test(persona.id + ' — ' + persona.label, async ({ page }) => {
      const result = await runPersona(page, persona)
      await persistRun(result)

      expect.soft(result.schemeCount).toBeGreaterThanOrEqual(persona.minSchemes)
      expect.soft(result.actionCount).toBeGreaterThan(0)

      if (persona.requireTerm) {
        expect.soft(
          result.schemeNames.some(name =>
            name.toLowerCase().includes(persona.requireTerm!.toLowerCase())
          )
        ).toBeTruthy()
      }

      if (persona.id === 'P8') {
        expect.soft(
          result.schemeNames.some(name =>
            /uttar pradesh|kanya sumangala|jan arogya/i.test(name)
          )
        ).toBeTruthy()
      }
    })
  }
})
