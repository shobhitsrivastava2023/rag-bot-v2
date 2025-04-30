"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface FormHeaderProps {
  title: string
  description: string
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
}

export function FormHeader({ title, description, onTitleChange, onDescriptionChange }: FormHeaderProps) {
  const [isTitleFocused, setIsTitleFocused] = useState(false)
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false)

  return (
    <div className="p-4 bg-white">
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        onFocus={() => setIsTitleFocused(true)}
        onBlur={() => setIsTitleFocused(false)}
        className={`text-xl font-medium bg-transparent border-0 border-b-2 border-transparent px-0 py-1 focus:ring-0 ${
          isTitleFocused ? "border-teal-500" : ""
        } placeholder-gray-500 text-gray-800`}
        placeholder="Form Title"
      />
      {description && (
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          onFocus={() => setIsDescriptionFocused(true)}
          onBlur={() => setIsDescriptionFocused(false)}
          className={`bg-transparent border-0 border-b-2 border-transparent px-0 py-1 focus:ring-0 ${
            isDescriptionFocused ? "border-teal-500" : ""
          } placeholder-gray-500 text-gray-600 resize-none mt-2`}
          placeholder="Form Description"
          rows={2}
        />
      )}
    </div>
  )
}
