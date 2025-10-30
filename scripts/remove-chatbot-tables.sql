-- Remove chatbot-related tables and storage buckets

-- Drop chatbot tables
DROP TABLE IF EXISTS chatbot_history CASCADE;
DROP TABLE IF EXISTS chatbot_contexts CASCADE;
DROP TABLE IF EXISTS chatbot_api_key CASCADE;
DROP TABLE IF EXISTS chatbot_settings CASCADE;

-- Remove storage bucket for chatbot contexts
DELETE FROM storage.buckets WHERE id = 'chatbot-contexts';

-- Remove any storage policies related to chatbot
DROP POLICY IF EXISTS "Allow all for authenticated users" ON storage.objects;

-- Clean up any remaining storage objects (if bucket still exists)
DELETE FROM storage.objects WHERE bucket_id = 'chatbot-contexts';

-- Remove any functions or triggers related to chatbot (if any exist)
-- Add any custom chatbot-related functions here if they were created

COMMIT;
