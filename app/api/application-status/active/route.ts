import { supabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// GET only active/open applications
export async function GET() {
    try {
        const supabase = supabaseServer

        const { data, error } = await supabase
            .from("application_status")
            .select("*")
            .eq("is_open", true)
            .order("application_type", { ascending: true })

        if (error) {
            console.error("Error fetching active application statuses:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ activeStatuses: data || [] })
    } catch (error) {
        console.error("Unexpected error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
