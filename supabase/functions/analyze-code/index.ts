

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// @ts-ignore
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, problemDescription } = await req.json();

    console.log('Analyzing code:', { language, codeLength: code.length });

    const prompt = `
You are an expert programming judge for coding interview problems. Analyze the following code submission:

**Problem**: Two Sum - Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Language**: ${language}
**Code**:
\`\`\`${language}
${code}
\`\`\`

Please analyze this code and provide feedback in the following JSON format:
{
  "status": "success" | "error",
  "executionTime": "estimated time (e.g., '42ms')",
  "memoryUsed": "estimated memory (e.g., '8.7MB')",
  "testCasesPassed": "X/10 format",
  "failedTestCases": [
    {
      "input": "example input",
      "expected": "expected output",
      "actual": "what your code would output (if incorrect)"
    }
  ],
  "errorMessage": "specific error description if any",
  "suggestions": "detailed feedback on algorithm, efficiency, edge cases",
  "timeComplexity": "Big O notation",
  "spaceComplexity": "Big O notation",
  "correctness": "percentage score 0-100"
}

Consider these test cases:
1. [2,7,11,15], target=9 → [0,1]
2. [3,2,4], target=6 → [1,2]
3. [3,3], target=6 → [0,1]
4. [1,2,3,4,5], target=9 → [3,4]
5. [0,4,3,0], target=0 → [0,3]
6. [-1,-2,-3,-4,-5], target=-8 → [2,4]
7. [1,5,3,7,9,2], target=8 → [0,4]
8. [10,20,30,40], target=50 → [1,2]
9. [1,1,1,1], target=2 → [0,1]
10. [100,200,300], target=400 → [0,2]

Analyze the algorithm approach, check for correctness, estimate performance, and identify any issues with edge cases or logic errors.
`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + geminiApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    console.log('Gemini response:', generatedText);

    // Extract JSON from the response
    let analysisResult;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Fallback analysis
      analysisResult = {
        status: 'error',
        executionTime: '0ms',
        memoryUsed: '0MB',
        testCasesPassed: '0/10',
        failedTestCases: [],
        errorMessage: 'Failed to analyze code with AI. Please check your implementation.',
        suggestions: 'Unable to provide AI feedback at this time. Try implementing a hash map approach for O(n) time complexity.',
        timeComplexity: 'Unknown',
        spaceComplexity: 'Unknown',
        correctness: 0
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-code function:', error);
    return new Response(JSON.stringify({ 
      status: 'error',
      executionTime: '0ms',
      memoryUsed: '0MB',
      testCasesPassed: '0/10',
      failedTestCases: [],
      errorMessage: 'Internal server error during code analysis',
      suggestions: 'Please try again or check your code for syntax errors.',
      timeComplexity: 'Unknown',
      spaceComplexity: 'Unknown',
      correctness: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

