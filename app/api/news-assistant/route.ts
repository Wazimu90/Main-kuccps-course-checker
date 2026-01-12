import { NextRequest, NextResponse } from "next/server"

/**
 * AI Chat System for News Assistant
 */
const SYSTEM_PROMPT = `You are a helpful and knowledgeable News Assistant for Bingwa News.
Your goal is to help users find relevant news articles, answer questions about recent education updates, and summarize key topics.

Context:
You have access to a list of recent news articles provided in the context.
Refer to these articles to answer user questions.

Guidelines:
1. **Be Accurate**: Base your answers on the provided news articles.
2. **Be Helpful**: If a user asks broadly, summarize the most important news.
3. **Suggest Articles**: When answering, recommend specific articles by title if relevant.
4. **Friendly Tone**: Keep the conversation friendly and professional.
5. **Concise**: Keep answers short and easy to read.

If the user asks about something NOT in the news provided, say you don't have that information right now but they can check the search bar.
`

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { messages, contextData } = body
        const { articles } = contextData || {}

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: "AI service not configured", content: null },
                { status: 500 }
            )
        }

        // Prepare context from articles
        let newsContext = "RECENT NEWS ARTICLES:\n"
        if (articles && Array.isArray(articles)) {
            newsContext += articles.slice(0, 15).map((a: any, i: number) => {
                return `${i + 1}. TITLE: ${a.title}\nCATEGORY: ${a.category}\nSUMMARY: ${a.content.substring(0, 200)}...\n`
            }).join("\n")
        } else {
            newsContext += "No articles available."
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: SYSTEM_PROMPT + "\n" + newsContext }]
                },
                contents: messages.map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                })),
                generationConfig: {
                    temperature: 0.5,
                    maxOutputTokens: 800,
                }
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Gemini API Error (News):", errorText)
            throw new Error(`Gemini API error: ${response.status}`)
        }

        const json = await response.json()
        const content = json?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't find an answer to that."

        return NextResponse.json({ content })

    } catch (error) {
        console.error("Error in News AI:", error)
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        )
    }
}
