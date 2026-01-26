# Implementation Plan: Fix Post-Midnight Dashboard Issues

## Goal
Fix timezone mismatch causing incorrect "today" counts and replace News card with Video Tutorials.

## Steps

### Step 1: Create Timezone Utility Function
**File:** `lib/timezone.ts` (new)
**Change:** Create a utility to calculate Kenya midnight correctly

### Step 2: Fix Metrics API Timezone
**File:** `app/api/admin/metrics/route.ts`
**Changes:**
- Import timezone utility
- Use Kenya-aware "today" calculation for all queries
- Replace news metrics with video_tutorials count

### Step 3: Fix Referrals API Timezone  
**File:** `app/api/admin/referrals/route.ts`
**Change:** Use Kenya-aware "today" calculation

### Step 4: Replace News Card with Video Tutorials
**File:** `app/admin/dashboard/page.tsx`
**Changes:**
- Replace News card (lines 255-288) with Video Tutorials card
- Update icon from `TrendingUp` to `Video`
- Update metrics state type to use `videoTutorials` instead of `news`

### Step 5: Update CHANGELOG
**File:** `CHANGELOG.md`

### Step 6: Verify Build
**Command:** `npm run build`

---

**Status:** APPROVED (proceeding with execution)
