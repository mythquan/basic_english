// ============================================================
// CONVERSATION MODE — AI Chat
// ============================================================

const SYSTEM_PROMPT = `You are a helpful assistant that ONLY uses Basic English (Ogden's 850 words) with its strict grammatical rules.

VOCABULARY RULES:
- Only use words from the 850 Basic English word list
- Allowed derivations: plural -s/-es/-ies (with irregular: feet, teeth, men, women, knives, leaves, selves, children, sheep, scissors, trousers)
- Noun derivatives: -er (person who does), -ing (the act), -ed (adjective form) for the 300 nouns that take them
- Adjectives: -ly for adverbs (but not from -ing adjectives, or from good/well, cut, like, awake, same, short, shut, small, tall)
- Comparative: more/most; single-syllable words can use -er/-est; exceptions: good/better/best, bad/worse/worst
- Negation: un- for the 50 allowed adjectives, otherwise use "not"
- Operator conjugations are full normal English: come/came/coming, go/went/going, take/took/taking, etc.
- Pronoun forms: I/me/my/mine, he/him/his, she/her/hers, we/us/our/ours, they/them/their/theirs, you/your/yours, it/its, who/whom/whose
- Possessive: 's (the boy's book)
- Contractions: I'll, I'd, don't, doesn't, didn't, won't, can't, isn't, aren't, it's, that's, let's, etc.
- You may use the 50 international words (hotel, radio, telephone, bank, etc.)
- You may use numerals and basic number words
- Names of persons and places are allowed

FORBIDDEN:
- NO words outside the 850 list
- NO should, shall, could
- NO verbs outside the 16 operators (come, get, give, go, keep, let, make, put, seem, take, be, do, have, say, see, send) plus may/will
- Instead of "enter" say "go into"; instead of "insert" say "put in"; instead of "prepare" say "get ready"
- Instead of "I attempted" say "I made an attempt"; instead of "he attacked" say "he made an attack"
- Instead of "I can" say "I am able"
- NO subjunctive mood
- NO literary/fancy words

GRAMMAR:
- Word order: Subject + time word + operator + object + direction + modifier
- Questions: invert auxiliary and subject; use "do" for simple present/past
- Prepositions can go at end of sentence (standard English)
- Use "more" and "most" for most comparatives

Keep responses short, clear, and natural. Be conversational and helpful.`

// ---- PROVIDER PRESETS ----
const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com',
    model: 'gpt-4o-mini'
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat'
  },
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai',
    model: 'llama-3.3-70b-versatile'
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api',
    model: 'openai/gpt-4o-mini'
  }
}

// ---- CHAT STATE ----
let chatMessages = []
let apiKey = localStorage.getItem('be_api_key') || ''
let apiBaseUrl = localStorage.getItem('be_api_base_url') || 'https://api.deepseek.com'
let apiModel = localStorage.getItem('be_api_model') || 'deepseek-chat'

function buildEndpoint(baseUrl) {
  let url = baseUrl.replace(/\/+$/, '')
  // If it already ends with /chat/completions or /v1/chat/completions, use as-is
  if (url.endsWith('/chat/completions')) return url
  // If it ends with a base domain (no path), try the OpenAI-compatible path
  // Try /v1/chat/completions first (OpenAI style), fall back to /chat/completions
  if (!url.includes('/v1')) url += '/v1'
  if (!url.endsWith('/chat/completions')) url += '/chat/completions'
  return url
}

