// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
html.setAttribute('data-theme', localStorage.getItem('theme') || 'light');
themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.borderBottomColor = window.scrollY > 20 ? 'rgba(0,0,0,0.18)' : '';
});

// ===== MOBILE MENU =====
const burgerBtn  = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
burgerBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => mobileMenu.classList.remove('open')));

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll('.section, .project-card, .skill-group, .timeline-item, .stat-card, .highlight-card');
revealEls.forEach(el => el.classList.add('reveal'));
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), 60); revealObs.unobserve(e.target); } });
}, { threshold: 0.08 });
revealEls.forEach(el => revealObs.observe(el));

// ===== STAGGERED CARDS =====
['.projects-grid .project-card', '.skills-grid .skill-group', '.stat-row .stat-card'].forEach(sel => {
  const cards = document.querySelectorAll(sel);
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.parentElement.querySelectorAll(sel.split(' ').pop()).forEach((s, i) => {
          setTimeout(() => s.classList.add('visible'), i * 80);
          obs.unobserve(s);
        });
      }
    });
  }, { threshold: 0.1 });
  if (cards.length) obs.observe(cards[0]);
});

// ===== PROJECT CARD GLOW ON CLICK =====
function handleCardClick(card, projectKey) {
  // Remove glow from all others
  document.querySelectorAll('.project-card').forEach(c => c !== card && c.classList.remove('glow-active'));
  card.classList.add('glow-active');
  // Auto-remove after animation completes
  clearTimeout(card._glowTimer);
  card._glowTimer = setTimeout(() => card.classList.remove('glow-active'), 900);
}

// ===== CONTACT FORM — sends real emails via Resend =====
// Uses your own Vercel serverless function (api/contact.js), which calls
// Resend's email API. See api/contact.js for the 2-minute setup.
const CONTACT_ENDPOINT = '/api/contact';

const form       = document.getElementById('contactForm');
const submitBtn  = document.getElementById('submitBtn');
const formSuccess= document.getElementById('formSuccess');
const formError  = document.getElementById('formError');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const [fname, lname, email, subject, msg] = ['fname','lname','email','subject','msg'].map(id => document.getElementById(id).value.trim());
  if ([fname, lname, email, subject, msg].some(v => !v)) { shakeForm(); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const el = document.getElementById('email');
    el.style.borderColor = '#D85A30';
    setTimeout(() => el.style.borderColor = '', 2000);
    return;
  }

  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;
  if (formError) formError.style.display = 'none';

  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fname, lname, email, subject, msg })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed');

    form.reset();
    submitBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Message sent!`;
    formSuccess.style.display = 'block';
    setTimeout(() => {
      submitBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send message`;
      submitBtn.disabled = false;
      formSuccess.style.display = 'none';
    }, 5000);

  } catch (err) {
    console.error('Form send error:', err.message);
    submitBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send message`;
    submitBtn.disabled = false;
    if (formError) {
      formError.style.display = 'block';
      setTimeout(() => formError.style.display = 'none', 6000);
    } else {
      alert("Something went wrong sending the message. Please email adocjoan123@gmail.com directly.");
    }
  }
});

function shakeForm() {
  form.style.animation = 'shake 0.4s ease';
  setTimeout(() => form.style.animation = '', 400);
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' }); }
  });
});

// ===== ACTIVE NAV =====
const navLinks = document.querySelectorAll('.nav-links a');
new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.getAttribute('id');
      navLinks.forEach(l => { l.style.color = ''; if (l.getAttribute('href') === `#${id}`) l.style.color = 'var(--color-text)'; });
    }
  });
}, { threshold: 0.4 }).observe || document.querySelectorAll('section[id], .hero[id]').forEach(s => {});

// Re-observe sections for active nav
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.getAttribute('id');
      navLinks.forEach(l => { l.style.color = ''; if (l.getAttribute('href') === `#${id}`) l.style.color = 'var(--color-text)'; });
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('section[id], .hero[id]').forEach(s => sectionObs.observe(s));

