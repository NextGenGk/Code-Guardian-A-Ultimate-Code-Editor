export function getCodeTemplate(language) {
  switch (language) {
    case 'javascript':
      return `// Write your JavaScript code here\nfunction main() {\n  // ...\n}`;
    case 'python':
      return `# Write your Python code here\ndef main():\n    pass`;
    case 'java':
      return `// Write your Java code here\npublic class Solution {\n    public static void main(String[] args) {\n        // ...\n    }\n}`;
    case 'cpp':
      return `// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // ...\n    return 0;\n}`;
    default:
      return '';
  }
}