import { generateEmbedding } from "ai"
import { openai } from "@ai-sdk/openai"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

type DocumentChunk = {
  content: string
  metadata: {
    source: string
    documentId?: string
    page?: number
    chunk: number
  }
}

type SearchResult = {
  id: string
  content: string
  metadata: {
    source: string
    documentId: string
    page?: number
    chunk: number
  }
  similarity: number
}

export async function storeEmbeddings(chunks: DocumentChunk[], source: string, documentId?: string): Promise<string> {
  const docId = documentId || uuidv4()
  console.log(`Generating embeddings for document: ${source} with ID: ${docId}`)

  try {
    // For simplicity and reliability, we'll process one chunk at a time
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      try {
        console.log(`Generating embedding for chunk ${i + 1}/${chunks.length}`)

        // Generate embedding
        let embedding
        try {
          const result = await generateEmbedding({
            model: openai.embedding("text-embedding-ada-002"),
            text: chunk.content,
          })
          embedding = result.embedding
        } catch (embeddingError) {
          console.error(`Error generating embedding, using fallback:`, embeddingError)
          // Use a fallback embedding (all zeros) if the API fails
          embedding = Array(1536).fill(0)
        }

        // Prepare the record
        const record = {
          id: uuidv4(),
          document_id: docId,
          content: chunk.content,
          embedding,
          metadata: {
            ...chunk.metadata,
            documentId: docId,
            source,
          },
        }

        // Store in Supabase
        const { error } = await supabase.from("embeddings").insert(record)

        if (error) {
          console.error("Error storing embedding in Supabase:", error)
        } else {
          console.log(`Successfully stored embedding ${i + 1}`)
        }
      } catch (error) {
        console.error(`Error processing chunk ${i + 1}:`, error)
        // Continue with next chunk
      }
    }

    return docId
  } catch (error) {
    console.error("Error in storeEmbeddings:", error)
    // Return the document ID anyway so we can at least store the document metadata
    return docId
  }
}

export async function searchVectorStore(query: string, limit = 5): Promise<SearchResult[]> {
  try {
    console.log(`Searching vector store for: "${query}"`)

    // Generate embedding for the query
    let embedding
    try {
      const result = await generateEmbedding({
        model: openai.embedding("text-embedding-ada-002"),
        text: query,
      })
      embedding = result.embedding
    } catch (error) {
      console.error("Error generating search embedding:", error)
      return []
    }

    // Search for similar content in the vector store
    const { data, error } = await supabase.rpc("match_embeddings", {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit,
    })

    if (error) {
      console.error("Error searching vector store:", error)
      return []
    }

    console.log(`Found ${data?.length || 0} matching results`)
    return (data as SearchResult[]) || []
  } catch (error) {
    console.error("Error in searchVectorStore:", error)
    return []
  }
}

export async function deleteDocumentEmbeddings(documentId: string): Promise<void> {
  try {
    console.log(`Deleting embeddings for document: ${documentId}`)
    const { error } = await supabase.from("embeddings").delete().eq("document_id", documentId)

    if (error) {
      console.error("Error deleting document embeddings:", error)
    } else {
      console.log(`Successfully deleted embeddings for document: ${documentId}`)
    }
  } catch (error) {
    console.error("Error in deleteDocumentEmbeddings:", error)
  }
}
