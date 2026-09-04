# HomeCare AI - Project Handoff Notes

Last updated: 2026-09-04

---

## Objective
Build comprehensive health/wellness application with AI assistant, health journey timeline, smart follow-up suggestions, security hardening, advanced AI features, and 3 killer features (AI Health Twin, Kitchen Pharmacy, Symptom Time Machine, Family War Room).

## Important Details
- Streaming chat endpoint: `POST /api/stream` returns SSE with markers `===STREAM_END===`, `===FOLLOWUPS||`, `===RELATED||`, `===LANG||`, `===SUGGESTIONS||`, `===PREVENTION||`, `===ERROR||`
- Backend push notifications use `pywebpush`; feature ABANDONED (401 errors on Render)
- VAPID keys (unused now):
  - Public: `BB-tQNbWgIEsw3AYnyVx0w-wTlmNXnQN4z8hYZZsReP94cmBDYCaz5AkWAq_X9P155IjsyM468CsIIj0JmGHVFs`
  - Private: `zuVOqJOOIpxjTthyIRyHPfIjk5bHI3cqDaRuIHRS_H0`
- `langdetect` removed from `language_detector.py` due to install issues
- Admin emails whitelist: `bossoftraning007@gmail.com`, `premcharantejtej@gmail.com`, `tejpersonal007007@gmail.com` (only 3 admins; `bossoftraning007` is NOT admin)
- Admin secret token: `PQjtStLZHnGYWSLR5ox_1cp75t20GOXeZk_xjfisfGo` (must be added to Render env)
- `SUPABASE_SERVICE_ROLE_KEY` must be added to Render env for admin user fetching
- RLS infinite recursion fixed with `is_admin()` security definer function (`fix_rls_recursion.sql`)
- CSP configured in `vercel.json` allowing `https://homecareai-backend.onrender.com` in `connect-src`
- Admin check uses 3 hardcoded emails + `admin_users` table for dynamic lookup
- API URL: `https://homecareai-backend.onrender.com`
- Frontend uses `useAuth` hook (from `@/lib/useAuth`), sends `x-user-id` header (not `access_token`)
- Library uses AI-generated original content (no copying from MSN to avoid copyright)
- Demo data fallback when API fails
- recharts for charts, framer-motion for animations, react-hot-toast for notifications, next-themes for dark mode
- User explicitly warned NOT to add `/safety` or `/responsible-ai` links in footer (pages don't exist)
- Manage-content merged into `/admin?tab=content` (no separate public route)
- Deploy: Vercel (frontend) + Render (backend), auto-deploy on push
- Build command: `npm run build --prefix C:\Users\WELCOME\homecareai\frontend`
- Stack: Next.js 16.2.12, FastAPI, Supabase, fpdf2

## 🚨 CRITICAL BUG FOUND (NOT YET FIXED)

**`.single()` method does NOT exist on Supabase Python SyncQueryRequestBuilder**

Affected routes (all return 500 silently when called):
- `backend/routes/family.py` lines 87, 103 (POST /family, DELETE /family/{id})
- `backend/routes/analytics.py` lines 15, 30
- `backend/routes/dashboard.py` line 202 (POST /api/dashboard/add-vital)
- `backend/routes/notifications.py` lines 151, 334
- `backend/routes/push.py` lines 75, 88
- `backend/routes/recovery.py` lines 61, 122, 168, 190, 220, 285
- `backend/routes/reminders.py` line 97
- `backend/routes/reports.py` lines 27, 91
- `backend/routes/symptom_timeline.py` lines 238, 281
- `backend/routes/timeline.py` line 56
- `backend/routes/wellness.py` lines 72, 75

**Error seen on Render:** `"detail":"'SyncQueryRequestBuilder' object has no attribute 'single'"`

**Fix:** Replace `.single().execute()` with `.execute()` and access first element of result.data array, OR use `.maybe_single()` if available.

This is why user said "can't save family members" - the POST endpoint returns 500.

## Deploy Status
- **Backend on Render:** SLOW auto-deploy. Last 3-4 commits needed manual empty commits to force redeploy. Symptom-timeline was deployed but family took 2 empty commits to land.
- **Vercel:** Strict TypeScript checks. Vercel build failed earlier because `useAuth()` returns `user: User | null` and 3 spots in `family/page.tsx` needed `if (!user) return` guards. Fixed in commit `99c8431`.

## Work State
### Completed
- Theme fix, Medication Tracker, Health Insights Dashboard, AI Engine streaming upgrade, Symptom Timeline + AI Patterns, Offline Mode, Push Notifications infra (abandoned)
- `frontend/app/chat/page.tsx` streaming: `fetch` replaces `axios`, parses SSE markers including `===SUGGESTIONS||` and `===PREVENTION||`
- `backend/services/ai_service.py` rewritten with streaming + SUGGESTIONS/PREVENTION parsing
- `backend/services/language_detector.py`, `backend/routes/stream.py` created
- `backend/prompts/system_prompt.txt` enhanced: 500+ symptoms, 2000+ remedies, knowledge categories, response format (Initial Assessment, Primary Recommendations, Nutrition Protocol, Red Flags, Prevention Strategies)
- Backend deploy fixes: removed `langdetect`, `webpush` → `pywebpush`, created `config/database.py` and `services/auth_service.py`
- Admin Dashboard (`frontend/app/admin/page.tsx`): 7 tabs, real Supabase tables, dark theme, ASCII-only, fixed loading-stuck bug via `authLoading` check. Fixed to use `${API_URL}/api/admin/users` and `${API_URL}/api/notifications/push/broadcast` (was using relative URLs that hit Vercel not Render).
- Admin API (`backend/routes/admin.py`): `/api/admin/users`, `/api/admin/stats`
- Articles admin router registered (cleaned duplicate import in `backend/main.py`)
- Professional User Profile (`frontend/app/profile/page.tsx`): Digital Health Card, 4 tabs, AI voice preferences, dietary filters, data export, dark/light mode
- Email notifications: `email_service.py` with SendGrid
- Scheduled reminders: `reminder_service.py`, `/reminders` page
- Analytics dashboard: `analytics_service.py`, `/analytics` page
- RLS fixes: `fix_rls_admin.sql`, `fix_rls_recursion.sql`
- Database schemas: `reminders_analytics_schema.sql`, `push_subscriptions_schema.sql`, `timeline_schema.sql`, `complete_setup.sql`, `wellness_tracker_schema.sql`, `dashboard_schema.sql`, `library_schema.sql`, `seed_articles.sql`, `seed_articles_part2.sql`, `content_manager_schema.sql`, `security_logs_schema.sql`, `health_twin_schema.sql`, `kitchen_remedies_schema.sql`, `symptom_timeline_schema.sql`, `family_schema.sql`
- My Health Journey: `database/timeline_schema.sql`, `backend/routes/timeline.py`, `backend/services/timeline_service.py`, `frontend/app/journey/page.tsx`
- Bug fixes: double prefix in reminders router, missing `days_of_week`, `get_user_id` reading `x-user-id` header
- UI: `components/Navbar.tsx` (updated quickActions with dashboard, sleep-mood, reports, library, family), `components/Sidebar.tsx`, `components/Footer.tsx`, redesigned `app/login/page.tsx`
- Build fixes: `@/context/AuthContext` → `@/lib/useAuth`, `access_token`/`token` → `x-user-id`
- AI Smart Follow-up: `suggestions` and `prevention` fields in `Message` type, clickable suggestion chips, prevention tip (green box)
- Security: `backend/middleware/security.py`, `vercel.json` CSP, `robots.txt`, `sitemap.xml`, `.htaccess`, `security.txt`
- Recovery plan fix: `getAuthHeaders()` added to `handlePredict` in `frontend/app/recovery/page.tsx`
- `database/add_suggestions_column.sql` for `suggestions JSONB` column
- Wellness tracker (`/api/wellness` GET/POST + `/api/wellness/insights`), reports (`/api/reports/weekly`, `/api/reports/monthly` PDF via fpdf2)
- Dashboard (`/api/dashboard`, quick-log, snooze-medication, add-vital, use-streak-freeze), `HealthReportPDF` class in `services/pdf_service.py`
- Pages: `/sleep-mood`, `/reports`, `/dashboard` (AI briefing, health score, quick log, med timeline), `/vitals`, `/goals` (XP, levels Bronze→Diamond, badges, streak freeze), `/library` (8 categories, search, featured), `/library/[slug]` (voice reader text-to-speech, uses `params: Promise<{slug: string}>`)
- Killer features deployed:
  - AI Health Twin (`backend/routes/health_twin.py`, `/health-twin` page): 7-day prediction, confidence score, risk level
  - Kitchen Pharmacy Scanner (`backend/routes/kitchen_remedies.py`, `/kitchen` page): 20 Indian home remedies seeded, ingredient matching with synonyms
  - Symptom Time Machine (`backend/routes/symptom_timeline.py`, `/symptom-timeline` page): interactive Q&A, emergency detection (CALL 108), root cause analysis with confidence scores
  - Family Health War Room (`backend/routes/family.py`, `/family` page): members, color-coded alerts (critical/warning/info), aggregated health scores, per-member avatar colors

### In Progress
- Investigating `.single()` bug affecting ~20 routes
- Force-deployed family route via empty commit (`0b1bbc5`), endpoint now returns 200 (empty list) but POST fails with 500

### Known Issues / Open
- `.single()` AttributeError in 11+ route files (see CRITICAL BUG above)
- Render auto-deploy is slow / sometimes doesn't trigger; user has had to push empty commits
- Local Next.js build fails on Windows (SWC worker incompatible); rely on Vercel Linux build + `npx tsc --noEmit` for type checks
- Push notification pages (`push-test`, `push-diag`, `test-notifications`) still exist in frontend but feature is abandoned; no harm but dead UI
- `lib/useAuth` returns `user: User | null` - every page calling `user.id` needs null guard (Vercel strict build catches this)
- `chat/page.tsx` already had multiple null guards; new pages must follow same pattern
- `journey/page.tsx` uses `process.env.NEXT_PUBLIC_API_URL` directly instead of `API_URL` constant (works but inconsistent)

## Schema Migrations To Run in Supabase SQL Editor
User confirmed they ran:
- ✅ `family_schema.sql` (Sept 4)

Still pending if not yet run:
- `kitchen_remedies_schema.sql`
- `symptom_timeline_schema.sql`
- `health_twin_schema.sql`
- `dashboard_schema.sql`
- `wellness_tracker_schema.sql`
- `library_schema.sql` + `seed_articles.sql` + `seed_articles_part2.sql`
- `reminders_analytics_schema.sql`
- `content_manager_schema.sql`
- `security_logs_schema.sql`
- `fix_rls_admin.sql`
- `fix_rls_recursion.sql`
- `add_suggestions_column.sql` (for AI suggestions JSONB)
- `timeline_schema.sql`

## Environment Variables To Add to Render
- `SUPABASE_SERVICE_ROLE_KEY` (for admin user listing)
- `ADMIN_SECRET_TOKEN` = `PQjtStLZHnGYWSLR5ox_1cp75t20GOXeZk_xjfisfGo`
- (Optional) `SENDGRID_API_KEY` for email notifications

## File Patterns
- Frontend pages: `frontend/app/{route}/page.tsx`
- Backend routes: `backend/routes/{name}.py`, registered in `backend/main.py` with `app.include_router(X, prefix="/api")`
- DB schemas: `database/{name}_schema.sql`
- API base: `const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://homecareai-backend.onrender.com"`
- Auth: `import { useAuth } from "@/lib/useAuth"`; destructure `const { user, loading: authLoading } = useAuth()`
- API calls: `headers: { "x-user-id": user.id }` (NOT access_token)

## Test Commands
```bash
# TypeScript check (works on Windows)
cd frontend && npx tsc --noEmit

# Test backend route
Invoke-RestMethod -Uri "https://homecareai-backend.onrender.com/api/family/war-room" -Headers @{"x-user-id"="test"} -Method GET
```

## Next Steps (When Resuming)
1. **URGENT:** Fix `.single()` calls in all 11+ backend files. Replace with `.execute()` and use `result.data[0] if result.data else None` pattern.
2. Test family POST / DELETE end-to-end after fix.
3. Test recovery, reminders, wellness, dashboard add-vital flows (all use .single()).
4. Verify all schema migrations ran in Supabase.
5. Continue with next killer feature or polish existing.

## Recent Commits
```
0b1bbc5 fix: force backend redeploy - family route missing on Render
feecae5 chore: trigger Render redeploy for family router
99c8431 fix: add null checks for user in family page
716977d feat: Family Health War Room - track family members, color-coded alerts, aggregated health scores
7389ae9 feat: Symptom Time Machine - Root Cause Analysis (Killer #3)
6d8b312 feat: Kitchen Pharmacy Scanner - AI matches ingredients to home remedies (Killer #2)
2f6f509 feat: AI Health Twin - Predictive Health Model (Killer Feature #1)
```
