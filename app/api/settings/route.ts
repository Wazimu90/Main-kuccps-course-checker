import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

// Force dynamic rendering and disable caching
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

/**
 * Public settings endpoint - returns only public settings like payment_amount
 * This endpoint is used by the frontend to fetch the current payment amount
 * without requiring admin authentication.
 */
export async function GET() {
    try {
        const { data, error } = await supabaseServer
            .from("system_settings")
            .select("payment_amount, maintenance_mode, payment_status")
            .limit(1)
            .maybeSingle()

        if (error) {
            console.error("[API:settings] Database error:", error.message)
            return NextResponse.json({
                error: "Failed to fetch settings",
                payment_amount: 200 // Fallback
            }, {
                status: 500,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            })
        }

        if (!data) {
            console.warn("[API:settings] No settings found in database, using defaults")
            return NextResponse.json({
                payment_amount: 200,
                maintenance_mode: false,
                payment_status: true
            }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            })
        }

        console.log("[API:settings] Settings loaded from database:", {
            payment_amount: data.payment_amount,
            maintenance_mode: data.maintenance_mode,
            payment_status: data.payment_status
        })

        return NextResponse.json({
            payment_amount: data.payment_amount ?? 200,
            maintenance_mode: data.maintenance_mode ?? false,
            payment_status: data.payment_status ?? true
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        })
    } catch (error) {
        console.error("[API:settings] Exception:", error)
        return NextResponse.json({
            error: "Internal Server Error",
            payment_amount: 200 // Fallback
        }, {
            status: 500,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        })
    }
}
