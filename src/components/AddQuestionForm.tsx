
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface QuestionFormData {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: string;
  memoryLimit: string;
  description: string;
  examples: Example[];
  constraints: string[];
}

interface AddQuestionFormProps {
  onQuestionAdded: (question: QuestionFormData) => void;
  onCancel: () => void;
}

const AddQuestionForm: React.FC<AddQuestionFormProps> = ({ onQuestionAdded, onCancel }) => {
  const [formData, setFormData] = useState<QuestionFormData>({
    title: '',
    difficulty: 'Easy',
    timeLimit: '1 second',
    memoryLimit: '256 MB',
    description: '',
    examples: [{ input: '', output: '', explanation: '' }],
    constraints: ['']
  });

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }]
    }));
  };

  const removeExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const updateExample = (index: number, field: keyof Example, value: string) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.map((example, i) => 
        i === index ? { ...example, [field]: value } : example
      )
    }));
  };

  const addConstraint = () => {
    setFormData(prev => ({
      ...prev,
      constraints: [...prev.constraints, '']
    }));
  };

  const removeConstraint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index)
    }));
  };

  const updateConstraint = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      constraints: prev.constraints.map((constraint, i) => 
        i === index ? value : constraint
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (title and description).",
        variant: "destructive",
      });
      return;
    }

    const validExamples = formData.examples.filter(ex => ex.input.trim() && ex.output.trim());
    if (validExamples.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one complete example.",
        variant: "destructive",
      });
      return;
    }

    const validConstraints = formData.constraints.filter(c => c.trim());

    const questionData = {
      ...formData,
      examples: validExamples,
      constraints: validConstraints
    };

    onQuestionAdded(questionData);
    toast({
      title: "Success!",
      description: "Your custom question has been added.",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Add Custom Question</CardTitle>
          <Badge className={getDifficultyColor(formData.difficulty)}>
            {formData.difficulty}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Two Sum"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <Select value={formData.difficulty} onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => 
                setFormData(prev => ({ ...prev, difficulty: value }))
              }>
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
            
            <div>
              <label className="block text-sm font-medium mb-2">Time Limit</label>
              <Input
                value={formData.timeLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: e.target.value }))}
                placeholder="e.g., 1 second"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Memory Limit</label>
              <Input
                value={formData.memoryLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, memoryLimit: e.target.value }))}
                placeholder="e.g., 256 MB"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Problem Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the problem clearly..."
              className="min-h-24"
              required
            />
          </div>

          {/* Examples */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Examples</label>
              <Button type="button" onClick={addExample} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Example
              </Button>
            </div>
            
            {formData.examples.map((example, index) => (
              <div key={index} className="border rounded-lg p-4 mb-3 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-sm">Example {index + 1}</span>
                  {formData.examples.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeExample(index)}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Input</label>
                    <Input
                      value={example.input}
                      onChange={(e) => updateExample(index, 'input', e.target.value)}
                      placeholder="e.g., nums = [2,7,11,15], target = 9"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Output</label>
                    <Input
                      value={example.output}
                      onChange={(e) => updateExample(index, 'output', e.target.value)}
                      placeholder="e.g., [0,1]"
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">Explanation (optional)</label>
                  <Textarea
                    value={example.explanation || ''}
                    onChange={(e) => updateExample(index, 'explanation', e.target.value)}
                    placeholder="Explain why this is the expected output..."
                    className="min-h-16"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Constraints */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Constraints</label>
              <Button type="button" onClick={addConstraint} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Constraint
              </Button>
            </div>
            
            {formData.constraints.map((constraint, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <Input
                  value={constraint}
                  onChange={(e) => updateConstraint(index, e.target.value)}
                  placeholder="e.g., 2 ≤ nums.length ≤ 10⁴"
                />
                {formData.constraints.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeConstraint(index)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Add Question
            </Button>
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddQuestionForm;
