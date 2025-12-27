# 🧠 Lenn-AI | Liquid Metal Learning Platform

> **AI-Powered Learning Assistant for Nursing & Medical Science Students**

[![Security](https://img.shields.io/badge/Security-Production%20Ready-green)](./README_SECURITY.md)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4.1.18-blue)](./TAILWIND_V4_GUIDE.md)
[![Deployment](https://img.shields.io/badge/Deployment-Guide-orange)](./DEPLOYMENT.md)

---

## 🚀 QUICK START

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Gemini API key

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd Lenn-Ai-main

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Edit .env with your credentials
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
# GEMINI_API_KEY=your-gemini-key

# 5. Run development server
npm run dev
```

**⚠️ IMPORTANT:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production setup.

---

## 🔒 SECURITY ARCHITECTURE

This application implements **enterprise-grade security**:

✅ **No API Keys in Browser** - All Gemini API calls via Supabase Edge Functions  
✅ **Row Level Security (RLS)** - Database access controlled per user  
✅ **Environment Variables** - Proper separation of public/private credentials  
✅ **Secure Authentication** - Supabase Auth with password-based login  
✅ **HTTPS Only** - All production traffic encrypted  

**Read more:** [README_SECURITY.md](./README_SECURITY.md)

---

## 🏗️ ARCHITECTURE

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────┐
│  Supabase Platform  │
│  ┌───────────────┐  │
│  │ Edge Functions│◄─┼─── GEMINI_API_KEY (server-side)
│  │ - gemini-chat │  │
│  │ - gemini-material │
│  │ - gemini-lecturer │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │  PostgreSQL   │  │
│  │  (RLS enabled)│  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │    Storage    │  │
│  │  (materials)  │  │
│  └───────────────┘  │
└─────────────────────┘
       │
       ▼
┌─────────────┐
│  Gemini API │
└─────────────┘
```

---

## 📦 FEATURES

### 🎓 For Students

- **AI Tutor Chat** - Ask questions, get NCLEX-style explanations
- **Material Lab** - Upload PDFs/images, generate study aids
- **Practice Quizzes** - Auto-generated questions with explanations
- **Flashcards** - Spaced repetition learning
- **Educational Games** - Interactive anatomy labeling, sequencing

### 👨‍🏫 For Lecturers

- **Lesson Plan Generator** - Structured teaching outlines
- **Question Bank Creator** - MCQs, case studies, short answers
- **Teaching Notes** - Summary or deep-dive content
- **Slide Deck Outlines** - Presentation structure with visual descriptions

---

## 🛠️ TECH STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript | 19.2.3 |
| Build Tool | Vite | 6.2.0 |
| Styling | Tailwind CSS | 4.1.18 |
| Backend | Supabase (PostgreSQL + Edge Functions) | Latest |
| AI | Google Gemini API | 2.0 Flash |
| Deployment | Vercel / Netlify | - |

---

## 📁 PROJECT STRUCTURE

```
Lenn-Ai-main/
├── components/           # React components
│   ├── Auth.tsx         # Authentication UI
│   ├── TutorChat.tsx    # AI chat interface
│   ├── MaterialLab.tsx  # Document analysis
│   └── ...
├── services/            # Business logic
│   ├── supabaseClient.ts    # Database client
│   ├── geminiService.ts     # AI service (Edge Function proxy)
│   └── storageService.ts    # File storage
├── supabase/
│   ├── migrations/      # Database schema
│   └── functions/       # Edge Functions (secure API proxies)
├── src/
│   └── index.css        # Tailwind imports + custom styles
├── .env.example         # Environment variable template
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind v4 configuration
├── DEPLOYMENT.md        # 📘 Production deployment guide
├── README_SECURITY.md   # 🔒 Security architecture docs
└── TAILWIND_V4_GUIDE.md # 🎨 Tailwind v4 migration guide
```

---

## 🚀 DEPLOYMENT

### Quick Deploy to Vercel

```bash
# 1. Build the app
npm run build

# 2. Deploy
npx vercel --prod
```

### Quick Deploy to Netlify

```bash
# 1. Build the app
npm run build

# 2. Deploy
npx netlify deploy --prod --dir=dist
```

**⚠️ CRITICAL:** Before deploying, you MUST:

1. Deploy Supabase Edge Functions
2. Set `GEMINI_API_KEY` in Supabase secrets
3. Run database migrations
4. Configure environment variables

**Full guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🧪 TESTING

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🐛 TROUBLESHOOTING

### "An API Key must be set when running in a browser"

**Cause:** Frontend trying to call Gemini directly  
**Fix:** Ensure Edge Functions are deployed and `geminiService.ts` is updated

### "GEMINI_API_KEY not configured"

**Cause:** Edge Function secret not set  
**Fix:** `supabase secrets set GEMINI_API_KEY=your-key`

### Tailwind styles not loading

**Cause:** CSS not imported or wrong Tailwind version  
**Fix:** Check `src/index.css` exists and uses `@import "tailwindcss"`

**More solutions:** [DEPLOYMENT.md#troubleshooting](./DEPLOYMENT.md#7%EF%B8%8F⃣-troubleshooting)

---

## 📄 LICENSE

MIT License - See LICENSE file for details

---

## 🤝 CONTRIBUTING

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📞 SUPPORT

- **Documentation:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Security:** [README_SECURITY.md](./README_SECURITY.md)
- **Tailwind v4:** [TAILWIND_V4_GUIDE.md](./TAILWIND_V4_GUIDE.md)

---

**🎉 Built with ❤️ by Phurdio | Powered by Supabase + Gemini AI**