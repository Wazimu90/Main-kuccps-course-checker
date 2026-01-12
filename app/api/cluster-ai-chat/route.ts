import { NextRequest, NextResponse } from "next/server"

/**
 * AI Chat System for KUCCPS Cluster Analysis
 */
const SYSTEM_PROMPT = `You are Kuccps Course checker News AI Assistant, a friendly and knowledgeable education assistant for students in Kenya. 
Your role is to help students understand their KCSE results, explore university coures, and navigate the KUCCPS placement process.

Personalize your responses using the Student's Data provided.
You are free to chat about general education topics, career advice, and student life in Kenya.
Verify course suggestions against the student's cluster weights if asked, but you can also suggest related fields if they don't qualify.
Keep your tone encouraging, realistic, and helpful.
If you don't know something, suggest checking the official KUCCPS website.
`

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { messages, contextData } = body

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
        if (!apiKey) {
            console.error("AI API Key missing. Checked GEMINI_API_KEY and GOOGLE_API_KEY")
            return NextResponse.json(
                { error: "AI service not configured", content: null },
                { status: 500 }
            )
        }

        // transform contextData into a readable string for the system prompt
        let studentContext = ""
        if (contextData) {
            const { meanGrade, totalKCSEPoints, clusterResults, allSubjects } = contextData

            const topClusters = clusterResults
                ?.filter((c: any) => c.qualified)
                .slice(0, 5)
                .map((c: any) => `${c.categoryName}: ${c.clusterWeight?.toFixed(1)} (Tier ${c.tier})`)
                .join(", ")

            const grades = allSubjects
                ?.map((s: any) => `${s.subject}: ${s.grade}`)
                .join(", ")

            studentContext = `
STUDENT DATA:
Mean Grade: ${meanGrade}
KCSE Total Points: ${totalKCSEPoints}/84
Subjects: ${grades}
Top Clusters: ${topClusters || "None qualified"}
`
        }

        // Call Gemini
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: SYSTEM_PROMPT + "\n" + studentContext }]
                },
                contents: messages.map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                })),
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                }
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Gemini API Error Status:", response.status)
            console.error("Gemini API Error Text:", errorText)
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
        }

        const json = await response.json()
        const content = json?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble thinking right now."

        return NextResponse.json({ content })

    } catch (error: any) {
        console.error("Critical Error in AI chat route:", error)
        console.error("Error Stack:", error.stack)
        return NextResponse.json(
            { error: `Failed to generate response: ${error.message}` },
            { status: 500 }
        )
    }
}
