import test from 'node:test'
import assert from 'node:assert/strict'

import { translations } from '../src/lib/i18n/translations.ts'

test('Hindi UI copy uses Devanagari for the migrated labels', () => {
  const hi = translations.hi

  assert.equal(hi.subtagline, 'सिर्फ 6 सवाल — 60 सेकंड में पूरी सूची')
  assert.equal(hi.start_btn, 'शुरू करें →')
  assert.equal(hi.next_btn, 'आगे बढ़ें →')
  assert.equal(hi.back_btn, '← वापस')
  assert.equal(hi.step_label, 'स्टेप')
  assert.equal(hi.step_of, 'का')
  assert.equal(hi.retry_btn, '🔄 दोबारा जाँचें')
  assert.equal(hi.pdf_btn, '💾 PDF सेव करें')
  assert.equal(hi.share_btn, '📲 WhatsApp पर शेयर करें')
  assert.equal(hi.confidence_high, '✓ निश्चित रूप से पात्र')
  assert.equal(hi.confidence_medium, '~ संभवतः पात्र')
  assert.equal(hi.listen_btn, 'सुनें')
  assert.equal(hi.why_qualify_btn, 'मैं क्यों पात्र हूँ? →')
  assert.equal(hi.stat1_label, 'सरकारी योजनाएं')
  assert.equal(hi.stat2_label, 'सवाल सिर्फ')
  assert.equal(hi.stat3_label, 'में परिणाम')
})
