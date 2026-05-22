// ============================================================
// TEACHING MODE — Word Cards + Rule Exercises
// ============================================================

// ---- WORD CATEGORIES WITH DISPLAY INFO ----
const CATEGORIES = [
  { id: 'operations', name: 'Operations', words: window.BE.WORDS.OPERATIONS, color: '#4f8cff' },
  { id: 'things-400', name: 'Things (General)', words: window.BE.WORDS.THINGS_400, color: '#2ecc71' },
  { id: 'things-200', name: 'Things (Pictured)', words: window.BE.WORDS.THINGS_200, color: '#e67e22' },
  { id: 'qualities-100', name: 'Qualities (General)', words: window.BE.WORDS.QUALITIES_100, color: '#9b59b6' },
  { id: 'qualities-50', name: 'Qualities (Opposites)', words: window.BE.WORDS.QUALITIES_50, color: '#e74c3c' },
]

// ---- RENDER TEACHING MODE ----
function renderTeaching(container) {
  const BE = window.BE.WORDS

  container.innerHTML = `
    <div class="teaching-layout">
      <div class="teaching-tabs">
        <button class="tab-btn active" data-tab="cards" onclick="BE.teaching.switchTab('cards')">📖 Word Cards</button>
        <button class="tab-btn" data-tab="exercises" onclick="BE.teaching.switchTab('exercises')">✏ Rule Exercises</button>
        <button class="tab-btn" data-tab="reference" onclick="BE.teaching.switchTab('reference')">📚 Quick Reference</button>
      </div>
      <div id="teaching-content" class="teaching-content"></div>
    </div>
  `

  BE.teaching.switchTab('cards')
}

function switchTab(tab) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab))
  const content = document.getElementById('teaching-content')
  if (!content) return

  if (tab === 'cards') renderWordCards(content)
  else if (tab === 'exercises') renderExercises(content)
  else if (tab === 'reference') renderReference(content)
}

// ============================================================
// WORD CARDS
// ============================================================
let cardFilter = ''
let cardCategory = 'all'
let cardPage = 0
const CARDS_PER_PAGE = 40

function renderWordCards(container) {
  const allWords = []
  for (const cat of CATEGORIES) {
    for (const w of cat.words) {
      allWords.push({ word: w, category: cat })
    }
  }

  container.innerHTML = `
    <div class="cards-section">
      <div class="cards-controls">
        <div class="cards-search">
          <input type="text" id="card-search" placeholder="Search words..." value="${cardFilter}" oninput="BE.teaching.filterCards()" />
        </div>
        <div class="cards-categories">
          <button class="cat-btn ${cardCategory==='all'?'active':''}" onclick="BE.teaching.setCategory('all')">All</button>
          ${CATEGORIES.map(c =>
            `<button class="cat-btn ${cardCategory===c.id?'active':''}" onclick="BE.teaching.setCategory('${c.id}')" style="--cat-color:${c.color}">${c.name}</button>`
          ).join('')}
        </div>
      </div>
      <div id="cards-grid" class="cards-grid"></div>
      <div id="cards-pagination" class="cards-pagination"></div>
    </div>
  `

  BE.teaching.updateCards()
}

function filterCards() {
  cardFilter = document.getElementById('card-search')?.value?.toLowerCase() || ''
  cardPage = 0
  const content = document.getElementById('teaching-content')
  if (content) renderWordCards(content)
}

function setCategory(cat) {
  cardCategory = cat
  cardPage = 0
  const content = document.getElementById('teaching-content')
  if (content) renderWordCards(content)
}

