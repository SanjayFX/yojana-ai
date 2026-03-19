<div align="center">

<img src="https://img.shields.io/badge/Made%20in-India%20🇮🇳-FF9933?style=for-the-badge" />
<img src="https://img.shields.io/badge/Built%20in-12%20Hours-138808?style=for-the-badge" />
<img src="https://img.shields.io/badge/Schemes-526%2B-0F2244?style=for-the-badge" />

<br /><br />

```
██╗   ██╗ ██████╗      ██╗ █████╗ ███╗   ██╗ █████╗      █████╗ ██╗
╚██╗ ██╔╝██╔═══██╗     ██║██╔══██╗████╗  ██║██╔══██╗    ██╔══██╗██║
 ╚████╔╝ ██║   ██║     ██║███████║██╔██╗ ██║███████║    ███████║██║
  ╚██╔╝  ██║   ██║██   ██║██╔══██║██║╚██╗██║██╔══██║    ██╔══██║██║
   ██║   ╚██████╔╝╚█████╔╝██║  ██║██║ ╚████║██║  ██║    ██║  ██║██║
   ╚═╝    ╚═════╝  ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝
```

### 🇮🇳 Find every Indian government scheme you qualify for — in 60 seconds

**Free • No login • 8 languages • 526+ schemes • Self-updating**

