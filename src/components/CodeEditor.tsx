'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Editor } from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Play, Save, RotateCcw } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import ProblemStatement from './ProblemStatement'
import TestResults from './TestResults'
import Header from './layout/Header'
import AdminQuestionForm from './admin/AdminQuestionForm'
import { Problem } from '@/types/Problem'
import { getCodeTemplate } from '@/utils/codeTemplates'
import { executeCode } from '@/utils/codeExecution'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAutoSubmit } from '@/hooks/useAutoSubmit'

export interface Problem {
  id: string;
  title: string;
  difficulty: string;
  timeLimit: string;
  memoryLimit: string;
  description: string;
  examples: any[];
  constraints: string[];
  starterCodeJS?: string;
  starterCodePython?: string;
  starterCodeJava?: string;
  starterCodeCpp?: string;
}

const CodeEditor: React.FC = () => {
  const { user } = useUser()
  const [questions, setQuestions] = useState<Problem[]>([])
  const [code, setCode] = useState<string>("")
  const [language, setLanguage] = useState('javascript')
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)
  const timerRef = useRef(null)

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === 'admin' || false

  const handleSave = () => {
    setLastSaved(new Date())
    console.log('Code saved:', code)
  }

  // Auto-submit functionality
  useAutoSubmit({
    code,
    onSubmit: handleSave,
    isEnabled: !hasSubmitted
  })

  // Fetch questions from database
  const fetchQuestions = async () => {
    try {
      setIsLoadingQuestions(true)
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: true })

      console.log('Fetched questions:', data, error)

      if (error) {
        console.error('Error fetching questions:', error)
        toast({
          title: "Error",
          description: "Failed to load questions from database. Using default question.",
          variant: "destructive",
        })
        return
      }

      if (data && data.length > 0) {
        const formattedQuestions: Problem[] = data.map(q => ({
          id: q.id,
          title: q.title,
          difficulty: q.difficulty,
          timeLimit: q.time_limit,
          memoryLimit: q.memory_limit,
          description: q.description,
          examples: q.examples,
          constraints: q.constraints,
          starterCodeJS: q.starter_code_js,
          starterCodePython: q.starter_code_python,
          starterCodeJava: q.starter_code_java,
          starterCodeCpp: q.starter_code_cpp,
        }))
        setQuestions(formattedQuestions)
        console.log(`Loaded ${formattedQuestions.length} questions from database`)
        console.log('Fetched questions:', data)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast({
        title: "Error",
        description: "Failed to connect to database. Using default question.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  const allProblems = questions

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    if (questions.length > 0 && !selectedProblem) {
      setSelectedProblem(questions[0])
    }
  }, [questions, selectedProblem])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    // Set code when language or selectedProblem changes
    if (selectedProblem) {
      let starter = '';
      switch (language) {
        case 'javascript':
          starter = selectedProblem.starterCodeJS || getCodeTemplate('javascript');
          break;
        case 'python':
          starter = selectedProblem.starterCodePython || getCodeTemplate('python');
          break;
        case 'java':
          starter = selectedProblem.starterCodeJava || getCodeTemplate('java');
          break;
        case 'cpp':
          starter = selectedProblem.starterCodeCpp || getCodeTemplate('cpp');
          break;
        default:
          starter = getCodeTemplate(language);
      }
      setCode(starter);
    } else {
      setCode(getCodeTemplate(language));
    }
  }, [language, selectedProblem]);

  useEffect(() => {
    window.monaco?.editor.defineTheme('myTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#f3f4f6', // your desired color
      },
    });
  }, []);

  const handleSubmit = () => {
    setHasSubmitted(true)
    handleSave()
    toast({
      title: "Code Auto-Submitted",
      description: "Your code was automatically submitted when you left the tab.",
    })
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    console.log('Solution auto-submitted and timer stopped')
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    try {
      const result = await executeCode(code, language)
      setTestResults(result)
    } catch (error) {
      console.error('Error running code:', error)
      setTestResults({
        status: 'error',
        executionTime: '0ms',
        memoryUsed: '0MB',
        testCasesPassed: '0/3',
        failedTestCases: [
          { input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", actual: "Error" }
        ],
        errorMessage: 'Failed to execute code. Please check your implementation.',
        suggestions: 'Make sure your code is syntactically correct.',
        timeComplexity: 'Unknown',
        spaceComplexity: 'Unknown',
        correctness: 0
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setCode(getCodeTemplate(language))
    setTestResults(null)
  }

  const handleQuestionAdded = async (newQuestion: Problem) => {
    try {
      // Try to insert the question into the database
      const { data, error } = await supabase
        .from('questions')
        .insert({
          title: newQuestion.title,
          difficulty: newQuestion.difficulty,
          time_limit: newQuestion.timeLimit,
          memory_limit: newQuestion.memoryLimit,
          description: newQuestion.description,
          examples: newQuestion.examples,
          constraints: newQuestion.constraints,
          created_by: user?.id || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding question to database:', error)
        // If database insert fails, add to local state
        setQuestions(prev => [...prev, newQuestion])
        toast({
          title: "Question Added Locally",
          description: "Question added to current session. Note: Authentication required for permanent storage.",
          variant: "default",
        })
      } else {
        // If successful, refresh questions from database
        await fetchQuestions()
        toast({
          title: "Success!",
          description: "Question has been permanently added to the database.",
        })
      }
    } catch (error) {
      console.error('Error adding question:', error)
      // Fallback to local state
      setQuestions(prev => [...prev, newQuestion])
      toast({
        title: "Question Added Locally",
        description: "Question added to current session only.",
        variant: "default",
      })
    }
    setShowAddQuestion(false)
  }

  const currentProblem = selectedProblem || questions[0]

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !hasSubmitted) {
        handleSubmit();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasSubmitted, code, language, selectedProblem]);

  if (isLoadingQuestions) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading questions...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">No questions found in the database.</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 p-4">
      <div className="h-full flex flex-col space-y-4">
        <Header
          timeLeft={timeLeft}
          lastSaved={lastSaved}
          hasSubmitted={hasSubmitted}
          onAddQuestion={isAdmin ? () => setShowAddQuestion(true) : undefined}
        />

        {showAddQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <AdminQuestionForm
              onQuestionAdded={handleQuestionAdded}
              onClose={() => setShowAddQuestion(false)}
            />
          </div>
        )}

        <div className="flex-1">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full bg-white rounded-lg p-4 overflow-auto">
                <div className="mb-4">
                  <Select 
                    value={selectedProblem?.id || ""} 
                    onValueChange={(value) => {
                      const problem = questions.find(p => p.id === value);
                      if (problem) setSelectedProblem(problem);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a problem" />
                    </SelectTrigger>
                    <SelectContent>
                      {questions.map((problem) => (
                        <SelectItem key={problem.id} value={problem.id}>
                          {problem.title} ({problem.difficulty})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ProblemStatement problem={currentProblem} />
              </div>
            </ResizablePanel>
            
            <ResizableHandle />
            
            <ResizablePanel defaultSize={60} minSize={40}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70} minSize={50}>
                  <div className="h-full bg-white rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="flex space-x-2">
                        <Button onClick={handleReset} variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reset
                        </Button>
                        <Button onClick={handleSave} variant="outline" size="sm">
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button onClick={handleRunCode} disabled={isRunning} size="sm">
                          <Play className="w-4 h-4 mr-1" />
                          {isRunning ? 'Running...' : 'Run'}
                        </Button>
                        <Button onClick={handleSubmit} disabled={hasSubmitted}>
                          Submit
                        </Button>
                      </div>
                    </div>
                    
                    <div className="h-[calc(100%-60px)]">
                      <div className="bg-gray-100 p-2 rounded">
                        <Editor
                          height="400px"
                          language={language}
                          value={code}
                          onChange={value => setCode(value || '')}
                          theme="vs-dark"
                        />
                      </div>
                    </div>
                  </div>
                </ResizablePanel>
                
                <ResizableHandle />
                
                <ResizablePanel defaultSize={30} minSize={20}>
                  <div className="h-full bg-white rounded-lg p-4">
                    {testResults && <TestResults result={testResults} />}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  )
}

export default CodeEditor
