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

// ---- SCENARIO DATA ----
const SCENARIOS = [
  {
    category: 'Daily Life',
    categoryZh: '日常生活',
    scenes: [
      { id: 'greeting', name: 'Greeting', nameZh: '问候寒暄',
        opener: "Good morning! How are you today? It is a beautiful day, is it not?" },
      { id: 'weather', name: 'Weather Talk', nameZh: '天气闲聊',
        opener: "The weather today is quite interesting. Do you have any thoughts about it? Is it cold or warm where you are?" },
      { id: 'introduce', name: 'Self Introduction', nameZh: '自我介绍',
        opener: "Hello! I don't think we have met before. My name is Alex. What is your name? Where are you from?" },
      { id: 'phone', name: 'Phone Call', nameZh: '打电话',
        opener: "Hello, this is the front office. How may I give you help today? Who do you have a desire to talk to?" },
      { id: 'appointment', name: 'Making Appointment', nameZh: '约时间',
        opener: "I would like to make an appointment with you. What day and time would be good for you? Are you free tomorrow?" }
    ]
  },
  {
    category: 'Shopping',
    categoryZh: '购物消费',
    scenes: [
      { id: 'grocery', name: 'Grocery Store', nameZh: '超市购物',
        opener: "Welcome to our store! Are you looking for something special today? The fruits and vegetables are very fresh." },
      { id: 'clothing', name: 'Clothing Store', nameZh: '服装店',
        opener: "Good day! May I give you some help? We have new coats and dresses that came in this week." },
      { id: 'return', name: 'Return & Exchange', nameZh: '退换货',
        opener: "Hello, I see you have something to return. Do you have the receipt with you? What seems to be the trouble with it?" },
      { id: 'online-shopping', name: 'Online Shopping', nameZh: '在线购物',
        opener: "I see you have a question about your order. Do you have the order number? I am able to give you help with the transport." }
    ]
  },
  {
    category: 'Food & Dining',
    categoryZh: '餐饮',
    scenes: [
      { id: 'restaurant', name: 'Restaurant', nameZh: '餐厅点餐',
        opener: "Welcome to our restaurant! Here is the list of food we have. Would you like something to drink first?" },
      { id: 'cafe', name: 'Coffee Shop', nameZh: '咖啡店',
        opener: "Hello! What would you like today? We have very good coffee and tea. Would you like it hot or cold?" },
      { id: 'fastfood', name: 'Fast Food', nameZh: '快餐店',
        opener: "Welcome! May I take your order? Would you like to have your food here or take it away?" },
      { id: 'delivery', name: 'Food Delivery', nameZh: '订外卖',
        opener: "Hello, this is Quick Food. I am able to take your order now. What would you like to have sent to your house?" },
      { id: 'allergy', name: 'Food Allergy', nameZh: '食物过敏',
        opener: "Before you order, do you have any special food needs? Some of our food has nuts and milk in it." }
    ]
  },
  {
    category: 'Transportation',
    categoryZh: '交通出行',
    scenes: [
      { id: 'directions', name: 'Asking Directions', nameZh: '问路',
        opener: "Hello! You seem to be looking for something. Are you in need of directions? Where would you like to go?" },
      { id: 'public-transit', name: 'Public Transit', nameZh: '公共交通',
        opener: "This is the station. Do you need help with the trains? Where are you going today?" },
      { id: 'taxi', name: 'Taxi / Ride Share', nameZh: '打车',
        opener: "Hello! I am your driver. Where would you like to go? Do you have the street name?" },
      { id: 'car-rental', name: 'Car Rental', nameZh: '租车',
        opener: "Welcome to our car business! Would you like to get a car for how long? We have small and big cars." },
      { id: 'gas-station', name: 'Gas Station', nameZh: '加油站',
        opener: "Hello! How much gas would you like? Would you like me to make the windows clean too?" },
      { id: 'airport', name: 'Airport', nameZh: '机场',
        opener: "Welcome to the airport. May I see your ticket and passport? Are you going to put any bags on the plane?" }
    ]
  },
  {
    category: 'Accommodation',
    categoryZh: '住宿',
    scenes: [
      { id: 'hotel', name: 'Hotel Check-in', nameZh: '酒店入住',
        opener: "Welcome to our hotel! Do you have a room kept for you? May I have your name please?" },
      { id: 'apartment', name: 'Apartment Viewing', nameZh: '租房看房',
        opener: "Hello! You are here to see the room, yes? Let me take you in. The rent is 1500 a month." },
      { id: 'repair', name: 'Maintenance Request', nameZh: '报修',
        opener: "Hello, building office here. What seems to be the trouble? Is it the water, heat, or something other?" },
      { id: 'neighbor', name: 'Neighbor Chat', nameZh: '邻里交流',
        opener: "Hello! I am your neighbor from the room next to yours. I came to say hello. How do you like it here so far?" }
    ]
  },
  {
    category: 'Health & Medical',
    categoryZh: '医疗健康',
    scenes: [
      { id: 'book-doctor', name: 'Book Appointment', nameZh: '预约看病',
        opener: "Hello, this is Dr. Smith's office. Would you like to make a time to see the doctor? What seems to be the trouble?" },
      { id: 'see-doctor', name: 'Doctor Visit', nameZh: '看医生',
        opener: "Hello, I am Dr. Smith. Please come in and take a seat. Now, what seems to be giving you trouble today?" },
      { id: 'pharmacy', name: 'Pharmacy', nameZh: '药房买药',
        opener: "Welcome to the chemist's. Do you have a paper from the doctor, or are you looking for common medical things?" },
      { id: 'emergency', name: 'Emergency', nameZh: '急诊',
        opener: "This is the hospital. What is the emergency? Please keep quiet and give me your name and where you are." },
      { id: 'dentist', name: 'Dentist / Eye Doctor', nameZh: '牙科/眼科',
        opener: "Hello, I am the tooth doctor. Please open your mouth. When did you last come to see a tooth doctor?" }
    ]
  },
  {
    category: 'Banking & Finance',
    categoryZh: '银行财务',
    scenes: [
      { id: 'open-account', name: 'Open Account', nameZh: '银行开户',
        opener: "Welcome to the bank! Would you like to open a new account? I will need to see some papers that say who you are." },
      { id: 'atm', name: 'ATM / Transfer', nameZh: '存取款/转账',
        opener: "Hello, may I give you help with the money machine? Would you like to put money in or take money out?" },
      { id: 'exchange', name: 'Currency Exchange', nameZh: '兑换货币',
        opener: "Welcome! What money would you like to exchange today? The rate for dollars is quite good right now." },
      { id: 'credit-card', name: 'Credit Card Issue', nameZh: '信用卡问题',
        opener: "Hello, this is the card company. How may I give you help? Is there a question about your account?" }
    ]
  },
  {
    category: 'Work & Career',
    categoryZh: '工作职场',
    scenes: [
      { id: 'interview', name: 'Job Interview', nameZh: '求职面试',
        opener: "Hello, please come in and take a seat. Thank you for coming today. Now, please give me some words about yourself." },
      { id: 'office', name: 'Office Daily', nameZh: '办公室日常',
        opener: "Good morning! Did you have a good night? Before we go into the meeting, do you have a minute to talk about the work?" },
      { id: 'leave', name: 'Request Leave', nameZh: '请假',
        opener: "Hello, I see you sent a letter about taking a day off. Is everything all right? When do you need to be away?" },
      { id: 'report', name: 'Work Report', nameZh: '汇报工作',
        opener: "Let's go over this week's work. What have you done? Are there any troubles I am able to help with?" }
    ]
  },
  {
    category: 'Education',
    categoryZh: '学校教育',
    scenes: [
      { id: 'enroll', name: 'School Enrollment', nameZh: '入学注册',
        opener: "Welcome to the school! Are you here to put your name down for classes? Let me give you the papers." },
      { id: 'classroom', name: 'Classroom', nameZh: '课堂交流',
        opener: "Good morning, everyone. Today we will go over a new part. Does anyone have questions about last time's work?" },
      { id: 'library', name: 'Library', nameZh: '图书馆',
        opener: "Welcome to the library. Are you looking for a book? I am able to help you have a look through our system." },
      { id: 'teacher', name: 'Talk to Teacher', nameZh: '与老师沟通',
        opener: "Hello! Please come in. You said you had some questions about the teaching? How may I give you help?" }
    ]
  },
  {
    category: 'Social & Entertainment',
    categoryZh: '社交娱乐',
    scenes: [
      { id: 'invite', name: 'Invite Friend', nameZh: '邀请朋友',
        opener: "Hello! I was having the thought of going out this week. Would you like to come with me? We may have a good time." },
      { id: 'party', name: 'Party', nameZh: '派对聚会',
        opener: "Welcome to my house! I am so happy you came. Please come in! Would you like something to drink?" },
      { id: 'cinema', name: 'Cinema', nameZh: '电影院',
        opener: "Welcome! What picture would you like to see today? We have some new ones. Would you like seats in front or back?" },
      { id: 'gym', name: 'Gym', nameZh: '健身房',
        opener: "Welcome to the sport place! Is this your first time here? Would you like me to take you round and see the machines?" },
      { id: 'sightseeing', name: 'Sightseeing', nameZh: '旅游观光',
        opener: "Welcome to the old building! I will be your guide today. This place was made two hundred years back. Any questions?" }
    ]
  },
  {
    category: 'Emergency & Help',
    categoryZh: '紧急求助',
    scenes: [
      { id: 'police', name: 'Call Police', nameZh: '报警',
        opener: "This is the police. What is your emergency? Please keep quiet and give me your name and where you are now." },
      { id: 'lost-item', name: 'Lost Item', nameZh: '物品丢失',
        opener: "Hello, this is the lost things office. What did you have taken from you? When and where did you see it last?" },
      { id: 'lost-way', name: 'Lost Way', nameZh: '迷路',
        opener: "Hello! You seem to be in need of help. Are you not able to see where you are? Where were you going?" },
      { id: 'help-translate', name: 'Language Help', nameZh: '语言求助',
        opener: "Hello! Do you need help with the language? I am able to give you some help. What is it you are attempting to say?" }
    ]
  },
  {
    category: 'Government & Services',
    categoryZh: '公共服务',
    scenes: [
      { id: 'post', name: 'Post Office', nameZh: '邮局',
        opener: "Welcome to the post office! Would you like to send a letter or a box? Where is it going to?" },
      { id: 'visa', name: 'Visa / Immigration', nameZh: '签证移民',
        opener: "Hello, please take a seat. You are here about your papers to be in this country, yes? Let me see your forms." },
      { id: 'driving', name: 'Driver\'s License', nameZh: '驾照',
        opener: "Welcome to the driving office. Are you here to get a new driving paper or to make yours new again?" },
      { id: 'community', name: 'Community Service', nameZh: '社区事务',
        opener: "Hello! This is the community office. How may I give you help today? Are you here for town news or to put in a form?" }
    ]
  }
]

