# SQL Backfill Script: Update payment_transactions with missing result_id

## Purpose
This script updates existing `payment_transactions` records that lack a `result_id` by matching them with `results_cache` entries based on phone number and similar timestamps.

## Pre-check: Count affected records
```sql
-- Count transactions missing result_id
SELECT COUNT(*) as missing_result_id_count
FROM payment_transactions
WHERE result_id IS NULL
  AND status = 'COMPLETED';
```

## Option 1: Simple backfill by phone number (most recent match)
This matches transactions to the most recent result_cache entry with the same phone number.

```sql
-- Preview before running (DRY RUN)
SELECT 
    pt.id,
    pt.reference,
    pt.phone_number,
    pt.completed_at,
    pt.result_id as current_result_id,
    rc.result_id as new_result_id,
    rc.category,
    rc.created_at as result_created_at
FROM payment_transactions pt
LEFT JOIN LATERAL (
    SELECT result_id, category, created_at
    FROM results_cache
    WHERE (
        phone_number = pt.phone_number
        OR phone_number = CONCAT('0', SUBSTRING(pt.phone_number, 4))
        OR phone_number = CONCAT('254', SUBSTRING(pt.phone_number, 2))
    )
    ORDER BY created_at DESC
    LIMIT 1
) rc ON true
WHERE pt.result_id IS NULL
  AND pt.status = 'COMPLETED'
LIMIT 20;
```

## Option 2: Backfill with timestamp proximity (safer)
This only matches if the result was created within 1 hour of the transaction.

```sql
-- Preview before running (DRY RUN)
SELECT 
    pt.id,
    pt.reference,
    pt.phone_number,
    pt.completed_at,
    rc.result_id as new_result_id,
    rc.category,
    rc.created_at as result_created_at,
    EXTRACT(EPOCH FROM (pt.completed_at - rc.created_at))/60 as minutes_diff
FROM payment_transactions pt
LEFT JOIN LATERAL (
    SELECT result_id, category, created_at
    FROM results_cache
    WHERE (
        phone_number = pt.phone_number
        OR phone_number = CONCAT('0', SUBSTRING(pt.phone_number, 4))
        OR phone_number = CONCAT('254', SUBSTRING(pt.phone_number, 2))
    )
    AND created_at BETWEEN pt.completed_at - INTERVAL '1 hour' AND pt.completed_at + INTERVAL '10 minutes'
    ORDER BY ABS(EXTRACT(EPOCH FROM (created_at - pt.completed_at)))
    LIMIT 1
) rc ON true
WHERE pt.result_id IS NULL
  AND pt.status = 'COMPLETED'
  AND rc.result_id IS NOT NULL
LIMIT 20;
```

## Execute the backfill (AFTER reviewing previews)

```sql
-- UPDATE with most recent result match
UPDATE payment_transactions pt
SET result_id = (
    SELECT rc.result_id
    FROM results_cache rc
    WHERE (
        rc.phone_number = pt.phone_number
        OR rc.phone_number = CONCAT('0', SUBSTRING(pt.phone_number, 4))
        OR rc.phone_number = CONCAT('254', SUBSTRING(pt.phone_number, 2))
    )
    ORDER BY rc.created_at DESC
    LIMIT 1
)
WHERE pt.result_id IS NULL
  AND pt.status = 'COMPLETED';
```

## Verify the update

```sql
-- Check how many were updated
SELECT COUNT(*) as still_missing_result_id
FROM payment_transactions
WHERE result_id IS NULL
  AND status = 'COMPLETED';

-- View a sample of updated records
SELECT id, reference, phone_number, result_id, completed_at
FROM payment_transactions
WHERE result_id IS NOT NULL
  AND status = 'COMPLETED'
ORDER BY completed_at DESC
LIMIT 10;
```

## Notes
- Run the preview queries first to understand the scope
- Option 2 (timestamp proximity) is safer but may miss some matches
- Some transactions may not have matching results if the user never generated results
- After backfill, future transactions will have result_id set automatically
