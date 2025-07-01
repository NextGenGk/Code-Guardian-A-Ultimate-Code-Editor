// src/utils/codeExecution.ts
const languageMap = {
  javascript: 63, // Node.js
  python: 71,     // Python 3
  java: 62,       // Java
  cpp: 54         // C++ (GCC 9.2.0)
};

const JUDGE0_API_URL = import.meta.env.VITE_JUDGE0_API_URL;

if (!JUDGE0_API_URL) {
  throw new Error("JUDGE0_API_URL is not set!");
}

export const executeCode = async (code, language, testCases) => {
  const language_id = languageMap[language];
  let passed = 0;
  let failedTestCases = [];

  console.log('Judge0 API Key:', JUDGE0_API_URL);
  console.log('Submitting code:', { code, language, language_id, testCases });

  for (const tc of testCases) {
    // Submit code to Judge0
    const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language_id,
        source_code: code,
        stdin: tc.input
      })
    });
    if (!response.ok) {
      throw new Error(`Judge0 error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    console.log('Judge0 response:', result);

    // Handle errors and output
    let output = '';
    if (result.stdout) {
      output = result.stdout.trim();
    } else if (result.stderr) {
      output = 'Error: ' + result.stderr.trim();
    } else if (result.compile_output) {
      output = 'Compile Error: ' + result.compile_output.trim();
    } else {
      output = 'No output';
    }

    const expected = (tc.expected_output || '').trim();

    // Normalize and trim both outputs for robust comparison
    const normalize = str => (str || '').trim().replace(/\r\n/g, '\n');
    if (normalize(output) === normalize(expected)) {
      passed++;
    } else {
      failedTestCases.push({
        input: tc.input,
        expected: tc.expected_output,
        actual: output
      });
    }
  }

  const allPassed = passed === testCases.length;
  return {
    status: allPassed ? 'success' : 'error',
    testCasesPassed: `${passed}/${testCases.length}`,
    failedTestCases,
    errorMessage: allPassed ? '' : 'Some test cases failed.',
    suggestions: allPassed ? '' : 'Check your logic and try again.',
    correctness: allPassed ? 100 : Math.round((passed / testCases.length) * 100)
  };
};
