# 🌿 HomeCare AI - Complete Project Handoff v3

**Latest Update:** Live Health Twin + Push Notification System (in progress)

---

## 👋 START HERE (For Next AI)

Hi AI! You're helping continue **HomeCare AI** project.

User is a **beginner web developer** who:
- Writes in **Tenglish** (Telugu-English mix)
- Uses casual "broo" tone with lots of emojis
- Learns step-by-step with exact terminal commands
- Uses **Windows PowerShell/CMD** + **VS Code**
- Loves encouragement and celebration
- Doesn't want fake content (honest healthcare app)

**Continue in same friendly, step-by-step Tenglish style!**

---

## 📌 PROJECT OVERVIEW

**Name:** HomeCare AI  
**Purpose:** AI-powered wellness assistant with natural remedies  
**Status:** ✅ LIVE with 120+ features!  
**Ethics:** Honest, no fake reviews, no marketing lies

---

## 🌍 LIVE URLs

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | https://homecareai.vercel.app |
| **Backend (Render)** | https://homecareai-backend.onrender.com |
| **Database (Supabase)** | https://bawzlgjfjspvxicyjsue.supabase.co |
| **GitHub** | https://github.com/bossoftraning007/homecareai |

---

## 🏗️ TECH STACK

### Frontend (Next.js on Vercel):
- Next.js 16.2.12 (App Router, Webpack NOT Turbopack)
- TypeScript
- Tailwind CSS v4
- Framer Motion (animations)
- react-hot-toast (notifications)
- react-markdown + remark-gfm
- next-themes (dark mode)
- recharts (charts)
- @supabase/supabase-js
- Axios

### Backend (FastAPI on Render):
- FastAPI (Python)
- Groq API (Llama 3.3)
- Uvicorn
- python-dotenv
- pywebpush (push notifications)

### Database (Supabase):
- PostgreSQL
- Row Level Security
- Authentication (email + Google OAuth ready)
- Real-time subscriptions

---

## 📁 COMPLETE PROJECT STRUCTURE

```
homecareai/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                    # Premium Landing (/)
│   │   ├── layout.tsx                  # With Providers
│   │   ├── providers.tsx               # next-themes wrapper
│   │   ├── globals.css                 # Tailwind v4 + animations
│   │   ├── home/page.tsx               # Bento Grid (/home)
│   │   ├── chat/page.tsx               # AI Chat with streaming
│   │   ├── voice/page.tsx              # Voice-only mode
│   │   ├── favorites/page.tsx          # Saved remedies (cloud sync)
│   │   ├── tracker/page.tsx            # Wellness tracker (cloud sync)
│   │   ├── medications/page.tsx        # Medication tracker
│   │   ├── insights/page.tsx           # Health insights dashboard
│   │   ├── symptoms-timeline/page.tsx  # Symptom timeline + AI patterns
│   │   ├── reminders/page.tsx          # Custom reminders
│   │   ├── recovery/page.tsx           # 🧬 Live Health Twin (NEW!)
│   │   ├── emergency/page.tsx          # Emergency contacts
│   │   ├── library/page.tsx            # Remedy library
│   │   ├── symptoms/
│   │   │   ├── page.tsx                # Symptoms list
│   │   │   └── [slug]/page.tsx         # Individual symptom pages
│   │   ├── questionnaire/page.tsx      # Guided assessment
│   │   ├── settings/page.tsx           # Themes + preferences
│   │   ├── login/page.tsx              # Auth (email + Google)
│   │   ├── profile/page.tsx            # User profile
│   │   ├── admin/page.tsx              # Admin dashboard
│   │   ├── analytics/page.tsx          # Notification analytics
│   │   ├── test-notifications/page.tsx # Push notification debug
│   │   ├── push-diag/page.tsx          # Push diagnostic tool
│   │   ├── api/
│   │   │   ├── notifications/push/
│   │   │   │   ├── subscribe/route.ts  # Push subscribe proxy
│   │   │   │   ├── unsubscribe/route.ts
│   │   │   │   └── broadcast/route.ts  # Push broadcast proxy
│   │   │   └── admin/users/route.ts    # Admin users proxy
│   │   │
│   │   ├── components/
│   │   │   ├── SplashScreen.tsx        # 4.2s cinematic intro
│   │   │   ├── OfflineIndicator.tsx    # Online/offline status
│   │   │   ├── useServiceWorker.ts     # SW registration hook
│   │   │   ├── usePushNotifications.ts # Push notification hook
│   │   │   ├── PushNotificationManager.tsx
│   │   │   └── NotificationBell.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── supabase.ts             # Supabase client
│   │   │   ├── useAuth.ts              # Auth hook
│   │   │   ├── translations.ts         # 10 languages
│   │   │   ├── questionnaires.ts       # 5 symptom questionnaires
│   │   │   └── symptomData.ts          # Detailed symptoms
│   │   │
│   │   ├── public/
│   │   │   ├── sw.js                   # Service worker (push handler)
│   │   │   ├── manifest.json           # PWA config
│   │   │   └── logo.svg
│   │   │
│   │   ├── .env.local
│   │   ├── package.json
│   │   └── next.config.ts
│   │
│   ├── backend/
│   │   ├── main.py                     # FastAPI + CORS + rate limiter
│   │   ├── requirements.txt
│   │   ├── .env
│   │   ├── prompts/system_prompt.txt   # AI persona
│   │   ├── config/
│   │   │   └── database.py             # Supabase client config
│   │   ├── routes/
│   │   │   ├── chat.py                 # POST /api/chat
│   │   │   ├── stream.py               # POST /api/stream (SSE)
│   │   │   ├── push.py                 # Push notification endpoints
│   │   │   ├── recovery.py             # Recovery plan endpoints
│   │   │   ├── reminders.py            # Reminder endpoints
│   │   │   ├── analytics.py            # Analytics endpoints
│   │   │   ├── admin.py                # Admin endpoints
│   │   │   ├── auth_webhook.py         # Auth webhook
│   │   │   └── notifications.py        # Notification endpoints
│   │   │
│   │   └── services/
│   │       ├── ai_service.py           # Groq with fallback
│   │       ├── language_detector.py    # Language detection
│   │       ├── push_service.py         # Push notification service
│   │       ├── recovery_service.py     # Recovery prediction engine
│   │       ├── reminder_service.py     # Reminder service
│   │       ├── analytics_service.py    # Analytics tracking
│   │       ├── email_service.py        # SendGrid email service
│   │       ├── auth_service.py         # JWT authentication
│   │       └── safety_check.py         # Red flag detection
│   │
│   ├── database/
│   │   ├── reminders_analytics_schema.sql
│   │   ├── recovery_twin_schema.sql    # Recovery plans + milestones
│   │   ├── push_subscriptions_schema.sql
│   │   ├── fix_rls_admin.sql
│   │   └── fix_rls_recursion.sql
│   │
│   ├── AI_HANDOFF_v3.md                # THIS FILE
│   └── README.md
```

