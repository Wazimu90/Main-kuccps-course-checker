import { supabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// GET all application statuses
export async function GET() {
    try {
        const supabase = supabaseServer

        const { data, error } = await supabase
            .from("application_status")
            .select("*")
            .order("application_type", { ascending: true })

        if (error) {
            console.error("Error fetching application statuses:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ statuses: data || [] })
    } catch (error) {
        console.error("Unexpected error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// POST - Create or update application status
export async function POST(request: Request) {
    try {
        const supabase = supabaseServer
        const body = await request.json()

        const { application_type, is_open, status_message, start_date, end_date } = body

        if (!application_type) {
            return NextResponse.json({ error: "application_type is required" }, { status: 400 })
        }

        // Upsert (insert or update)
        const { data, error } = await supabase
            .from("application_status")
            .upsert(
                {
                    application_type,
                    is_open: is_open ?? false,
                    status_message,
                    start_date,
                    end_date,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "application_type" }
            )
            .select()
            .single()

        if (error) {
            console.error("Error upserting application status:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ status: data })
    } catch (error) {
        console.error("Unexpected error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// PATCH - Update existing status
export async function PATCH(request: Request) {
    try {
        const supabase = supabaseServer
        const body = await request.json()

        const { id, application_type, is_open, status_message, start_date, end_date } = body

        if (!id && !application_type) {
            return NextResponse.json({ error: "id or application_type is required" }, { status: 400 })
        }

        const updateData: any = {}
        if (is_open !== undefined) updateData.is_open = is_open
        if (status_message !== undefined) updateData.status_message = status_message
        if (start_date !== undefined) updateData.start_date = start_date
        if (end_date !== undefined) updateData.end_date = end_date

        let query = supabase.from("application_status").update(updateData)

        if (id) {
            query = query.eq("id", id)
        } else {
            query = query.eq("application_type", application_type)
        }

        const { data, error } = await query.select().single()

        if (error) {
            console.error("Error updating application status:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ status: data })
    } catch (error) {
        console.error("Unexpected error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
