import test from 'node:test'
import assert from 'node:assert/strict'

import { mergeAutomaticMatches } from '../src/lib/eligibility.ts'

test('mergeAutomaticMatches auto-includes elderly pension and health schemes for age 60+', () => {
  const profile = {
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
  }

  const schemes = [
    {
      id: 'ignoaps',
      name: 'Indira Gandhi National Old Age Pension Scheme',
      ministry: 'Ministry Of Rural Development',
      category: 'elderly',
      benefit: 'Monthly pension',
      eligibility: {
        min_age: 60,
        max_age: null,
        gender: 'Any',
        caste_categories: [],
        occupations: [],
        max_annual_income_inr: null,
        requires_bpl_card: true,
        requires_land: false,
        eligible_states: ['All'],
        special_conditions: null,
      },
      documents_required: [],
      apply_url: 'https://example.com/ignoaps',
      apply_modes: ['Online'],
      helpline: null,
    },
    {
      id: 'karnataka-sandhya-suraksha-yojana',
      name: 'Karnataka Sandhya Suraksha Yojana',
      ministry: 'Government of Karnataka',
      category: 'elderly',
      benefit: 'State old age pension',
      eligibility: {
        min_age: 60,
        max_age: null,
        gender: 'Any',
        caste_categories: [],
        occupations: [],
        max_annual_income_inr: null,
        requires_bpl_card: false,
        requires_land: false,
        eligible_states: ['Karnataka'],
        special_conditions: null,
      },
      documents_required: [],
      apply_url: 'https://example.com/sandhya',
      apply_modes: ['Online'],
      helpline: null,
    },
    {
      id: 'ab_pmjay',
      name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
      ministry: 'Ministry of Health',
      category: 'health',
      benefit: 'Health coverage',
      eligibility: {
        min_age: null,
        max_age: null,
        gender: 'Any',
        caste_categories: [],
        occupations: [],
        max_annual_income_inr: null,
        requires_bpl_card: false,
        requires_land: false,
        eligible_states: ['All'],
        special_conditions: null,
      },
      documents_required: [],
      apply_url: 'https://example.com/ab',
      apply_modes: ['Online'],
      helpline: null,
    },
  ]

  const merged = mergeAutomaticMatches(profile, schemes, [])
  const ids = merged.map((scheme) => scheme.id)

  assert.ok(ids.includes('ignoaps'))
  assert.ok(ids.includes('karnataka-sandhya-suraksha-yojana'))
  assert.ok(ids.includes('ab_pmjay'))
})
