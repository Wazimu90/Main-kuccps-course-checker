# Plan: Debug and Fix n8n Webhook Delivery

## Goal
Fix the issue where data is not being sent to the n8n webhook from the website, likely due to strict field validation or missing data in the transaction record.

## Assumptions
- The n8n URL is correct and reachable (verified by manual test).
- The issue is caused by the `sendToN8nWebhook` function rejecting payloads because some fields (like `name` or `result_id`) might be empty in the source `payment_transactions` record.
- Providing default values for non-critical fields (like `name`) will allow the webhook to succeed.

## Plan

### Step 1: Relax Validation and Add Defaults in Webhook Handler
- **Files**: `app/api/payments/webhook/route.ts`
- **Change**:
  - When calling `sendToN8nWebhook`, provide fallback values:
    - `name`: Use `transaction.name` OR "Valued Customer" (if empty/null).
    - `resultId`: Ensure fallback to `transaction.reference` or `transaction.transaction_id`.
  - Log the payload *before* sending to help with future debugging.
  - When relaxing the validations, the name, pho number and mpesa code can be null but the email and result id must be there - they are a must all.
- **Verify**: `npm run build`

### Step 2: Create a Test API Endpoint
- **Files**: `app/api/debug/test-n8n/route.ts` (New)
- **Change**:
  - Create a secure (or simple) endpoint that allows manual triggering of the webhook with hardcoded "perfect" data.
  - This allows us to verify if the Next.js environment itself can reach the external URL, ruling out firewall/network issues specific to the deployment.
- **Verify**: User can visit `/api/debug/test-n8n` to see a success message.

### Step 3: Update Library Logging
- **Files**: `lib/n8n-webhook.ts`
- **Change**:
  - Enhance validation logging to explicitly state *which* value was rejected (e.g., "Name field was empty string").
- **Verify**: Check logs after deployment.

## Risks & Mitigations
- **Risk**: Sending "Valued Customer" might confuse the email template if it expects a real name.
  - **Mitigation**: It's better than sending nothing. The email should be generic enough.
- **Risk**: Abuse of Test Endpoint.
  - **Mitigation**: We will make it a GET request that sends dummy data, harmless. Can be removed later.

Make sure the email and result id is fetched and send on the n8n webhook.
Fetch name, email, phone number from the payments_transactions table.
Here is the table schema:
table public.payment_transactions:
  phone_number text not null,
  email text not null,
  name text not null,
  mpesa_receipt_number text null,

Then the result id of that user to be fetched from the payments table, making sure the email and phoen number are the same as the  ones on the payments_transactions table.
Here is the payments table schema:
 table public.payments:
  name text not null,
  email text null,
  phone_number text null,
  result_id text null,


## Rollback Plan
- Revert changes to `app/api/payments/webhook/route.ts`.
- Delete `app/api/debug/test-n8n/route.ts`.

