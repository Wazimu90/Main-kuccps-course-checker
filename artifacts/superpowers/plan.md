### Goal
Fix persistent "Missing CSRF token" error on admin side when generating ART tokens and resetting counts. Ensure the CSRF protection mechanism functions correctly by allowing the client to read the CSRF token.

### Assumptions
- The error "Missing CSRF token" is thrown client-side in `app/admin/referrals/page.tsx` because `document.cookie` cannot read the `csrf_token` cookie.
- The root cause is `middleware.ts` setting `httpOnly: true` for the `csrf_token`.
- The application intends to use the Double Submit Cookie pattern (Client reads cookie -> sends in Header -> Server compares), which requires the cookie to be readable by the client (`httpOnly: false`).
- The `agent-tokens` API route is currently missing server-side validation, which should be added for a complete fix.

### Plan
1. **Enable Client-Side Access to CSRF Token**
   - Files: `middleware.ts`
   - Change: Update the `csrf_token` cookie options to set `httpOnly: false`. This allows `document.cookie` to read the token.
   - Verify: Review `middleware.ts` to ensure `httpOnly` is false while `secure` and `sameSite` remain set.

2. **Add Server-Side CSRF Validation to ART Token Generation**
   - Files: `app/api/admin/agent-tokens/route.ts`
   - Change: Add validation logic to compare the `x-csrf-token` header with the `csrf_token` cookie, ensuring they match. This closes the security loop.
   - Verify: Review code to ensure it correctly extracts and compares the tokens, returning 403 on mismatch.

### Risks & mitigations
- **Risk**: `httpOnly: false` makes the CSRF token accessible to XSS attacks.
  - **Mitigation**: This is inherent to the Double Submit Cookie pattern without a separate specialized token endpoint. Given the existing architecture, this is the intended design. Ensure `secure: true` is kept to prevent leakage over HTTP.

### Rollback plan
- Revert changes to `middleware.ts` (set `httpOnly: true` again).
- Remove validation logic from `app/api/admin/agent-tokens/route.ts`.
