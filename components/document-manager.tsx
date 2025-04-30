"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileUp, Loader2, Trash2, FileText, FileIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Document = {
  id: string
  name: string
  type: string
  size: number
  uploaded_at: string
  chunk_count: number
}

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Fetch existing documents when component mounts
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/documents")
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast({
        title: "Error",
        description: "Failed to load documents. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    const files = Array.from(e.target.files)

    try {
      // Create form data with files
      const formData = new FormData()
      files.forEach((file) => {
        console.log(`Adding file to form data: ${file.name}, size: ${file.size}, type: ${file.type}`)
        formData.append("files", file)
      })

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 300)

      // Upload files to API
      console.log("Sending files to API...")
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Handle response
      const responseText = await response.text()
      console.log("Raw API response:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Error parsing response:", parseError)
        throw new Error("Invalid response from server")
      }

      if (!response.ok) {
        throw new Error(data.error || `Upload failed: ${response.status} ${response.statusText}`)
      }

      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded and processed successfully.`,
      })

      // Refresh document list
      fetchDocuments()
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload and process files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Delete failed: ${response.status} ${response.statusText}`)
      }

      // Remove document from state
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))

      toast({
        title: "Document deleted",
        description: "Document has been removed from the system.",
      })
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType === "pdf") return <FileText className="h-4 w-4" />
    if (fileType === "ppt" || fileType === "pptx") return <FileIcon className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card className="msforms-card">
      <CardHeader className="pb-2 pt-4 border-b">
        <CardTitle className="text-lg text-msforms-700">Document Library</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 mt-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="default"
            disabled={isUploading}
            className="w-full flex items-center gap-2 py-1.5 h-auto text-sm bg-msforms-600 hover:bg-msforms-700"
          >
            {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileUp className="h-3 w-3" />}
            {isUploading ? "Uploading..." : "Upload Documents"}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            multiple
            accept=".pdf,.ppt,.pptx,.doc,.docx,.txt"
          />

          {isUploading && (
            <div className="mt-2">
              <Progress value={uploadProgress} className="h-1.5 bg-gray-100" />
              <p className="text-xs text-gray-500 mt-0.5 text-right">{uploadProgress}%</p>
            </div>
          )}

          <p className="text-[10px] text-gray-500 mt-1">Supported: PDF, PPT, PPTX, DOC, DOCX, TXT</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-medium mb-1.5 text-msforms-700">Your Documents</h3>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-msforms-500" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-xs">No documents uploaded yet</div>
          ) : (
            <div className="space-y-1">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-1.5 bg-gray-50 rounded-md text-sm hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {getFileIcon(doc.type)}
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">{doc.type.toUpperCase()}</span>
                        <span className="text-[10px] text-gray-500">•</span>
                        <span className="text-[10px] text-gray-500">{formatFileSize(doc.size)}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteDocument(doc.id)} className="h-6 w-6 p-0">
                    <Trash2 className="h-3 w-3 text-gray-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

