import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET() {
    try {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { count, error } = await supabaseServer
            .from("news")
            .select("*", { count: "exact", head: true })
            .eq("status", "published")
            .gte("created_at", sevenDaysAgo.toISOString())

        if (error) {
            console.error("Error fetching unread news count:", error)
            return NextResponse.json({ count: 0 }, { status: 200 })
        }

        return NextResponse.json({ count: count ?? 0 })
    } catch (error) {
        console.error("Error in unread-count endpoint:", error)
        return NextResponse.json({ count: 0 }, { status: 200 })
    }
}
