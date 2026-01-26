# Superpowers Debug Report: Referrals Not Showing on Admin Dashboard

**Date:** 2026-01-26  
**Severity:** CRITICAL

---

## Symptom

Older agents' referrals are not showing correctly on the admin dashboard and referral sections, while a new agent's (Stephen/ref_06) referrals are appearing correctly. The `users_today` and `total_users` counts in the referrals table don't match the actual payment records.

---

## Repro Steps

1. Navigate to Admin Dashboard → Referrals section
2. Compare "Today" and "Total" counts displayed for each agent
3. Note: Older agents like "Vicky Calaster" (ref_02) show `stored_total=30` but only have `actual_total=24` payments with that `agent_id`
4. "Benteke" (ref_01) shows `stored_total=3` but has `actual_total=0` actual payments linked

---

## Root Cause Analysis

### Problem 1: **Admin Dashboard Metrics API uses STALE `users_today` column**

**File:** `app/api/admin/metrics/route.ts` (lines 29-40)

The metrics API reads directly from `referrals.users_today` and `referrals.total_users` columns:
```typescript
const { data: refRows } = await supabaseServer
  .from("referrals")
  .select("id,name,code,users_today,total_users")
  ...
const agents = (refRows || []).map((r) => ({
  today: Number(r.users_today || 0),
  total: Number(r.total_users || 0),
}))
```

The `users_today` column is supposed to reset daily, but **no daily reset function exists**.

### Problem 2: **Admin Referrals API already calculates `today` correctly but others don't**

**File:** `app/api/admin/referrals/route.ts` (lines 22-38)

This API correctly calculates `users_today` from payments:
```typescript
const { data: todayPayments } = await supabaseServer
  .from("payments")
  .select("agent_id")
  .gte("paid_at", todayStart.toISOString())
  .not("agent_id", "is", null)

const todayMap = new Map<string, number>()
for (const p of todayPayments) {
  todayMap.set(aid, (todayMap.get(aid) || 0) + 1)
}
```

**But** the `/api/admin/metrics` endpoint does NOT do this calculation—it uses the stale column values.

### Problem 3: **total_users column is inaccurate for older agents**

The `fn_referral_increment` trigger exists and correctly increments counts on payment insert:
```sql
IF new.agent_id IS NOT NULL THEN
  UPDATE public.referrals
    SET users_today = coalesce(users_today,0) + 1,
        total_users = coalesce(total_users,0) + 1
    WHERE id = new.agent_id;
END IF;
```

**However**, there's evidence of data inconsistency:
- `Vicky Calaster`: stored_total=30, actual_total=24 (6 phantom referrals)
- `Benteke`: stored_total=3, actual_total=0 (all 3 are phantom)

This suggests:
1. Payments may have been deleted or modified without decrementing counts
2. Referral records were manually edited
3. The trigger wasn't always in place

### Problem 4: **No daily reset mechanism exists**

SQL query for daily/reset functions returned `[]`. There's no cron job or scheduled function to reset `users_today` to 0 at midnight.

---

## Data Discrepancy Summary

| Agent | Code | stored_today | actual_today | stored_total | actual_total | Status |
|-------|------|--------------|--------------|--------------|--------------|--------|
| Stephen | ref_06 | 3 | 1 | 3 | 3 | TODAY MISMATCH |
| Gwiji Fleva | \tref_04 | 0 | 0 | 0 | 0 | OK (but has TAB in code!) |
| Eliab | ref_05 | 0 | 0 | 6 | 6 | OK |
| Mr Paul | ref_03 | 1 | 0 | 8 | 8 | TODAY MISMATCH |
| Vicky Calaster | ref_02 | 8 | 0 | 30 | 24 | BOTH MISMATCH |
| Benteke | ref_01 | 0 | 0 | 3 | 0 | TOTAL MISMATCH |

---

## Fix Recommendations

### Fix 1: Update Metrics API to Calculate Counts Dynamically (CRITICAL)

Modify `/api/admin/metrics/route.ts` to calculate referral counts from payments table, same as `/api/admin/referrals/route.ts`:

```typescript
// Calculate users_today from payments
const todayStart = new Date()
todayStart.setHours(0, 0, 0, 0)

const { data: todayPayments } = await supabaseServer
  .from("payments")
  .select("agent_id")
  .gte("paid_at", todayStart.toISOString())
  .not("agent_id", "is", null)

const todayMap = new Map<string, number>()
if (todayPayments) {
  for (const p of todayPayments) {
    const aid = String(p.agent_id)
    todayMap.set(aid, (todayMap.get(aid) || 0) + 1)
  }
}

// Calculate total from payments
const { data: allAgentPayments } = await supabaseServer
  .from("payments")
  .select("agent_id")
  .not("agent_id", "is", null)

const totalMap = new Map<string, number>()
if (allAgentPayments) {
  for (const p of allAgentPayments) {
    const aid = String(p.agent_id)
    totalMap.set(aid, (totalMap.get(aid) || 0) + 1)
  }
}

const agents = (refRows || []).map((r) => ({
  id: r.id,
  name: r.name,
  code: r.code,
  today: todayMap.get(r.id) || 0,
  total: totalMap.get(r.id) || 0,
}))
```

### Fix 2: Sync referrals table with actual payment counts (ONE-TIME)

Run this SQL to fix the discrepancies:
```sql
-- Sync total_users from actual payments
WITH payment_counts AS (
  SELECT agent_id, COUNT(*) as cnt
  FROM payments
  WHERE agent_id IS NOT NULL
  GROUP BY agent_id
)
UPDATE referrals r
SET total_users = COALESCE(p.cnt, 0)
FROM payment_counts p
WHERE r.id = p.agent_id;

-- Reset agents with no payments
UPDATE referrals
SET total_users = 0
WHERE id NOT IN (SELECT DISTINCT agent_id FROM payments WHERE agent_id IS NOT NULL);

-- Reset users_today for midnight
UPDATE referrals SET users_today = 0;
```

### Fix 3: Create Daily Reset Cron Job (MEDIUM)

Use Supabase pg_cron to reset `users_today` at midnight:
```sql
-- Enable pg_cron extension first
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the reset job (runs at midnight UTC)
SELECT cron.schedule(
  'reset_referrals_daily',
  '0 0 * * *', -- At midnight
  $$UPDATE public.referrals SET users_today = 0$$
);
```

### Fix 4: Fix the TAB character in Gwiji Fleva's code (MINOR)

```sql
UPDATE referrals 
SET code = 'ref_04', link = '/rc=ref_04'
WHERE name = 'Gwiji Fleva';
```

---

## Regression Protection

1. Add integration test to verify referral counts match payment counts
2. Add admin alert when referral counts drift from actual payments
3. Consider removing `users_today` and `total_users` columns entirely—calculate on-the-fly

---

## Verification

After implementing Fix 1 (minimum viable fix):
1. Navigate to `/admin/dashboard`
2. Verify referral counts match actual payment counts
3. Navigate to `/admin/referrals`
4. Verify both pages show consistent data
5. Make a test payment with a referral code
6. Verify the count increments correctly in both views

---

## Files to Modify

| File | Change |
|------|--------|
| `app/api/admin/metrics/route.ts` | Calculate referral counts from payments table |
| Database migration | Sync existing counts and create daily reset cron |

---

## Priority

- **Fix 1**: BLOCKER - Must be done to restore correct display
- **Fix 2**: HIGH - Required to correct historical data  
- **Fix 3**: MEDIUM - Required for proper daily reset behavior
- **Fix 4**: MINOR - Data cleanup

