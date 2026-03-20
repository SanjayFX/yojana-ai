import test from 'node:test'
import assert from 'node:assert/strict'

import {
  BATCH,
  LANGS,
  shouldStopBatch,
} from '../scripts/translate-all.ts'

test('bulk translation script targets all 7 languages with batch size 20', () => {
  assert.equal(BATCH, 20)
  assert.deepEqual(LANGS, ['hi', 'ta', 'bn', 'te', 'mr', 'gu', 'kn'])
})

test('shouldStopBatch stops on terminal batch conditions', () => {
  assert.equal(shouldStopBatch({ done: true, translated: 20 }), true)
  assert.equal(shouldStopBatch({ done: false, translated: 0 }), true)
  assert.equal(shouldStopBatch({ done: false, translated: 5 }), false)
})