let currentScenario = null
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
  // Build scenario sidebar HTML
  let scenarioHtml = '<div class="scenario-sidebar" id="scenario-sidebar">'
  scenarioHtml += '<div class="scenario-header"><span>Scenarios</span><button class="scenario-close" onclick="BE.chat.toggleScenarios()">×</button></div>'
  scenarioHtml += '<div class="scenario-list">'
  for (const cat of SCENARIOS) {
    scenarioHtml += `<div class="scenario-category">${cat.categoryZh} ${cat.category}</div>`
    for (const scene of cat.scenes) {
      scenarioHtml += `<div class="scenario-item" data-id="${scene.id}" onclick="BE.chat.selectScenario('${scene.id}')">${scene.nameZh}<span class="scenario-item-en">${scene.name}</span></div>`
    }
  }
  scenarioHtml += '</div></div>'

  container.innerHTML = `
    <div class="chat-layout">
      <div class="chat-main">
        <div class="chat-settings-bar">
          <button class="btn btn-sm" onclick="BE.chat.toggleSettings()">⚙ Settings</button>
          <button class="btn btn-sm" onclick="BE.chat.clearChat()">✕ Clear</button>
          <button class="btn btn-sm btn-scenario" onclick="BE.chat.toggleScenarios()">📋 Scenarios</button>
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
            <p class="hint">Or pick a <strong>Scenario</strong> on the right to start a practice talk.</p>
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
      ${scenarioHtml}
    </div>
  `

  const msgsEl = document.getElementById('chat-messages')
  chatMessages.forEach(msg => {
    if (msg.type === 'divider') {
      appendDividerDOM(msgsEl, msg)
    } else {
      appendMessageDOM(msgsEl, msg)
    }
  })

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
  if (window.speechSynthesis) {
    var sound = document.createElement('span')
    sound.className = 'msg-sound'
    sound.textContent = '▶'
    sound.title = 'Read this out loud'
    sound.onclick = function() { BE.chat.playSentence(msg.content) }
    div.appendChild(sound)
  }
  container.appendChild(div)
  container.scrollTop = container.scrollHeight
}

