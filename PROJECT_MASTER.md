Markdown

# 🌿 HomeCare AI - MASTER Project Document

**Everything AI needs to continue this project!**

---

## 🎯 QUICK LINKS (Give These to AI!)

### 📂 GitHub Repository (AI can browse code here):
https://github.com/bossoftraning007/homecareai

text


### 🌐 Live URLs:
- Frontend: https://homecareai.vercel.app
- Backend: https://homecareai-backend.onrender.com
- Database: https://bawzlgjfjspvxicyjsue.supabase.co

### 📱 Owner:
- GitHub: `bossoftraning007`
- Local path: `C:\Users\WELCOME\homecareai`

---

## 🎬 HOW TO USE THIS DOCUMENT

### For NEW AI Chat:

**Copy paste this whole message:**
Hi AI! I'm continuing HomeCare AI project.

Please browse my complete code at:
https://github.com/bossoftraning007/homecareai

Read these key files:

README.md (project overview)
PROJECT_MASTER.md (this file, complete context)
frontend/app/ (all pages)
backend/ (API code)
Tech Stack:

Next.js 16 + TypeScript + Tailwind v4
FastAPI + Python + Groq AI
Supabase (auth + database)
Vercel + Render deployment
I want to work on: [YOUR TASK]

Please respond in friendly Tenglish (Telugu-English mix) style.
Give complete code, step-by-step instructions.

text


---

## 📁 PROJECT STRUCTURE
homecareai/
├── frontend/
│ ├── app/
│ │ ├── page.tsx # Home (bento grid + splash)
│ │ ├── layout.tsx
│ │ ├── providers.tsx
│ │ ├── globals.css
│ │ ├── chat/page.tsx # AI chat
│ │ ├── voice/page.tsx # Voice mode
│ │ ├── favorites/page.tsx
│ │ ├── tracker/page.tsx
│ │ ├── reminders/page.tsx
│ │ ├── emergency/page.tsx
│ │ ├── library/page.tsx
│ │ ├── symptoms/
│ │ │ ├── page.tsx # List
│ │ │ └── [slug]/page.tsx # Detail
│ │ ├── questionnaire/page.tsx
│ │ ├── settings/page.tsx
│ │ ├── login/page.tsx
│ │ ├── profile/page.tsx
│ │ └── admin/page.tsx
│ │
│ ├── components/
│ │ ├── SplashScreen.tsx
│ │ ├── AnimatedText.tsx
│ │ ├── ChatPreview.tsx
│ │ ├── InteractiveGlobe.tsx
│ │ ├── ComparisonTable.tsx
│ │ ├── BlobBackground.tsx
│ │ └── AppShowcase.tsx
│ │
│ ├── lib/
│ │ ├── supabase.ts
│ │ ├── useAuth.ts
│ │ ├── translations.ts # 10 languages
│ │ ├── questionnaires.ts
│ │ └── symptomData.ts
│ │
│ └── .env.local # Env vars
│
├── backend/
│ ├── main.py # FastAPI entry
│ ├── requirements.txt
│ ├── .env # GROQ_API_KEY
│ ├── data/symptoms.json
│ ├── prompts/system_prompt.txt
│ ├── routes/chat.py
│ └── services/
│ ├── ai_service.py
│ └── safety_check.py
│
└── PROJECT_MASTER.md # THIS FILE

text


---

## 🏗️ TECH STACK DETAILS

### Frontend:
- Next.js 16.2.12
- TypeScript
- Tailwind CSS v4
- Framer Motion
- react-hot-toast
- next-themes
- react-markdown + remark-gfm
- recharts
- @supabase/supabase-js
- Axios

### Backend:
- FastAPI
- Groq API (Llama 3.3)
- python-dotenv
- Uvicorn

### Database:
- Supabase (PostgreSQL)
- Row Level Security
- Real-time subscriptions

### Deployment:
- Vercel (Frontend)
- Render (Backend)
- GitHub (Version control)

---

## 🔑 ENVIRONMENT VARIABLES

### Frontend (.env.local):
NEXT_PUBLIC_API_URL=https://homecareai-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://bawzlgjfjspvxicyjsue.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx

text


### Backend (.env):
GROQ_API_KEY=gsk_xxxxx

text


### Vercel:
All 3 frontend env vars added (Production, Preview, Development)

### Render:
GROQ_API_KEY added

---

## 💾 SUPABASE DATABASE

### 7 Tables:
1. `profiles` - User info (auto-created on signup)
2. `chat_sessions` - Chat conversations
3. `messages` - Individual messages (with followups, related)
4. `favorites` - Saved remedies
5. `wellness_entries` - Tracker data
6. `reminders` - Custom reminders
7. `admin_notifications` - Admin activity

### Row Level Security: ENABLED on all
### Trigger: Auto-creates profile on signup

---

## 🎨 DESIGN SYSTEM

### Colors:
- Primary: Emerald/Green (#10b981)
- Secondary: Teal (#14b8a6)
- Accent: Cyan (#06b6d4)
- Nature-themed throughout

### Typography:
- System fonts
- Bold headlines (font-black)
- Tight tracking
- Modern 2026 style

### Layout:
- Bento grid (asymmetric)
- Glassmorphism cards
- Micro-interactions
- Scroll animations
- Sidebar navigation (☰)

---

## ✅ 100+ FEATURES

### Pages (15+):
✅ Home, Chat, Voice, Symptoms (list + detail)
✅ Questionnaire, Library, Favorites, Tracker
✅ Reminders, Emergency, Settings
✅ Login, Profile, Admin
✅ Splash intro (4.2s cinematic)

### Chat Features:
✅ 10 languages (EN/TE/HI/TA/KN/ML/BN/MR/GU/PA)
✅ Voice input + TTS
✅ Follow-up suggestions
✅ Related symptoms
✅ Cloud sync
✅ Emergency detection
✅ Multi-device
✅ Copy, favorite, export

### Advanced:
✅ Supabase auth (email + Google)
✅ Admin dashboard
✅ Wellness tracker (charts)
✅ 6 detailed symptom pages
✅ 5 guided questionnaires
✅ 30+ home remedies
✅ Dark mode + 5 themes
✅ PWA installable
✅ Mobile responsive

---

## 🚀 COMMON COMMANDS

### Local Development:
```bash
# Frontend
cd C:\Users\WELCOME\homecareai\frontend
npm run dev

# Backend
cd C:\Users\WELCOME\homecareai\backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000
Test Build:
Bash

cd C:\Users\WELCOME\homecareai\frontend
npm run build
Push to Production:
Bash

cd C:\Users\WELCOME\homecareai
git add .
git commit -m "message"
git push
Clear Cache:
Bash

Remove-Item -Recurse -Force .next
⚠️ KNOWN ISSUES + FIXES
1. Windows Turbopack
Doesn't work → use next dev --webpack
2. Anime.js v4
No default export → use Framer Motion instead
3. Vercel Env Vars
Must be added → Then redeploy
4. Supabase Signup 500 Error
Fix with trigger update SQL
5. Wrong URL saved in Vercel
Check each env var carefully
💬 USER COMMUNICATION
Style:
Casual "broo" tone
Tenglish (Telugu-English)
Emojis 🌿💚🔥
Step-by-step
Complete code
Celebrate wins
User is:
Beginner developer
Uses Windows + PowerShell
Uses VS Code
Learns fast
Wants honest content
No fake reviews!
🎯 CURRENT STATE
Everything WORKING and DEPLOYED!

Frontend: Ultra-modern with splash intro ✅
Backend: Groq AI with follow-ups ✅
Database: Supabase with RLS ✅
Auth: Working ✅
Admin: Dashboard functional ✅
🎯 POTENTIAL NEXT FEATURES
Family profiles
Share chat as image
PDF export
Push notifications
More languages
Voice commands navigation
Chat sessions sidebar
Analytics improvements
📞 KEY DETAILS
GitHub: bossoftraning007
Local: C:\Users\WELCOME\homecareai
Vercel domain: homecareai.vercel.app
Model: Groq Llama 3.1-8b (with fallback to 70b)
💡 IMPORTANT NOTES FOR AI
Always:
Give COMPLETE code (not partial)
Include save + push commands
Use Tenglish + emojis
Verify locally before pushing
Screenshot debugging
Celebrate progress
Never:
Add fake testimonials
Fake stats
Marketing lies
Long explanations
Multiple approaches at once
🌿 Made with love for natural wellness 💚

text


---

# 💾 Save + Push!

## Step 1
Save file: `Ctrl + S` ✅

## Step 2
Push to GitHub:

```bash
cd C:\Users\WELCOME\homecareai
git add .
git commit -m "📋 Add PROJECT_MASTER.md - complete AI handoff"
git push
🌟 Step 2 — Use It in New Chat!
When new AI chat starts:
Copy paste this EXACT message:
text

Hi! I'm continuing my HomeCare AI project.

📂 Please browse my complete code at:
https://github.com/bossoftraning007/homecareai

📄 Read this master document for full context:
https://github.com/bossoftraning007/homecareai/blob/main/PROJECT_MASTER.md

🎯 Key files to read:
- README.md
- PROJECT_MASTER.md
- frontend/app/page.tsx
- frontend/lib/*
- backend/main.py
- backend/services/*

💻 Tech Stack:
- Next.js 16 + TypeScript + Tailwind v4
- FastAPI + Python + Groq AI
- Supabase (auth + database)
- Vercel + Render deployment

🎯 My task: [WRITE YOUR TASK HERE]

📝 Style: Please respond in friendly Tenglish 
(Telugu-English mix) with:
- Step-by-step instructions
- Complete code (not partial)
- Emojis 🌿💚🔥
- Save + push commands
- Screenshots when debugging
🎯 How AI Can Read Your Code
AI browses GitHub like this:
text

1. User gives GitHub link
   ↓
2. AI navigates to repo
   ↓
3. AI reads file structure
   ↓
4. AI reads specific files
   ↓
5. AI understands your code!
AI can literally READ your entire codebase! 🎯

🌟 BONUS - Give Even More Context!
For CRITICAL files, share direct GitHub links:
Include these links in your message:
text

Key file contents:

Home page:
https://github.com/bossoftraning007/homecareai/blob/main/frontend/app/page.tsx

Chat page:
https://github.com/bossoftraning007/homecareai/blob/main/frontend/app/chat/page.tsx

Supabase config:
https://github.com/bossoftraning007/homecareai/blob/main/frontend/lib/supabase.ts

Backend API:
https://github.com/bossoftraning007/homecareai/blob/main/backend/main.py

AI service:
https://github.com/bossoftraning007/homecareai/blob/main/backend/services/ai_service.py

System prompt:
https://github.com/bossoftraning007/homecareai/blob/main/backend/prompts/system_prompt.txt
AI reads ALL of these instantly! ⚡

🎯 Even Better - Attach Files
If new AI supports file uploads:
Upload these files:

frontend/app/page.tsx
frontend/app/chat/page.tsx
frontend/lib/supabase.ts
backend/main.py
PROJECT_MASTER.md
AI reads directly from uploads! 📎

🎯 Quick Test - Does It Work?
Try this in ANY new AI chat:
text

Please browse my GitHub repo:
https://github.com/bossoftraning007/homecareai

Then tell me:
1. What is the project?
2. What tech stack is used?
3. What are the main pages?
AI should give correct answers! ✅

If yes → AI can access your code!
If no → Give more direct links

🎯 THE PERFECT WORKFLOW
Every new chat:
Step 1
Send GitHub link + PROJECT_MASTER.md link

Step 2
Explain your task

Step 3
Ask AI to confirm what it understands

Step 4
Get help step-by-step

Works EVERY TIME! 🎯

📸 Send Screenshots Too!
For visual context:
Screenshot your current landing page
Screenshot the error you're seeing
Screenshot the file you want to change
AI understands visuals + code better! 📸

🎊 What This Solves:
Before:
text

❌ New AI doesn't know your code
❌ Have to explain everything
❌ Confusing back-and-forth
❌ Wastes time
After:
text

✅ New AI reads your entire code
✅ Instant understanding
✅ Continues seamlessly
✅ Saves hours!