// ===== SHAKE KEYFRAME =====
const styleEl = document.createElement('style');
styleEl.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`;
document.head.appendChild(styleEl);

// ========================
// VIDEO DEMO MODAL
// ========================
const PROJECT_DATA = {
  healthbot:  { title:'HealthBot AI',                stack:['LangChain','LangGraph','FAISS','ChromaDB','Streamlit'], videoSrc:null, youtubeSrc:null, github:'https://github.com/Adoc410' },
  studycoach: { title:'AI Study Coach Agent',        stack:['LangGraph','Next.js 14','GPT-4o','Zod'],               videoSrc:null, youtubeSrc:null, github:'https://github.com/Adoc410' },
  interview:  { title:'AI Interview Prep Master',    stack:['Streamlit','OpenAI','Anthropic','Gemini'],              videoSrc:null, youtubeSrc:null, github:'https://github.com/Adoc410' },
  agri:       { title:'Agricultural Disease Asst.',  stack:['React','FastAPI','AI Vision','Python'],                 videoSrc:null, youtubeSrc:null, github:'https://github.com/Adoc410' },
  report:     { title:'AI Report Generator',         stack:['Python','OpenAI','smtplib','pytest'],                   videoSrc:null, youtubeSrc:null, github:'https://github.com/Adoc410' },
  chess:      { title:'Chess Capture Checker',       stack:['Python','pytest','CLI','PEP 8'],                        videoSrc:null, youtubeSrc:null, github:'https://github.com/Adoc410' }
};

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function openVideoModal(projectKey) {
  const d = PROJECT_DATA[projectKey]; if (!d) return;
  document.getElementById('videoModalTitle').textContent = d.title;
  document.getElementById('videoModalStack').innerHTML = d.stack.map(s => `<span class="pill pill-gray">${escapeHtml(s)}</span>`).join('');
  document.querySelector('.video-gh-link').href = d.github;
  const body = document.getElementById('videoPlaceholder');
  if (d.youtubeSrc) {
    body.innerHTML = `<iframe width="100%" height="340" src="${d.youtubeSrc}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius:8px;"></iframe>`;
  } else if (d.videoSrc) {
    body.innerHTML = `<video controls width="100%" style="border-radius:8px;max-height:340px;"><source src="${d.videoSrc}" type="video/mp4"></video>`;
  } else {
    body.innerHTML = `
      <div class="video-play-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
      <div class="video-placeholder-text">Demo coming soon</div>
      <div class="video-placeholder-sub">Set <code style="font-size:11px;background:var(--color-border);padding:2px 6px;border-radius:4px;">videoSrc</code> or <code style="font-size:11px;background:var(--color-border);padding:2px 6px;border-radius:4px;">youtubeSrc</code> in script.js PROJECT_DATA</div>`;
  }
  document.getElementById('videoModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeVideoModal(event, force) {
  if (force || (event && event.target === document.getElementById('videoModal'))) {
    document.getElementById('videoModal').classList.remove('open');
    document.body.style.overflow = '';
    const v = document.querySelector('#videoPlaceholder video'); if (v) v.pause();
    const f = document.querySelector('#videoPlaceholder iframe'); if (f) { const s = f.src; f.src = s; }
  }
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideoModal(null, true); });

// ========================
// AI ASSISTANT
// ========================
const aiChatPanel   = document.getElementById('aiChatPanel');
const aiFab         = document.getElementById('aiFab');
const aiFabBadge    = document.getElementById('aiFabBadge');
const aiMessages    = document.getElementById('aiMessages');
const aiInput       = document.getElementById('aiInput');
const aiSuggestions = document.getElementById('aiSuggestions');

// Add your Anthropic API key here to enable real Claude responses
// Get one free at: https://console.anthropic.com
const ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';

let chatOpen = false;
let conversationHistory = [];
let isWaiting = false;

const WELCOME_MSG = "Hi! I'm Joan's AI assistant. Ask me about her skills, projects, experience, or how to hire her.";

const SUGGESTIONS = [
  "What technologies does Joan know?",
  "Tell me about HealthBot AI",
  "Tell me about Refactory & Turing projects",
  "How do I hire Joan?",
  "Show me her GitHub"
];

const SYSTEM_PROMPT = `You are Joan Adoc's personal AI assistant on her portfolio website. You have a warm, conversational, professional tone. Answer any question the user asks — not just about Joan. If they want to chat casually, chat! If they ask about Joan, answer accurately using the info below. Keep responses concise but complete.

ABOUT JOAN: Name: Adoc Joan. Location: Kampala, Uganda. Email: adocjoan123@gmail.com. Phone: +256 705 746 349. GitHub: https://github.com/Adoc410. LinkedIn: https://linkedin.com/in/adocjoan. Available for remote contracts, full-time roles, collaborations.

