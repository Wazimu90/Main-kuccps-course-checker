import { supabase } from "./supabase"

export interface ChatbotSettings {
  id?: string
  enabled: boolean
  welcome_message: string
  response_tone: string
  model: string
  temperature: number
  max_tokens: number
  updated_at?: string
}

export interface ChatbotHistory {
  id: string
  user_email: string
  user_name: string
  prompt: string
  response: string
  timestamp: string
  session_id: string
  result_id: string
}

export interface ChatbotApiKey {
  id: string
  api_key: string
  provider: string
  updated_at: string
}

export interface ContextFile {
  name: string
  updated_at: string
  size: number
}

// Chatbot Settings
export async function getChatbotSettings(): Promise<ChatbotSettings | null> {
  try {
    const { data, error } = await supabase.from("chatbot_settings").select("*").single()

    if (error) {
      console.error("Error fetching chatbot settings:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getChatbotSettings:", error)
    return null
  }
}

export async function updateChatbotSettings(settings: Partial<ChatbotSettings>): Promise<boolean> {
  try {
    const { error } = await supabase.from("chatbot_settings").upsert({
      ...settings,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error updating chatbot settings:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in updateChatbotSettings:", error)
    return false
  }
}

// API Key Management
export async function getChatbotApiKey(): Promise<string | null> {
  try {
    const { data, error } = await supabase.from("chatbot_api_key").select("api_key").single()

    if (error) {
      console.error("Error fetching API key:", error)
      return null
    }

    return data?.api_key || null
  } catch (error) {
    console.error("Error in getChatbotApiKey:", error)
    return null
  }
}

export async function updateChatbotApiKey(apiKey: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("chatbot_api_key").upsert({
      api_key: apiKey,
      provider: "openrouter",
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error updating API key:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in updateChatbotApiKey:", error)
    return false
  }
}

// Context Management - Storage Only
export async function uploadChatbotContext(file: File): Promise<boolean> {
  try {
    // Create a unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const fileName = `context-${timestamp}-${file.name}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("chatbot-contexts")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return false
    }

    console.log("File uploaded successfully:", uploadData)
    return true
  } catch (error) {
    console.error("Error in uploadChatbotContext:", error)
    return false
  }
}

export async function getChatbotContexts(): Promise<ContextFile[]> {
  try {
    const { data, error } = await supabase.storage.from("chatbot-contexts").list("", {
      limit: 100,
      offset: 0,
      sortBy: { column: "updated_at", order: "desc" },
    })

    if (error) {
      console.error("Error fetching contexts:", error)
      return []
    }

    return (
      data?.map((file) => ({
        name: file.name,
        updated_at: file.updated_at || file.created_at,
        size: file.metadata?.size || 0,
      })) || []
    )
  } catch (error) {
    console.error("Error in getChatbotContexts:", error)
    return []
  }
}

export async function deleteChatbotContext(fileName: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from("chatbot-contexts").remove([fileName])

    if (error) {
      console.error("Error deleting context:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteChatbotContext:", error)
    return false
  }
}

export async function getContextContent(): Promise<string> {
  try {
    // Get list of files in storage
    const { data: files, error: listError } = await supabase.storage.from("chatbot-contexts").list("", {
      limit: 100,
      sortBy: { column: "updated_at", order: "desc" },
    })

    if (listError || !files || files.length === 0) {
      console.log("No context files found, using default context")
      return "You are a helpful assistant for the KUCCPS Course Checker platform. Help students with course selection based on their KCSE results."
    }

    // Get the most recent file
    const latestFile = files[0]
    console.log("Loading context from file:", latestFile.name)

    // Download and read the file content
    const { data, error } = await supabase.storage.from("chatbot-contexts").download(latestFile.name)

    if (error) {
      console.error("Error downloading context file:", error)
      return "You are a helpful assistant for the KUCCPS Course Checker platform. Help students with course selection based on their KCSE results."
    }

    const text = await data.text()
    console.log("Context loaded successfully, length:", text.length)
    return text
  } catch (error) {
    console.error("Error in getContextContent:", error)
    return "You are a helpful assistant for the KUCCPS Course Checker platform. Help students with course selection based on their KCSE results."
  }
}

// Chat History
export async function saveChatHistory(
  userEmail: string,
  userName: string,
  prompt: string,
  response: string,
  sessionId: string,
  resultId?: string,
): Promise<boolean> {
  try {
    const { error } = await supabase.from("chatbot_history").insert({
      user_email: userEmail,
      user_name: userName,
      prompt,
      response,
      session_id: sessionId,
      result_id: resultId,
    })

    if (error) {
      console.error("Error saving chat history:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in saveChatHistory:", error)
    return false
  }
}

export async function getChatHistory(
  page = 1,
  limit = 50,
  search?: string,
): Promise<{
  data: ChatbotHistory[]
  total: number
}> {
  try {
    let query = supabase
      .from("chatbot_history")
      .select("*", { count: "exact" })
      .order("timestamp", { ascending: false })

    if (search) {
      query = query.or(`user_email.ilike.%${search}%,prompt.ilike.%${search}%,response.ilike.%${search}%`)
    }

    const { data, error, count } = await query.range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error("Error fetching chat history:", error)
      return { data: [], total: 0 }
    }

    return { data: data || [], total: count || 0 }
  } catch (error) {
    console.error("Error in getChatHistory:", error)
    return { data: [], total: 0 }
  }
}

export async function getUserChatHistory(userEmail: string): Promise<ChatbotHistory[]> {
  try {
    const { data, error } = await supabase
      .from("chatbot_history")
      .select("*")
      .eq("user_email", userEmail)
      .order("timestamp", { ascending: true })

    if (error) {
      console.error("Error fetching user chat history:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getUserChatHistory:", error)
    return []
  }
}

// Analytics
export async function getChatbotAnalytics(): Promise<{
  totalConversations: number
  averageResponseTime: number
  activeUsers: number
}> {
  try {
    // Get total conversations
    const { count: totalConversations } = await supabase
      .from("chatbot_history")
      .select("*", { count: "exact", head: true })

    // Get unique users count
    const { data: uniqueUsers } = await supabase.from("chatbot_history").select("user_email")

    const activeUsers = new Set(uniqueUsers?.map((u) => u.user_email)).size

    // For now, return mock average response time (can be calculated based on actual timestamps)
    const averageResponseTime = 1.2

    return {
      totalConversations: totalConversations || 0,
      averageResponseTime,
      activeUsers,
    }
  } catch (error) {
    console.error("Error in getChatbotAnalytics:", error)
    return {
      totalConversations: 0,
      averageResponseTime: 0,
      activeUsers: 0,
    }
  }
}

// OpenRouter API Integration
export async function sendChatMessage(message: string, userCourses: any[], apiKey: string): Promise<string> {
  try {
    // Get context from storage
    const context = await getContextContent()

    const systemPrompt = `${context}

You are a helpful assistant for the KUCCPS Course Checker platform. Your goal is to help students choose the best course from their qualified courses based on their KCSE results.

User's Qualified Courses: ${JSON.stringify(userCourses, null, 2)}

Guidelines:
- Only discuss topics related to the user's qualified courses and course selection
- Be friendly, concise, and informative
- Help with course recommendations, institution comparisons, cutoff analysis, and application guidance
- If asked about unrelated topics, politely redirect to course-related discussions
- Use the provided context and course data to give accurate advice`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "KUCCPS Course Checker",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || "Sorry, I could not generate a response."
  } catch (error) {
    console.error("Error sending chat message:", error)
    return "Sorry, there was an error processing your message. Please try again."
  }
}
