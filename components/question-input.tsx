"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface QuestionInputProps {
  onSubmit: (questions: string[], numQuestions: number) => void
  onCancel: () => void
  isLoading?: boolean
}

export function QuestionInput({ onSubmit, onCancel, isLoading = false }: QuestionInputProps) {
  const [questionsText, setQuestionsText] = useState("")
  const [numQuestions, setNumQuestions] = useState(3)

  const handleSubmit = () => {
    const questions = questionsText
      .split("\n")
      .filter((q) => q.trim() !== "")
      .map((q) => q.trim())

    if (questions.length === 0) {
      return
    }

    onSubmit(questions, numQuestions)
  }

  return (
    <Card className="p-6 border border-gray-200 mt-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="num-questions" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Questions
          </Label>
          <Input
            id="num-questions"
            type="number"
            min={1}
            max={10}
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number.parseInt(e.target.value) || 1)}
            className="w-full"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="questions-input" className="block text-sm font-medium text-gray-700 mb-1">
            Enter Your Questions (one per line)
          </Label>
          <Textarea
            id="questions-input"
            value={questionsText}
            onChange={(e) => setQuestionsText(e.target.value)}
            placeholder="Enter your questions here, one per line"
            rows={5}
            className="w-full"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">These questions will replace the dummy questions in the form.</p>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Add Questions"
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
