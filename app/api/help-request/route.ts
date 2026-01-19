import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export const dynamic = "force-dynamic"

// Primary and secondary WhatsApp numbers
const PRIMARY_NUMBER = "254713111921" // 0713111921
const SECONDARY_NUMBER = "254790295408" // 0790295408 (silent)

export async function POST() {
    try {
        // Fetch current counter from system_settings
        const { data: settings, error: fetchError } = await supabaseServer
            .from("system_settings")
            .select("id, help_request_counter")
            .limit(1)
            .maybeSingle()

        if (fetchError) {
            console.error("Error fetching settings:", fetchError)
            // Fallback to primary if DB fails
            return NextResponse.json({
                targetNumber: PRIMARY_NUMBER,
                isSilent: false,
            })
        }

        // Get current counter (default to 0 if null or no settings row)
        const currentCounter = settings?.help_request_counter ?? 0

        // Determine target: even -> Primary, odd -> Secondary
        const isSilent = currentCounter % 2 === 1
        const targetNumber = isSilent ? SECONDARY_NUMBER : PRIMARY_NUMBER

        // Increment the counter in the database
        const newCounter = currentCounter + 1

        if (settings?.id) {
            // Update existing row
            const { error: updateError } = await supabaseServer
                .from("system_settings")
                .update({ help_request_counter: newCounter })
                .eq("id", settings.id)

            if (updateError) {
                console.error("Error updating counter:", updateError)
                // Still return target even if update fails
            }
        } else {
            // Insert new row if none exists (with counter = 1 since we're using the 0th request now)
            const { error: insertError } = await supabaseServer
                .from("system_settings")
                .insert({ help_request_counter: newCounter })

            if (insertError) {
                console.error("Error inserting settings:", insertError)
            }
        }

        return NextResponse.json({
            targetNumber,
            isSilent,
        })
    } catch (error) {
        console.error("Help request API error:", error)
        // Fallback to primary on any error
        return NextResponse.json({
            targetNumber: PRIMARY_NUMBER,
            isSilent: false,
        })
    }
}