SKILLS: LangChain/LangGraph (95%), RAG+FAISS/ChromaDB (92%), Prompt Engineering (90%), Multi-provider LLMs (88%), Agentic AI (86%), Python/FastAPI (90%), Node.js/Express (85%), React/Next.js (88%), HTML/CSS (90%), Tailwind (88%), Git (90%), Docker/Vercel (78%).

PROJECTS:
1. HealthBot AI — Production healthcare chatbot. Hybrid RAG, 5 medical tools, 15 languages, multi-model (OpenAI/Claude/Gemini), MCP server. Stack: LangChain, LangGraph, FAISS, ChromaDB, Streamlit.
2. AI Study Coach Agent (Turing capstone) — LangGraph tutor for Ugandan students. 5 tools, dual memory. Stack: LangGraph, Next.js 14, GPT-4o, Zod.
3. AI Interview Prep Master — 10+ interview types, 7 difficulty levels, 4 LLM providers, PDF export. Stack: Streamlit, OpenAI, Anthropic, Gemini.
4. Agricultural Disease Assistant — Crop disease ID via AI vision for Ugandan farmers. Stack: React, FastAPI, Python.
5. AI Report Generator — Live API data to NLP reports to email delivery. Stack: Python, OpenAI, smtplib.
6. Chess Capture Checker — Python CLI chess validator with pytest suite.

EXPERIENCE:
- AI & Full Stack Engineer @ Refactory Academy Uganda (2025–Present): REST APIs, React frontends, Mayondo Wood & Furniture platform (e-commerce, RBAC).
- AI Engineering Student @ Turing College (Aug 2025–Jun 2026): LangChain/LangGraph, RAG, multi-provider LLMs, capstone projects.
- Certificate in Software Engineering @ Refactory/Groundbreaker.org (2025).
- Uganda A-Level @ Pride College School, Mpigi (2023–2024).