// ---- RENDER CHAT UI ----
function renderChat(container) {
  container.innerHTML = `
    <div class="chat-layout">
      <div class="chat-settings-bar">
        <button class="btn btn-sm" onclick="BE.chat.toggleSettings()">⚙ Settings</button>
        <button class="btn btn-sm" onclick="BE.chat.clearChat()">✕ Clear</button>
      </div>
      <div id="chat-settings-panel" class="chat-settings" style="display:none">
        <div class="form-group">
          <label>API Base URL</label>
          <input type="text" id="api-base-url-input" value="${apiBaseUrl}" placeholder="https://api.deepseek.com" />
        </div>
        <div class="form-group">
          <label>API Key</label>
          <input type="password" id="api-key-input" value="${apiKey}" placeholder="sk-..." />
        </div>
        <div class="form-group">
          <label>Model</label>
          <input type="text" id="api-model-input" value="${apiModel}" placeholder="deepseek-chat" />
        </div>
        <div class="form-group">
          <label>Quick Select</label>
          <div class="provider-presets">
            ${Object.entries(PROVIDERS).map(([key, p]) =>
              `<button class="btn btn-sm" onclick="BE.chat.selectProvider('${key}')">${p.name}</button>`
            ).join('')}
          </div>
        </div>
        <button class="btn" onclick="BE.chat.saveSettings()">Save Settings</button>
      </div>
      <div id="chat-messages" class="chat-messages">
        <div class="chat-welcome">
          <p>Say something to start a talk. The AI will only use Basic English words.</p>
          <p class="hint">Example: "What is Basic English?" or "Give me some information about the weather."</p>
        </div>
      </div>
      <div class="chat-input-area">
        <div class="chat-validation" id="chat-validation"></div>
        <div class="chat-input-row">
          <textarea id="chat-input" rows="2" placeholder="Say something in Basic English..."></textarea>
          <button id="chat-send-btn" class="btn btn-primary" onclick="BE.chat.sendMessage()">Send</button>
        </div>
      </div>
    </div>
  `

  const msgsEl = document.getElementById('chat-messages')
  chatMessages.forEach(msg => appendMessageDOM(msgsEl, msg))

  document.getElementById('chat-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); BE.chat.sendMessage() }
  })
  document.getElementById('chat-input').addEventListener('input', function() {
    BE.chat.validateInput(this.value)
  })
}

function appendMessageDOM(container, msg) {
  const div = document.createElement('div')
  div.className = `chat-message ${msg.role}`
  div.dataset.msgId = msg.id
  const content = document.createElement('div')
  content.className = 'msg-content'
  content.innerHTML = msg.html || escapeHtml(msg.content)
  div.appendChild(content)
  if (msg.violations && msg.violations.length > 0) {
    const warn = document.createElement('div')
    warn.className = 'msg-violations'
    warn.textContent = '⚠ Words not in Basic: ' + msg.violations.join(', ')
    div.appendChild(warn)
  }
  const sound = document.createElement('span')
  sound.className = 'msg-sound'
  sound.textContent = '▶'
  sound.title = 'Listen'
  sound.onclick = function() { playSentence(msg.content) }
  div.appendChild(sound)
  container.appendChild(div)
  container.scrollTop = container.scrollHeight
}

