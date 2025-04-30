import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

type DocumentMetadata = {
  id: string
  name: string
  type: string
  size: number
  uploaded_at: string
  chunk_count: number
}

export async function saveDocumentMetadata(document: DocumentMetadata): Promise<void> {
  try {
    console.log(`Saving document metadata: ${document.name}`)

    // Check if document already exists
    const { data: existingDoc } = await supabase.from("documents").select("id").eq("id", document.id).single()

    if (existingDoc) {
      console.log(`Document ${document.id} already exists, updating...`)
      const { error } = await supabase.from("documents").update(document).eq("id", document.id)

      if (error) {
        console.error("Error updating document metadata:", error)
        throw new Error(`Failed to update document metadata: ${error.message}`)
      }
    } else {
      // Insert new document
      const { error } = await supabase.from("documents").insert(document)

      if (error) {
        console.error("Error saving document metadata:", error)
        throw new Error(`Failed to save document metadata: ${error.message}`)
      }
    }

    console.log(`Successfully saved document metadata for: ${document.name}`)
  } catch (error) {
    console.error("Error in saveDocumentMetadata:", error)
    throw error
  }
}

export async function getDocuments(): Promise<DocumentMetadata[]> {
  try {
    console.log("Fetching documents from Supabase")
    const { data, error } = await supabase.from("documents").select("*").order("uploaded_at", { ascending: false })

    if (error) {
      console.error("Error fetching documents:", error)
      return []
    }

    console.log(`Retrieved ${data?.length || 0} documents`)
    return data || []
  } catch (error) {
    console.error("Error in getDocuments:", error)
    return []
  }
}

export async function getDocumentInfo(documentId: string): Promise<DocumentMetadata | null> {
  try {
    console.log(`Fetching document info for ID: ${documentId}`)
    const { data, error } = await supabase.from("documents").select("*").eq("id", documentId).single()

    if (error) {
      console.error("Error fetching document info:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getDocumentInfo:", error)
    return null
  }
}

export async function deleteDocument(documentId: string): Promise<void> {
  try {
    console.log(`Deleting document with ID: ${documentId}`)
    const { error } = await supabase.from("documents").delete().eq("id", documentId)

    if (error) {
      console.error("Error deleting document:", error)
    } else {
      console.log(`Successfully deleted document with ID: ${documentId}`)
    }
  } catch (error) {
    console.error("Error in deleteDocument:", error)
  }
}
