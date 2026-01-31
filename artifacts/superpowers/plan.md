# Plan: n8n Webhook Integration for Email Notifications

## Goal
Send user details to an n8n webhook URL after successful payment, enabling automated email notifications to users with their result information.

## JSON Payload Structure
```json
{
  "name": "User Name",
  "phone": "+254727921038",
  "mpesaCode": "ABC123XYZ",
  "email": "customer@example.com",
  "resultId": "artisane_rieru78549889yffhdh"
}
```

## Assumptions
- The n8n webhook URL will be added to `.env.local` as `N8N_WEBHOOK_URL`
- The webhook should be called **after** a payment is confirmed as `COMPLETED`
- We have access to all required fields (`name`, `phone`, `mpesaCode`, `email`, `resultId`) from the payment transaction and webhook data
- The webhook call should be non-blocking (fire-and-forget) to not delay the payment response

## Risks & Mitigations
- **Risk**: n8n webhook might be down or slow
  - **Mitigation**: Make webhook call async with timeout, log errors but don't fail payment
- **Risk**: Missing fields (e.g., `resultId` not available)
  - **Mitigation**: Only send webhook if all required fields are present, log warning otherwise
- **Risk**: Duplicate webhook calls for same payment
  - **Mitigation**: Add a flag to `payment_transactions` table to track if webhook was sent

## Plan

### Step 1: Add N8N_WEBHOOK_URL to environment configuration
- **Files**: `.env.local`, `.env.example` (if exists)
- **Change**:
  - Add `N8N_WEBHOOK_URL=` placeholder to `.env.local`
  - Document the new environment variable
- **Verify**:
  - Confirm the variable is readable: `grep N8N_WEBHOOK_URL .env.local`

### Step 2: Create a utility function to send data to n8n webhook
- **Files**: `lib/n8n-webhook.ts` (new file)
- **Change**:
  - Create a new utility function `sendToN8nWebhook(data: N8nWebhookPayload)`
  - Function should:
    - Validate all required fields are present
    - Make a POST request to `process.env.N8N_WEBHOOK_URL`
    - Use a 10-second timeout
    - Log success/failure without throwing
    - Return `{ success: boolean, error?: string }`
- **Verify**:
  - TypeScript compiles without errors: `npx tsc --noEmit lib/n8n-webhook.ts`

### Step 3: Integrate webhook call into PesaFlux webhook handler
- **Files**: `app/api/payments/webhook/route.ts`
- **Change**:
  - Import `sendToN8nWebhook` from `lib/n8n-webhook`
  - After payment is recorded successfully (after line 231), call `sendToN8nWebhook` with:
    - `name`: from `transaction.name`
    - `phone`: from `transaction.phone_number` (format as +254xxx)
    - `mpesaCode`: from `mpesaReceiptNumber`
    - `email`: from `transaction.email`
    - `resultId`: from `transaction.result_id` or `transaction.reference`
  - Log the webhook call result
- **Verify**:
  - Build passes: `npm run build`
  - No TypeScript errors

### Step 4: Integrate webhook call into payments API route (fallback/direct recording)
- **Files**: `app/api/payments/route.ts`
- **Change**:
  - Import `sendToN8nWebhook` from `lib/n8n-webhook`
  - After successful payment recording (after line 445), call `sendToN8nWebhook` with:
    - `name`: from request body
    - `phone`: from `phone_number` (format as +254xxx)
    - `mpesaCode`: from body or transaction metadata (may need to pass from client)
    - `email`: from request body
    - `resultId`: from `result_id`
  - Only call if we have the M-Pesa code available
- **Verify**:
  - Build passes: `npm run build`

### Step 5: Update CHANGELOG.md
- **Files**: `CHANGELOG.md`
- **Change**:
  - Add entry for n8n webhook integration feature
- **Verify**:
  - File updated correctly

### Step 6: Final verification and testing
- **Files**: N/A
- **Change**: N/A
- **Verify**:
  - `npm run build` passes
  - Check that webhook is called in logs (simulated or real test)
  - Confirm all fields are correctly formatted per the spec

## Rollback Plan
- Delete `lib/n8n-webhook.ts`
- Revert changes to `app/api/payments/webhook/route.ts`
- Revert changes to `app/api/payments/route.ts`
- Remove `N8N_WEBHOOK_URL` from environment files

## Acceptance Criteria
1. ✅ When payment is successful, user details are sent to n8n webhook
2. ✅ Payload matches the specified JSON structure exactly
3. ✅ Webhook failures don't block payment processing
4. ✅ All webhook calls are logged
5. ✅ Environment variable is documented
