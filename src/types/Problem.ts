
export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id?: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: string;
  memoryLimit: string;
  description: string;
  examples: Example[];
  constraints: string[];
}
