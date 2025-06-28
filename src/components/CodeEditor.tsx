'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Editor } from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Play, Save, RotateCcw, Settings, FileText, Terminal, Eye, EyeOff, Maximize2, Minimize2, Download, Upload, Share2, History, BookOpen, Target, Zap, Brain } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

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
  const [editorTheme, setEditorTheme] = useState('vs-dark')
  const [showProblemPanel, setShowProblemPanel] = useState(true)
  const [showTestPanel, setShowTestPanel] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState('editor')
  const [codeHistory, setCodeHistory] = useState<string[]>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1)
  const [appTheme, setAppTheme] = useState<'light' | 'dark'>('light')
  const timerRef = useRef(null)

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === 'admin' || false

  const handleSave = () => {
    setLastSaved(new Date())
    // Add to history
    setCodeHistory(prev => [...prev.slice(0, currentHistoryIndex + 1), code])
    setCurrentHistoryIndex(prev => prev + 1)
    toast({
      title: "Code Saved",
      description: "Your code has been saved successfully.",
    })
  }

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(prev => prev - 1)
      setCode(codeHistory[currentHistoryIndex - 1])
    }
  }

  const handleRedo = () => {
    if (currentHistoryIndex < codeHistory.length - 1) {
      setCurrentHistoryIndex(prev => prev + 1)
      setCode(codeHistory[currentHistoryIndex + 1])
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `solution.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Code Copied",
      description: "Your code has been copied to clipboard.",
    })
  }

  const toggleTheme = () => {
    setAppTheme(prev => prev === 'light' ? 'dark' : 'light')
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
      // Reset history when problem changes
      setCodeHistory([starter])
      setCurrentHistoryIndex(0)
    } else {
      const template = getCodeTemplate(language);
      setCode(template);
      setCodeHistory([template])
      setCurrentHistoryIndex(0)
    }
  }, [language, selectedProblem]);

  useEffect(() => {
    // Define custom themes
    if (typeof window !== 'undefined' && (window as any).monaco) {
      (window as any).monaco.editor.defineTheme('vs-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1e1e1e',
          'editor.foreground': '#d4d4d4',
          'editor.lineHighlightBackground': '#2a2d2e',
          'editor.selectionBackground': '#264f78',
          'editor.inactiveSelectionBackground': '#3a3d41',
        },
      });

      (window as any).monaco.editor.defineTheme('vs-light', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#ffffff',
          'editor.foreground': '#000000',
          'editor.lineHighlightBackground': '#f0f0f0',
          'editor.selectionBackground': '#add6ff',
          'editor.inactiveSelectionBackground': '#e5ebf1',
        },
      });

      (window as any).monaco.editor.defineTheme('github-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#0d1117',
          'editor.foreground': '#c9d1d9',
          'editor.lineHighlightBackground': '#161b22',
          'editor.selectionBackground': '#264f78',
          'editor.inactiveSelectionBackground': '#21262d',
        },
      });
    }
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
      toast({
        title: "Code Executed",
        description: "Your code has been executed successfully.",
      })
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
      toast({
        title: "Execution Error",
        description: "Failed to execute code. Please check your implementation.",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    const template = getCodeTemplate(language)
    setCode(template)
    setTestResults(null)
    setCodeHistory([template])
    setCurrentHistoryIndex(0)
    toast({
      title: "Code Reset",
      description: "Your code has been reset to the template.",
    })
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
      <div className={`h-screen ${appTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center transition-colors duration-200`}>
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className={`text-lg ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Loading questions...</div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className={`h-screen ${appTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center transition-colors duration-200`}>
        <div className="text-center">
          <div className={`text-lg mb-2 ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No questions found in the database.</div>
          <div className={`text-sm ${appTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Please add some questions to get started.</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'} ${appTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="h-full flex flex-col space-y-4">
        <Header
          timeLeft={timeLeft}
          lastSaved={lastSaved}
          hasSubmitted={hasSubmitted}
          onAddQuestion={isAdmin ? () => setShowAddQuestion(true) : undefined}
          appTheme={appTheme}
        />

        {showAddQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <AdminQuestionForm
              onQuestionAdded={handleQuestionAdded}
              onClose={() => setShowAddQuestion(false)}
            />
          </div>
        )}

        <div className="flex-1 px-4 pb-4">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {showProblemPanel && (
              <>
                <ResizablePanel defaultSize={40} minSize={30}>
                  <div className="h-full bg-white border-gray-200 rounded-lg shadow-sm border">
                    <div className="p-4 border-b bg-gray-50 border-gray-200 rounded-t-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          <h2 className="text-lg font-semibold text-gray-900">Problem Statement</h2>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTheme}
                            className={appTheme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                          >
                            {appTheme === 'dark' ? '☀️' : '🌙'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowProblemPanel(false)}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          >
                            <Minimize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Select 
                        value={selectedProblem?.id || ""} 
                        onValueChange={(value) => {
                          const problem = questions.find(p => p.id === value);
                          if (problem) setSelectedProblem(problem);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a problem" />
                        </SelectTrigger>
                        <SelectContent>
                          {questions.map((problem) => (
                            <SelectItem key={problem.id} value={problem.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{problem.title}</span>
                                <Badge variant={problem.difficulty === 'Easy' ? 'default' : problem.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                                  {problem.difficulty}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-4 overflow-auto h-[calc(100%-100px)]">
                      <ProblemStatement problem={currentProblem} />
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}
            
            <ResizablePanel defaultSize={showProblemPanel ? 60 : 100} minSize={40}>
              <ResizablePanelGroup direction="vertical" className="h-full">
                <ResizablePanel defaultSize={70} minSize={50}>
                  <div className={`h-full ${appTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border transition-colors duration-200`}>
                    <div className={`p-4 border-b ${appTheme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-t-lg transition-colors duration-200`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Target className="w-5 h-5 text-green-600" />
                          <h2 className={`text-lg font-semibold ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Code Editor</h2>
                          {!showProblemPanel && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowProblemPanel(true)}
                              className={appTheme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                            >
                              <Maximize2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Select value={editorTheme} onValueChange={setEditorTheme}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vs-dark">Dark</SelectItem>
                              <SelectItem value="vs-light">Light</SelectItem>
                              <SelectItem value="github-dark">GitHub Dark</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className={appTheme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                          >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center space-x-4">
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
                          
                          <div className="hidden md:flex items-center space-x-1 text-sm">
                            <span>Lines:</span>
                            <span className="font-mono">{code.split('\n').length}</span>
                          </div>
                          
                          <div className="hidden md:flex items-center space-x-1 text-sm">
                            <span>Chars:</span>
                            <span className="font-mono">{code.length}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button onClick={handleDownload} variant="ghost" size="sm" className={`h-9 px-3 ${appTheme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button onClick={handleShare} variant="ghost" size="sm" className={`h-9 px-3 ${appTheme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                            <Share2 className="w-4 h-4" />
                          </Button>
                          
                          <Separator orientation="vertical" className="h-6" />
                          
                          <Button onClick={handleReset} variant="outline" size="sm" className={`h-9 px-3 ${appTheme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : ''}`}>
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reset
                          </Button>
                          <Button onClick={handleSave} variant="outline" size="sm" className={`h-9 px-3 ${appTheme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : ''}`}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          
                          <Button onClick={handleRunCode} disabled={isRunning} size="sm" className="h-9 px-3 bg-green-600 hover:bg-green-700">
                            <Play className="w-4 h-4 mr-1" />
                            {isRunning ? 'Running...' : 'Run'}
                          </Button>
                          <Button onClick={handleSubmit} disabled={hasSubmitted} size="sm" className="h-9 px-3 bg-blue-600 hover:bg-blue-700">
                            <Zap className="w-4 h-4 mr-1" />
                            Submit
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-[calc(100%-120px)]">
                      <Editor
                        height="100%"
                        language={language}
                        value={code}
                        onChange={value => setCode(value || '')}
                        theme={editorTheme}
                        options={{
                          minimap: { enabled: true },
                          fontSize: 14,
                          lineNumbers: 'on',
                          roundedSelection: false,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: 'on',
                          folding: true,
                          lineDecorationsWidth: 10,
                          lineNumbersMinChars: 3,
                          glyphMargin: true,
                          renderLineHighlight: 'all',
                          selectOnLineNumbers: true,
                          cursorBlinking: 'smooth',
                          cursorSmoothCaretAnimation: 'on',
                          smoothScrolling: true,
                          mouseWheelZoom: true,
                          bracketPairColorization: { enabled: true },
                          guides: {
                            bracketPairs: true,
                            indentation: true,
                          },
                        }}
                      />
                    </div>
                  </div>
                </ResizablePanel>
                
                <ResizableHandle />
                
                <ResizablePanel defaultSize={30} minSize={20}>
                  <div className={`h-full ${appTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border transition-colors duration-200`}>
                    <div className={`p-4 border-b ${appTheme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-t-lg transition-colors duration-200`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-5 h-5 text-purple-600" />
                          <h2 className={`text-lg font-semibold ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>AI Analysis</h2>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTestPanel(false)}
                          className={appTheme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                        >
                          <Minimize2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 overflow-auto h-[calc(100%-80px)]">
                      {testResults ? (
                        <TestResults result={testResults} />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Run your code to see AI analysis results</p>
                          </div>
                        </div>
                      )}
                    </div>
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
