import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

type DocumentChunk = {
  content: string
  metadata: {
    source: string
    documentId?: string
    page?: number
    chunk: number
  }
}

export async function processDocument(
  buffer: Buffer,
  fileExtension: string,
  fileName: string,
): Promise<{ text: string; chunks: DocumentChunk[] }> {
  let text = ""

  try {
    console.log(`Processing document: ${fileName} (${fileExtension})`)

    // Process based on file type
    if (fileExtension === "pdf") {
      // For PDF files, we'll use a simpler approach for now
      // In a production app, you'd use a proper PDF parsing library
      text = `Sample content from PDF file: ${fileName}. This is placeholder text for demonstration purposes.`
      console.log("Using placeholder text for PDF file")
    } else if (fileExtension === "ppt" || fileExtension === "pptx") {
      // For PPT files, we'll use a simple approach
      text = `Sample content from PowerPoint file: ${fileName}. This is placeholder text for demonstration purposes.`
      console.log("Using placeholder text for PowerPoint file")
    } else if (fileExtension === "doc" || fileExtension === "docx") {
      // For Word documents
      text = `Sample content from Word document: ${fileName}. This is placeholder text for demonstration purposes.`
      console.log("Using placeholder text for Word document")
    } else {
      // For other file types, try to read as text
      text = buffer.toString("utf8")
      console.log(`Read ${text.length} characters from text file`)
    }

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })

    // If text is empty, add some placeholder content
    if (!text || text.trim() === "") {
      text = `Empty or unprocessable file: ${fileName}. This is placeholder text for demonstration purposes.`
      console.log("Using placeholder text for empty file")
    }

    const rawChunks = await splitter.splitText(text)
    console.log(`Split text into ${rawChunks.length} chunks`)

    // Format chunks with metadata
    const chunks: DocumentChunk[] = rawChunks.map((chunk, index) => ({
      content: chunk,
      metadata: {
        source: fileName,
        chunk: index,
      },
    }))

    return { text, chunks }
  } catch (error) {
    console.error(`Error in processDocument for ${fileName}:`, error)
    // Return minimal content to prevent complete failure
    const fallbackText = `Error processing file: ${fileName}. This is placeholder text for demonstration purposes.`
    const fallbackChunks: DocumentChunk[] = [
      {
        content: fallbackText,
        metadata: {
          source: fileName,
          chunk: 0,
        },
      },
    ]
    return { text: fallbackText, chunks: fallbackChunks }
  }
}