function playSentence(text) {
  window.BE.speak(text, 0.85)
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
  // Filter out dividers - only include actual chat messages with role
  const recentChat = chatMessages.filter(m => m.role).slice(-10)
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
  currentScenario = null
  isGeneratingOpener = false
  const msgsEl = document.getElementById('chat-messages')
  if (msgsEl) {
    msgsEl.innerHTML = `<div class="chat-welcome"><p>Say something to start a talk. The AI will only use Basic English words.</p><p class="hint">Or pick a <strong>Scenario</strong> on the right to start a practice talk.</p></div>`
  }
  // Re-enable inputs in case they were disabled
  const sendBtn = document.getElementById('chat-send-btn')
  const inputEl = document.getElementById('chat-input')
  if (sendBtn) sendBtn.disabled = false
  if (inputEl) inputEl.disabled = false
}

// ---- SCENARIO FUNCTIONS ----
function toggleScenarios() {
  const sidebar = document.getElementById('scenario-sidebar')
  if (sidebar) {
    sidebar.classList.toggle('open')
  }
}

function findScenarioById(id) {
  for (const cat of SCENARIOS) {
    for (const scene of cat.scenes) {
      if (scene.id === id) return { category: cat, scene: scene }
    }
  }
  return null
}

function appendDividerDOM(container, dividerData) {
  const div = document.createElement('div')
  div.className = 'chat-divider'
  div.innerHTML = `<span class="divider-line"></span><span class="divider-text">${escapeHtml(dividerData.text)}</span><span class="divider-line"></span>`
  container.appendChild(div)
  container.scrollTop = container.scrollHeight
}

