"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, FileText, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  sources?: Source[]
  createdAt: Date
}

type Source = {
  documentName: string
  documentType: string
  relevance: number
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [passcode, setPasscode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if user is already verified
  useEffect(() => {
    const verified = localStorage.getItem('chatVerified')
    if (verified === 'true') {
      setIsVerified(true)
    }
  }, [])

  const handleVerify = async () => {
    if (!passcode.trim()) return

    setIsVerifying(true)
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode }),
      })

      if (!response.ok) {
        throw new Error('Invalid passcode')
      }

      setIsVerified(true)
      localStorage.setItem('chatVerified', 'true')
      toast({
        title: "Success",
        description: "Passcode verified successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid passcode",
        variant: "destructive",
      })
      setPasscode("")
    } finally {
      setIsVerifying(false)
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const messageId = Date.now().toString()

    // Add user message to chat
    const userMessage: Message = {
      id: messageId,
      role: "user",
      content: input,
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Send message to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const data = await response.json()

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.content,
          sources: data.sources,
          createdAt: new Date(),
        },
      ])
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      })

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "system",
          content: "Sorry, I couldn't process your request. Please try again later.",
          createdAt: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVerified) {
    return (
      <Card className="h-[calc(100vh-200px)] flex flex-col">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-lg">Verify Passcode</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="max-w-sm w-full space-y-4">
            <div className="flex flex-col items-center gap-2">
              <Lock className="h-12 w-12 text-gray-400" />
              <p className="text-center text-sm text-gray-600">
                Please enter the passcode to access the chat interface
              </p>
            </div>
            <Input
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleVerify()
                }
              }}
            />
            <Button 
              className="w-full" 
              onClick={handleVerify}
              disabled={isVerifying || !passcode.trim()}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[calc(100vh-200px)] flex flex-col">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-lg">Chat with Your Documents</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        <div className="flex-1 overflow-auto px-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div className="max-w-md">
                <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                <p className="text-gray-500 text-sm">
                  Upload your documents and ask questions about them. The AI will use your materials to provide accurate
                  answers.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col">
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-100 ml-auto max-w-[80%]"
                        : message.role === "system"
                          ? "bg-gray-200 max-w-full"
                          : "bg-white border max-w-[80%]"
                    }`}
                  >
                    <p className="text-sm font-semibold mb-1">
                      {message.role === "user" ? "You" : message.role === "system" ? "System" : "AI Assistant"}
                    </p>
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {/* Show sources if available */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Sources:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((source, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                              <FileText className="h-3 w-3" />
                              {source.documentName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(message.createdAt).toLocaleTimeString()}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your documents..."
              className="flex-1 min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="self-end">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
