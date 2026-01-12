-- Create payment_transactions table to track PesaFlux payments
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT UNIQUE NOT NULL, -- Our unique reference (e.g., PAY-1234567890-ABC12)
  transaction_id TEXT, -- PesaFlux transaction ID (from their response)
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, CANCELLED
  
  -- Webhook data
  mpesa_receipt_number TEXT, -- M-Pesa confirmation code
  webhook_data JSONB, -- Full webhook payload for debugging
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON payment_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_phone ON payment_transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_email ON payment_transactions(email);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_payment_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_transactions_updated_at();

-- Add RLS policies (if RLS is enabled)
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Allow service role (backend) full access
CREATE POLICY "Service role full access" ON payment_transactions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Allow authenticated users to view their own transactions
CREATE POLICY "Users view own transactions" ON payment_transactions
  FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND (email = auth.jwt()->>'email' OR phone_number = auth.jwt()->>'phone')
  );
