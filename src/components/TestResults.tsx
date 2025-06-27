
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, Database, AlertCircle, Lightbulb, Zap, Brain } from 'lucide-react';

interface SubmissionResult {
  status: 'success' | 'error';
  executionTime: string;
  memoryUsed: string;
  testCasesPassed: string;
  failedTestCases: any[];
  errorMessage: string;
  suggestions: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  correctness?: number;
}

interface TestResultsProps {
  result: SubmissionResult;
}

const TestResults: React.FC<TestResultsProps> = ({ result }) => {
  const isSuccess = result.status === 'success';
  const [passed, total] = result.testCasesPassed.split('/').map(Number);
  const passRate = total > 0 ? (passed / total) * 100 : 0;

  const getCorrectnessColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>AI Code Analysis</span>
          </CardTitle>
          <Badge variant={isSuccess ? "default" : "destructive"}>
            {isSuccess ? 'Accepted' : 'Failed'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">Execution Time:</span>
            <span className="font-mono font-semibold">{result.executionTime}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Database className="w-4 h-4 text-purple-600" />
            <span className="text-gray-600">Memory Used:</span>
            <span className="font-mono font-semibold">{result.memoryUsed}</span>
          </div>
        </div>

        {/* Complexity Analysis */}
        {(result.timeComplexity || result.spaceComplexity) && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              {result.timeComplexity && (
                <div className="flex items-center space-x-2 text-sm">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-600">Time Complexity:</span>
                  <span className="font-mono font-semibold">{result.timeComplexity}</span>
                </div>
              )}
              {result.spaceComplexity && (
                <div className="flex items-center space-x-2 text-sm">
                  <Database className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Space Complexity:</span>
                  <span className="font-mono font-semibold">{result.spaceComplexity}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Correctness Score */}
        {result.correctness !== undefined && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AI Correctness Score:</span>
              <span className={`font-semibold text-lg ${getCorrectnessColor(result.correctness)}`}>
                {result.correctness}%
              </span>
            </div>
          </>
        )}

        <Separator />

        {/* Test Cases Results */}
        <div>
          <h4 className="font-semibold mb-3">Test Cases</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Passed:</span>
              <span className="font-semibold text-lg">{result.testCasesPassed}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isSuccess ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${passRate}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span className="font-semibold">{passRate.toFixed(1)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {result.errorMessage && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Analysis Results</span>
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <pre className="text-sm text-red-800 whitespace-pre-wrap font-mono">
                  {result.errorMessage}
                </pre>
              </div>
            </div>
          </>
        )}

        {/* Failed Test Cases */}
        {result.failedTestCases.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Failed Test Cases</span>
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {result.failedTestCases.map((testCase, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium text-red-700">Input:</span>
                        <pre className="mt-1 font-mono text-red-800">{testCase.input}</pre>
                      </div>
                      <div>
                        <span className="font-medium text-red-700">Expected:</span>
                        <pre className="mt-1 font-mono text-red-800">{testCase.expected}</pre>
                      </div>
                      {testCase.actual && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-red-700">Your Output:</span>
                          <pre className="mt-1 font-mono text-red-800">{testCase.actual}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* AI Suggestions */}
        {result.suggestions && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center space-x-2 text-blue-600">
                <Lightbulb className="w-4 h-4" />
                <span>AI Feedback & Suggestions</span>
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">{result.suggestions}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TestResults;
