import { NextResponse } from "next/server"
import { deleteDocument } from "@/lib/document-service"
import { deleteDocumentEmbeddings } from "@/lib/vector-store"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // Delete document embeddings from vector store
    await deleteDocumentEmbeddings(id)

    // Delete document metadata
    await deleteDocument(id)

    return NextResponse.json({
      message: "Document deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json(
      { error: `Failed to delete document: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
