# Payment Security Hardening Plan

**Task:** Fix all blockers, majors, and minors from `artifacts/superpowers/review.md` to make the payment integration secure, without breaking current functionality.

---

## Goal

Harden the payment integration so that:
1. No user can access results without a verified M-Pesa payment
2. No attacker can forge webhook callbacks or fake payment records
3. Payment amount is enforced server-side and tamper-proof
4. Admin email is not leaked to the client
5. All payment API endpoints have CSRF + rate limiting
6. Webhook endpoint is authenticated
7. Empty catch blocks are replaced with logging
8. Phone normalization is centralized

---

## Assumptions

1. The Supabase project ID and tables (`payments`, `payment_transactions`, `results_cache`, `users`, `system_settings`, `activity_logs`) already exist.
2. The M-Pesa production environment is active and the shortcode `4185053` is correct.
3. The ngrok callback URL issue (M2) is **acknowledged but deferred** — the user manages this externally. We will add a validation guard in code.
4. The secrets audit (M3) is **informational** — we will verify `.gitignore` but not rotate secrets in this plan.
5. Real CAPTCHA (m4) will use **Cloudflare Turnstile** (free, privacy-friendly) — the user can swap for reCAPTCHA if preferred.
6. The dev server is running on `npm run dev` and we can verify via browser.

---

## Plan

Steps are grouped into **parallel batches**. Steps within a batch are independent and can be executed simultaneously.

---

### ═══ BATCH 1 — Core Server-Side Hardening (4 parallel steps) ═══

---

### Step 1. Server-side amount enforcement (Fixes M1, M5)

- **Files:** `app/payment/actions.ts`, `app/payment/page.tsx`
- **Change:**
  - In `initiatePayment()` (actions.ts): **Ignore** the `amount` parameter from the client. Instead, query `system_settings` server-side via `supabaseServer` to get the canonical `payment_amount`. Hard fallback to `200` (not `1`).
  - In `page.tsx` line 278: Change `paymentAmount || 1` to `paymentAmount || 200`, and disable submit button if `paymentAmount` is `null` (settings not loaded).
  - Remove `amount` from `initiatePayment()` function signature.
- **Verify:**
  - `npx tsc --noEmit` — no type errors
  - Manual: intercept the payment action call; confirm the amount sent to M-Pesa is always from DB, not client

---

### Step 2. Webhook authentication — HMAC signing + IP guard (Fixes B1, M6)

- **Files:** `lib/mpesa.ts`, `app/api/payments/webhook/route.ts`
- **Change:**
  - Generate a unique per-transaction `webhook_token` (HMAC-SHA256 of `checkoutRequestID` + a server `WEBHOOK_SECRET` env var) and append it to `CallBackURL` as a query param during STK push.
  - In the webhook handler: extract the `token` query param, recompute the HMAC from the request's `CheckoutRequestID`, and reject if mismatch.
  - Add Safaricom IP validation (allow `196.201.214.0/24`, `196.201.213.0/24`, plus `0.0.0.0/0` in non-production for ngrok).
  - **Remove** the `GET` handler (M6) — return 405 Method Not Allowed.
- **Verify:**
  - `npx tsc --noEmit`
  - Manual: send a forged POST to `/api/payments/webhook` without the token → should get 403
  - Manual: send with wrong token → should get 403

---

### Step 3. Secure `/api/payments` route — CSRF + payment verification gate (Fixes B2, M4)

- **Files:** `app/api/payments/route.ts`, `middleware.ts`, `lib/csrf.ts`
- **Change:**
  - Add CSRF token validation: the route reads `x-csrf-token` header and calls `verifyCsrfToken()`. Reject with 403 if invalid.
  - Add rate limiting: `checkRateLimit()` with key `payment-record:${ip}`, max 5 requests per 60 seconds.
  - **Critical:** Before recording payment, verify that a matching `COMPLETED` `payment_transactions` record exists (by email + phone + recent timestamp). If no matching completed transaction → reject with 403 "Payment not verified". Exception: admin bypass path (which already validates access code hash).
  - In middleware.ts: ensure CSRF cookie is set for **all** routes (not just admin), so the payment page has a CSRF token available.
- **Verify:**
  - `npx tsc --noEmit`
  - Manual: `curl -X POST /api/payments` without CSRF → 403
  - Manual: `curl -X POST /api/payments` with CSRF but no completed transaction → 403

---

### Step 4. Server-side results gating (Fixes B3, B4)

- **Files:** `app/api/results/route.ts` (NEW), `app/results/page.tsx`
- **Change:**
  - Create new API route `app/api/results/route.ts`:
    - Accepts `{ result_id }` as query param
    - Uses `supabaseServer` to check that a matching `COMPLETED` payment exists in `payment_transactions` OR `payments` table for this `result_id`
    - If payment verified → return the `results_cache` data
    - If not → return 403 `{ error: "Payment required" }`
    - Admin check: if a valid admin session exists (via `sb-access-token` cookie), bypass payment check
  - In `app/results/page.tsx`: replace the direct `supabase.from("results_cache")` client-side query with a `fetch("/api/results?result_id=...")` call to the new secure API route.
