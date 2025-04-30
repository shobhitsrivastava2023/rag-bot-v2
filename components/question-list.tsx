"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Check, AlertCircle, Eye, EyeOff } from "lucide-react"
import type { Question } from "./form-builder"

interface QuestionListProps {
  questions: Question[]
  onUpdateQuestion: (id: string, question: Partial<Question>) => void
  onDeleteQuestion: (id: string) => void
}

export function QuestionList({ questions, onUpdateQuestion, onDeleteQuestion }: QuestionListProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [showAnswers, setShowAnswers] = useState(false)

  const handleOptionSelect = (questionId: string, option: string) => {
    setSelectedOptions({
      ...selectedOptions,
      [questionId]: option,
    })
  }

  const isCorrectAnswer = (questionId: string, option: string) => {
    const question = questions.find((q) => q.id === questionId)
    return question?.correctAnswer === option
  }

  const toggleShowAnswers = () => {
    setShowAnswers(!showAnswers)
  }

  return (
    <div className="space-y-4">
      {questions.length > 0 ? (
        <>
          <div className="flex justify-end mb-2">
            <Button onClick={toggleShowAnswers} variant="outline" className="text-sm flex items-center gap-1" size="sm">
              {showAnswers ? (
                <>
                  <EyeOff className="h-4 w-4" /> Hide Answers
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" /> Show Answers
                </>
              )}
            </Button>
          </div>

          {questions.map((question, index) => (
            <div key={question.id} className="question-card">
              <div className="flex items-start">
                <div className="question-number">{index + 3}</div>
                <div className="flex-1">
                  <div className="text-base font-normal w-full mb-4">{question.text}</div>

                  {question.type === "text" && (
                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="Your answer"
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>
                  )}

                  {question.type === "choice" && question.options && (
                    <div className="mt-4 space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`${question.id}-option-${optIndex}`}
                            name={`question-${question.id}`}
                            value={option}
                            checked={selectedOptions[question.id] === option}
                            onChange={() => handleOptionSelect(question.id, option)}
                            className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                          />
                          <label
                            htmlFor={`${question.id}-option-${optIndex}`}
                            className={`text-sm flex-1 ${
                              showAnswers && isCorrectAnswer(question.id, option) ? "font-medium" : ""
                            }`}
                          >
                            {option}
                          </label>

                          {/* Show correct answer indicator */}
                          {showAnswers && isCorrectAnswer(question.id, option) && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}

                          {/* Show if user selected wrong answer */}
                          {showAnswers &&
                            selectedOptions[question.id] === option &&
                            !isCorrectAnswer(question.id, option) && <AlertCircle className="h-4 w-4 text-red-500" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show correct answer when answers are visible */}
                  {showAnswers && question.correctAnswer && (
                    <div className="mt-4 text-sm text-green-600">
                      <span className="font-medium">Correct answer:</span> {question.correctAnswer}
                    </div>
                  )}
                </div>

                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteQuestion(question.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">No questions yet. Add questions using the button below.</div>
      )}
    </div>
  )
}
