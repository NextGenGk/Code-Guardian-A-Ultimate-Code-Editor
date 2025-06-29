// src/utils/codeExecution.ts
const languageMap = {
  javascript: 63, // Node.js
  python: 71,     // Python 3
  java: 62,       // Java
  cpp: 54         // C++ (GCC 9.2.0)
};

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
const JUDGE0_API_KEY = import.meta.env.VITE_JUDGE0_API_KEY;

export const executeCode = async (code, language, testCases) => {
  const language_id = languageMap[language];
  let passed = 0;
  let failedTestCases = [];

  console.log('Judge0 API Key:', JUDGE0_API_KEY);
  console.log('Submitting code:', { code, language, language_id, testCases });

  for (const tc of testCases) {
    // Submit code to Judge0
    const submissionRes = await fetch(JUDGE0_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({
        source_code: code,
        language_id,
        stdin: tc.input
      })
    });
    const submission = await submissionRes.json();
    console.log('Judge0 response:', submission);

    // Handle errors and output
    let output = '';
    if (submission.stdout) {
      output = submission.stdout.trim();
    } else if (submission.stderr) {
      output = 'Error: ' + submission.stderr.trim();
    } else if (submission.compile_output) {
      output = 'Compile Error: ' + submission.compile_output.trim();
    } else {
      output = 'No output';
    }

    const expected = (tc.expected_output || '').trim();

    if (output === expected) {
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
