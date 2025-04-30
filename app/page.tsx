"use client"

import { useState, useEffect } from "react"
import { DocumentManager } from "@/components/document-manager"
import { ChatInterface } from "@/components/chat-interface"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    console.log("Home component mounted")
    setIsLoaded(true)
  }, [])

  return (
    <main className="container mx-auto max-w-6xl p-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Document Q&A Assistant</h1>
      <p className="mb-8 text-gray-600">
        Upload your documents, then ask questions to get AI-powered answers based on your content.
      </p>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DocumentManager />
          </div>
          <div className="lg:col-span-2">
            <ChatInterface />
          </div>
        </div>
      ) : (
        <div className="text-center py-12">Loading application...</div>
      )}
    </main>
  )
}
