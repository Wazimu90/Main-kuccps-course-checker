# Plan: Allow Agent Result Regeneration via M-Pesa Code (Without Result ID)

## Goal

Allow agents to regenerate user results using **M-Pesa receipt code + phone number** as an alternative to Result ID. This makes the workflow more flexible while maintaining security and not breaking existing token-based functionality.

**Current Flow:**
1. Agent enters ART token → Verified
2. Agent enters Result ID (required) + Phone Number (optional) + M-Pesa Receipt (optional)
3. System verifies payment and generates PDF

**New Flow:**
1. Agent enters ART token → Verified
2. Agent enters **one of**:
   - **Option A:** Result ID (current flow, still works)
   - **Option B:** M-Pesa Receipt Code + Phone Number (new alternative)
3. System looks up the result via whichever method is provided
4. System generates PDF

## Assumptions

1. M-Pesa receipt codes are unique per transaction
2. The `payments` table or `payment_transactions` table contains M-Pesa receipt numbers
3. We can link a payment to a result via `result_id` in payments table or by matching phone number to `results_cache`
4. The existing token verification flow remains unchanged
5. Per-result download limits (3) still apply regardless of lookup method
6. Agent daily limits (20) still apply

## Plan

### Step 1: Update verify-payment API to accept M-Pesa receipt as primary lookup (5 min)
- **Files**: `app/api/agent-portal/verify-payment/route.ts`
- **Change**: 
  - Modify validation: require **either** `result_id` **OR** (`mpesa_receipt` AND `phone_number`)
  - Add new lookup path: If `result_id` not provided but `mpesa_receipt` is:
    1. Find payment in `payment_transactions` by `mpesa_receipt_number`
    2. Use the found payment's `phone_number` to find matching `results_cache` entry
    3. Return the discovered `result_id` in response
  - Keep existing `result_id` flow intact as first priority
- **Verify**: 
  - Call API with only `mpesa_receipt` + `phone_number` → Should return result info
  - Call API with only `result_id` → Should still work (regression test)

### Step 2: Update download-pdf API to accept M-Pesa-based lookup (5 min)
- **Files**: `app/api/agent-portal/download-pdf/route.ts`
- **Change**: 
  - Modify validation: require **either** `result_id` **OR** (`mpesa_receipt` AND `phone_number`)
  - Add resolution logic: If `result_id` not provided:
    1. Look up payment by `mpesa_receipt`
    2. Get associated `result_id` from payment or match via phone
    3. Proceed with existing PDF generation flow using resolved `result_id`
  - Keep all existing limits (daily + per-result) intact
- **Verify**: 
  - API should generate PDF when given M-Pesa receipt instead of result_id
  - Existing `result_id` flow should remain unchanged

### Step 3: Update Agent Portal frontend to make Result ID optional (5 min)
- **Files**: `app/agent-portal/page.tsx`
- **Change**: 
  - Change Result ID label from `*` (required) to `(optional)`
  - Update form validation: Enable "Verify Payment" button if EITHER:
    - `resultId` is filled, OR
    - (`mpesaReceipt` AND `phoneNumber`) are both filled
  - Update phone number label from `(optional)` to indicate it's required when no Result ID
  - Add helper text explaining the two options
- **Verify**: 
  - Button should be enabled when M-Pesa + Phone are filled but Result ID is empty
  - Button should still work when only Result ID is filled

### Step 4: Update handleVerifyPayment to pass correct params (3 min)
- **Files**: `app/agent-portal/page.tsx`
- **Change**: 
  - Modify `handleVerifyPayment` to send request even without `result_id` if `mpesa_receipt` and `phone_number` are provided
  - Store the returned `result_id` from API response for use in download
- **Verify**: 
  - Verification should succeed with M-Pesa + Phone only
  - Returned result_id should be stored in state

### Step 5: Update handleDownloadPDF to use resolved result_id (3 min)
- **Files**: `app/agent-portal/page.tsx`
- **Change**: 
  - Use `verifiedResult.result_id` (from verification response) instead of form input `resultId`
  - This ensures the resolved result_id is used for download regardless of lookup method
- **Verify**: 
  - Download should work after M-Pesa-based verification

### Step 6: Update CHANGELOG.md (2 min)
- **Files**: `CHANGELOG.md`
- **Change**: Add entry documenting the new M-Pesa-based lookup feature
- **Verify**: Entry appears in changelog

### Step 7: End-to-end manual test (5 min)
- **Files**: None (testing only)
- **Verify**:
  1. Navigate to `/agent-portal`
  2. Enter valid ART token → Success
  3. **Test Case A**: Enter only Result ID → Verify + Download works
  4. **Test Case B**: Enter only M-Pesa Receipt + Phone → Verify + Download works
  5. **Test Case C**: Enter all three → Should work (Result ID takes priority)
  6. Verify download limits still apply

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| M-Pesa code doesn't link to result | Medium | Medium | Fallback error message: "Could not find result for this payment" |
| Multiple results match same phone | Low | Medium | Use most recent result or require M-Pesa code to be unique per result |
| Breaking existing Result ID flow | Low | High | Keep Result ID as primary path; M-Pesa is fallback |
| Abuse via guessing M-Pesa codes | Very Low | Low | Rate limiting already in place (10/min); M-Pesa codes are random |

## Rollback Plan

1. Revert changes to `verify-payment/route.ts`
2. Revert changes to `download-pdf/route.ts`
3. Revert changes to `agent-portal/page.tsx`
4. Revert CHANGELOG.md entry
5. No database changes required
