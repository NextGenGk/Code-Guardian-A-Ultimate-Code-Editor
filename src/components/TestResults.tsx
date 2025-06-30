import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, Lightbulb } from 'lucide-react';

interface TestResultsProps {
  result: {
    status: 'success' | 'error';
    testCasesPassed: string;
    failedTestCases: any[];
    errorMessage: string;
    suggestions: string;
    correctness?: number;
  };
}

const TestResults: React.FC<TestResultsProps> = ({ result }) => {
  const isSuccess = result.status === 'success';
  const [passed, total] = result.testCasesPassed.split('/').map(Number);
  const passRate = total > 0 ? (passed / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            {isSuccess ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span>Test Results</span>
          </CardTitle>
          <Badge variant={isSuccess ? "default" : "destructive"}>
            {isSuccess ? 'Accepted' : 'Failed'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Passed:</span>
          <span className="font-semibold text-lg">{result.testCasesPassed}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isSuccess ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${passRate}%` }}
          />
        </div>
        <Separator />

        {/* Error Message */}
        {result.status === 'error' && result.errorMessage && (
          <>
            <div className="space-y-2 mt-4">
              <h4 className="font-semibold flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Error</span>
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <pre className="text-sm text-red-800 whitespace-pre-wrap font-mono">
                  {JSON.stringify(result.errorMessage)}
                </pre>
              </div>
            </div>
          </>
        )}

        {/* Suggestions */}
        {result.status === 'error' && result.suggestions && (
          <>
            <div className="space-y-2 mt-4">
              <h4 className="font-semibold flex items-center space-x-2 text-blue-600">
                <Lightbulb className="w-4 h-4" />
                <span>How to Fix</span>
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <pre className="text-sm text-blue-800 whitespace-pre-wrap font-mono">
                  {result.suggestions}
                </pre>
              </div>
            </div>
          </>
        )}

        {/* Failed Test Cases */}
        {result.failedTestCases.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Failed Test Cases</span>
              </h4>
              {result.failedTestCases.map((tc, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
                  <div>
                    <span className="font-semibold">Input:</span>{' '}
                    <span className="font-mono">{typeof tc.input === 'object' ? JSON.stringify(tc.input) : tc.input}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Expected:</span>{' '}
                    <span className="font-mono">{typeof tc.expected === 'object' ? JSON.stringify(tc.expected) : tc.expected}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Actual:</span>{' '}
                    <span className="font-mono text-red-600">{typeof tc.actual === 'object' ? JSON.stringify(tc.actual) : tc.actual}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TestResults;