function updateCards() {
  // Get filtered words
  let allWords = []
  for (const cat of CATEGORIES) {
    for (const w of cat.words) {
      if (cardCategory === 'all' || cat.id === cardCategory) {
        allWords.push({ word: w, category: cat })
      }
    }
  }

  if (cardFilter) {
    allWords = allWords.filter(item => item.word.includes(cardFilter))
  }

  // Pagination
  const totalPages = Math.ceil(allWords.length / CARDS_PER_PAGE) || 1
  if (cardPage >= totalPages) cardPage = totalPages - 1
  const start = cardPage * CARDS_PER_PAGE
  const pageWords = allWords.slice(start, start + CARDS_PER_PAGE)

  // Render grid
  const grid = document.getElementById('cards-grid')
  if (!grid) return

  if (pageWords.length === 0) {
    grid.innerHTML = '<div class="empty-state">No words to show.</div>'
    document.getElementById('cards-pagination').innerHTML = ''
    return
  }

  grid.innerHTML = pageWords.map(item => {
    const cat = item.category
    return `<div class="word-card" style="border-color:${cat.color}">
      <div class="word-card-word">${item.word}</div>
      <div class="word-card-cat" style="background:${cat.color}">${cat.name}</div>
    </div>`
  }).join('')

  // Pagination
  const pagEl = document.getElementById('cards-pagination')
  if (totalPages <= 1) {
    pagEl.innerHTML = `<span class="page-info">${allWords.length} words</span>`
  } else {
    pagEl.innerHTML = `
      <button class="btn btn-sm" onclick="BE.teaching.goPage(-1)" ${cardPage<=0?'disabled':''}>◀ Prev</button>
      <span class="page-info">${cardPage+1} / ${totalPages} (${allWords.length} words)</span>
      <button class="btn btn-sm" onclick="BE.teaching.goPage(1)" ${cardPage>=totalPages-1?'disabled':''}>Next ▶</button>
    `
  }
}

function goPage(delta) {
  cardPage += delta
  BE.teaching.updateCards()
}

