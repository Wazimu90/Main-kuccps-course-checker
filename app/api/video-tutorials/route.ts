import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

// GET - Fetch all video tutorials (or only active ones for public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const includeInactive = searchParams.get("includeInactive") === "true"

        let query = supabaseServer
            .from("video_tutorials")
            .select("*")
            .order("display_order", { ascending: true })

        // Only show active videos for public requests if specifically requested? 
        // actually, if includeInactive is false (default), we only return active ones.
        // But wait, "public" requests usually go through this same API route?
        // Ah, the CLIENT component on the public page fetches this same API.
        // If we use supabaseServer, we BYPASS RLS. 
        // So we MUST implement the filtering logic manually here, which we already have!

        if (!includeInactive) {
            query = query.eq("is_active", true)
        }

        const { data, error } = await query

        if (error) {
            console.error("Error fetching video tutorials:", error)
            return NextResponse.json(
                { error: "Failed to fetch video tutorials", details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ videos: data || [] })
    } catch (error) {
        console.error("Error in GET /api/video-tutorials:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST - Create a new video tutorial (admin-only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, description, youtube_id, duration, display_order } = body

        // Validation
        if (!title || !description || !youtube_id) {
            return NextResponse.json(
                { error: "Missing required fields: title, description, youtube_id" },
                { status: 400 }
            )
        }

        // Insert new video tutorial
        const { data, error } = await supabaseServer
            .from("video_tutorials")
            .insert({
                title,
                description,
                youtube_id,
                duration: duration || null,
                display_order: display_order || 0,
                is_active: true,
            })
            .select()
            .single()

        if (error) {
            console.error("Error creating video tutorial:", error)
            return NextResponse.json(
                { error: "Failed to create video tutorial", details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { message: "Video tutorial created successfully", video: data },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error in POST /api/video-tutorials:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
