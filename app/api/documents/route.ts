import { NextResponse } from "next/server"
import { getDocuments } from "@/lib/document-service"

export async function GET() {
  try {
    const documents = await getDocuments()

    return NextResponse.json({
      documents,
    })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      { error: `Failed to fetch documents: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
