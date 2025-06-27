
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Database, Zap } from 'lucide-react';

interface Problem {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: string;
  memoryLimit: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
}

interface ProblemStatementProps {
  problem: Problem;
}

const ProblemStatement: React.FC<ProblemStatementProps> = ({ problem }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{problem.title}</CardTitle>
          <Badge className={getDifficultyColor(problem.difficulty)}>
            {problem.difficulty}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{problem.timeLimit}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Database className="w-4 h-4" />
            <span>{problem.memoryLimit}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Problem Description</h3>
          <p className="text-gray-700 leading-relaxed">{problem.description}</p>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-3">Examples</h3>
          <div className="space-y-4">
            {problem.examples.map((example, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Input:</h4>
                    <pre className="bg-white p-2 rounded border text-sm font-mono">
                      {example.input}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Output:</h4>
                    <pre className="bg-white p-2 rounded border text-sm font-mono">
                      {example.output}
                    </pre>
                  </div>
                </div>
                {example.explanation && (
                  <div className="mt-3">
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Explanation:</h4>
                    <p className="text-sm text-gray-700">{example.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-2">Constraints</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {problem.constraints.map((constraint, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-gray-400">•</span>
                <span>{constraint}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProblemStatement;