- **Verify:**
  - `npx tsc --noEmit`
  - Manual: navigate to `/results` with a `resultId` that has no payment → should show "Payment required" error
  - Manual: after a real payment → results should load normally

---

### ═══ BATCH 2 — Admin & Client Hardening (3 parallel steps) ═══

---

### Step 5. Remove admin email from client-side (Fixes B5)

- **Files:** `app/payment/page.tsx`, `app/api/payments/check-admin/route.ts` (NEW)
- **Change:**
  - Create new API route `app/api/payments/check-admin/route.ts`:
    - Accepts `{ email }` in POST body
    - Server-side: checks if the email matches the admin email (from `process.env.ADMIN_EMAIL`, NOT `NEXT_PUBLIC_*`)
    - Returns `{ isAdmin: true }` or `{ isAdmin: false }`
    - Rate limited: 5 requests per minute per IP
  - In `page.tsx`: remove `ADMIN_EMAIL` constant and `NEXT_PUBLIC_ADMIN_EMAIL` usage. Instead, on email blur/change, call the new API to check admin status.
  - Remove `NEXT_PUBLIC_ADMIN_EMAIL` from `.env.local` references; add `ADMIN_EMAIL` (server-only) instead.
- **Verify:**
  - `npx tsc --noEmit`
  - Inspect browser source → should NOT contain `wazimuautomate@gmail.com`
  - Manual: enter admin email → admin mode activates via API check

---

### Step 6. Consolidate admin bypass + add error logging (Fixes m2, m5)

- **Files:** `app/api/payments/route.ts`
- **Change:**
  - Remove the **duplicate** admin bypass block (lines 191-206). Keep only the early-return block (lines 36-150).
  - Replace ALL `} catch { }` blocks (11 instances) with `} catch (e: any) { log("api:payments:fallback", "Error: " + e?.message, "error") }` — at minimum log the error.
- **Verify:**
  - `npx tsc --noEmit`
  - `grep -c "catch { }" app/api/payments/route.ts` → should return 0
  - Manual: trigger a payment recording error → should see log output in terminal

---

### Step 7. N8n webhook authentication (Fixes m1)

- **Files:** `lib/n8n-webhook.ts`, `.env.local`
- **Change:**
  - Add `N8N_WEBHOOK_SECRET` env var.
  - In `sendToN8nWebhook()`, add `Authorization: Bearer ${process.env.N8N_WEBHOOK_SECRET}` header to the fetch call.
  - Log a warning if `N8N_WEBHOOK_SECRET` is not set.
- **Verify:**
  - `npx tsc --noEmit`
  - Check logs: should show the auth header is being sent (without logging the secret itself)

---

### ═══ BATCH 3 — Input Validation & Normalization (3 parallel steps) ═══

---

### Step 8. Centralize phone normalization (Fixes n3)

- **Files:** `lib/phone-utils.ts` (NEW), `lib/mpesa.ts`, `lib/n8n-webhook.ts`, `app/api/payments/route.ts`, `app/api/agent-portal/verify-payment/route.ts`, `lib/paymentValidation.ts`
- **Change:**
  - Create `lib/phone-utils.ts` with a single `normalizeKenyanPhone(phone: string): string` function that handles: `07...`, `+254...`, `254...`, 9-digit, with whitespace stripping.
  - Replace all inline phone normalization in the 5 files above with `import { normalizeKenyanPhone } from "@/lib/phone-utils"`.
  - Keep `normalizePhoneNumber` in `lib/mpesa.ts` as a re-export for backward compatibility.
- **Verify:**
  - `npx tsc --noEmit`
  - Manual: initiate a payment with phone `0712345678` → should normalize to `254712345678`

---

### Step 9. Consistent phone validation (Fixes m3)

- **Files:** `lib/paymentValidation.ts`, `app/payment/page.tsx`
- **Change:**
  - Update `paymentValidation.ts` regex to accept all valid Kenyan formats: `^(?:\+?254|0)(?:7|1)\d{8}$`
  - Update `page.tsx` frontend regex to match: `^(?:\+?254|0)(?:7|1)\d{8}$`
  - Both front-end and back-end now accept the same formats.
- **Verify:**
  - `npx tsc --noEmit`
  - Manual test: enter `+254712345678` on payment form → should pass validation

---

### Step 10. Implement Cloudflare Turnstile CAPTCHA (Fixes m4)

