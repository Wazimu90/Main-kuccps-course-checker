export function validatePaymentPayload(input: {
  name: string
  email: string
  phone_number?: string
  amount: number
}) {
  if (!input.name || !input.email || !input.amount) return false
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return false
  // Phone is optional for Paystack; only validate format if provided
  if (input.phone_number && input.phone_number.trim()) {
    if (!/^(?:\+254|0)(?:7|1)\d{8}$/.test(input.phone_number)) return false
  }
  if (input.amount <= 0) return false
  return true
}
