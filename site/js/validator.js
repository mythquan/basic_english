// ============================================================
// BASIC ENGLISH WORD VALIDATOR
// Checks if text uses only Allowed Basic English words + forms
// ============================================================

function isAllowedWord(word) {
  const BE = window.BE.WORDS
  if (!word || word.length === 0) return { ok: false, reason: "empty" }

  const lower = word.toLowerCase()

  // 1. Direct match in all Allowed words
  if (BE.ALLOWED_WORDS.has(lower)) return { ok: true }

  // 2. Check possessive 's (base word + "'s")
  if (lower.endsWith("'s")) {
    const base = lower.slice(0, -2)
    if (BE.ALL_850.has(base)) return { ok: true }
  }

  // 3. Check plural -s, -es, -ies
  if (lower.endsWith("ies")) {
    const base = lower.slice(0, -3) + "y"
    if (BE.ALL_850.has(base)) return { ok: true }
  }
  if (lower.endsWith("es")) {
    const base1 = lower.slice(0, -2)
    const base2 = lower.slice(0, -1)
    if (BE.ALL_850.has(base1)) return { ok: true }
    if (BE.ALL_850.has(base2)) return { ok: true }
  }
  if (lower.endsWith("s") && !lower.endsWith("ss")) {
    const base = lower.slice(0, -1)
    if (BE.ALL_850.has(base)) return { ok: true }
  }

  // 4. Check -ed adjectives (from 300 nouns + general pattern)
  if (lower.endsWith("ed")) {
    const base = lower.slice(0, -2)
    if (BE.ALL_850.has(base)) return { ok: true }
    if (BE.NOUNS_WITH_DERIVATIVES.has(base)) return { ok: true }
    // double consonant + ed: stopped, planned, etc.
    if (lower.length >= 4) {
      const base2 = lower.slice(0, -3)
      if (BE.ALL_850.has(base2) || BE.NOUNS_WITH_DERIVATIVES.has(base2)) return { ok: true }
    }
    // -ied: carried, married, etc.
    if (lower.endsWith("ied")) {
      const baseY = lower.slice(0, -3) + "y"
      if (BE.ALL_850.has(baseY)) return { ok: true }
    }
  }

  // 5. Check -ing derivatives
  if (lower.endsWith("ing")) {
    const base = lower.slice(0, -3)
    if (BE.ALL_850.has(base)) return { ok: true }
    if (BE.NOUNS_WITH_DERIVATIVES.has(base)) return { ok: true }
    // double consonant + ing: stopping, running
    const base2 = lower.slice(0, -4)
    if (base2.length >= 2 && BE.ALL_850.has(base2)) return { ok: true }
    // -ying: carrying, marrying
    if (lower.endsWith("ying")) {
      const baseY = lower.slice(0, -3) + "y"
      if (BE.ALL_850.has(baseY) || BE.ALL_850.has(baseY.slice(0,-1))) return { ok: true }
    }
    // -eing (like "being")
    if (lower === "being") return { ok: true }
  }

  // 6. Check -er derivatives
  if (lower.endsWith("er")) {
    const base = lower.slice(0, -2)
    if (BE.ALL_850.has(base)) return { ok: true }
    if (BE.NOUNS_WITH_DERIVATIVES.has(base)) return { ok: true }
    if (BE.ADJ_ER_ING.has(base)) return { ok: true }
    // -ier: happier, carrier
    if (lower.endsWith("ier")) {
      const baseY = lower.slice(0, -3) + "y"
      if (BE.ALL_850.has(baseY)) return { ok: true }
    }
    // -yer: lawyer -> law, etc.
    if (lower.endsWith("yer")) {
      const baseY = lower.slice(0, -3)
      if (BE.ALL_850.has(baseY)) return { ok: true }
    }
  }

  // 7. Check -ly adverbs
  if (lower.endsWith("ly")) {
    const base = lower.slice(0, -2)
    if (BE.ALL_850.has(base)) return { ok: true }
    // happy -> happily
    if (lower.endsWith("ily")) {
      const baseY = lower.slice(0, -3) + "y"
      if (BE.ALL_850.has(baseY)) return { ok: true }
    }
    // simple -> simply; true -> truly
    if (lower.endsWith("ly")) {
      const baseBle = lower.slice(0, -3) + "le"
      if (BE.ALL_850.has(baseBle)) return { ok: true }
    }
    // -tic -> -tically: automatic -> automatically
    if (lower.endsWith("ally")) {
      const baseTic = lower.slice(0, -5) + "ic"
      if (BE.ALL_850.has(baseTic)) return { ok: true }
    }
  }

  // 8. Check un- prefix
  if (lower.startsWith("un") && lower.length > 3) {
    const base = lower.slice(2)
    if (BE.UN_PREFIX_ADJECTIVES.has(base)) return { ok: true }
    if (BE.ALL_850.has(base)) return { ok: true }
    // Check if base has -ed, -ing, -ly forms
    if (base.endsWith("ed") || base.endsWith("ing") || base.endsWith("ly")) {
      const baseBase = base.endsWith("ed") ? base.slice(0,-2) :
                       base.endsWith("ing") ? base.slice(0,-3) :
                       base.endsWith("ly") ? base.slice(0,-2) : base
      if (BE.UN_PREFIX_ADJECTIVES.has(baseBase)) return { ok: true }
    }
  }

  // 9. Check -est superlatives
  if (lower.endsWith("est")) {
    const base = lower.slice(0, -3)
    if (BE.ALL_850.has(base)) return { ok: true }
    // -iest: happiest, angriest
    if (lower.endsWith("iest")) {
      const baseY = lower.slice(0, -4) + "y"
      if (BE.ALL_850.has(baseY)) return { ok: true }
    }
  }

  // 10. Comparatives (-er as comparative, not derivative)
  if (lower.endsWith("er")) {
    // already checked in #6 above; check if adjective
    const base = lower.slice(0, -2)
    if (BE.ALL_850.has(base)) {
      // Check if it's an adjective (single-syllable can use -er comparative)
      const isAdj = [...BE.QUALITIES_100, ...BE.QUALITIES_50].includes(base)
      if (isAdj) return { ok: true }
    }
  }

  // 11. Check for single-letter words that should be valid
  if (lower === "a" || lower === "i") return { ok: true }

  // 12. Numerals (basic)
  if (/^\d+(?:st|nd|rd|th)?$/.test(lower)) return { ok: true, isNumeral: true }

  return { ok: false }
}

// ---- GLOBAL VALIDATOR FUNCTION ----
function validateBasicEnglish(text) {
  if (!text || text.trim().length === 0) return { valid: true, errors: [] }

  const errors = []
  const words = text.split(/\s+/)

  for (let i = 0; i < words.length; i++) {
    const raw = words[i]
    // Remove leading/trailing punctuation for checking
    const clean = raw.replace(/^[^a-zA-Z0-9']+|[,.;:!?\"'()\[\]{}<>]+$/g, '')
                     .replace(/^[,.!?;:'"()]+/, "")
    if (!clean || clean.length === 0) continue

    // Skip proper names (capitalized in middle of sentence)
    // Actually, let's check anyway
    const result = isAllowedWord(clean)
    if (!result.ok) {
      errors.push({ word: clean, index: i, original: raw })
    }
  }

  return { valid: errors.length === 0, errors }
}

// ---- EXPORT ----
window.BE = window.BE || {}
window.BE.validate = validateBasicEnglish
window.BE.isAllowed = isAllowedWord
