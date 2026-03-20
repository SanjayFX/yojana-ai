import { config } from 'dotenv'
import { pathToFileURL } from 'node:url'

config({ path: '.env.local' })

const DEFAULT_BASE_URL = 'http://localhost:3000'
const DEFAULT_SECRET = 'yojana2026secret'

export const BASE_URL =
  process.env.TRANSLATE_BASE_URL ?? DEFAULT_BASE_URL
export const SECRET =
  process.env.SEED_SECRET ?? DEFAULT_SECRET
export const BATCH = 20
export const LANGS = [
  'hi', 'ta', 'bn', 'te',
  'mr', 'gu', 'kn'
]

type TranslateResponse = {
  done?: boolean
  translated?: number
  next_offset?: number
}

export function shouldStopBatch(
  data: TranslateResponse
): boolean {
  return Boolean(data.done) ||
    (data.translated ?? 0) === 0
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function translateLang(lang: string) {
  console.log(`\nStarting ${lang}...`)
  let offset = 0
  let total = 0
  let done = false

  while (!done) {
    try {
      const res = await fetch(
        `${BASE_URL}/api/schemes/translate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SECRET}`
          },
          body: JSON.stringify({
            offset,
            limit: BATCH,
            lang
          })
        }
      )

      if (!res.ok) {
        throw new Error(
          `HTTP ${res.status}: ${await res.text()}`
        )
      }

      const data = await res.json() as TranslateResponse
      total += data.translated ?? 0
      console.log(
        `${lang} offset ${offset}:` +
        ` ${data.translated ?? 0} translated` +
        ` (total: ${total})`
      )

      if (shouldStopBatch(data)) {
        done = true
      } else {
        offset = data.next_offset ?? offset + BATCH
        await delay(1000)
      }
    } catch (err) {
      console.error(`Error at offset ${offset}:`, err)
      done = true
    }
  }

  console.log(`✅ ${lang} complete: ${total} schemes`)
  return total
}

export async function main() {
  console.log('Starting bulk translation...')
  console.log('Make sure npm run dev is running!')
  console.log('')

  let grandTotal = 0
  for (const lang of LANGS) {
    const count = await translateLang(lang)
    grandTotal += count
    await delay(3000)
  }

  console.log('\nALL DONE!')
  console.log(`Total translated: ${grandTotal}`)
}

const entryHref = process.argv[1]
  ? pathToFileURL(process.argv[1]).href
  : ''

if (import.meta.url === entryHref) {
  void main().catch(err => {
    console.error(err)
    process.exitCode = 1
  })
}
