import test from 'node:test'
import assert from 'node:assert/strict'

import { buildEligibilityPrompt } from '../src/lib/prompts.ts'

test('buildEligibilityPrompt includes the additional accuracy rules block', () => {
  const prompt = buildEligibilityPrompt(
    {
      age: 19,
      state: 'Tamil Nadu',
      annual_income_inr: 100000,
      caste_category: 'SC',
      occupation: 'student',
      gender: 'Female',
      is_farmer: false,
      has_bpl_card: false,
      is_student: true,
      is_disabled: false,
      is_widow: false,
      preferred_language: 'hi',
    },
    []
  )

  assert.match(prompt, /ADDITIONAL ACCURACY RULES:/)
  assert.match(prompt, /annual_income_inr < 100000 = BPL category/)
  assert.match(prompt, /Farmers \(occupation=farmer\) automatically qualify for: PM Kisan/)
  assert.match(prompt, /Students \(occupation=student\) automatically qualify for: National Scholarship Portal/)
  assert.match(prompt, /Women \(gender=Female\) additionally qualify/)
  assert.match(prompt, /If state has state-specific schemes in the database, always include relevant ones/)
})
