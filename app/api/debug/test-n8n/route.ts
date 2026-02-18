
import { NextResponse } from "next/server";
import { sendToN8nWebhook } from "@/lib/n8n-webhook";

/**
 * Debug Endpoint to test n8n webhook integration
 * 
 * Usage: GET /api/debug/test-n8n
 */
export async function GET(request: Request) {
    try {
        console.log("🛠️ Testing n8n webhook via API route...");

        // Test payload with perfect data
        const payload = {
            name: "Debug API User",
            phone: "+254727921038",
            paystackReference: "PAY-DEBUG-123XYZ",
            email: "wazimucreations@gmail.com",
            resultId: "debug-result-id-TEST"
        };

        console.log("📤 Sending test payload:", payload);

        // Check if ENV is loaded
        const envUrl = process.env.N8N_WEBHOOK_URL;
        if (!envUrl) {
            console.error("❌ N8N_WEBHOOK_URL is missing in process.env");
            return NextResponse.json({
                success: false,
                error: "N8N_WEBHOOK_URL is missing in environment variables"
            }, { status: 500 });
        }

        const result = await sendToN8nWebhook(payload);
        console.log("✅ Webhook result:", result);

        return NextResponse.json({
            success: true,
            result,
            envCheck: {
                hasUrl: !!envUrl,
                urlPreview: envUrl ? `${envUrl.substring(0, 20)}...` : null
            },
            payloadSent: payload
        });
    } catch (error: any) {
        console.error("❌ Test API error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