<br />

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-yojanai--rosy.vercel.app-FF9933?style=for-the-badge&logoColor=white)](https://yojanai-rosy.vercel.app)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/yojana-ai?style=for-the-badge&color=0F2244)](https://github.com/yourusername/yojana-ai)
[![License MIT](https://img.shields.io/badge/License-MIT-138808?style=for-the-badge)](LICENSE)

<br />

> *"Built by a 3rd year student in 12 hours.*
> *What a senior dev team would take 6 weeks to build."*

</div>

---

## 🎯 What is YojanaAI?

India has **400+ government schemes** worth crores of rupees annually. Most citizens — especially in rural areas — **never find out they qualify.**

YojanaAI fixes this. Answer 6 simple questions. Get every scheme you're eligible for, the documents you need, and exactly how to apply. In 60 seconds. In your language.

**This isn't a chatbot. It's a multi-agent AI system.**

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 **Multi-Agent AI** | 4 specialized agents run in parallel — Profile, Eligibility, Documents, Action |
| 🗄️ **526+ Schemes** | Central + state government schemes, self-updating daily |
| 🌐 **8 Languages** | Hindi, English, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada |
| 🔍 **Instant Search** | Search any scheme directly from the homepage |
| 📱 **Mobile First** | Works on ₹5,000 Android phones on slow 4G |
| 🔄 **Self-Updating** | AI agent adds new schemes automatically when users search |
| ⏰ **Daily Cron** | Runs every night at 2am, updates top 20 states |
| 🔒 **Privacy First** | Zero personal data stored — only anonymous analytics |
| 📄 **PDF Export** | Download your scheme list |
| 📲 **WhatsApp Share** | Share results directly with family |

---

## 🏗️ Architecture

```
User answers 6 questions
         │
         ▼
┌─────────────────────────────────────────────────┐
│              find-schemes orchestrator           │
│                                                  │
│  Step 1: Profile Agent (Gemini Flash)            │
│  → Parses answers into structured JSON profile  │
│                                                  │
│  Step 2: Eligibility Agent (Gemini Pro)          │
│  → Deep reasoning across 526+ schemes           │
│  → Returns matched schemes with reasons         │
│                                                  │
│  Step 3: Documents + Action Agents (PARALLEL)   │
│  → Document Agent: exact docs per scheme        │
│  → Action Agent: step-by-step apply guide       │
│                                                  │
│  Step 4: Background Auto-Update (fire & forget) │
│  → Silently checks if state schemes are fresh   │
│  → Adds new schemes via AI research if stale    │
└─────────────────────────────────────────────────┘
         │
         ▼
  Results in ~13 seconds
  13+ matched schemes
  Real .gov.in apply URLs
  Documents checklist
  Step-by-step guide
```

---

## 🤖 The Agent Pipeline

```typescript
// 4 agents, 2 running in parallel
const start = Date.now()

// Agent 1 — Profile Parser (Gemini Flash ~2s)
const profile = await profileAgent(answers)

// Agent 2 — Eligibility Reasoner (Gemini Pro ~5s)
// This is where Gemini Pro earns its cost.
// Complex multi-condition matching across 526 schemes.
const { matched_schemes } = await eligibilityAgent(profile)

// Agents 3 + 4 — Parallel execution (~7s combined → ~7s total)
const [documents, actions] = await Promise.all([
  documentsAgent(matched_schemes, profile),
  actionAgent(matched_schemes, profile)
])

// Total: ~13s not ~20s because of parallel execution
console.log(`Done in ${Date.now() - start}ms`)
```

---

## 🗺️ Self-Updating Database

```
User searches "Kerala"
        │
        ▼
Background agent fires (non-blocking)
        │
        ▼
"When did I last update Kerala schemes?"
        │
   ┌────┴────┐
   │         │
< 7 days  > 7 days
   │         │
 Skip      Fire Gemini research
           "Find new Kerala schemes
            announced in 2024-2026"
                    │
                    ▼
           Upsert to Supabase
                    │
                    ▼
           Next user gets fresher results
```

**Daily cron at 2am** proactively refreshes top 20 states.
**Hit counting** — most-searched schemes rank higher.
**Zero downtime** — always falls back to local JSON if DB fails.

---

## 🛠️ Tech Stack

```
Frontend          Next.js 15 (App Router, TypeScript)
Styling           Tailwind CSS + Custom CSS (glassmorphism)
AI Models         Gemini 2.0 Flash + Gemini Pro (Google)
AI Fallback       Groq Llama 3.3 70B (free, 14k req/day)
Database          Supabase (PostgreSQL + Row Level Security)
Deployment        Vercel (with cron jobs)
i18n              Custom React Context (8 languages)
```

---

## 📁 Project Structure

```
yojana-ai/
├── app/
│   ├── api/
│   │   ├── find-schemes/     ← Main orchestrator
│   │   ├── profile/          ← Agent 1
│   │   ├── eligibility/      ← Agent 2 (Gemini Pro)
│   │   ├── documents/        ← Agent 3
│   │   ├── action/           ← Agent 4
│   │   ├── schemes/
│   │   │   ├── search/       ← Instant search API
│   │   │   ├── stats/        ← Live scheme count
│   │   │   ├── seed/         ← DB seeder
│   │   │   ├── update/       ← Manual AI update
│   │   │   └── auto-update/  ← Background updater
│   │   └── cron/
│   │       └── refresh-schemes/ ← Daily cron
│   ├── components/           ← React components
│   └── page.tsx              ← Main app (4 screens)
├── lib/
│   ├── ai.ts                 ← Gemini + Groq clients
│   ├── supabase.ts           ← DB client + helpers
│   ├── prompts.ts            ← All 4 agent prompts
│   ├── types.ts              ← TypeScript interfaces
│   ├── ratelimit.ts          ← IP rate limiting
│   └── i18n/
│       └── translations.ts   ← 8 languages
├── data/
│   └── schemes.json          ← 50 base schemes (seed)
└── vercel.json               ← Cron config
```

---

## 🚀 Local Setup

```bash
# 1. Clone
git clone https://github.com/yourusername/yojana-ai.git
cd yojana-ai

# 2. Install
npm install

# 3. Environment variables
cp .env.example .env.local
# Fill in your keys (see below)

# 4. Run
npm run dev
# Open http://localhost:3000
```

### Environment Variables

```env
# AI
GEMINI_API_KEY=                  # aistudio.google.com (free)
GROQ_API_KEY=                    # console.groq.com (free)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=        # your project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # public anon key
SUPABASE_SERVICE_ROLE_KEY=       # service role key

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SEED_SECRET=your_seed_secret
CRON_SECRET=your_cron_secret
```

### Supabase Setup

Run this in your Supabase SQL Editor:

```sql
CREATE TABLE schemes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ministry TEXT,
  category TEXT,
  benefit TEXT,
  eligibility JSONB,
  documents_required TEXT[],
  apply_url TEXT,
  apply_modes TEXT[],
  helpline TEXT,
  eligible_states TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  hit_count INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_all ON schemes FOR SELECT USING (true);
CREATE POLICY insert_all ON schemes FOR INSERT WITH CHECK (true);
CREATE POLICY update_all ON schemes FOR UPDATE USING (true);
```

Then seed the database:

```bash
curl -X POST http://localhost:3000/api/schemes/seed \
  -H "Authorization: Bearer your_seed_secret"
```

---

## 🌐 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/find-schemes` | POST | Main pipeline — runs all 4 agents |
| `/api/profile` | POST | Parse answers to user profile |
| `/api/eligibility` | POST | Match profile to schemes (Gemini Pro) |
| `/api/documents` | POST | Get document checklist per scheme |
| `/api/action` | POST | Get apply steps per scheme |
| `/api/schemes/search` | GET | Search schemes by name/benefit |
| `/api/schemes/stats` | GET | Total scheme count + categories |
| `/api/schemes/auto-update` | POST | Trigger AI scheme research for a state |
| `/api/schemes/seed` | POST | Seed DB from local JSON |
| `/api/cron/refresh-schemes` | GET | Run daily refresh (cron) |

---

## 📊 Stats

```
526+    schemes in database (and growing)
8       languages supported
13+     schemes matched per search average
~13s    end-to-end pipeline time
14,400  free Groq requests/day (fallback)
2am     daily cron refresh time
7 days  scheme freshness window per state
0       personal data stored
```

---

## 🗣️ Languages

| Language | Code | Speakers |
|---|---|---|
| हिन्दी (Hindi) | `hi` | 52 crore |
| English | `en` | 12 crore |
| বাংলা (Bengali) | `bn` | 9.7 crore |
| తెలుగు (Telugu) | `te` | 8.1 crore |
| मराठी (Marathi) | `mr` | 8.3 crore |
| தமிழ் (Tamil) | `ta` | 6.9 crore |
| ગુજરાતી (Gujarati) | `gu` | 5.5 crore |
| ಕನ್ನಡ (Kannada) | `kn` | 4.4 crore |

---

## 🔒 Security

- ✅ Rate limiting — 10 requests/minute per IP
- ✅ Input validation — age 1-120, state allowlist
- ✅ Row Level Security on all Supabase tables
- ✅ Service role key server-side only
- ✅ No PII stored — anonymous analytics only
- ✅ All API keys in environment variables
- ✅ SEED_SECRET + CRON_SECRET protected endpoints

---

## 🤝 Contributing

Contributions welcome! Especially:

- **New schemes** — Add to `data/schemes.json`
- **New languages** — Add to `lib/i18n/translations.ts`
- **Bug fixes** — Open an issue first
- **UI improvements** — PRs welcome

```bash
# Fork, clone, make changes
git checkout -b feature/add-scheme-xyz
git commit -m "feat: add XYZ scheme"
git push origin feature/add-scheme-xyz
# Open Pull Request
```

---

## 📖 Blog Posts

- [How I built a civic AI app in 12 hours](https://dev.to) — *coming soon*
- [Multi-agent architecture with Gemini API](https://dev.to) — *coming soon*

---

## 📄 License

MIT — free to use, modify, distribute.

---

<div align="center">

**Built with ❤️ for 140 crore Indians**

*3rd year student • 12 hours • One holiday*

[![Twitter](https://img.shields.io/badge/Twitter-Share-1DA1F2?style=for-the-badge)](https://twitter.com/intent/tweet?text=Found%20this%20free%20AI%20tool%20that%20finds%20every%20Indian%20govt%20scheme%20you%20qualify%20for%20in%2060%20seconds%20🇮🇳&url=https://yojanai-rosy.vercel.app)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Share-25D366?style=for-the-badge)](https://wa.me/?text=Free%20AI%20tool%20that%20finds%20Indian%20govt%20schemes%20you%20qualify%20for%3A%20https%3A%2F%2Fyojanai-rosy.vercel.app)

<br />

*If this helped you or your family, give it a ⭐*

</div>