---

## ✅ ALL FEATURES BUILT (120+)

### 📄 Pages (20+):
1. **Home** (/) - Premium landing with splash intro
2. **Dashboard** (/home) - Bento grid + symptoms
3. **Chat** (/chat) - AI streaming chat
4. **Voice** (/voice) - Hands-free mode
5. **Favorites** (/favorites) - Saved remedies
6. **Tracker** (/tracker) - Wellness charts
7. **Medications** (/medications) - Medication tracker
8. **Insights** (/insights) - Health analytics
9. **Symptom Timeline** (/symptoms-timeline) - Pattern analysis
10. **Reminders** (/reminders) - Custom reminders
11. **Recovery** (/recovery) - 🧬 Live Health Twin (NEW!)
12. **Emergency** (/emergency) - Helplines
13. **Library** (/library) - Remedy library
14. **Symptoms** (/symptoms) - Symptom list
15. **Symptom Detail** (/symptoms/[slug]) - Full guide
16. **Questionnaire** (/questionnaire) - Guided assessment
17. **Settings** (/settings) - Themes + preferences
18. **Login** (/login) - Auth
19. **Profile** (/profile) - User dashboard
20. **Admin** (/admin) - Admin dashboard
21. **Analytics** (/analytics) - Notification analytics
22. **Test Notifications** (/test-notifications) - Debug tool
23. **Push Diagnostic** (/push-diag) - Push diagnostic

### 🧬 Live Health Twin Features:
- **Recovery Plans** - Create plans for symptoms + remedies
- **Predicted Timeline** - AI-generated recovery milestones
- **Daily Logging** - Track symptom severity + energy
- **Progress Tracking** - % complete, symptom relief, trend
- **Milestone System** - Auto-calculated checkpoints
- **10 Symptoms** supported (cold, cough, headache, fever, etc.)
- **13 Remedies** supported (honey lemon, ginger tea, etc.)
- **Severity-based Predictions** - 1-5 scale affects timeline

### 📊 Database Tables (12):
1. `profiles` - User profiles
2. `chat_sessions` - Chat conversations
3. `messages` - Individual messages
4. `favorites` - Saved remedies
5. `wellness_entries` - Tracker data
6. `reminders` - Custom reminders
7. `notification_analytics` - Notification stats
8. `recovery_plans` - Recovery plans (NEW!)
9. `recovery_milestones` - Recovery milestones (NEW!)
10. `recovery_logs` - Daily progress logs (NEW!)
11. `push_subscriptions` - Push subscriptions (NEW!)
12. `admin_notifications` - Admin activity log

