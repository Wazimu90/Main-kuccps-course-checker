# Plan: Add result_id to payment_transactions Table

## Goal
Ensure the n8n webhook receives the **real result_id** (e.g., `degree_abc123`) instead of the payment reference (e.g., `PAY-1706892345-xyz`). This requires:
1. Adding a `result_id` column to `payment_transactions` table
2. Recording the `result_id` during payment initiation from `localStorage`
3. Updating the webhook handler to read `result_id` directly from `payment_transactions`

## Assumptions
1. The `result_id` is generated and stored in `localStorage` (`localStorage.getItem("resultId")`) BEFORE the user reaches the payment page
2. The `payment_transactions` table currently does NOT have a `result_id` column (confirmed via SQL query)
3. The n8n webhook needs the `result_id` to include in automated emails
4. PesaFlux webhooks contain the `transaction_id` or phone number that maps back to `payment_transactions`

## Plan

### Step 1: Add `result_id` Column to `payment_transactions` Table (Database Migration)
- **Files**: Database migration via Supabase MCP
- **Change**: 
  ```sql
  ALTER TABLE payment_transactions 
  ADD COLUMN result_id TEXT;
  ```
- **Verify**: Run `SELECT column_name FROM information_schema.columns WHERE table_name = 'payment_transactions' AND column_name = 'result_id';`

---

### Step 2: Update `initiatePayment` Action to Accept and Store `result_id`
- **Files**: `app/payment/actions.ts`
- **Change**:
  - Add `resultId?: string | null` to the function parameter interface
  - Include `result_id` in the `payment_transactions` INSERT statement
- **Verify**: `npm run build` - no TypeScript errors

---

### Step 3: Update Payment Page to Pass `result_id` During Payment Initiation
- **Files**: `app/payment/page.tsx`
- **Change**:
  - Read `resultId` from `localStorage` at component mount
  - Pass `resultId` to `initiatePayment()` call
- **Verify**: `npm run build` - no TypeScript errors

---

### Step 4: Update PesaFlux Webhook Handler to Use `result_id` from `payment_transactions`
- **Files**: `app/api/payments/webhook/route.ts`
- **Change**:
  - Remove the complex 3-tier lookup from `payments` table
  - Simply use `transaction.result_id` directly (it's now guaranteed to be in `payment_transactions`)
  - Only fall back to reference if `result_id` is null (for legacy transactions)
  - Log explicitly which source was used
- **Verify**: 
  1. `npm run build`
  2. Check console logs show `result_id` source as `payment_transactions`

---

### Step 5: Backfill Existing Transactions (Optional - Data Fix)
- **Files**: Database via Supabase MCP
- **Change**: Update existing `payment_transactions` rows that have matching records in `payments` table
  ```sql
  UPDATE payment_transactions pt
  SET result_id = p.result_id
  FROM payments p
  WHERE pt.email = p.email 
    AND pt.phone_number = p.phone_number
    AND pt.result_id IS NULL
    AND p.result_id IS NOT NULL;
  ```
- **Verify**: `SELECT COUNT(*) FROM payment_transactions WHERE result_id IS NOT NULL;`

---

### Step 6: Update CHANGELOG and Verify End-to-End
- **Files**: `CHANGELOG.md`
- **Change**: Document the schema change and code updates
- **Verify**: 
  1. Make a test payment
  2. Check `payment_transactions` table - `result_id` should be populated
  3. Check n8n webhook logs - should show real `result_id`, not `PAY-xxx`
  4. Check `activity_logs` - `resultIdSource` should be `payment_transactions`

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| `localStorage` doesn't have `resultId` at payment time | Add fallback; log warning; still attempt webhook |
| Old transactions have no `result_id` | Step 5 backfills; webhook handler has fallback to reference |
| Database migration fails | Migration is simple ALTER TABLE, low risk. Rollback: `ALTER TABLE payment_transactions DROP COLUMN result_id;` |

## Rollback Plan
1. Revert code changes (git revert)
2. Drop the column: `ALTER TABLE payment_transactions DROP COLUMN result_id;`
3. Restore previous webhook logic (git revert)

---

## Summary Table

| Step | Component | Action |
|------|-----------|--------|
| 1 | Database | Add `result_id` column |
| 2 | `actions.ts` | Accept and store `result_id` |
| 3 | `page.tsx` | Pass `result_id` from localStorage |
| 4 | `webhook/route.ts` | Read `result_id` from `payment_transactions` |
| 5 | Database | Backfill existing records |
| 6 | CHANGELOG | Document changes |

---

**Approve this plan? Reply APPROVED if it looks good.**
