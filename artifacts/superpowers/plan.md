# Implementation Plan: Fix Referrals Display Issue

## Goal
Fix the critical issue where referral counts are not showing correctly on the admin dashboard and referral sections.

## Constraints
- Must not break existing payment recording functionality
- Changes must be backward compatible
- Database must remain consistent

## Acceptance Criteria
- [ ] Referral counts on admin dashboard match actual payment records
- [ ] Referral counts on referrals page match actual payment records
- [ ] Both pages show consistent data
- [ ] Daily reset mechanism is in place
- [ ] Historical data discrepancies are corrected

---

## Steps

### Step 1: Update Metrics API to Calculate Referral Counts from Payments
**File:** `app/api/admin/metrics/route.ts`
**Change:** Add dynamic calculation of `users_today` and `total_users` from payments table
**Verification:** 
```bash
npm run build
```
Check that the build succeeds with no TypeScript errors.

### Step 2: Sync Referral Counts in Database
**Action:** Run SQL to sync `total_users` and `users_today` with actual payment counts
**Verification:** Query database to confirm counts match:
```sql
SELECT r.name, r.total_users, COUNT(p.id) as actual
FROM referrals r
LEFT JOIN payments p ON p.agent_id = r.id
GROUP BY r.id, r.name, r.total_users;
```

### Step 3: Fix Gwiji Fleva's Code with TAB Character
**Action:** Run SQL to fix the corrupted referral code
**Verification:** Query to confirm code no longer has TAB:
```sql
SELECT code, LENGTH(code) FROM referrals WHERE name = 'Gwiji Fleva';
```

### Step 4: Create Daily Reset Cron Job (if pg_cron available)
**Action:** Create scheduled job to reset `users_today` at midnight
**Fallback:** If pg_cron not available, document manual reset procedure
**Verification:** Check cron job exists:
```sql
SELECT * FROM cron.job WHERE jobname = 'reset_referrals_daily';
```

### Step 5: Update CHANGELOG.md
**File:** `CHANGELOG.md`
**Change:** Document all changes made
**Verification:** File contains new entry

### Step 6: Final Verification
**Action:** Test the complete flow
**Verification:**
1. Load `/admin/dashboard` and check referral counts
2. Load `/admin/referrals` and verify consistency
3. Compare displayed values with database query results

---

## Rollback Plan
If issues occur:
1. Revert `app/api/admin/metrics/route.ts` to previous version
2. Database changes are additive/corrective, no rollback needed

---

**Status:** AWAITING APPROVAL

Please reply **APPROVED** to proceed with execution.
