import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

// GET - Fetch a single video tutorial
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const { data, error } = await supabaseServer
            .from("video_tutorials")
            .select("*")
            .eq("id", id)
            .single()

        if (error || !data) {
            return NextResponse.json(
                { error: "Video tutorial not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ video: data })
    } catch (error) {
        console.error("Error in GET /api/video-tutorials/[id]:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// PUT - Update a video tutorial (admin-only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { title, description, youtube_id, duration, display_order, is_active } = body

        // Build update object with only provided fields
        const updateData: any = {}
        if (title !== undefined) updateData.title = title
        if (description !== undefined) updateData.description = description
        if (youtube_id !== undefined) updateData.youtube_id = youtube_id
        if (duration !== undefined) updateData.duration = duration
        if (display_order !== undefined) updateData.display_order = display_order
        if (is_active !== undefined) updateData.is_active = is_active

        const { data, error } = await supabaseServer
            .from("video_tutorials")
            .update(updateData)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Error updating video tutorial:", error)
            return NextResponse.json(
                { error: "Failed to update video tutorial", details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: "Video tutorial updated successfully",
            video: data,
        })
    } catch (error) {
        console.error("Error in PUT /api/video-tutorials/[id]:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// DELETE - Delete a video tutorial (admin-only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const { error } = await supabaseServer
            .from("video_tutorials")
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Error deleting video tutorial:", error)
            return NextResponse.json(
                { error: "Failed to delete video tutorial", details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: "Video tutorial deleted successfully",
        })
    } catch (error) {
        console.error("Error in DELETE /api/video-tutorials/[id]:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