HIRING: Available now. Remote preferred. Response time: 24 hours.`;

function resetChat() {
  conversationHistory = [];
  isWaiting = false;
  aiMessages.innerHTML = '';
  appendMessage('bot', WELCOME_MSG);
  aiSuggestions.innerHTML = SUGGESTIONS.map(s => `<button class="ai-suggestion" onclick="sendSuggestion(this)">${escapeHtml(s)}</button>`).join('');
  aiSuggestions.classList.remove('hidden');
  aiInput.value = '';
}

function toggleChat() {
  chatOpen = !chatOpen;
  aiChatPanel.classList.toggle('open', chatOpen);
  aiFab.classList.toggle('chat-open', chatOpen);
  aiFabBadge.classList.add('hidden');
  if (chatOpen) { resetChat(); setTimeout(() => aiInput.focus(), 320); }
}

function sendSuggestion(btn) {
  if (isWaiting) return;
  aiSuggestions.classList.add('hidden');
  sendMessage(btn.innerText);
}

function handleAiKey(e) { if (e.key === 'Enter' && !e.shiftKey) sendAiMessage(); }

function sendAiMessage() {
  const text = aiInput.value.trim();
  if (!text || isWaiting) return;
  aiInput.value = '';
  aiSuggestions.classList.add('hidden');
  sendMessage(text);
}

function sendMessage(text) {
  appendMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });
  showTyping();
  isWaiting = true;
  callClaudeAPI();
}

function renderMarkdown(text) {
  let s = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  s = s.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
  s = s.replace(/\*(.*?)\*/g,'<em>$1</em>');
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  s = s.replace(/(^|[\s])(https?:\/\/[^\s<"]+)/g,'$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
  s = s.replace(/\n/g,'<br>');
  return s;
}

function appendMessage(role, text) {
  const div = document.createElement('div');
  div.className = `ai-msg ai-msg--${role === 'user' ? 'user' : 'bot'}`;
  const bubble = document.createElement('div');
  bubble.className = 'ai-msg-bubble';
  bubble.innerHTML = renderMarkdown(text);
  div.appendChild(bubble);
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

let typingEl = null;
function showTyping() {
  if (typingEl) return;
  typingEl = document.createElement('div');
  typingEl.className = 'ai-msg ai-msg--bot';
  typingEl.innerHTML = `<div class="ai-typing-bubble"><span></span><span></span><span></span></div>`;
  aiMessages.appendChild(typingEl);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}
function hideTyping() { if (typingEl) { typingEl.remove(); typingEl = null; } }

async function callClaudeAPI() {
  const hasKey = ANTHROPIC_API_KEY && ANTHROPIC_API_KEY !== 'YOUR_ANTHROPIC_API_KEY_HERE';

  // ── Real Claude when API key is set ──────────────────────────
  if (hasKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 800,
          system: SYSTEM_PROMPT,
          messages: conversationHistory
        })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      hideTyping();
      const reply = data.content?.map(b => b.text || '').join('').trim() || '';
      if (!reply) throw new Error('Empty');
      conversationHistory.push({ role: 'assistant', content: reply });
      appendMessage('bot', reply);
      isWaiting = false;
      return;
    } catch (err) {
      console.warn('Claude API error:', err.message);
    }
  }

  // ── Local responder — no key / no backend needed ──────────────
  await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
  hideTyping();
  const q = (conversationHistory[conversationHistory.length - 1]?.content || '').toLowerCase().trim();
  const reply = localReply(q);
  conversationHistory.push({ role: 'assistant', content: reply });
  appendMessage('bot', reply);
  isWaiting = false;
}

function localReply(q) {

  // ── Greetings ──────────────────────────────────────────────────
  if (/^(hi|hey|hello|howdy|good\s*(morning|afternoon|evening|day)|sup|what'?s up|yo\b)/.test(q)) {
    const greets = [
      "Hey! Great to have you here. I'm Joan's assistant — happy to tell you about her skills, projects, or how to get in touch. What's on your mind?",
      "Hi there! 👋 I'm here to help you learn about Joan. What would you like to know?",
      "Hello! Welcome to Joan's portfolio. Ask me anything — about her work, her projects, or how to hire her!"
    ];
    return greets[Math.floor(Math.random() * greets.length)];
  }

  // ── How are you / small talk ───────────────────────────────────
  if (/how are you|how('?re| are) (you|things)|you okay|you good/.test(q)) {
    return "Doing great, thanks for asking! Ready to help you learn about Joan. What would you like to know about her?";
  }

  if (/what('?s| is) your name|who are you/.test(q)) {
    return "I'm Joan's AI assistant, built into her portfolio to answer questions about her background, skills, and projects. What can I help you with?";
  }

  if (/what can you (do|help)|what do you know/.test(q)) {
    return "I can tell you all about Joan — her technical skills, projects she's built, her experience at Refactory and Turing College, how to contact her, and more. Just ask!";
  }

  // ── Technologies / skills ──────────────────────────────────────
  if (/tech|skill|know|stack|language|framework|tool|proficien|speciali|best at|good at/.test(q)) {
    return "Joan's core stack:\n\n**AI & LLM:** LangChain, LangGraph, RAG, FAISS, ChromaDB, OpenAI, Claude, Gemini, Groq\n**Backend:** Python, FastAPI, Node.js, Express, PostgreSQL, MongoDB\n**Frontend:** React, Next.js, TypeScript, Tailwind CSS, Streamlit\n**Tools:** Git, Docker, Vercel, pytest, CI/CD, Agile\n\nShe's strongest in agentic AI systems — building production LLM pipelines from scratch.";
  }

  // ── HealthBot ──────────────────────────────────────────────────
  if (/health.?bot|healthcare chatbot/.test(q)) {
    return "HealthBot AI is Joan's featured project — a production healthcare chatbot with:\n\n- Hybrid RAG (BM25 + ChromaDB)\n- 5 medical tools: symptom checker, BMI calc, drug interactions, CVD risk scorer, web search\n- Support for 15 languages\n- Multi-model: OpenAI, Claude, Gemini\n- Real-time cost tracking & MCP server\n\nStack: LangChain, LangGraph, FAISS, ChromaDB, Streamlit. Code on [GitHub](https://github.com/Adoc410).";
  }

  // ── Study Coach ────────────────────────────────────────────────
  if (/study.?coach|study agent|turing.*capstone|capstone.*turing/.test(q)) {
    return "The AI Study Coach Agent is Joan's Turing College capstone — a LangGraph-powered tutor for Ugandan students (PLE, UCE, UACE levels).\n\n5 autonomous tools: quiz generation, answer grading, Wikipedia grounding, progress tracking, and personalised study plans. Dual memory system (session + cross-session). Stack: LangGraph, Next.js 14, GPT-4o, Zod.";
  }

  // ── Interview Prep ────────────────────────────────────────────
  if (/interview|prep master/.test(q)) {
    return "AI Interview Prep Master — a full-stack Streamlit interview coach:\n\n- 10+ interview types (technical, behavioural, case study...)\n- 7 difficulty levels\n- 4 LLM providers\n- 5 prompting techniques (zero-shot, few-shot, CoT, role-based, structured)\n- Real-time cost tracking & PDF export\n\nStack: Streamlit, OpenAI, Anthropic, Gemini.";
  }

  // ── Agricultural ──────────────────────────────────────────────
  if (/agri|farm|crop|disease|plant/.test(q)) {
    return "The Agricultural Disease Assistant is an AI web app built for Ugandan smallholder farmers. Upload a photo of your crop and it identifies the disease, then gives organic and chemical treatment recommendations, a seasonal planting calendar, and best practices for 10+ crops. Stack: React, FastAPI, AI Vision, Python.";
  }

  // ── Report Generator ──────────────────────────────────────────
  if (/report.?gen|email.*report|automat.*report/.test(q)) {
    return "The AI Report Generator is a fully automated Python pipeline: it fetches live data from weather, news, and stock APIs — generates structured NLP reports via OpenAI — then emails them via smtplib. Zero manual work after setup. Includes a pytest test suite.";
  }

  // ── Chess ─────────────────────────────────────────────────────
  if (/chess|capture.?checker|rook|pawn/.test(q)) {
    return "The Chess Capture Checker is a clean Python CLI tool that validates piece positions on an 8×8 board, computes all valid rook and pawn capture moves, and renders a live unicode board. It has comprehensive input validation and a full pytest suite following PEP 8.";
  }

  // ── All projects ──────────────────────────────────────────────
  if (/project|built|portfolio|show.*work|all.*project/.test(q)) {
    return "Joan has shipped 6 projects:\n\n1. **HealthBot AI** — production healthcare chatbot with hybrid RAG\n2. **AI Study Coach Agent** — LangGraph tutor for Ugandan students\n3. **AI Interview Prep Master** — multi-LLM interview coach\n4. **Agricultural Disease Assistant** — crop disease ID for farmers\n5. **AI Report Generator** — automated data-to-email pipeline\n6. **Chess Capture Checker** — Python CLI with pytest suite\n\nWant details on any of these?";
  }

  // ── Refactory ────────────────────────────────────────────────
  if (/refactory/.test(q)) {
    return "At Refactory Academy Uganda, Joan works as an AI & Full Stack Engineer. She built scalable REST APIs with Node.js/Express, React frontends, and led full-stack development of the Mayondo Wood & Furniture e-commerce platform — covering inventory, sales flows, and RBAC in an Agile team environment.";
  }

  // ── Turing ───────────────────────────────────────────────────
  if (/turing/.test(q)) {
    return "Joan is currently in Turing College's AI Engineering programme (Aug 2025 – Jun 2026). She's building production AI systems — LangChain/LangGraph agents, RAG pipelines, multi-provider LLM orchestration, and agentic workflows. Her capstone projects (HealthBot AI and AI Study Coach) both received strong reviews.";
  }

  // ── Hiring / availability ─────────────────────────────────────
  if (/hire|contract|availab|collab|freelanc|full.?time|remote|job|opportun|looking for|recruit/.test(q)) {
    return "Joan is available now for remote contracts, full-time roles, and collaborations. She's based in Kampala, Uganda (UTC+3) — open to remote, hybrid, or on-site.\n\nGet in touch:\n📧 [adocjoan123@gmail.com](mailto:adocjoan123@gmail.com)\n📱 [+256 705 746 349](https://wa.me/256705746349)\n💼 [linkedin.com/in/adocjoan](https://linkedin.com/in/adocjoan)\n\nShe replies within 24 hours.";
  }

  // ── Contact ───────────────────────────────────────────────────
  if (/contact|email|phone|reach|whatsapp|message|get in touch/.test(q)) {
    return "Here's how to reach Joan:\n\n📧 [adocjoan123@gmail.com](mailto:adocjoan123@gmail.com)\n📱 [+256 705 746 349](https://wa.me/256705746349)\n💼 [linkedin.com/in/adocjoan](https://linkedin.com/in/adocjoan)\n💻 [github.com/Adoc410](https://github.com/Adoc410)\n\nShe responds within 24 hours.";
  }

  // ── GitHub ────────────────────────────────────────────────────
  if (/github|repo|code|source/.test(q)) {
    return "All of Joan's projects are on GitHub: [github.com/Adoc410](https://github.com/Adoc410). You'll find her AI projects, full-stack work, and Python projects there.";
  }

  // ── LinkedIn ──────────────────────────────────────────────────
  if (/linkedin|connect.*with|profile/.test(q)) {
    return "Connect with Joan on LinkedIn: [linkedin.com/in/adocjoan](https://linkedin.com/in/adocjoan). Feel free to send her a message there too!";
  }

  // ── CV / resume ───────────────────────────────────────────────
  if (/cv|resume|download/.test(q)) {
    return "You can download Joan's CV using the **Download CV** button at the top of the page. It covers her full experience, skills, education, and projects.";
  }

  // ── Location ──────────────────────────────────────────────────
  if (/location|where|country|uganda|kampala|based|timezone/.test(q)) {
    return "Joan is based in Kampala, Uganda (EAT — UTC+3). She's fully open to remote work globally, as well as hybrid or on-site roles within Uganda.";
  }

  // ── Education ─────────────────────────────────────────────────
  if (/educat|school|degree|certif|background|qualif/.test(q)) {
    return "Joan's education:\n\n- **AI Engineering** @ Turing College (Aug 2025–Jun 2026)\n- **Certificate in Software Engineering** @ Refactory Academy / Groundbreaker.org (2025)\n- **Uganda A-Level (UACE)** @ Pride College School, Mpigi (2023–2024)\n\nShe also has hands-on professional experience as an AI & Full Stack Engineer since 2025.";
  }

  // ── Experience / seniority ────────────────────────────────────
  if (/experience|how long|years|senior|junior|level|background/.test(q)) {
    return "Joan is an early-career engineer with strong practical depth. She completed her Software Engineering certificate at Refactory in 2025, is currently in Turing College's AI Engineering programme, and has been working professionally as an AI & Full Stack Engineer since 2025 — shipping real e-commerce platforms and production AI systems.";
  }

  // ── Salary ────────────────────────────────────────────────────
  if (/salary|rate|pay|compensation|cost|charge|price/.test(q)) {
    return "For rates and compensation, it's best to reach Joan directly — she's happy to discuss based on the role and scope:\n\n📧 [adocjoan123@gmail.com](mailto:adocjoan123@gmail.com)\n📱 [+256 705 746 349](https://wa.me/256705746349)";
  }

  // ── Thanks / compliments ──────────────────────────────────────
  if (/thank|thanks|appreciate|great|awesome|cool|nice|perfect|helpful|brilliant/.test(q)) {
    return "You're very welcome! 😊 Anything else you'd like to know about Joan?";
  }

  // ── Bye ───────────────────────────────────────────────────────
  if (/bye|goodbye|see you|talk later|that'?s all/.test(q)) {
    return "Take care! Feel free to come back anytime. Hope you get to work with Joan — she's great! 👋";
  }

  // ── RAG / LangChain / LangGraph (technical deep dive) ─────────
  if (/rag|langchain|langgraph|vector|embedding|retrieval/.test(q)) {
    return "Joan has deep hands-on experience with RAG pipelines and LangChain/LangGraph:\n\n- Built hybrid RAG (BM25 + ChromaDB) for HealthBot AI\n- Designed multi-tool LangGraph agents with memory (MemorySaver + JSON store)\n- Custom FAISS vector stores, prompt chaining, structured output with Zod\n- Multi-provider LLM orchestration (OpenAI, Claude, Gemini, Groq)\n\nThis is her strongest area — she's built these in production, not just tutorials.";
  }

  // ── Open-ended / conversational fallback ──────────────────────
  const fallbacks = [
    "Happy to help! Could you tell me a bit more about what you're looking for? I can talk about Joan's skills, projects, experience, or how to hire her.",
    "Good question! I'm best placed to help with anything about Joan — her tech stack, the projects she's built, her background, or contact details. What specifically interests you?",
    "I want to make sure I give you a useful answer! Are you asking about Joan's technical skills, a specific project, her experience, or something else?"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}