function playSentence(text) {
  if (!window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel()
    var u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.85
    window.speechSynthesis.speak(u)
  } catch (e) {}
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// ---- VALIDATE USER INPUT ----
function validateInput(text) {
  const el = document.getElementById('chat-validation')
  if (!el) return
  if (!text || text.trim().length === 0) { el.innerHTML = ''; return }
  const result = window.BE.validate(text)
  if (!result.valid) {
    const words = result.errors.map(e => `<span class="bad-word">${escapeHtml(e.word)}</span>`).join(', ')
    el.innerHTML = `⚠ Words not in Basic English: ${words}`
    el.className = 'chat-validation warning'
  } else {
    el.innerHTML = '✓ All words are in Basic English'
    el.className = 'chat-validation ok'
  }
}

// ---- SEND MESSAGE ----
async function sendMessage() {
  const input = document.getElementById('chat-input')
  const text = input.value.trim()
  if (!text) return
  if (!apiKey) { alert('Please put your API key in Settings first.'); return }

  const userMsg = { id: 'u' + Date.now(), role: 'user', content: text, html: escapeHtml(text), violations: [] }
  chatMessages.push(userMsg)
  const msgsEl = document.getElementById('chat-messages')
  appendMessageDOM(msgsEl, userMsg)
  input.value = ''
  document.getElementById('chat-validation').innerHTML = ''

  const loadingId = 'l' + Date.now()
  const loadingDiv = document.createElement('div')
  loadingDiv.className = 'chat-message assistant loading-msg'
  loadingDiv.id = loadingId
  loadingDiv.innerHTML = '<div class="msg-content"><span class="loading-dots">Thinking</span></div>'
  msgsEl.appendChild(loadingDiv)
  msgsEl.scrollTop = msgsEl.scrollHeight
  document.getElementById('chat-send-btn').disabled = true

  try {
    const response = await callLLM(text)
    document.getElementById(loadingId)?.remove()
    if (response.error) {
      chatMessages.push({ id: 'e' + Date.now(), role: 'assistant', content: 'Error: ' + response.error, html: '⚠ Error: ' + escapeHtml(response.error) })
      appendMessageDOM(msgsEl, chatMessages[chatMessages.length - 1])
    } else {
      const reply = response.text
      const validation = window.BE.validate(reply)
      const aiMsg = { id: 'a' + Date.now(), role: 'assistant', content: reply, html: escapeHtml(reply), violations: validation.errors.map(e => e.word) }
      chatMessages.push(aiMsg)
      appendMessageDOM(msgsEl, aiMsg)
    }
  } catch (err) {
    document.getElementById(loadingId)?.remove()
    chatMessages.push({ id: 'e' + Date.now(), role: 'assistant', content: 'Error: ' + err.message, html: '⚠ Error: ' + escapeHtml(err.message) })
    appendMessageDOM(msgsEl, chatMessages[chatMessages.length - 1])
  }
  document.getElementById('chat-send-btn').disabled = false
}

// ---- CALL LLM API ----
async function callLLM(userText) {
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }]
  const recentChat = chatMessages.slice(-10)
  for (const msg of recentChat) messages.push({ role: msg.role, content: msg.content })
  messages.push({ role: 'user', content: userText })

  const endpoint = buildEndpoint(apiBaseUrl)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({ model: apiModel, messages: messages, max_tokens: 500, temperature: 0.7 })
    })

    if (!response.ok) {
      const errData = await response.text()
      let errMsg = `HTTP ${response.status}`
      try { const json = JSON.parse(errData); errMsg = json.error?.message || errMsg } catch(e) {}
      // Show full response for debugging
      return { error: `${errMsg}\n\nFull response:\n${errData.slice(0, 500)}` }
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''
    return { text }
  } catch (err) {
    // Network error — likely CORS or connectivity
    let hint = ''
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      hint = '\n\nThis is most likely a CORS error. The browser blocks API calls from "file://" URLs.\n\nSolution: Use the local server script "start-server.ps1" to serve the site over HTTP.\nOpen PowerShell in the "site" folder and run: .\\start-server.ps1\nThen go to http://localhost:8080 in your browser.'
    }
    return { error: err.message + hint }
  }
}

// ---- SETTINGS ----
function toggleSettings() {
  const panel = document.getElementById('chat-settings-panel')
  if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none'
}

function selectProvider(key) {
  const p = PROVIDERS[key]
  if (!p) return
  document.getElementById('api-base-url-input').value = p.baseUrl
  document.getElementById('api-model-input').value = p.model
}

function saveSettings() {
  apiBaseUrl = document.getElementById('api-base-url-input').value.trim()
  apiKey = document.getElementById('api-key-input').value.trim()
  apiModel = document.getElementById('api-model-input').value.trim()
  localStorage.setItem('be_api_base_url', apiBaseUrl)
  localStorage.setItem('be_api_key', apiKey)
  localStorage.setItem('be_api_model', apiModel)
  document.getElementById('chat-settings-panel').style.display = 'none'
  alert('Settings saved.')
}

function clearChat() {
  chatMessages = []
  const msgsEl = document.getElementById('chat-messages')
  if (msgsEl) {
    msgsEl.innerHTML = `<div class="chat-welcome"><p>Say something to start a talk. The AI will only use Basic English words.</p><p class="hint">Example: "What is Basic English?" or "Give me some information about the weather."</p></div>`
  }
}

// ---- EXPORT ----
window.BE = window.BE || {}
window.BE.chat = { renderChat, sendMessage, toggleSettings, saveSettings, clearChat, validateInput, selectProvider }
