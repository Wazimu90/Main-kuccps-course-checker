-- Create chatbot settings table
CREATE TABLE IF NOT EXISTS chatbot_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN DEFAULT true,
  welcome_message TEXT DEFAULT 'Hello! How can I help you with your course selection today?',
  response_tone VARCHAR(50) DEFAULT 'friendly',
  model VARCHAR(100) DEFAULT 'openai/gpt-3.5-turbo',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 150,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chatbot API key table
CREATE TABLE IF NOT EXISTS chatbot_api_key (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key TEXT NOT NULL,
  provider VARCHAR(50) DEFAULT 'openrouter',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chatbot contexts table
CREATE TABLE IF NOT EXISTS chatbot_contexts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chatbot history table
CREATE TABLE IF NOT EXISTS chatbot_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  result_id VARCHAR(100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO chatbot_settings (enabled, welcome_message, response_tone, model, temperature, max_tokens)
VALUES (true, 'Hello! How can I help you with your course selection today?', 'friendly', 'openai/gpt-3.5-turbo', 0.7, 150)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for chatbot contexts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chatbot-contexts', 'chatbot-contexts', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies
ALTER TABLE chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_api_key ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_history ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (admin access)
CREATE POLICY "Allow all for authenticated users" ON chatbot_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON chatbot_api_key FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON chatbot_contexts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON chatbot_history FOR ALL TO authenticated USING (true);