### 🔌 API Routes:
- `POST /api/chat` - AI chat
- `POST /api/stream` - SSE streaming chat
- `POST /api/push/subscribe` - Subscribe to push
- `POST /api/push/unsubscribe` - Unsubscribe
- `POST /api/push/broadcast` - Broadcast notification
- `GET /api/push/subscriptions` - List subscriptions
- `POST /api/recovery/plans` - Create recovery plan
- `GET /api/recovery/plans` - List plans
- `GET /api/recovery/plans/{id}` - Plan details
- `POST /api/recovery/plans/{id}/log` - Add daily log
- `POST /api/recovery/plans/{id}/complete` - Complete plan
- `POST /api/recovery/predict` - Preview recovery timeline
- `GET /api/admin/users` - Admin: list users
- `GET /api/admin/stats` - Admin: get stats

---

## 🔑 ENVIRONMENT VARIABLES

### Frontend (Vercel):
```
NEXT_PUBLIC_API_URL=https://homecareai-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://bawzlgjfjspvxicyjsue.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_rYSuxEBSrlYAoAulof6BRg_0zhhbOvk
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BMvvfSdxU1PtLukDHAh0otzmuicitJF6tkzWxOF7lFZLD3yF_mwWTpFWptgh96fEdIUgCeS6vehf0FgfttG2kMQ
```

### Backend (Render):
```
GROQ_API_KEY=gsk_xxxxx
SUPABASE_URL=https://bawzlgjfjspvxicyjsue.supabase.co
SUPABASE_ANON_KEY=sb_publishable_xxxxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxx
VAPID_PUBLIC_KEY=BMvvfSdxU1PtLukDHAh0otzmuicitJF6tkzWxOF7lFZLD3yF_mwWTpFWptgh96fEdIUgCeS6vehf0FgfttG2kMQ
VAPID_PRIVATE_KEY=kTN1-XxFGPRcWENOAw-iTToITdHVJd2Ov1PBAXwJxTM
```

---

## 🚀 COMMON COMMANDS

### Frontend dev:
```bash
cd C:\Users\WELCOME\homecareai\frontend
npm run dev
```

### Backend dev:
```bash
cd C:\Users\WELCOME\homecareai\backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Push to production:
```bash
cd C:\Users\WELCOME\homecareai
git add .
git commit -m "Your message"
git push
```

---

## ⚠️ KNOWN ISSUES / QUIRKS

1. **Push Notifications** - Currently debugging (subscription works, broadcast fails)
2. **Anime.js** - Use Framer Motion instead
3. **Windows Turbopack** - Use `next dev --webpack`
4. **Supabase RLS** - Service role key needed for push subscriptions
5. **VAPID Keys** - Must match between frontend and backend

---

## 🎯 CURRENT STATUS

### ✅ Working:
- Live Health Twin (recovery plans, milestones, logging)
- Push notification subscription
- Push notification saving to database
- All 20+ pages
- AI chat with streaming
- Cloud sync
- User authentication

### 🔄 In Progress:
- Push notification broadcasting (auth works, broadcast endpoint fails)
- Device notification display

### 📋 TODO:
- Fix push broadcast endpoint
- Add sound to notifications
- iOS PWA support for push

---

## 💬 USER COMMUNICATION STYLE

**DO:**
- Casual "broo" tone
- Tenglish (Telugu-English mix)
- Lots of emojis 🌿💚🔥
- Step-by-step numbered instructions
- Complete code (not diffs)
- Celebrate wins 🎉🏆

**DON'T:**
- Long theoretical explanations
- Assume user knows things
- Multiple approaches at once
- Formal professional tone

---

## 📊 DEVELOPMENT HISTORY

### ✅ Phase 1-5: Core App (100+ features)
### ✅ Phase 6A: Live Health Twin
- Recovery plans with AI predictions
- Milestone tracking
- Daily logging system

### 🔄 Phase 6B: Push Notifications (IN PROGRESS)
- VAPID key setup
- Service worker with push handler
- Subscription saving
- Broadcast endpoint (debugging)

---

## 🌟 KEY LEARNINGS

### Push Notifications:
- VAPID keys must match between frontend and backend
- Service worker must be at root (`/sw.js`)
- RLS requires service role key for anonymous operations
- API routes must forward Authorization header
- Notifications only show when browser is closed/minimized

### Recovery Prediction:
- Base recovery hours vary by symptom-remedy combination
- Severity multiplier (1-5) affects timeline
- Milestones auto-calculate based on total hours
- Progress tracked via time elapsed + symptom improvement

---

## 📞 QUICK REFERENCE

- **GitHub:** bossoftraning007
- **Project path:** C:\Users\WELCOME\homecareai
- **Vercel domain:** homecareai.vercel.app
- **Groq Model:** openai/gpt-oss-120b
- **VAPID Keys:** Generated via `web-push generate-vapid-keys`

---

🌿 Made with love for natural wellness 💚

**Last Updated:** After Live Health Twin + Push notification setup
**Status:** LIVE & WORKING (push notifications in progress)
**Total Features:** 120+
**Total Pages:** 20+
