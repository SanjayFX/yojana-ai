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

**Free • No login • 8 languages • 770+ schemes • Self-updating daily**

<br />

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-yojanai--rosy.vercel.app-FF9933?style=for-the-badge)](https://yojanai-rosy.vercel.app)
[![Built in](https://img.shields.io/badge/Built%20in-24%20Hours-138808?style=for-the-badge)](https://yojanai-rosy.vercel.app)
[![Schemes](https://img.shields.io/badge/Schemes-770%2B%20and%20growing-0F2244?style=for-the-badge)](https://yojanai-rosy.vercel.app)
[![License MIT](https://img.shields.io/badge/License-MIT-FF9933?style=for-the-badge)](LICENSE)

<br />

> *Built by a 3rd year engineering student in 24 hours.*
> *What a senior dev team takes 6 weeks to build.*

**[Sanjay K](https://www.linkedin.com/in/sanjay-k-523120287) • [GitHub @SanjayFX](https://github.com/SanjayFX)**

</div>

---

## 🎯 What is YojanaAI?

India has **400+ government schemes** worth crores of rupees every year. Most citizens — especially in rural areas — **never find out they qualify.**

YojanaAI fixes this. Answer 6 simple questions. Get every scheme you're eligible for, exact documents needed, and step-by-step apply instructions. In 60 seconds. In your language.

**Not a chatbot. A multi-agent AI system with a self-updating, self-translating, self-healing database.**

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 **5 AI Agents** | Profile → Eligibility → Documents → Action → Explain |
| 🗄️ **770+ Schemes** | Central + state government, live in Supabase |
| 🔄 **Self-Updating** | AI adds new schemes every night at 2am |
| 🔧 **Self-Healing** | Broken URLs auto-fixed every night at 3am |
| 🌍 **Auto-Translation** | All 770 schemes translated in 7 languages |
| 🌐 **8 Languages** | Hindi, English, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada |
| 🏛️ **Central/State Filter** | Filter by Central Govt, State Govt, or Both |
| 🔍 **Instant Search** | Search in any Indian language |
| 📱 **Mobile First** | Works on ₹5,000 Android phones on slow 4G |
| 📞 **Clickable Helplines** | Direct call to scheme helpline |
| 🔒 **Privacy First** | Zero personal data stored ever |
| 📄 **PDF Export** | Download your scheme list |
| 📲 **WhatsApp Share** | Share results with family |
| 🇮🇳 **Animated Flag** | Pure CSS waving Indian flag |
| 📊 **Analytics** | Vercel Analytics — real-time usage |

---

## 🏗️ Architecture

```
User answers 6 questions (7 steps)
         │
         ▼
┌─────────────────────────────────────────────────────┐
│                find-schemes orchestrator             │
│                                                      │
│  Step 1: Profile Agent (Gemini Flash ~2s)            │
│  → Parses answers into structured UserProfile        │
│                                                      │
│  Step 2: Eligibility Agent (Gemini Pro ~5s)          │
│  → Filters by central/state/both preference         │
│  → Deep reasoning across 770+ schemes               │
│  → Language-aware reasons                           │
│                                                      │
│  Step 3: Documents + Action Agents (PARALLEL ~7s)   │
│  → Document Agent: exact document checklist         │
│  → Action Agent: step-by-step apply guide           │
│                                                      │
│  Step 4: Explain Agent (on demand)                  │
│  → "Why do I qualify?" per scheme                   │
│  → Difficulty + success tips                        │
│                                                      │
│  Step 5: Translation (background, instant)          │
│  → Fetches scheme_translations from Supabase        │
│  → Scheme names + benefit in user's language        │
└─────────────────────────────────────────────────────┘
         │
         ▼
  Results in ~13 seconds
  13+ matched schemes average
  Verified .gov.in apply URLs
  Translated to selected language
```

---

## 🔄 Autonomous Pipeline

```
Every night 2am (cron-job.org → free):
  → Rotates 21 states, 3 per night
  → AI researches new 2024-2026 schemes
  → Classifies as central/state/both
  → Translates 10 schemes in rotating language
  → Full DB (770 schemes × 7 langs) maintained

Every night 3am (cron-job.org → free):
  → 20 random schemes URL-validated
  → Dead URLs → auto-fixed to myscheme.gov.in
  → AI checks if scheme still active in 2026
  → Marks discontinued schemes inactive

Real-time on every user search:
  → State freshness check (7 day window)
  → Background refresh if stale
  → Translations fetched and shown instantly
```

---

## 🌍 Translation System

```
770 schemes × 7 languages = 5,390 translations
All stored in scheme_translations table.
Translated automatically via nightly cron.

When user selects Hindi:
  Results load → fetchSchemeTranslations()
  → Hindi names replace English instantly
  → Benefit text also in Hindi
  → Zero extra loading time
```

---

## 🏛️ Central/State Filter

```
New step 2 of 7 in the form:

🇮🇳 All Schemes     → Central + State both
🏛️ Central Govt    → PM Kisan, Ayushman...
🏠 State Govt      → Pudhumai Penn, Yuvanidhi...

DB classification:
  central:  59 schemes
  state:   677 schemes
  both:     34 schemes
  total:   770 schemes
```

---

## 🔒 URL Validation (Zero 404s)

```
Apply Now button priority:
1. Verified hardcoded map (30+ known URLs)
2. AI URL — only if passes domain allowlist
   gov.in, nic.in, nabard.org...
   Blocks: tnhb, /scheme/, /view/, /data_view/
3. myscheme.gov.in/search?keyword=...
   Official Govt of India portal — always works
```

---

## 🛠️ Tech Stack

```
Frontend     Next.js 15, TypeScript, Custom CSS
AI Primary   Gemini 2.0 Flash + Gemini Pro
AI Fallback  Groq Llama 3.3 70B (auto-switch)
Database     Supabase PostgreSQL + RLS
Analytics    Vercel Analytics
Deployment   Vercel
Cron         cron-job.org (free, 2am + 3am)
i18n         Custom React Context (8 languages)
```

---

## 📁 Project Structure

```
yojana-ai/
├── src/app/
│   ├── api/
│   │   ├── find-schemes/        ← Orchestrator
│   │   ├── profile/             ← Agent 1
│   │   ├── eligibility/         ← Agent 2 (Pro)
│   │   ├── documents/           ← Agent 3
│   │   ├── action/              ← Agent 4
│   │   ├── explain/             ← Agent 5
│   │   └── schemes/
│   │       ├── search/          ← Multilingual
│   │       ├── stats/           ← Live count
│   │       ├── translate/       ← Translation agent
│   │       ├── translations/    ← Fetch translations
│   │       ├── classify/        ← Central/state AI
│   │       ├── auto-update/     ← Per-search update
│   │       └── validate/        ← URL validator
│   │   └── cron/
│   │       ├── refresh-schemes/ ← 2am daily
│   │       └── validate-schemes/← 3am daily
│   ├── page.tsx                 ← Main app (7 steps)
│   └── layout.tsx               ← Dynamic title
├── src/components/
│   └── DynamicTitle.tsx         ← Cycling lang title
├── src/lib/
│   ├── ai.ts                    ← Gemini + Groq
│   ├── prompts.ts               ← All agent prompts
│   ├── eligibility.ts           ← Elderly guard
│   ├── ratelimit.ts             ← IP limiting
│   └── i18n/translations.ts    ← 8 languages
├── scripts/
│   └── translate-all.ts        ← Bulk translator
├── tests/
│   └── e2e-full.spec.ts        ← 8 Playwright tests
└── data/schemes.json            ← 50 base schemes
```

---

## 🚀 Local Setup

```bash
git clone https://github.com/SanjayFX/yojana-ai.git
cd yojana-ai
npm install
cp .env.example .env.local
# Fill in your API keys
npm run dev
```

### Environment Variables

```env
GEMINI_API_KEY=          # aistudio.google.com (free)
GROQ_API_KEY=            # console.groq.com (free)
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
  scheme_type TEXT DEFAULT 'central'
    CHECK (scheme_type IN
      ('central','state','both')),
  is_active BOOLEAN DEFAULT TRUE,
  hit_count INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scheme_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheme_id TEXT NOT NULL
    REFERENCES schemes(id),
  lang TEXT NOT NULL,
  name TEXT,
  benefit TEXT,
  UNIQUE(scheme_id, lang)
);

CREATE TABLE update_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL UNIQUE,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  is_processing BOOLEAN DEFAULT FALSE
);

-- Enable RLS on all tables
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_translations
  ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_queue ENABLE ROW LEVEL SECURITY;

-- Open read policies
CREATE POLICY read_all ON schemes
  FOR SELECT USING (true);
CREATE POLICY read_t ON scheme_translations
  FOR SELECT USING (true);
CREATE POLICY write_t ON scheme_translations
  FOR ALL USING (true) WITH CHECK (true);
```

### Translate all schemes

```bash
# Runs in background, all 7 languages
npm run translate:all
```

### Cron Setup (cron-job.org — free)

```
Job 1: /api/cron/refresh-schemes  GET  0 2 * * *
Job 2: /api/cron/validate-schemes GET  0 3 * * *
Both headers: Authorization: Bearer yojanacron2026
```

---

## 📊 Stats

```
770+    schemes in Supabase
59      central government schemes
677     state government schemes
34      both central + state
5,390   translations (770 × 7 languages)
8       languages supported
13+     schemes matched per search
5       AI agents
~13s    end-to-end pipeline time
0       personal data stored
0       404s guaranteed
```

---

## ✅ Verified Status

| Check | Status |
|---|---|
| Build + TypeScript | ✅ 0 errors |
| All 5 agents | ✅ Working |
| Full pipeline | ✅ ~13s, 13+ schemes |
| 770 schemes classified | ✅ central/state/both |
| Translation agent | ✅ All 7 languages seeded |
| 8 languages UI | ✅ Zero Hinglish |
| Mobile 375px + 412px | ✅ Playwright verified |
| 8/8 Playwright personas | ✅ All passing |
| Cron refresh prod | ✅ 200 in 0.03s |
| URL validation | ✅ Zero 404s |
| Rate limiting | ✅ 429 at req 11 |
| Dynamic tab title | ✅ Cycles 8 languages |
| Vercel Analytics | ✅ Live |

*Last verified: March 2026*

---

## 🌐 Languages

| Language | Code | Script |
|---|---|---|
| हिन्दी | `hi` | Devanagari |
| English | `en` | Latin |
| বাংলা | `bn` | Bengali |
| తెలుగు | `te` | Telugu |
| मराठी | `mr` | Devanagari |
| தமிழ் | `ta` | Tamil |
| ગુજરાતી | `gu` | Gujarati |
| ಕನ್ನಡ | `kn` | Kannada |

---

## 🔒 Security

- ✅ Rate limiting — 429 at request 11 per IP
- ✅ RLS on all Supabase tables
- ✅ Service role key server-side only
- ✅ URL allowlist — verified domains only
- ✅ SEED_SECRET + CRON_SECRET protected
- ✅ Zero PII stored

---

## 🤝 Contributing

- **New schemes** → `data/schemes.json`
- **New languages** → `lib/i18n/translations.ts`
- **Bug fixes** → Open an issue first

---

## 📄 License

MIT — free to use, modify, distribute.

---

<div align="center">

**Built with ❤️ for 140 crore Indians**

*3rd year student • 24 hours • One holiday*

**[Sanjay K](https://www.linkedin.com/in/sanjay-k-523120287) • [SanjayFX](https://github.com/SanjayFX)**

[![Twitter](https://img.shields.io/badge/Share-Twitter-1DA1F2?style=for-the-badge)](https://twitter.com/intent/tweet?text=Free%20AI%20finds%20every%20Indian%20govt%20scheme%20you%20qualify%20for%20%F0%9F%87%AE%F0%9F%87%B3&url=https://yojanai-rosy.vercel.app)
[![WhatsApp](https://img.shields.io/badge/Share-WhatsApp-25D366?style=for-the-badge)](https://wa.me/?text=Free%20AI%20for%20Indian%20govt%20schemes%3A%20https%3A%2F%2Fyojanai-rosy.vercel.app)

*If this helped you or your family, give it a ⭐*

</div>