let isGeneratingOpener = false

async function selectScenario(sceneId) {
  // Prevent rapid clicks while generating
  if (isGeneratingOpener) return

  const found = findScenarioById(sceneId)
  if (!found) return

  const { category, scene } = found
  currentScenario = scene

  const msgsEl = document.getElementById('chat-messages')
  if (!msgsEl) return

  // Remove welcome message if it exists
  const welcome = msgsEl.querySelector('.chat-welcome')
  if (welcome) welcome.remove()

  // Add divider
  const dividerData = {
    type: 'divider',
    text: `${scene.nameZh} — ${scene.name}`
  }
  chatMessages.push(dividerData)
  appendDividerDOM(msgsEl, dividerData)

  // Close sidebar on mobile
  const sidebar = document.getElementById('scenario-sidebar')
  if (sidebar && window.innerWidth < 900) {
    sidebar.classList.remove('open')
  }

  // If no API key, use the preset opener
  if (!apiKey) {
    addOpenerMessage(msgsEl, scene.opener)
    return
  }

  // Disable input while generating
  isGeneratingOpener = true
  const sendBtn = document.getElementById('chat-send-btn')
  const inputEl = document.getElementById('chat-input')
  if (sendBtn) sendBtn.disabled = true
  if (inputEl) inputEl.disabled = true

  // Show loading
  const loadingId = 'l' + Date.now()
  const loadingDiv = document.createElement('div')
  loadingDiv.className = 'chat-message assistant loading-msg'
  loadingDiv.id = loadingId
  loadingDiv.innerHTML = '<div class="msg-content"><span class="loading-dots">Thinking</span></div>'
  msgsEl.appendChild(loadingDiv)
  msgsEl.scrollTop = msgsEl.scrollHeight

  // Generate opener via API
  try {
    const openerText = await generateScenarioOpener(scene, category)
    document.getElementById(loadingId)?.remove()
    addOpenerMessage(msgsEl, openerText)
  } catch (err) {
    // Fallback to preset opener on error
    document.getElementById(loadingId)?.remove()
    addOpenerMessage(msgsEl, scene.opener)
  } finally {
    // Re-enable input
    isGeneratingOpener = false
    if (sendBtn) sendBtn.disabled = false
    if (inputEl) inputEl.disabled = false
  }
}

function addOpenerMessage(container, text) {
  const aiMsg = {
    id: 'a' + Date.now(),
    role: 'assistant',
    content: text,
    html: escapeHtml(text),
    violations: []
  }
  chatMessages.push(aiMsg)
  appendMessageDOM(container, aiMsg)
}

async function generateScenarioOpener(scene, category) {
  const prompt = `You are starting a practice conversation for the scenario: "${scene.name}" (${scene.nameZh}).
Category: ${category.category} (${category.categoryZh}).

Generate a natural, friendly opening line as if you are the service person, shopkeeper, doctor, or other role in this scenario. Start the conversation - greet the user and begin the interaction naturally.

Remember: Use ONLY Basic English (Ogden's 850 words). Be varied and natural - don't always start the same way. Keep it 1-3 sentences.`

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt }
  ]

  const endpoint = buildEndpoint(apiBaseUrl)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: JSON.stringify({ model: apiModel, messages: messages, max_tokens: 150, temperature: 0.9 })
  })

  if (!response.ok) {
    throw new Error('API error')
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || scene.opener
  return text.trim()
}

// ---- EXPORT ----
window.BE = window.BE || {}
window.BE.chat = { renderChat, sendMessage, toggleSettings, saveSettings, clearChat, validateInput, selectProvider, playSentence, toggleScenarios, selectScenario }
