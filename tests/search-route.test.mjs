import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildSchemeSearchOrClause,
  buildSchemeSearchTerms,
  translateQuery,
} from '../src/app/api/schemes/search/route.ts'

test('translateQuery maps regional farmer input to english keywords', () => {
  assert.equal(translateQuery('किसान'), 'farmer kisan')
  assert.equal(translateQuery('loan'), 'loan finance mudra')
})

test('buildSchemeSearchTerms preserves original and translated query terms', () => {
  const translatedTerms = buildSchemeSearchTerms('किसान')

  assert.ok(translatedTerms.includes('किसान'))
  assert.ok(translatedTerms.includes('farmer kisan'))
  assert.ok(translatedTerms.includes('farmer'))
  assert.ok(translatedTerms.includes('kisan'))
  assert.deepEqual(buildSchemeSearchTerms('PM Kisan'), ['PM Kisan'])
})

test('buildSchemeSearchOrClause searches across fields for every search term', () => {
  const clause = buildSchemeSearchOrClause(['किसान', 'farmer kisan'])

  assert.match(clause, /name\.ilike\.%किसान%/)
  assert.match(clause, /benefit\.ilike\.%किसान%/)
  assert.match(clause, /category\.ilike\.%किसान%/)
  assert.match(clause, /name\.ilike\.%farmer kisan%/)
  assert.match(clause, /ministry\.ilike\.%farmer kisan%/)
})
