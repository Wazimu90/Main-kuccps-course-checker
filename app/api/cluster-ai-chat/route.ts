import { NextRequest, NextResponse } from "next/server"

/**
 * AI Chat System for KUCCPS Cluster Analysis
 */
const SYSTEM_PROMPT = `You are a helpful, encouraging, and knowledgeable educational assistant for a Kenyan KCSE student.
Your name is "Bingwa AI".

Context:
The student has just calculated their KUCCPS cluster weights. You have access to their grades and calculation results.
Your goal is to explain their performance, suggest courses, and answer their questions about university placement in Kenya.

Guidelines:
1. **Be Encouraging & Empathetic**: KCSE results can be stressful. Speak warmly.
2. **Be Realistic**: Acknowledge that cluster weights are estimates (±5 points).
3. **No False Promises**: Never guarantee admission. Use words like "likely", "competitive for", "strong chance".
4. **Kenyan Context**: Use local context where appropriate (e.g., mention KUCCPS, TVET if grades are lower, popular universities).
5. **Concise**: Keep responses easy to read on mobile (short paragraphs).

Data Access:
You will be provided with the student's Mean Grade, Total KCSE Points, and Cluster Weights.
REFER to this data when answering. If a student asks "What can I do?", look at their strongest clusters.

Strict Rules:
- Do NOT recalculate cluster points. Assume the provided values are correct.
- If the student asks about a specific course, check if their cluster weight for that category is competitive (Tier A is >40, Tier B is 35-40).
- If they failed a required subject (e.g., Maths for Engineering), point it out gently.
`

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { messages, contextData } = body

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: "AI service temporarily unavailable" },
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
            console.error("Gemini API Error:", errorText)
            throw new Error(`Gemini API error: ${response.status}`)
        }

        const json = await response.json()
        const content = json?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble thinking right now."

        return NextResponse.json({ content })

    } catch (error) {
        console.error("Error in AI chat:", error)
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        )
    }
}
