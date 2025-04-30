import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { searchVectorStore } from "@/lib/vector-store"
import { getDocumentInfo } from "@/lib/document-service"

export async function POST(req: Request) {
  try {
    console.log("Chat API called")

    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log("Invalid messages format")
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Get the last user message
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")

    if (!lastUserMessage) {
      console.log("No user message found")
      return NextResponse.json({ error: "No user message found" }, { status: 400 })
    }

    console.log(`Processing query: "${lastUserMessage.content}"`)

    // Search for relevant context in the vector store
    console.log("Searching vector store for relevant content")
    const relevantChunks = await searchVectorStore(lastUserMessage.content)
    console.log(`Found ${relevantChunks.length} relevant chunks`)

    // Create context from relevant chunks
    const context = relevantChunks
      .map((chunk) => {
        return `Source: ${chunk.metadata.source}\n${chunk.content}`
      })
      .join("\n\n")

    console.log("Generating AI response")

    // Generate response using AI with context
    let aiResponse
    try {
      aiResponse = await generateText({
        model: openai("gpt-4o"),
        system: `You are a helpful assistant that answers questions based on the provided context. 
        If the context doesn't contain relevant information to answer the question, say so politely.
        Always provide accurate information based only on the context provided.
        
        Context:
        ${context || "No relevant context found."}`,
        prompt: lastUserMessage.content,
      })

      console.log("AI response generated successfully")
    } catch (aiError) {
      console.error("Error generating AI response:", aiError)

      // Provide a fallback response
      return NextResponse.json({
        content: "I'm having trouble processing your request with the AI model. Please try again later.",
        sources: [],
      })
    }

    // Get document info for sources
    console.log("Gathering source information")
    const sources = await Promise.all(
      relevantChunks.map(async (chunk) => {
        const documentName = chunk.metadata.source
        const documentInfo = await getDocumentInfo(chunk.metadata.documentId)

        return {
          documentName,
          documentType: documentInfo?.type || "unknown",
          relevance: chunk.similarity,
        }
      }),
    )

    // Filter out duplicate sources
    const uniqueSources = sources.filter(
      (source, index, self) => index === self.findIndex((s) => s.documentName === source.documentName),
    )

    console.log("Chat API completed successfully")
    return NextResponse.json({
      content: aiResponse.text,
      sources: uniqueSources,
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: `Failed to generate response: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
