import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

export async function POST(req: Request) {
  try {
    const { question } = await req.json()

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // Generate options and correct answer using AI with the environment variable
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      system: "You are an expert at creating multiple choice questions with one correct answer.",
      prompt: `Create 4 options for the following question, and indicate which one is correct: "${question}"`,
      schema: z.object({
        options: z.array(z.string()).length(4).describe("Four possible answer options"),
        correctAnswer: z.string().describe("The correct answer from the options"),
      }),
    })

    // Log the result for debugging
    console.log("API result:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing AI request:", error)
    return NextResponse.json(
      { error: `Failed to process request: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
