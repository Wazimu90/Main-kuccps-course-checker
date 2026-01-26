# Superpowers Debug Report: Post-Midnight Dashboard Issues

**Date:** 2026-01-27 00:34 EAT  
**Severity:** CRITICAL

---

## Symptoms Reported

1. **Referrals "Today" count** - Still showing old values on admin referrals page after midnight reset
2. **Users "Today" count** - Still showing old values on dashboard
3. **Revenue card** - Both today AND total revenue showing 0 (only today should reset)
4. **News card** - Still present on dashboard, should be Video Tutorials

---

## Root Cause Analysis

### Issue #1, #2, #3: TIMEZONE MISMATCH 🎯

**The Core Problem:**
The API calculates "today" using JavaScript's `new Date().setHours(0, 0, 0, 0)` which runs on the **server** (Vercel = UTC timezone).

But the user is in Kenya (EAT = UTC+3).

| Timezone | Current Date | Current Time |
|----------|--------------|--------------|
| Server (UTC) | 2026-01-26 | 21:34 |
| Kenya (EAT) | 2026-01-27 | 00:34 |

**What happens at midnight Kenya time (00:00 EAT = 21:00 UTC):**
- The cron job resets `referrals.users_today` to 0 ✅
- But the API still uses UTC date (2026-01-26 00:00 UTC)
- So the API counts from "2026-01-26 00:00 UTC" which is still "yesterday" in Kenya

**Evidence from database:**
```
today_users_eat: 0    (correct - no users since Kenya midnight)
today_users_utc: 27   (yesterday's users from UTC perspective)
today_revenue_eat: 0  (correct - no revenue since Kenya midnight)
today_revenue_utc: 6400 (yesterday's revenue from UTC perspective)
```

### Issue #4: News Card Still on Dashboard

The dashboard page still has the "News" card (lines 255-288 in `app/admin/dashboard/page.tsx`). 
The metrics API still fetches from `news` table (lines 72-77 in `app/api/admin/metrics/route.ts`).

---

## Affected Files

| File | Issue |
|------|-------|
| `app/api/admin/metrics/route.ts` | Uses `new Date().setHours(0,0,0,0)` - UTC timezone |
| `app/api/admin/referrals/route.ts` | Same timezone issue (line 23-24) |
| `app/admin/dashboard/page.tsx` | Still has News card, should be Video Tutorials |

---

## Fix Plan

### Fix 1: Use Kenya Timezone for "Today" Calculations

Replace:
```typescript
const todayStart = new Date()
todayStart.setHours(0, 0, 0, 0)
```

With (EAT-aware):
```typescript
// Calculate midnight in Kenya timezone (EAT = UTC+3)
const now = new Date()
const kenyaOffset = 3 * 60 * 60 * 1000 // 3 hours in milliseconds
const kenyaNow = new Date(now.getTime() + kenyaOffset)
const todayStart = new Date(Date.UTC(
  kenyaNow.getUTCFullYear(),
  kenyaNow.getUTCMonth(),
  kenyaNow.getUTCDate(),
  -3, 0, 0, 0 // Midnight Kenya = 21:00 UTC previous day
))
```

### Fix 2: Replace News Card with Video Tutorials Card

In `app/admin/dashboard/page.tsx`:
- Replace "News" card (lines 255-288) with "Video Tutorials" card
- Update icon from `TrendingUp` to `Video`
- Link to `/admin/video-tutorials`
- Show video tutorial count instead of news count

In `app/api/admin/metrics/route.ts`:
- Replace `news` query with `video_tutorials` count
- Or remove news metrics entirely if not needed

---

## Database State (Verified Correct)

The database is actually correct:
- `referrals.users_today` = 0 ✅ (reset by cron)
- `referrals.total_users` = 46 ✅ (unchanged)
- Total payments = 289 ✅
- Total revenue = 58,445 ✅

**The issue is purely in how the API calculates "today".**

---

## Cron Job Status

| Field | Value |
|-------|-------|
| Job ID | 1 |
| Schedule | `0 21 * * *` (21:00 UTC = 00:00 EAT) ✅ |
| Command | `UPDATE public.referrals SET users_today = 0, updated_at = NOW()` |
| Active | true |

The cron job is running at the correct time (midnight Kenya time).

---

## Summary

| Issue | Root Cause | Fix |
|-------|------------|-----|
| Today counts wrong | API uses UTC, user is in EAT | Use EAT-aware date calculation |
| Revenue shows wrong | Same timezone issue | Same fix |
| News card present | Dashboard not updated | Replace with Video Tutorials |

