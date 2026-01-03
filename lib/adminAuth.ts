import { cookies } from "next/headers"
import { supabaseServer } from "@/lib/supabaseServer"

export async function getAdminUserEmail(): Promise<string | null> {
  try {
    const c = cookies()
    const token = c.get("sb-access-token")?.value || ""
    if (!token) return null
    const { data, error } = await supabaseServer.auth.getUser(token)
    if (error || !data?.user?.email) return null
    return data.user.email
  } catch {
    return null
  }
}

export async function isAdminAuthorized(email: string | null): Promise<boolean> {
  if (!email) return false
  if (email !== "wazimuautomate@gmail.com") return false
  try {
    const { data, error } = await supabaseServer
      .from("admin_access_codes")
      .select("is_active")
      .eq("email", email)
      .limit(1)
      .maybeSingle()
    if (error) return false
    return Boolean(data?.is_active)
  } catch {
    return false
  }
}

export async function ensureAdminSession(): Promise<boolean> {
  const email = await getAdminUserEmail()
  const ok = await isAdminAuthorized(email)
  return ok
}

