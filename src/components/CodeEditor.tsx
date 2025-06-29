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
  const [testCases, setTestCases] = useState([]);
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
        setQuestions(data)
        setSelectedProblem(data[0])
        console.log(`Loaded ${data.length} questions from database`)
        console.log('Fetched questions:', data)
        console.log('Test cases for first question:', data[0].test_cases);
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

      (window as any).monaco.editor.defineTheme('github-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
          'editor.background': '#ffffff',
          'editor.foreground': '#24292e',
          'editor.lineHighlightBackground': '#f6f8fa',
          'editor.selectionBackground': '#c8e1ff',
          'editor.inactiveSelectionBackground': '#f1f8ff',
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

  // Fetch test cases for the selected problem
  const fetchTestCases = async (problemId: string) => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', problemId)
      .single();

    if (error) {
      console.error('Error fetching test cases:', error);
    } else {
      // data.test_cases is your array of test cases
      console.log('Fetched test cases:', data.test_cases);
      setTestCases(data.test_cases);
    }
  };

  useEffect(() => {
    if (selectedProblem?.id) {
      fetchTestCases(selectedProblem.id);
    }
  }, [selectedProblem]);

  // Update handleRunCode to use testCases
  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    const result = await executeCode(code, language, testCases);
    setTestResults(result);
    setIsRunning(false);
    console.log('Test results:', result);
  };

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
        <div className={`text-lg ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Loading questions...</div>
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
    <div className="h-screen w-full flex flex-col bg-background">
        <Header
          timeLeft={timeLeft}
          lastSaved={lastSaved}
          hasSubmitted={hasSubmitted}
          onAddQuestion={isAdmin ? () => setShowAddQuestion(true) : undefined}
        appTheme={appTheme}
        compact={true}
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
                          <SelectItem key={problem.id} value={problem.id} className="py-3">
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{problem.title}</span>
                              <Badge variant={problem.difficulty === 'Easy' ? 'default' : problem.difficulty === 'Medium' ? 'secondary' : 'destructive'} className="ml-2 px-3 py-1">
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 h-10">
                    <TabsTrigger value="editor" className="text-sm">Editor</TabsTrigger>
                    <TabsTrigger value="submission" className="text-sm">Submission</TabsTrigger>
                  </TabsList>

                  <TabsContent value="editor" className="flex-1 mt-0 p-0">
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
                                <SelectItem value="vs-dark">VS Dark</SelectItem>
                                <SelectItem value="vs-light">VS Light</SelectItem>
                                <SelectItem value="github-dark">GitHub Dark</SelectItem>
                                <SelectItem value="github-light">GitHub Light</SelectItem>
                                <SelectItem value="hc-black">High Contrast</SelectItem>
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
                            cursorBlinking: 'solid',
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
                  </TabsContent>

                  <TabsContent value="submission" className="flex-1 mt-0 p-0">
                    <div className={`h-full ${appTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border transition-colors duration-200`}>
                      <div className={`p-4 border-b ${appTheme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-t-lg transition-colors duration-200`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h2 className={`text-lg font-semibold ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Submission Details</h2>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={hasSubmitted ? 'default' : 'secondary'} className="px-3 py-1">
                              {hasSubmitted ? 'Submitted' : 'Not Submitted'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 overflow-auto h-[calc(100%-80px)]">
                        <div className="space-y-6">
                          {/* Problem Information */}
                          <div className={`p-4 rounded-lg border ${appTheme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                            <h3 className={`text-lg font-semibold mb-3 ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Problem Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className={`text-sm font-medium ${appTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Problem Title</p>
                                <p className={`text-base ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentProblem?.title || 'No problem selected'}</p>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${appTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Difficulty</p>
                                <Badge variant={currentProblem?.difficulty === 'Easy' ? 'default' : currentProblem?.difficulty === 'Medium' ? 'secondary' : 'destructive'} className="mt-1">
                                  {currentProblem?.difficulty || 'Unknown'}
                                </Badge>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${appTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Time Limit</p>
                                <p className={`text-base ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentProblem?.timeLimit || '30 minutes'}</p>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${appTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Memory Limit</p>
                                <p className={`text-base ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentProblem?.memoryLimit || '128 MB'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Submission Status */}
                          <div className={`p-4 rounded-lg border ${appTheme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                            <h3 className={`text-lg font-semibold mb-3 ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Submission Status</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className={`text-sm font-medium ${appTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Status</p>
                                <Badge variant={hasSubmitted ? 'default' : 'secondary'} className="mt-1">
                                  {hasSubmitted ? 'Submitted' : 'Draft'}
                                </Badge>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${appTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Language</p>
                                <p className={`text-base ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{language.charAt(0).toUpperCase() + language.slice(1)}</p>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${appTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Last Saved</p>
                                <p className={`text-base ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{lastSaved?.toString() || 'Never'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Code Preview */}
                          <div className={`p-4 rounded-lg border ${appTheme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <h3 className={`text-lg font-semibold ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Code Preview</h3>
                              <div className="flex items-center space-x-2 text-sm">
                                <span className={appTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                  {code.split('\n').length} lines
                                </span>
                                <span className={appTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                  {code.length} characters
                                </span>
                              </div>
                            </div>
                            <div className={`rounded-lg border ${appTheme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                              <Editor
                                height="300px"
                                language={language}
                                value={code}
                                theme={editorTheme}
                                options={{
                                  readOnly: true,
                                  minimap: { enabled: false },
                                  fontSize: 12,
                                  lineNumbers: 'on',
                                  wordWrap: 'on',
                                  folding: false,
                                  glyphMargin: false,
                                  renderLineHighlight: 'none',
                                  cursorBlinking: 'solid',
                                  scrollBeyondLastLine: false,
                                  overviewRulerBorder: false,
                                  overviewRulerLanes: 0,
                                  hideCursorInOverviewRuler: true,
                                  scrollbar: {
                                    vertical: 'visible',
                                    horizontal: 'visible',
                                    useShadows: false,
                                    verticalScrollbarSize: 8,
                                    horizontalScrollbarSize: 8,
                                  },
                                }}
                              />
                            </div>
                          </div>

                          {/* Test Results */}
                          {testResults && (
                            <div className={`p-4 rounded-lg border ${appTheme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                              <h3 className={`text-lg font-semibold mb-3 ${appTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Test Results</h3>
                              <TestResults result={testResults} />
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  </TabsContent>
                </Tabs>
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
  )
}

export default CodeEditor
