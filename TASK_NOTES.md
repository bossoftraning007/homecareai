# Task Notes

## 1. Theme Fix (5 min)
**What:** Added 7 popular color themes + fixed CSS to apply theme colors globally.
**How:** Extended `themes` array in `app/settings/page.tsx` with gradient configs; added `.theme-*` CSS classes in `globals.css`.
**Benefit:** Users can personalize app appearance with one click. Themes persist via localStorage and apply across all pages.

## 2. Medication Tracker (30-45 min)
**What:** Full CRUD medication tracking page with cloud sync.
**How:** `/medications` page — users enter name, dosage, frequency, times, notes. Saves to Supabase when logged in, localStorage for guests. Toggle active/inactive, edit, delete.
**Benefit:** Never miss a medication. Works offline for guest users. Cloud sync for logged-in users across devices.

## 3. Health Insights Dashboard (45-60 min)
**What:** AI-powered health analytics dashboard aggregating data from tracker + medications.
**How:** `/insights` page — pulls wellness entries (mood, water, sleep, exercise) + medications from Supabase/localStorage. Shows charts (recharts), stats grid (8 metrics), medication overview, and an "AI Insights" button that sends data to backend for analysis.
**Benefit:** Users see health patterns at a glance. AI provides personalized recommendations based on real data trends.

## 4. Enhanced AI Engine (2-3 hrs)
**What:** Fixed broken AI chat (model 404 errors) + added robust multi-provider fallback.
**How:** Updated `backend/services/ai_service.py` to use current Groq model names (`openai/gpt-oss-120b` primary). Error handling now catches 404/model_not_found → tries next model instead of crashing.
**Benefit:** Chat works reliably. AI responds to symptoms, provides natural remedies, follow-up questions, and related conditions.

## 5. Symptom Timeline + AI Patterns (1.5-2 hrs)
**What:** Symptom timeline extracted from chat history with AI pattern analysis.
**How:** `/symptoms-timeline` page — scans chat messages for symptom keywords, displays chronological timeline, shows frequency bars and activity charts. "Analyze Patterns" button sends data to AI for insights.
**Benefit:** Users see when symptoms occur, which ones repeat, and get AI insights about triggers and patterns.

## 6. Offline Mode (1-1.5 hrs)
**What:** PWA service worker + offline UI for full offline functionality.
**How:** Custom `public/sw.js` caches static assets (cache-first), API responses (network-first), pages (offline fallback). `OfflineIndicator` shows online/offline status. `/offline` fallback page. Auto-registers in production.
**Benefit:** App works fully offline after first load. PWA-installable on mobile. Cached data persists. Graceful offline UX.
