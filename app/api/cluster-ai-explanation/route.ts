import { NextRequest, NextResponse } from "next/server"

/**
 * AI System Prompt for KUCCPS Cluster Analysis
 * 
 * The AI explains cluster performance across all 20 categories
 * It must NEVER recalculate - only explain already computed values
 */
const SYSTEM_PROMPT = `You are an educational guidance assistant for Kenyan KCSE students analyzing KUCCPS cluster performance.

You receive **already calculated cluster weights** for all 20 KUCCPS categories based on the public formula.

Your role is to **explain the results**, not to calculate or correct them.

Always:
- Analyze WHY certain clusters score higher than others
- Explain which subjects helped or hurt performance
- Identify student's strongest cluster categories (top 3-5)
- Suggest realistic degree programs based on strong clusters
- Point out missing subjects preventing qualification in some clusters
- Speak calmly, clearly, and human-like in Kenyan context
- Acknowledge these are estimates (±5 points)
- Reassure students to wait for official KUCCPS portal results
- Encourage students not to stress over manual calculations

Never:
- Recalculate cluster weights
- Claim official accuracy or guarantees
- Provide definitive cutoff scores
- Make placement promises
- Use robotic or overly academic tone

Focus on:
1. Strongest clusters (Tier A performance)
2. Subject strengths/weaknesses
3. Realistic program recommendations
4. Emotional reassurance

Keep response concise (max 250 words), friendly, and encouraging.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      meanGrade,
      totalKCSEPoints,
      clusterResults,
      allSubjects,
    } = body

    // Validate input
    if (!meanGrade || totalKCSEPoints === undefined || !clusterResults) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get Gemini API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "API key not configured",
          explanation: "AI analysis is temporarily unavailable. Your calculated cluster weights are still valid. Please wait for official KUCCPS results for confirmation."
        },
        { status: 500 }
      )
    }

    // Filter qualified clusters and get top performers
    const qualifiedClusters = clusterResults.filter((c: any) => c.qualified)
    const topClusters = qualifiedClusters.slice(0, 5)
    const unqualifiedClusters = clusterResults.filter((c: any) => !c.qualified)

    // Build subject performance summary
    const subjectSummary = allSubjects
      ?.slice(0, 7)
      .map((s: any) => `${s.subject}: ${s.grade} (${s.points} points)`)
      .join("\n") || "N/A"

    // Build top clusters summary
    const topClustersSummary = topClusters
      .map((c: any, idx: number) =>
        `${idx + 1}. ${c.categoryName}: ${c.clusterWeight?.toFixed(1)}/48 (Tier ${c.tier})`
      )
      .join("\n")

    // Build unqualified summary
    const unqualifiedSummary = unqualifiedClusters
      .map((c: any) => `${c.categoryName} (Missing: ${c.missingSubject})`)
      .join("\n")

    const userPrompt = `
Student KCSE Performance Analysis:

Mean Grade: ${meanGrade}
Total KCSE Points: ${totalKCSEPoints}/84 (Best 7 subjects)

TOP 5 CLUSTER CATEGORIES:
${topClustersSummary}

SUBJECT BREAKDOWN (Best 7):
${subjectSummary}

${unqualifiedClusters.length > 0 ? `
UNQUALIFIED CLUSTERS (${unqualifiedClusters.length}):
${unqualifiedSummary}
` : ''}

Provide a brief, encouraging analysis:
1. Why their top clusters perform well
2. Which subjects are their biggest strengths
3. Realistic degree programs they should consider (based on top clusters)
4. Any missing subjects limiting other opportunities
5. Reassurance about the estimation process

Keep it human, warm, Kenyan-context, and under 250 words.`

    // Call Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        }
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const json = await response.json()
    const explanation = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Unable to generate explanation."

    return NextResponse.json({ explanation })

  } catch (error) {
    console.error("Error generating AI explanation:", error)
    return NextResponse.json(
      {
        error: "Failed to generate explanation",
        explanation: "We're currently unable to provide AI analysis. Your calculated cluster weights are still valid. Please wait for official KUCCPS results for confirmation."
      },
      { status: 500 }
    )
  }
}