- **Files:** `app/payment/page.tsx`, `app/payment/actions.ts`, `package.json`
- **Change:**
  - Install: `npm install @marsidev/react-turnstile`
  - Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` env vars.
  - In `page.tsx`: replace the fake checkbox CAPTCHA with a `<Turnstile>` component. On success, store the turnstile token.
  - In `initiatePayment()` (actions.ts): accept `captchaToken` param. Before calling M-Pesa, POST to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with the secret + token. Reject payment if CAPTCHA fails.
  - If Turnstile keys are not configured, fall back to current behavior (checkbox) with a log warning.
- **Verify:**
  - `npx tsc --noEmit`
  - Manual: load payment page → Turnstile widget should appear (if keys configured)
  - Manual: submit form without solving CAPTCHA → should fail

---

### ═══ BATCH 4 — Credential Cleanup & Nits (2 parallel steps) ═══

---

### Step 11. Remove partial credential logging (Fixes n1)

- **Files:** `lib/mpesa.ts`
- **Change:**
  - Remove `keyStart: key.substring(0, 4) + "****"` from the log call (lines 52-56).
  - Replace with `keyPresent: !!key` — just log whether the key is present, not its value.
- **Verify:**
  - `npx tsc --noEmit`
  - `grep "keyStart" lib/mpesa.ts` → should return 0 results

---

### Step 12. Verify secrets not in git history (Fixes M3)

- **Files:** `.gitignore`, git history
- **Change:**
  - Run `git log --all --diff-filter=A -- .env* .env.local` to check if `.env.local` was ever committed.
  - If found: notify the user that secrets must be rotated.
  - Verify `.gitignore` pattern `.env*` covers all env files.
- **Verify:**
  - `git log --all --diff-filter=A -- ".env*"` → should return no results (or identify the commits)
  - `echo ".env.test" | git check-ignore --stdin` → should be ignored

---

### ═══ BATCH 5 — Final CSRF Cookie + Verification ═══

---

### Step 13. Extend CSRF cookie to user routes

- **Files:** `middleware.ts`
- **Change:**
  - Move the CSRF cookie generation out of the admin-only block (currently lines 207-222).
  - Set the CSRF cookie for **all** non-static routes. This ensures the payment page has a CSRF token available.
  - Keep `httpOnly: false` so the client JS can read and send it as a header.
- **Verify:**
  - `npx tsc --noEmit`
  - Manual: navigate to `/payment` → inspect cookies → should see `csrf_token`
  - Manual: submit payment form → CSRF token should be in request headers

---

### Step 14. End-to-end validation

- **Files:** None (testing only)
- **Change:** Full manual test of the happy path and attack scenarios:
  1. ✅ Normal payment flow: enter grades → preview → pay via M-Pesa → results load
  2. ✅ Forged webhook: `curl -X POST /api/payments/webhook` with fake data → 403
  3. ✅ Direct results access: navigate to `/results` without payment → "Payment required"
  4. ✅ Fake payment recording: `curl -X POST /api/payments` → 403 (no CSRF / no completed transaction)
  5. ✅ Amount tampering: intercept initiatePayment → amount is from server DB, not client
  6. ✅ Admin bypass: enter admin email → admin mode (via API, email not in source)
  7. ✅ Webhook GET: `curl /api/payments/webhook` → 405
- **Verify:**
  - All 7 scenarios pass
  - `npm run build` succeeds with no errors

---

### Step 15. Update CHANGELOG.md

- **Files:** `CHANGELOG.md`
- **Change:**
  - Add a "Security" section under a new date entry documenting all hardening changes.
- **Verify:**
  - `head -30 CHANGELOG.md` — should show the new entry

---

## Parallel Execution Map

```
BATCH 1 (Steps 1-4):  all 4 in parallel  │ ~10 min
                                           │
BATCH 2 (Steps 5-7):  all 3 in parallel  │ ~8 min
                                           │
BATCH 3 (Steps 8-10): all 3 in parallel  │ ~8 min
                                           │
BATCH 4 (Steps 11-12): both in parallel  │ ~3 min
                                           │
BATCH 5 (Steps 13-15): sequential        │ ~10 min
                                           │
Total estimated:                          │ ~40 min
```

**Dependencies:**
- Batch 2 depends on Batch 1 (Step 6 modifies same file as Step 3)
- Batch 3 is independent of Batches 1–2
- Batch 5 depends on all prior (integration testing)
- Steps 8 and 9 within Batch 3 touch different parts of `paymentValidation.ts` — coordinate if needed

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Webhook HMAC breaks existing M-Pesa flow | Medium | High | Test with ngrok + M-Pesa sandbox first; keep a 24-hour grace period where unsigned webhooks are accepted but logged as warnings |
| CSRF breaks admin bypass | Low | Medium | Admin bypass already uses `fetch()` which can include CSRF headers; test separately |
| Server-side amount read adds latency | Low | Low | Query is simple, single-row read from `system_settings` |
| Cloudflare Turnstile blocks legitimate users | Low | Medium | Fallback to checkbox if keys not configured; Turnstile has high solve rate |
| Results gating API breaks existing paid users | Medium | High | The API checks both `payments` and `payment_transactions` tables; also allows admin bypass |
| Phone normalization change breaks matching | Low | Medium | New function handles all formats already seen in the codebase; extensive testing |

---

## Rollback Plan

1. **Git-based:** Every batch creates a logical commit. If any batch breaks production:
   ```bash
   git revert HEAD~<N>  # revert the batch
   ```

2. **Feature flags (optional):** For webhook HMAC, add env var `WEBHOOK_AUTH_ENABLED=true`. If set to `false`, skip HMAC validation (emergency bypass).

3. **Database:** No schema changes in this plan. All changes are application-level only.

4. **Worst case:** Revert all changes and redeploy the previous commit:
   ```bash
   git stash && git checkout main && npm run build
   ```
