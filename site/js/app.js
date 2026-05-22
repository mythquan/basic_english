// ============================================================
// MAIN APP — Router & State
// ============================================================

function navigateTo(page) {
  // Set hash (will trigger hashchange)
  const hash = page === 'home' ? '' : page
  if (location.hash.slice(1) !== hash) {
    location.hash = hash
  } else {
    renderPage(page)
  }
}

function renderPage(page) {
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page)
  })

  const main = document.getElementById('main-content')
  if (!main) return

  if (page === 'home') renderHome(main)
  else if (page === 'conversation') window.BE.chat.renderChat(main)
  else if (page === 'teaching') window.BE.teaching.renderTeaching(main)
}

function renderHome(container) {
  const WORDS = window.BE.WORDS

  container.innerHTML = `
    <div class="home-layout">
      <div class="home-hero">
        <h1>Basic English</h1>
        <p class="home-subtitle">C. K. Ogden's 850-word International Language</p>
        <p class="home-desc">
          Basic English is a system of 850 English words with simple rules.
          It does the work of 20,000 words in normal English.
          Every word and rule here comes from Ogden's system.
        </p>
      </div>
      <div class="home-cards">
        <div class="home-card" onclick="navigateTo('conversation')">
          <div class="home-card-icon">💬</div>
          <h2>Conversation</h2>
          <p>Talk with an AI that uses only Basic English. Your own words are checked against the 850-word list.</p>
          <span class="home-card-link">Start Talking →</span>
        </div>
        <div class="home-card" onclick="navigateTo('teaching')">
          <div class="home-card-icon">📖</div>
          <h2>Teaching</h2>
          <p>Learn the 850 words by category. Practice Ogden's grammar rules with interactive exercises.</p>
          <span class="home-card-link">Start Learning →</span>
        </div>
      </div>
      <div class="home-stats">
        <div class="stat">
          <span class="stat-num">${[...WORDS.ALL_850].length}</span>
          <span class="stat-label">Words</span>
        </div>
        <div class="stat">
          <span class="stat-num">${WORDS.NOUNS_WITH_DERIVATIVES.size}</span>
          <span class="stat-label">Derivable Nouns</span>
        </div>
        <div class="stat">
          <span class="stat-num">${WORDS.UN_PREFIX_ADJECTIVES.size}</span>
          <span class="stat-label">un- Adjectives</span>
        </div>
        <div class="stat">
          <span class="stat-num">${WORDS.INTERNATIONAL_WORDS.size}</span>
          <span class="stat-label">International Words</span>
        </div>
      </div>
    </div>
  `
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', function() {
  window.addEventListener('hashchange', function() {
    const page = location.hash.slice(1) || 'home'
    renderPage(page)
  })
  const initialPage = location.hash.slice(1) || 'home'
  renderPage(initialPage)
})
