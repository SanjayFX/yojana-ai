import test from 'node:test'
import assert from 'node:assert/strict'

import { buildEligibilityPrompt } from '../src/lib/prompts.ts'
import schemes from '../src/data/schemes.json' with { type: 'json' }

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

test('buildEligibilityPrompt includes elderly pension accuracy rules', () => {
  const prompt = buildEligibilityPrompt(
    {
      age: 65,
      state: 'Karnataka',
      annual_income_inr: 50000,
      caste_category: 'ST',
      occupation: 'unemployed',
      gender: 'Male',
      is_farmer: false,
      has_bpl_card: true,
      is_student: false,
      is_disabled: false,
      is_widow: false,
      preferred_language: 'kn',
    },
    []
  )

  assert.match(prompt, /ELDERLY CITIZENS \(age >= 60\):/)
  assert.match(prompt, /IGNOAPS \(Indira Gandhi Old Age Pension\)/)
  assert.match(prompt, /Karnataka Sandhya Suraksha Yojana/)
  assert.match(prompt, /These must be checked even if not in/)
  assert.match(prompt, /top pre-filtered results\./)
})

test('local scheme data keeps IGNOAPS available nationwide for age 60 plus', () => {
  const scheme = schemes.find((entry) => entry.id === 'ignoaps')

  assert.ok(scheme, 'ignoaps must exist in local schemes data')
  assert.equal(scheme.eligibility.min_age, 60)
  assert.deepEqual(scheme.eligibility.eligible_states, ['All'])
})
