import { NextResponse } from "next/server"
import { headers, cookies } from "next/headers"
import { supabaseServer } from "@/lib/supabaseServer"
import { validatePaymentPayload } from "@/lib/paymentValidation"
import bcrypt from "bcryptjs"
import { log } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body.name || "").trim()
    const email = String(body.email || "").trim()
    const phone_number = String(body.phone_number || "").trim()
    const amount = Number(body.amount || 0)

    // CRITICAL FIX: Ensure course_category is always valid for database constraint
    const validCategories = ['degree', 'diploma', 'certificate', 'artisan', 'kmtc']
    const rawCategory = body.course_category ? String(body.course_category).toLowerCase().trim() : null
    const course_category = rawCategory && validCategories.includes(rawCategory)
      ? rawCategory
      : 'degree' // Default to 'degree' if missing/invalid

    const admin_access_code = body.admin_access_code ? String(body.admin_access_code) : ""
    const paid_at = new Date().toISOString()

    log("api:payments", "Received payment recording request", "info", {
      email,
      phone: phone_number,
      amount,
      category: course_category,
      rawCategory: body.course_category,
      isAdminBypass: !!admin_access_code
    })

    if (email === "wazimuautomate@gmail.com" && admin_access_code) {
      log("api:payments:admin", "Attempting admin bypass", "info", { email })
      const hdrsEarly = await headers()
      const ipEarly =
        hdrsEarly.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        hdrsEarly.get("x-real-ip") ||
        "0.0.0.0"
      const cookieStoreEarly = await cookies()
      const refEarly = cookieStoreEarly.get("referral_code")?.value || null
      let agentIdEarly: string | null = null
      if (refEarly) {
        const { data: ref } = await supabaseServer
          .from("referrals")
          .select("id,code,status")
          .eq("code", refEarly)
          .eq("status", "active")
          .limit(1)
        if (ref && ref.length > 0) {
          agentIdEarly = ref[0].id
        }
      }
      const { data: adminRow } = await supabaseServer
        .from("admin_access_codes")
        .select("access_code_hash,is_active")
        .eq("email", email)
        .limit(1)
        .maybeSingle()
      let okEarly = false
      if (adminRow?.is_active && adminRow?.access_code_hash) {
        try {
          okEarly = await bcrypt.compare(admin_access_code, adminRow.access_code_hash)
        } catch {
          okEarly = false
        }
      }
      if (!okEarly) {
        log("api:payments:admin", "Admin bypass FAILED - invalid code", "warn", { email })
        return NextResponse.json({ error: "Invalid admin access code" }, { status: 401 })
      }
      log("api:payments:admin", "Admin bypass SUCCESS", "success", { email })
      try {
        await supabaseServer
          .from("activity_logs")
          .insert({
            event_type: "payment.admin_bypass",
            description: "Admin bypass applied",
            actor_role: "admin",
            email,
            ip_address: ipEarly,
            created_at: paid_at,
            metadata: { amount: 0, course_category },
          })
      } catch { }
      const dedupSince = new Date(Date.now() - 10 * 60 * 1000).toISOString()
      const { data: existingPay } = await supabaseServer
        .from("payments")
        .select("id")
        .eq("email", email)
        .eq("phone_number", "")
        .gte("paid_at", dedupSince)
        .limit(1)
      if (!existingPay || existingPay.length === 0) {
        try {
          await supabaseServer
            .from("payments")
            .insert({
              name: name || "Admin",
              email,
              phone_number: "",
              amount: 0,
              ip_address: ipEarly,
              course_category,
              agent_name: refEarly || "default",
              paid_at,
              agent_id: agentIdEarly,
            })
        } catch { }
      }
      const { data: existingUser } = await supabaseServer
        .from("users")
        .select("id")
        .or(`email.eq.${email},phone_number.eq.`)
        .limit(1)
      if (existingUser && existingUser.length > 0) {
        try {
          await supabaseServer
            .from("users")
            .update({
              name: name || "Admin",
              ip_address: ipEarly,
              course_category,
              agent: refEarly || "default",
              agent_id: agentIdEarly,
              status: "active",
            })
            .or(`email.eq.${email},phone_number.eq.`)
        } catch { }
      } else {
        try {
          await supabaseServer
            .from("users")
            .insert({
              name: name || "Admin",
              email,
              phone_number: "",
              ip_address: ipEarly,
              course_category,
              agent: refEarly || "default",
              agent_id: agentIdEarly,
              status: "active",
            })
        } catch { }
      }
      return NextResponse.json({ ok: true, admin_bypass: true })
    }

    if (!validatePaymentPayload({ name, email, phone_number, amount })) {
      log("api:payments:validation", "Payment payload validation FAILED", "error", { name, email, phone_number, amount })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    log("api:payments:validation", "Payment payload validation SUCCESS", "debug")

    const hdrs = await headers()
    const ip_address =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("x-real-ip") ||
      "0.0.0.0"

    const cookieStore = await cookies()
    const referral_code = cookieStore.get("referral_code")?.value || null
    let agent_id: string | null = null
    if (referral_code) {
      const { data: ref } = await supabaseServer
        .from("referrals")
        .select("id,code,status")
        .eq("code", referral_code)
        .eq("status", "active")
        .limit(1)
      if (ref && ref.length > 0) {
        agent_id = ref[0].id
      } else {
        await supabaseServer.from("activity_logs").insert({
          event_type: "referral_invalid",
          description: `Invalid referral code on payment: ${referral_code}`,
          ip_address,
          actor_role: "user",
          created_at: paid_at,
        })
      }
    }

    const meta = { referral_code, device: hdrs.get("user-agent") || null }

    let rpcError: any = null
    let shouldBypass = false
    if (email === "wazimuautomate@gmail.com" && admin_access_code) {
      const { data: adminRow } = await supabaseServer
        .from("admin_access_codes")
        .select("access_code_hash,is_active")
        .eq("email", email)
        .limit(1)
        .maybeSingle()
      if (adminRow?.is_active && adminRow?.access_code_hash) {
        try {
          const ok = await bcrypt.compare(admin_access_code, adminRow.access_code_hash)
          shouldBypass = ok
        } catch {
          shouldBypass = false
        }
      }
    }

    log("api:payments:rpc", "Calling fn_record_payment_and_update_user RPC", "debug", { email, amount })
    const { error } = await supabaseServer.rpc("fn_record_payment_and_update_user", {
      p_name: name,
      p_email: email,
      p_phone: phone_number,
      p_amount: amount,
      p_ip: ip_address,
      p_course_category: course_category,
      p_agent_id: agent_id,
      p_paid_at: paid_at,
      p_metadata: meta,
    })
    rpcError = error || null
    if (rpcError) {
      log("api:payments:rpc", "RPC FAILED", "error", { error: rpcError })
    } else {
      log("api:payments:rpc", "RPC SUCCESS", "success", { email })
    }

    if (shouldBypass || rpcError) {
      log("api:payments:fallback", "Starting fallback recording", "info", { reason: shouldBypass ? "admin_bypass" : "rpc_failed" })
      try {
        await supabaseServer
          .from("activity_logs")
          .insert({
            event_type: shouldBypass ? "payment.admin_bypass" : "payment.failed",
            description: shouldBypass
              ? "Admin bypass applied, recording payment without RPC"
              : `Payment RPC failed: ${rpcError?.message || "unknown"}`,
            actor_role: "user",
            email,
            phone_number,
            ip_address,
            created_at: paid_at,
            metadata: { amount, course_category },
          })
      } catch { }
      // Fallback: record directly into payments and users tables
      // Dedup recent payment
      const dedupSince = new Date(Date.now() - 10 * 60 * 1000).toISOString()
      const { data: existingPay } = await supabaseServer
        .from("payments")
        .select("id")
        .eq("email", email)
        .eq("phone_number", phone_number)
        .gte("paid_at", dedupSince)
        .limit(1)
      if (!existingPay || existingPay.length === 0) {
        try {
          await supabaseServer
            .from("payments")
            .insert({
              name,
              email,
              phone_number,
              amount,
              ip_address,
              course_category,
              agent_name: referral_code || "default",
              paid_at,
              agent_id: agent_id,
            })
        } catch { }
      }
      // Upsert user row by email/phone
      const { data: existingUser } = await supabaseServer
        .from("users")
        .select("id")
        .or(`email.eq.${email},phone_number.eq.${phone_number}`)
        .limit(1)
      if (existingUser && existingUser.length > 0) {
        try {
          await supabaseServer
            .from("users")
            .update({
              name,
              ip_address,
              course_category,
              agent: referral_code || "default",
              agent_id: agent_id,
              status: "active",
            })
            .or(`email.eq.${email},phone_number.eq.${phone_number}`)
        } catch { }
      } else {
        try {
          await supabaseServer
            .from("users")
            .insert({
              name,
              email,
              phone_number,
              ip_address,
              course_category,
              agent: referral_code || "default",
              agent_id: agent_id,
              status: "active",
            })
        } catch { }
      }
      return NextResponse.json({ ok: true, fallback: true, admin_bypass: shouldBypass || undefined })
    }

    // Log payment initiation/completion on server
    try {
      await supabaseServer
        .from("activity_logs")
        .insert({
          event_type: "payment.initiated",
          description: `Payment recorded for ${email || phone_number}`,
          actor_role: "user",
          email,
          phone_number,
          ip_address,
          created_at: paid_at,
          metadata: { amount, course_category },
        })
    } catch { }
    // Ensure payments and users tables reflect the transaction even when RPC succeeded
    const { data: existingPay2 } = await supabaseServer
      .from("payments")
      .select("id")
      .eq("email", email)
      .eq("phone_number", phone_number)
      .gte("paid_at", paid_at)
      .limit(1)
    if (!existingPay2 || existingPay2.length === 0) {
      try {
        await supabaseServer
          .from("payments")
          .insert({
            name,
            email,
            phone_number,
            amount,
            ip_address,
            course_category,
            agent_name: referral_code || "default",
            paid_at,
            agent_id: agent_id,
          })
      } catch { }
    }
    const { data: existingUser2 } = await supabaseServer
      .from("users")
      .select("id")
      .or(`email.eq.${email},phone_number.eq.${phone_number}`)
      .limit(1)
    if (existingUser2 && existingUser2.length > 0) {
      try {
        await supabaseServer
          .from("users")
          .update({
            name,
            ip_address,
            course_category,
            agent: referral_code || "default",
            agent_id: agent_id,
            status: "active",
          })
          .or(`email.eq.${email},phone_number.eq.${phone_number}`)
      } catch { }
    } else {
      try {
        await supabaseServer
          .from("users")
          .insert({
            name,
            email,
            phone_number,
            ip_address,
            course_category,
            agent: referral_code || "default",
            agent_id: agent_id,
            status: "active",
          })
      } catch { }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to process payment" }, { status: 500 })
  }
}
