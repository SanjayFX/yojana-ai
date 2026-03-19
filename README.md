<div align="center">

```
██╗   ██╗ ██████╗      ██╗ █████╗ ███╗   ██╗ █████╗      █████╗ ██╗
╚██╗ ██╔╝██╔═══██╗     ██║██╔══██╗████╗  ██║██╔══██╗    ██╔══██╗██║
 ╚████╔╝ ██║   ██║     ██║███████║██╔██╗ ██║███████║    ███████║██║
  ╚██╔╝  ██║   ██║██   ██║██╔══██║██║╚██╗██║██╔══██║    ██╔══██║██║
   ██║   ╚██████╔╝╚█████╔╝██║  ██║██║ ╚████║██║  ██║    ██║  ██║██║
   ╚═╝    ╚═════╝  ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝
```

### 🇮🇳 Find every Indian government scheme you qualify for — in 60 seconds

**Free • No login • 8 languages • 562+ schemes • Self-updating daily**

<br />

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-yojanai--rosy.vercel.app-FF9933?style=for-the-badge)](https://yojanai-rosy.vercel.app)
[![Built in](https://img.shields.io/badge/Built%20in-12%20Hours-138808?style=for-the-badge)](https://yojanai-rosy.vercel.app)
[![Schemes](https://img.shields.io/badge/Schemes-562%2B%20and%20growing-0F2244?style=for-the-badge)](https://yojanai-rosy.vercel.app)
[![License MIT](https://img.shields.io/badge/License-MIT-FF9933?style=for-the-badge)](LICENSE)

<br />

> *Built by a 3rd year engineering student in 12 hours.*
> *What a senior dev team takes 6 weeks to build.*

</div>

---

## 🎯 What is YojanaAI?

India has **400+ government schemes** worth crores of rupees every year. Most citizens — especially in rural areas — **never find out they qualify.**

YojanaAI fixes this. Answer 6 simple questions. Get every scheme you're eligible for, the exact documents you need, and step-by-step apply instructions. In 60 seconds. In your language.

**This is not a chatbot. It's a multi-agent AI system with a self-updating database.**

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 **4 AI Agents in Parallel** | Profile → Eligibility → Documents + Action |
| 🗄️ **562+ Schemes** | Central + state government, live in Supabase |
| 🔄 **Self-Updating** | AI adds new schemes every night at 2am |
| 🔧 **Self-Healing** | Broken URLs auto-fixed every night at 3am |
| 🌐 **8 Languages** | Hindi, English, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada |
| 🔍 **Instant Search** | Search any scheme directly from homepage |
| 📱 **Mobile First** | Works on ₹5,000 Android phones on slow 4G |
| 🔒 **Privacy First** | Zero personal data stored |
| 📄 **PDF Export** | Download your scheme list |
| 📲 **WhatsApp Share** | Share results with family |
| 🇮🇳 **Animated Flag** | Pure CSS waving flag |

---

## 🏗️ Architecture

```
User answers 6 questions
         │
         ▼
┌─────────────────────────────────────────────────────┐
│                find-schemes orchestrator             │
│                                                      │
│  Step 1: Profile Agent (Gemini Flash ~2s)            │
│  → Parses answers into structured UserProfile        │
│                                                      │
│  Step 2: Eligibility Agent (Gemini Pro ~5s)          │
│  → Deep reasoning across 562+ schemes               │
│  → Returns matched schemes with reasons             │
│                                                      │
│  Step 3: Documents + Action Agents (PARALLEL ~7s)   │
│  → Document Agent: exact document checklist         │
│  → Action Agent: step-by-step apply guide           │
│                                                      │
│  Step 4: Background Auto-Update (fire & forget)     │
│  → Checks freshness of user's state schemes         │
│  → Triggers AI research if older than 7 days        │
└─────────────────────────────────────────────────────┘
         │
         ▼
  Results in ~13 seconds
  13+ matched schemes average
  Verified .gov.in apply URLs
  Documents checklist per scheme
  Step-by-step apply guide
```

---

## 🔄 Autonomous Pipeline

```
Every night 2am (cron-job.org):
  → Rotates through 21 states (3 per night)
  → AI researches new schemes from 2024-2026
  → Upserts to Supabase automatically
  → Full state rotation every 7 days

Every night 3am (cron-job.org):
  → Picks 20 random schemes from DB
  → HEAD request to every apply_url
  → Dead URLs → auto-fixed to myscheme.gov.in
  → AI checks if scheme still active in 2026
  → Marks discontinued schemes inactive

Real-time on every user search:
  → Checks when user's state was last updated
  → If older than 7 days → background refresh
  → User never waits for this
```

**First validation run fixed 16 broken URLs automatically.**

---

## 🔒 URL Validation (Zero 404s Guaranteed)

```
Apply Now button uses strict allowlist:

1. VERIFIED_URLS map — 30+ hardcoded known URLs
   pmkisan.gov.in, pmjay.gov.in, nrega.nic.in...

2. AI-returned URL — only if matches safe domains
   gov.in, nic.in, nabard.org, nsdl.co.in...
   Blocks: tnhb, /scheme/, /view/, /data_view/...

3. myscheme.gov.in/search?keyword=SchemeName
   Official Govt of India portal — always works
```

---

## 🛠️ Tech Stack

```
Frontend     Next.js 15, TypeScript, Custom CSS (glassmorphism)
AI Primary   Gemini 2.0 Flash + Gemini Pro
AI Fallback  Groq Llama 3.3 70B (auto-switches on quota)
Database     Supabase PostgreSQL + Row Level Security
Deployment   Vercel
Cron         cron-job.org (free, 2am + 3am daily)
i18n         Custom React Context (8 languages)
```

---

## 📁 Project Structure

```
yojana-ai/
├── app/
│   ├── api/
│   │   ├── find-schemes/        ← Main orchestrator
│   │   ├── profile/             ← Agent 1
│   │   ├── eligibility/         ← Agent 2 (Gemini Pro)
│   │   ├── documents/           ← Agent 3
│   │   ├── action/              ← Agent 4
│   │   ├── schemes/
│   │   │   ├── search/          ← Instant search
│   │   │   ├── stats/           ← Live count API
│   │   │   ├── seed/            ← DB seeder
│   │   │   ├── auto-update/     ← Per-search updater
│   │   │   └── validate/        ← URL validator
│   │   └── cron/
│   │       ├── refresh-schemes/ ← 2am daily
│   │       └── validate-schemes/← 3am daily
│   └── page.tsx                 ← Main app (4 screens)
├── lib/
│   ├── ai.ts                    ← Gemini + Groq fallback
│   ├── supabase.ts              ← DB client + helpers
│   ├── prompts.ts               ← All 4 agent prompts
│   ├── types.ts                 ← TypeScript interfaces
│   ├── ratelimit.ts             ← IP rate limiting
│   └── i18n/translations.ts    ← 8 languages
├── data/schemes.json            ← 50 base schemes (seed)
└── vercel.json                  ← Cron config
```

---

## 🚀 Local Setup

```bash
# Clone
git clone https://github.com/yourusername/yojana-ai.git
cd yojana-ai && npm install

# Set up environment (see below)
cp .env.example .env.local

# Run Supabase SQL (see Database Setup)

# Seed database
curl -X POST http://localhost:3000/api/schemes/seed \
  -H "Authorization: Bearer yojana2026secret"

# Start
npm run dev
```

### Environment Variables

```env
GEMINI_API_KEY=               # aistudio.google.com (free)
GROQ_API_KEY=                 # console.groq.com (free)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SEED_SECRET=yojana2026secret
CRON_SECRET=yojanacron2026
```

### Database Setup

```sql
CREATE TABLE schemes (
  id TEXT PRIMARY KEY, name TEXT NOT NULL,
  ministry TEXT, category TEXT, benefit TEXT,
  eligibility JSONB, documents_required TEXT[],
  apply_url TEXT, apply_modes TEXT[],
  helpline TEXT, eligible_states TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  hit_count INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE update_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL UNIQUE,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  is_processing BOOLEAN DEFAULT FALSE
);

CREATE TABLE searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT, age INT, income_range TEXT,
  caste_category TEXT, occupation TEXT,
  schemes_matched INT DEFAULT 0,
  total_benefit TEXT, language TEXT DEFAULT 'hi',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_all ON schemes FOR SELECT USING (true);
CREATE POLICY insert_all ON schemes FOR INSERT WITH CHECK (true);
CREATE POLICY update_all ON schemes FOR UPDATE USING (true);
CREATE POLICY upsert_queue ON update_queue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY read_queue ON update_queue FOR SELECT USING (true);
CREATE POLICY insert_searches ON searches FOR INSERT WITH CHECK (true);
```

### Cron Setup (cron-job.org — free)

```
Job 1:
  URL:      https://your-app.vercel.app/api/cron/refresh-schemes
  Method:   GET
  Schedule: Every day at 2:00 AM UTC
  Header:   Authorization: Bearer yojanacron2026

Job 2:
  URL:      https://your-app.vercel.app/api/cron/validate-schemes
  Method:   GET
  Schedule: Every day at 3:00 AM UTC
  Header:   Authorization: Bearer yojanacron2026
```

---

## 📊 Live Stats

```
562+    schemes in Supabase (grows nightly)
8       languages supported
13+     schemes matched per search (average)
~13s    end-to-end pipeline time
3       states refreshed per cron run
20      schemes URL-validated per night
16      broken URLs auto-fixed in first run
0.03s   cron response time (background mode)
0       personal data stored
```

---

## 🌐 Languages Supported

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

## ✅ Verified Status

| Check | Status |
|---|---|
| Build + TypeScript | ✅ 0 errors |
| All 4 agents | ✅ Working |
| Full pipeline | ✅ ~13s, 13+ schemes |
| Supabase live | ✅ 562+ schemes |
| 8 languages | ✅ All verified |
| Mobile 375px + 412px | ✅ Playwright verified |
| Cron refresh (prod) | ✅ 200 in 0.03s |
| Cron validate (prod) | ✅ 16 URLs auto-fixed |
| URL allowlist | ✅ Zero 404s |
| Rate limiting | ✅ 429 at req 11 |

*Last verified: March 2026*

---

## 🤝 Contributing

- **New schemes** → Add to `data/schemes.json`
- **New languages** → Add to `lib/i18n/translations.ts`
- **Bug fixes** → Open an issue first
- **UI improvements** → PRs welcome

---

## 📄 License

MIT — free to use, modify, distribute.

---

<div align="center">

**Built with ❤️ for 140 crore Indians**

*3rd year student • 12 hours • One holiday*

[![Twitter](https://img.shields.io/badge/Share-Twitter-1DA1F2?style=for-the-badge)](https://twitter.com/intent/tweet?text=Free%20AI%20that%20finds%20every%20Indian%20govt%20scheme%20you%20qualify%20for%20%F0%9F%87%AE%F0%9F%87%B3&url=https://yojanai-rosy.vercel.app)
[![WhatsApp](https://img.shields.io/badge/Share-WhatsApp-25D366?style=for-the-badge)](https://wa.me/?text=Free%20AI%20tool%20for%20Indian%20govt%20schemes%3A%20https%3A%2F%2Fyojanai-rosy.vercel.app)

*If this helped you or your family, give it a ⭐*

</div>
