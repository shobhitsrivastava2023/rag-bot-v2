"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { QuestionList } from "@/components/question-list"
import { QuestionInput } from "@/components/question-input"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

// Define types for our form data
export type Question = {
  id: string
  text: string
  type: "text" | "choice" | "rating"
  options?: string[]
  correctAnswer?: string
}

// Initial dummy questions
const initialQuestions: Question[] = [
  {
    id: "q1",
    text: "What is the capital of France?",
    type: "choice",
    options: ["London", "Paris", "Berlin", "Madrid"],
    correctAnswer: "Paris",
  },
  {
    id: "q2",
    text: "What is 2 + 2?",
    type: "choice",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
  },
  {
    id: "q3",
    text: "Which of the following can detect an error if a programmer by mistake writes multiplication instead of division?",
    type: "choice",
    options: ["Interpreter", "Compiler or interpreter test", "Compiler", "None of the mentioned"],
    correctAnswer: "Compiler or interpreter test",
  },
]

export function FormBuilder() {
  const [formTitle, setFormTitle] = useState("MTE for AT2086/ International Relations (Jan-May 2024)")
  const [formDescription, setFormDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [showQuestionInput, setShowQuestionInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [totalPoints, setTotalPoints] = useState(30)
  const [studentName, setStudentName] = useState("")
  const [registrationNo, setRegistrationNo] = useState("")
  const { toast } = useToast()

  const addQuestion = (type: Question["type"]) => {
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      text: "New Question",
      type,
      options: type === "choice" ? ["Option 1", "Option 2", "Option 3", "Option 4"] : undefined,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updatedQuestion: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updatedQuestion } : q)))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleReplaceQuestions = async (newQuestions: string[], numQuestions: number) => {
    setIsLoading(true)
    try {
      // Create new questions based on input
      const updatedQuestions: Question[] = []

      for (let i = 0; i < Math.min(numQuestions, newQuestions.length); i++) {
        try {
          // Call AI to determine correct answers
          const response = await fetch("/api/get-correct-answer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: newQuestions[i],
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error("API Error:", errorData)
            throw new Error(errorData.error || `API error: ${response.status}`)
          }

          const data = await response.json()
          console.log("Generated question data:", data)

          // Extract options and correctAnswer from the object property
          const options = data.object?.options || data.options || ["Option A", "Option B", "Option C", "Option D"]
          const correctAnswer = data.object?.correctAnswer || data.correctAnswer || "Option A"

          updatedQuestions.push({
            id: `q${i + 1}`,
            text: newQuestions[i],
            type: "choice",
            options: options,
            correctAnswer: correctAnswer,
          })
        } catch (error) {
          console.error(`Error processing question ${i + 1}:`, error)
          // Add a fallback question if AI generation fails
          updatedQuestions.push({
            id: `q${i + 1}`,
            text: newQuestions[i],
            type: "choice",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
          })
        }
      }

      console.log("Updated questions:", updatedQuestions)
      setQuestions(updatedQuestions)
      setShowQuestionInput(false)

      toast({
        title: "Questions Updated",
        description: "Your questions have been updated with AI-generated answers.",
      })
    } catch (error) {
      console.error("Form Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process questions with AI. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="form-container">
        <div className="form-header">
          <h1 className="text-xl font-medium text-gray-800">{formTitle}</h1>
          <div className="points-display">Points: -/{totalPoints}</div>
        </div>

        <div className="p-4 bg-gray-50 border-b">
          <div className="mb-4">
            <label className="block mb-1">
              <span className="text-base font-medium">
                1. NAME OF THE STUDENT <span className="text-red-500">*</span>
              </span>
            </label>
            <Input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full"
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1">
              <span className="text-base font-medium">
                2. REGISTRATION NO. <span className="text-red-500">*</span>
              </span>
            </label>
            <Input
              value={registrationNo}
              onChange={(e) => setRegistrationNo(e.target.value)}
              placeholder="Enter your registration number"
              className="w-full"
            />
          </div>
        </div>

        <div className="p-4">
          <QuestionList questions={questions} onUpdateQuestion={updateQuestion} onDeleteQuestion={deleteQuestion} />
        </div>

        <div className="p-4">
          <Button
            variant="outline"
            className="flex items-center justify-center border-dashed border-2"
            onClick={() => setShowQuestionInput(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <PlusCircle className="h-5 w-5 mr-2 text-teal-600" />
                <span>Add Questions</span>
              </>
            )}
          </Button>

          {showQuestionInput && (
            <QuestionInput
              onSubmit={handleReplaceQuestions}
              onCancel={() => setShowQuestionInput(false)}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}