// ============================================================
// RULE EXERCISES
// ============================================================
const EXERCISES = [
  // Exercise 1: Plural formation
  {
    id: 'plurals',
    title: 'Plural Forms (-s, -es, -ies)',
    desc: 'Make the plural of the given Basic English word.',
    generate: function() {
      const nouns = [...window.BE.WORDS.THINGS_400, ...window.BE.WORDS.THINGS_200]
      // Pick nouns with different endings
      const candidates = nouns.filter(w => {
        const last = w.slice(-1)
        const last2 = w.slice(-2)
        return !['s','x','sh','ch','o','y'].includes(last) && last2 !== 'sh' && last2 !== 'ch' && !w.endsWith('sh') && !w.endsWith('ch')
      })
      const word = candidates[Math.floor(Math.random() * candidates.length)] || 'book'
      const answer = word + 's'
      return { question: `What is the plural of "${word}"?`, answer, word }
    },
    check: function(input, data) {
      return input.trim().toLowerCase() === data.answer
    }
  },
  // Exercise 2: -er derivative
  {
    id: 'der-er',
    title: 'Noun Derivatives (-er)',
    desc: 'Make a word for "a person who does [word]" using -er.',
    generate: function() {
      const nouns = [...window.BE.WORDS.NOUNS_WITH_DERIVATIVES]
      const word = nouns[Math.floor(Math.random() * nouns.length)] || 'design'
      const answer = word + 'er'
      return { question: `What do we call a person who ${word}s? (use "${word}" + -er)`, answer, word }
    },
    check: function(input, data) {
      return input.trim().toLowerCase() === data.answer
    }
  },
  // Exercise 3: -ing derivative
  {
    id: 'der-ing',
    title: 'Noun Derivatives (-ing)',
    desc: 'Make a word for "the act of [word]" using -ing.',
    generate: function() {
      const nouns = [...window.BE.WORDS.NOUNS_WITH_DERIVATIVES]
      const word = nouns[Math.floor(Math.random() * nouns.length)] || 'build'
      const answer = word + 'ing'
      return { question: `What is the word for "the act of ${word}ing"? (use "${word}" + -ing)`, answer, word }
    },
    check: function(input, data) {
      return input.trim().toLowerCase() === data.answer
    }
  },
  // Exercise 4: -ly adverb
  {
    id: 'adv-ly',
    title: 'Adverbs (-ly)',
    desc: 'Make an adverb from this Quality word.',
    generate: function() {
      const adjs = [...window.BE.WORDS.QUALITIES_100].filter(w => !w.endsWith('ing'))
      const word = adjs[Math.floor(Math.random() * adjs.length)] || 'quick'
      // Basic rule: add -ly
      let answer = word + 'ly'
      if (word.endsWith('y') && !['y'].includes(word)) answer = word.slice(0,-1) + 'ily'
      if (word.endsWith('ble')) answer = word.slice(0,-2) + 'ly'
      if (word === 'true') answer = 'truly'
      if (word === 'good') answer = 'well'
      // Skip exceptions
      if (['cut','like','awake','same','short','shut','small','tall'].includes(word)) return this.generate()
      return { question: `What is the adverb form of "${word}"? (use -ly)`, answer, word }
    },
    check: function(input, data) {
      return input.trim().toLowerCase() === data.answer
    }
  },
  // Exercise 5: un- negation
  {
    id: 'un-neg',
    title: 'Negation with un-',
    desc: 'Add "un-" to make the opposite of this word.',
    generate: function() {
      const words = [...window.BE.WORDS.UN_PREFIX_ADJECTIVES]
      const word = words[Math.floor(Math.random() * words.length)] || 'happy'
      const answer = 'un' + word
      return { question: `What is the opposite of "${word}" using "un-"?`, answer, word }
    },
    check: function(input, data) {
      return input.trim().toLowerCase() === data.answer
    }
  },
  // Exercise 6: Operator + Direction
  {
    id: 'op-dir',
    title: 'Operator + Direction',
    desc: 'Make a Basic English phrase from a complex English verb.',
    data: [
      { verb: 'enter', answer: 'go into' },
      { verb: 'exit', answer: 'go out of' },
      { verb: 'insert', answer: 'put in' },
      { verb: 'remove', answer: 'take out' },
      { verb: 'ascend', answer: 'go up' },
      { verb: 'descend', answer: 'go down' },
      { verb: 'continue', answer: 'go on' },
      { verb: 'arrive', answer: 'come in' },
      { verb: 'depart', answer: 'go away' },
      { verb: 'prepare', answer: 'get ready' },
      { verb: 'discover', answer: 'get knowledge of' },
      { verb: 'examine', answer: 'go through' },
      { verb: 'discuss', answer: 'talk about' },
      { verb: 'resemble', answer: 'be like' },
    ],
    generate: function() {
      const item = this.data[Math.floor(Math.random() * this.data.length)]
      return { question: `How do you say "${item.verb}" in Basic English? (use operator + direction)`, answer: item.answer, word: item.verb }
    },
    check: function(input, data) {
      return input.trim().toLowerCase() === data.answer
    }
  },
  // Exercise 7: Word Order
  {
    id: 'word-order',
    title: 'Word Order',
    desc: 'Put the words in the right order: Subject + Time + Operator + Object + Direction.',
    generate: function() {
      const orders = [
        { correct: 'I will put the book on the table.', scrambled: 'book on I the table will put the' },
        { correct: 'He gave the letter to me.', scrambled: 'letter me gave the He to' },
        { correct: 'She is making a cake now.', scrambled: 'cake is a making now She' },
        { correct: 'They went to the store.', scrambled: 'the went store They to' },
        { correct: 'We have a meeting today.', scrambled: 'a have meeting today We' },
      ]
      const item = orders[Math.floor(Math.random() * orders.length)]
      return { question: `Put these in the right order: "${item.scrambled}"`, answer: item.correct, word: item.scrambled }
    },
    check: function(input, data) {
      const clean = s => s.toLowerCase().replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ').trim()
      return clean(input) === clean(data.answer)
    }
  },
  // Exercise 8: Noun-as-verb replacement
  {
    id: 'noun-verb',
    title: 'Using Nouns for Actions',
    desc: 'Change the sentence to use "make/give/have/take + noun" instead of the verb.',
    generate: function() {
      const items = [
        { sentence: 'He attempted to come.', answer: 'He made an attempt to come.' },
        { sentence: 'She answered the letter.', answer: 'She gave an answer to the letter.' },
        { sentence: 'They attacked the town.', answer: 'They made an attack on the town.' },
        { sentence: 'I desire food.', answer: 'I have a desire for food.' },
        { sentence: 'She doubts the story.', answer: 'She has doubt about the story.' },
      ]
      const item = items[Math.floor(Math.random() * items.length)]
      return { question: `Change: "${item.sentence}"`, answer: item.answer, word: item.sentence }
    },
    check: function(input, data) {
      const clean = s => s.toLowerCase().replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ').trim()
      return clean(input) === clean(data.answer)
    }
  }
]

