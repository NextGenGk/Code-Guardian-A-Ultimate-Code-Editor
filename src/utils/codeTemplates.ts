export function getCodeTemplate(language) {
  switch (language) {
    case 'javascript':
      return `// Read input from stdin\nconst input = require('fs').readFileSync('/dev/stdin').toString().trim();\nconst [numsStr, targetStr] = input.split(' ');\nconst nums = JSON.parse(numsStr);\nconst target = parseInt(targetStr);\n\nfunction twoSum(nums, target) {\n    // Your code here\n}\n\nconsole.log(JSON.stringify(twoSum(nums, target)));`;
    case 'python':
      return `# Write your Python code here\ninput_str = input().strip()\nnums_str, target_str = input_str.split(' ')\nnums = eval(nums_str)\ntarget = int(target_str)\n\ndef two_sum(nums, target):\n    # Your code here\n    pass\n\nprint(two_sum(nums, target))`;
    case 'java':
      return `// Write your Java code here\nimport java.util.*;\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[0];\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split(" ");\n        String numsStr = parts[0].replaceAll("[\\[\\]]", "");\n        int target = Integer.parseInt(parts[1]);\n        String[] numsArr = numsStr.split(",");\n        int[] nums = new int[numsArr.length];\n        for (int i = 0; i < numsArr.length; i++) {\n            nums[i] = Integer.parseInt(numsArr[i]);\n        }\n        int[] result = twoSum(nums, target);\n        System.out.println(Arrays.toString(result));\n    }\n}`;
    case 'cpp':
      return `// Write your C++ code here\n#include <iostream>\n#include <vector>\n#include <unordered_map>\n#include <sstream>\nusing namespace std;\n\nvector<int> parseNums(const string& s) {\n    vector<int> nums;\n    string num;\n    for (char c : s) {\n        if (isdigit(c) || c == '-') num += c;\n        else if (!num.empty()) {\n            nums.push_back(stoi(num));\n            num.clear();\n        }\n    }\n    if (!num.empty()) nums.push_back(stoi(num));\n    return nums;\n}\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n    return {};\n}\n\nint main() {\n    string numsStr;\n    int target;\n    cin >> numsStr >> target;\n    vector<int> nums = parseNums(numsStr);\n    vector<int> result = twoSum(nums, target);\n    cout << "[";\n    for (int i = 0; i < result.size(); ++i) {\n        cout << result[i];\n        if (i != result.size() - 1) cout << ",";\n    }\n    cout << "]" << endl;\n    return 0;\n}`;
    default:
      return '';
  }
}