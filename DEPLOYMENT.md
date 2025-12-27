# 🚀 LENN-AI PRODUCTION DEPLOYMENT GUIDE

## 📋 PRE-DEPLOYMENT CHECKLIST

- [ ] Supabase project created
- [ ] Gemini API key obtained
- [ ] Supabase CLI installed
- [ ] All environment variables configured
- [ ] Database schema migrated
- [ ] Edge Functions deployed
- [ ] Frontend built and tested

---

## 1️⃣ SUPABASE SETUP

### 1.1 Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Note your project URL and anon key

### 1.2 Disable Email Confirmation (CRITICAL)

**Why:** Your app uses password-based auth without email verification.

**Steps:**
1. Go to Supabase Dashboard → Authentication → Providers
2. Click "Email" provider
3. **UNCHECK** "Confirm email"
4. Click "Save"

### 1.3 Run Database Migration

**Option A: SQL Editor (Recommended)**
```bash
# Copy the entire content of supabase/migrations/20240320_initial_schema.sql
# Paste into Supabase Dashboard → SQL Editor → New Query
# Click "Run"
```

**Option B: Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## 2️⃣ EDGE FUNCTIONS DEPLOYMENT

### 2.1 Install Supabase CLI

```bash
npm install -g supabase
supabase login
```

### 2.2 Link Your Project

```bash
cd /path/to/Lenn-Ai-main
supabase link --project-ref your-project-ref
```

### 2.3 Set Gemini API Key Secret

```bash
# CRITICAL: This keeps your API key secure (server-side only)
supabase secrets set GEMINI_API_KEY=your-actual-gemini-api-key-here
```

### 2.4 Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy gemini-chat
supabase functions deploy gemini-material
supabase functions deploy gemini-lecturer

# Verify deployment
supabase functions list
```

### 2.5 Test Edge Functions

```bash
# Test chat function
curl -i --location --request POST \
  'https://your-project-ref.supabase.co/functions/v1/gemini-chat' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"text":"What is hypertension?"}'
```

---

## 3️⃣ FRONTEND DEPLOYMENT (VERCEL)

### 3.1 Update Environment Variables

Create `.env.production`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3.2 Install Dependencies

```bash
cd /path/to/Lenn-Ai-main
npm install
```

### 3.3 Build for Production

```bash
npm run build
```

### 3.4 Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com
2. Click "Import Project"
3. Connect your GitHub repo
4. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click "Deploy"

---

## 4️⃣ FRONTEND DEPLOYMENT (NETLIFY)

### 4.1 Create `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4.2 Deploy to Netlify

**Option A: Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

**Option B: Netlify Dashboard**
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repo
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click "Deploy"

---

## 5️⃣ POST-DEPLOYMENT VERIFICATION

### 5.1 Test Authentication

1. Open your deployed app
2. Click "Register Profile"
3. Create a test account
4. Verify you can log in

### 5.2 Test Chat Feature

1. Log in to your app
2. Navigate to "Chat" section
3. Ask a question (e.g., "What is diabetes?")
4. Verify AI response appears

### 5.3 Test Material Upload

1. Navigate to "Material Lab"
2. Upload a test PDF or image
3. Click "Initialize Analysis"
4. Verify study aids are generated

### 5.4 Check Browser Console

- Open DevTools → Console
- Should see NO errors about:
  - Missing API keys
  - CORS issues
  - Tailwind CDN warnings
  - Favicon 404

---

## 6️⃣ SECURITY VERIFICATION

### ✅ Security Checklist

- [ ] No `GEMINI_API_KEY` in browser DevTools → Application → Local Storage
- [ ] No `GEMINI_API_KEY` in browser DevTools → Network → Response bodies
- [ ] No `process.env` references in built JavaScript files
- [ ] All API calls go to `supabase.co/functions/v1/*` endpoints
- [ ] Supabase RLS policies enabled on all tables
- [ ] Email confirmation disabled in Supabase Auth settings

### 🔍 How to Verify

```bash
# Check built files for exposed secrets
cd dist/assets
grep -r "GEMINI_API_KEY" .
grep -r "process.env" .

# Should return NO results
```

---

## 7️⃣ TROUBLESHOOTING

### Issue: "An API Key must be set when running in a browser"

**Cause:** Frontend is trying to call Gemini directly  
**Fix:** Ensure `geminiService.ts` uses Edge Functions (already fixed in this refactor)

### Issue: "GEMINI_API_KEY not configured in Edge Function secrets"

**Cause:** Edge Function secret not set  
**Fix:** Run `supabase secrets set GEMINI_API_KEY=your-key`

### Issue: "Failed to call gemini-chat"

**Cause:** Edge Function not deployed or CORS issue  
**Fix:** 
```bash
supabase functions deploy gemini-chat
supabase functions list  # Verify it's deployed
```

### Issue: "Profile fetch error" after registration

**Cause:** Database trigger not created  
**Fix:** Re-run the migration SQL in Supabase SQL Editor

### Issue: Tailwind styles not loading

**Cause:** CSS not imported correctly  
**Fix:** Ensure `src/index.css` exists and is imported in `index.tsx`

---

## 8️⃣ MONITORING & MAINTENANCE

### Monitor Edge Function Usage

```bash
# View function logs
supabase functions logs gemini-chat --follow
```

### Monitor Database Usage

1. Supabase Dashboard → Database → Usage
2. Check storage, bandwidth, and API requests

### Update Edge Functions

```bash
# After making changes to function code
supabase functions deploy gemini-chat
```

---

## 9️⃣ COST OPTIMIZATION

### Gemini API Costs

- Monitor usage at https://aistudio.google.com/app/billing
- Set up billing alerts
- Consider caching frequent queries

### Supabase Costs

- Free tier: 500MB database, 1GB file storage, 2GB bandwidth
- Upgrade to Pro ($25/mo) for production apps
- Enable Supabase Edge Function caching if available

---

## 🎯 PRODUCTION READY CHECKLIST

- [ ] Database schema deployed
- [ ] RLS policies enabled
- [ ] Email confirmation disabled
- [ ] Edge Functions deployed
- [ ] Edge Function secrets set
- [ ] Frontend environment variables set
- [ ] Frontend built and deployed
- [ ] Authentication tested
- [ ] Chat feature tested
- [ ] Material upload tested
- [ ] No console errors
- [ ] No exposed API keys
- [ ] Performance tested
- [ ] Mobile responsive tested

---

## 📞 SUPPORT

- **Supabase Issues:** https://github.com/supabase/supabase/discussions
- **Gemini API Issues:** https://ai.google.dev/gemini-api/docs/troubleshooting
- **Vite Issues:** https://vitejs.dev/guide/troubleshooting.html

---

**🎉 Congratulations! Your Lenn-AI app is now production-ready and secure!**