let currentExercise = 0
let exerciseResults = { correct: 0, total: 0 }

function renderExercises(container) {
  container.innerHTML = `
    <div class="exercises-section">
      <div class="exercises-header">
        <h3>Practice Ogden's Grammar Rules</h3>
        <p>Do these exercises to get a better knowledge of Basic English word-building and sentence structure.</p>
        <div class="exercise-progress">${exerciseResults.correct} correct out of ${exerciseResults.total}</div>
      </div>
      <div class="exercise-selector">
        ${EXERCISES.map((ex, i) => `
          <button class="ex-btn ${i===currentExercise?'active':''}" onclick="BE.teaching.selectExercise(${i})">
            ${ex.title}
          </button>
        `).join('')}
      </div>
      <div id="exercise-area" class="exercise-area"></div>
    </div>
  `
  BE.teaching.showExercise(currentExercise)
}

function selectExercise(index) {
  currentExercise = index
  document.querySelectorAll('.ex-btn').forEach((b, i) => b.classList.toggle('active', i === index))
  BE.teaching.showExercise(index)
}

function showExercise(index) {
  const area = document.getElementById('exercise-area')
  if (!area) return

  const ex = EXERCISES[index]
  const data = ex.generate()

  area.innerHTML = `
    <div class="exercise-card">
      <div class="ex-title">${ex.title}</div>
      <div class="ex-desc">${ex.desc}</div>
      <div class="ex-question">${data.question}</div>
      <div class="ex-input-row">
        <input type="text" id="ex-answer" placeholder="Your answer..." />
        <button class="btn btn-primary" onclick="BE.teaching.checkAnswer(${index})">Check</button>
        <button class="btn" onclick="BE.teaching.showExercise(${index})">Skip</button>
      </div>
      <div id="ex-feedback" class="ex-feedback"></div>
    </div>
  `

  document.getElementById('ex-answer').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') BE.teaching.checkAnswer(index)
  })

  // Store data for checking
  area.dataset.exData = JSON.stringify(data)
}

function checkAnswer(index) {
  const input = document.getElementById('ex-answer')
  const feedback = document.getElementById('ex-feedback')
  const area = document.getElementById('exercise-area')
  if (!input || !feedback || !area) return

  const ex = EXERCISES[index]
  const data = JSON.parse(area.dataset.exData)
  const userAnswer = input.value.trim()

  exerciseResults.total++

  if (ex.check(userAnswer, data)) {
    exerciseResults.correct++
    feedback.innerHTML = `<span class="ex-correct">✓ Right! The answer is: ${escapeHtml(data.answer)}</span>`
    // Update progress
    document.querySelector('.exercise-progress').textContent = `${exerciseResults.correct} correct out of ${exerciseResults.total}`
    // Auto-advance after 1.5s
    setTimeout(() => BE.teaching.showExercise(index), 1500)
  } else {
    feedback.innerHTML = `<span class="ex-wrong">✕ Not quite. Try again.\n(Hint: "${escapeHtml(data.answer)}")</span>`
  }
}

