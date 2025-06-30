export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export type Problem = {
  id: string;
  title: string;
  difficulty: string;
  time_limit: string;
  memory_limit: string;
  description: string;
  examples: Array<{ input: string; output: string }>;
  constraints: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  starter_code_js: string;
  starter_code_python: string;
  starter_code_java: string;
  starter_code_cpp: string;
  test_cases: Array<any>; // You can type this more strictly if you want
  // ...add any other fields you use
};
