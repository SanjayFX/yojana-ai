import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildTranslationPrompt,
  isSupportedTranslationLang,
  parseTranslationPayload,
  stripJsonFence,
} from '../src/app/api/schemes/translate/shared.ts'
import {
  buildTranslationsMap,
  parseTranslationIds,
} from '../src/app/api/schemes/translations/shared.ts'

test('translation route accepts only seeded Indian UI languages', () => {
  assert.equal(isSupportedTranslationLang('hi'), true)
  assert.equal(isSupportedTranslationLang('ta'), true)
  assert.equal(isSupportedTranslationLang('en'), false)
})

test('buildTranslationPrompt embeds scheme data and language guidance', () => {
  const prompt = buildTranslationPrompt('hi', [{
    id: 'pm-kisan',
    name: 'PM Kisan Samman Nidhi',
    benefit: 'Rs. 6000 per year'
  }])

  assert.match(prompt, /Hindi \(Devanagari script\)/)
  assert.match(prompt, /"id":"pm-kisan"/)
  assert.match(prompt, /Return ONLY JSON array/)
})

test('parseTranslationPayload strips markdown fences before parsing', () => {
  const raw = '```json\n[{"id":"pm-kisan","name":"PM किसान","benefit":"₹6000"}]\n```'

  assert.equal(stripJsonFence(raw), '[{"id":"pm-kisan","name":"PM किसान","benefit":"₹6000"}]')
  assert.deepEqual(parseTranslationPayload(raw), [{
    id: 'pm-kisan',
    name: 'PM किसान',
    benefit: '₹6000'
  }])
})

test('translations route helpers parse ids and shape response map', () => {
  assert.deepEqual(parseTranslationIds('a,b,c'), ['a', 'b', 'c'])
  assert.deepEqual(parseTranslationIds(null), [])

  assert.deepEqual(buildTranslationsMap([{
    scheme_id: 'pm-kisan',
    name: 'PM किसान',
    benefit: '₹6000'
  }]), {
    'pm-kisan': {
      name: 'PM किसान',
      benefit: '₹6000'
    }
  })
})