// ============================================================
// QUICK REFERENCE
// ============================================================
function renderReference(container) {
  container.innerHTML = `
    <div class="reference-section">
      <h3>Ogden's Basic English Rules — Quick Look-up</h3>

      <div class="ref-category">
        <h4>1. Plurals</h4>
        <p>Add <strong>-s</strong>. But words ending in <strong>y</strong> → <strong>-ies</strong> (fly → flies). Words ending in <strong>s, x, sh, ch, o</strong> → <strong>-es</strong> (box → boxes).</p>
        <p>Irregular: feet, teeth, men, women, knives, leaves, selves, children</p>
      </div>

      <div class="ref-category">
        <h4>2. Noun Derivatives</h4>
        <p>300 nouns can take <strong>-er</strong> (person who does), <strong>-ing</strong> (the act), <strong>-ed</strong> (adjective).</p>
        <p><em>design → designer, designing, designed</em></p>
        <p>⚠ -ed is only an adjective: "the printed book" (NOT "I printed").</p>
      </div>

      <div class="ref-category">
        <h4>3. Adverbs (-ly)</h4>
        <p>Add <strong>-ly</strong> to Qualities (quick → quickly).</p>
        <p>Exceptions: <strong>good</strong> → <strong>well</strong>. No -ly from -ing words or from: cut, like, awake, same, short, shut, small, tall.</p>
      </div>

      <div class="ref-category">
        <h4>4. Comparatives</h4>
        <p>Use <strong>more/most</strong>. Single-syllable words may use <strong>-er/-est</strong>.</p>
        <p>Exceptions: <strong>good→better→best, bad→worse→worst</strong>.</p>
      </div>

      <div class="ref-category">
        <h4>5. Negatives (un-)</h4>
        <p>50 adjectives take <strong>un-</strong> (happy → unhappy). Use <strong>not</strong> for others.</p>
      </div>

      <div class="ref-category">
        <h4>6. No Extra Verbs!</h4>
        <p>Only the <strong>16 operators</strong>: come, get, give, go, keep, let, make, put, seem, take, be, do, have, say, see, send</p>
        <p>Plus auxiliaries: <strong>may, will</strong></p>
        <p>Use <strong>operator + direction + noun</strong> for all other actions.</p>
      </div>

      <div class="ref-category">
        <h4>7. Word Order</h4>
        <p><strong>Subject + Time + Operator + Object + Direction + Modifier</strong></p>
        <p><em>"I will put the record on the machine now."</em></p>
      </div>

      <div class="ref-category">
        <h4>8. Questions</h4>
        <p>Invert: <strong>Is this soft? What is this?</strong></p>
        <p>Use <strong>do/does/did</strong> for simple tenses: <em>Do you like it?</em></p>
      </div>

      <div class="ref-category">
        <h4>9. No "should"/"shall"/"could"</h4>
        <p>Use <strong>"It is right for you to..."</strong> instead of "You should..."</p>
      </div>

      <div class="ref-category">
        <h4>10. Instead of... use...</h4>
        <p><em>enter</em> → <strong>go into</strong> &nbsp;|&nbsp; <em>insert</em> → <strong>put in</strong> &nbsp;|&nbsp; <em>prepare</em> → <strong>get ready</strong> &nbsp;|&nbsp; <em>I can</em> → <strong>I am able</strong> &nbsp;|&nbsp; <em>difficult</em> → <strong>hard</strong> &nbsp;|&nbsp; <em>shape</em> → <strong>form</strong></p>
      </div>

      <div class="ref-category">
        <h4>11. Verb → Noun Pattern</h4>
        <p><em>I attempted to come</em> → <strong>I made an attempt to come</strong></p>
        <p><em>He attacked the town</em> → <strong>He made an attack on the town</strong></p>
      </div>
    </div>
  `
}

// ---- EXPORT ----
window.BE = window.BE || {}
window.BE.teaching = {
  renderTeaching, switchTab,
  renderWordCards, filterCards, setCategory, updateCards, goPage,
  renderExercises, selectExercise, showExercise, checkAnswer,
  renderReference
}
