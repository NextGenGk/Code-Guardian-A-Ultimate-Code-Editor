
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus, Trash2 } from 'lucide-react'
import { Problem, Example } from '@/types/Problem'

interface AdminQuestionFormProps {
  onQuestionAdded: (question: Problem) => void
  onClose: () => void
}

const AdminQuestionForm: React.FC<AdminQuestionFormProps> = ({ onQuestionAdded, onClose }) => {
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy')
  const [timeLimit, setTimeLimit] = useState('30 minutes')
  const [memoryLimit, setMemoryLimit] = useState('256 MB')
  const [description, setDescription] = useState('')
  const [examples, setExamples] = useState<Example[]>([
    { input: '', output: '', explanation: '' }
  ])
  const [constraints, setConstraints] = useState<string[]>([''])

  const addExample = () => {
    setExamples([...examples, { input: '', output: '', explanation: '' }])
  }

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index))
  }

  const updateExample = (index: number, field: keyof Example, value: string) => {
    const updated = examples.map((example, i) => 
      i === index ? { ...example, [field]: value } : example
    )
    setExamples(updated)
  }

  const addConstraint = () => {
    setConstraints([...constraints, ''])
  }

  const removeConstraint = (index: number) => {
    setConstraints(constraints.filter((_, i) => i !== index))
  }

  const updateConstraint = (index: number, value: string) => {
    const updated = constraints.map((constraint, i) => 
      i === index ? value : constraint
    )
    setConstraints(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newQuestion: Problem = {
      title,
      difficulty,
      timeLimit,
      memoryLimit,
      description,
      examples: examples.filter(ex => ex.input && ex.output),
      constraints: constraints.filter(c => c.trim())
    }

    onQuestionAdded(newQuestion)
  }

  return (
    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Add New Question</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit</Label>
              <Input
                id="timeLimit"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memoryLimit">Memory Limit</Label>
              <Input
                id="memoryLimit"
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Examples</Label>
              <Button type="button" onClick={addExample} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Example
              </Button>
            </div>
            {examples.map((example, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Example {index + 1}</span>
                  {examples.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeExample(index)}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Input"
                  value={example.input}
                  onChange={(e) => updateExample(index, 'input', e.target.value)}
                />
                <Input
                  placeholder="Output"
                  value={example.output}
                  onChange={(e) => updateExample(index, 'output', e.target.value)}
                />
                <Input
                  placeholder="Explanation (optional)"
                  value={example.explanation || ''}
                  onChange={(e) => updateExample(index, 'explanation', e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Constraints</Label>
              <Button type="button" onClick={addConstraint} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Constraint
              </Button>
            </div>
            {constraints.map((constraint, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder="Enter constraint"
                  value={constraint}
                  onChange={(e) => updateConstraint(index, e.target.value)}
                />
                {constraints.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeConstraint(index)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit">
              Add Question
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default AdminQuestionForm
