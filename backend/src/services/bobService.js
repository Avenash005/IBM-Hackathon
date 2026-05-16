import axios from 'axios';

class BobService {
  constructor() {
    this.apiUrl = process.env.BOB_API_URL;
    this.apiKey = process.env.BOB_API_KEY;
  }

  /**
   * Analyze PR changes using IBM Bob API
   * @param {string} prDiff - Unified diff of the PR
   * @param {Array} relevantFiles - Array of {path, content} objects
   * @param {string} language - Primary language (e.g., 'javascript', 'python')
   * @param {string} testFramework - Test framework (e.g., 'jest', 'pytest')
   * @returns {Promise<Object>} Review results with comments, test stubs, and summary
   */
  async reviewPR(prDiff, relevantFiles, language, testFramework) {
    const prompt = this.buildReviewPrompt(prDiff, relevantFiles, language, testFramework);

    try {
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: 'bob-v1',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const reviewResult = this.parseReviewResponse(response.data);
      return reviewResult;
    } catch (error) {
      console.error('Bob API Error:', error.response?.data || error.message);
      throw new Error(`Failed to get PR review from Bob: ${error.message}`);
    }
  }

  /**
   * Get the system prompt that defines Bob's role as PR Buddy
   */
  getSystemPrompt() {
    return `You are PR Buddy, an expert senior software engineer AI embedded in a pull request review workflow.

Your job is to return a JSON object with the following structure:

{
  "review_comments": [
    {
      "file": "path/to/file.js",
      "line": 42,
      "severity": "bug" | "security" | "style" | "suggestion",
      "summary": "One-line title of the issue",
      "detail": "2-3 sentence explanation citing specific lines or other files in the codebase that relate to this issue",
      "suggested_fix": "The exact replacement code block, ready to apply"
    }
  ],
  "test_stubs": [
    {
      "function_name": "processPayment",
      "file": "path/to/file.js",
      "stub": "Full test stub code using the project's test framework, with realistic inputs drawn from usage patterns in the codebase"
    }
  ],
  "summary": {
    "risk_level": "low" | "medium" | "high",
    "one_line": "One sentence summary of the PR quality",
    "top_issue": "The single most important thing to fix before merging"
  }
}

Rules:
- Only flag real issues. Do not invent problems for completeness.
- Every comment must cite a specific line number and reference other parts of the codebase where relevant.
- suggested_fix must be valid, runnable code — not pseudocode or prose.
- Test stubs must use realistic input values drawn from how the function is called elsewhere in the repo.
- Return only valid JSON. No markdown, no preamble, no explanation outside the JSON object.`;
  }

  /**
   * Build the user prompt with PR diff and relevant files
   */
  buildReviewPrompt(prDiff, relevantFiles, language, testFramework) {
    let prompt = `Review this pull request.\n\n`;
    prompt += `**Primary Language:** ${language}\n`;
    prompt += `**Test Framework:** ${testFramework}\n\n`;
    prompt += `**PR Diff:**\n\`\`\`diff\n${prDiff}\n\`\`\`\n\n`;
    
    if (relevantFiles && relevantFiles.length > 0) {
      prompt += `**Relevant Files from Repository:**\n\n`;
      relevantFiles.forEach(file => {
        prompt += `**File: ${file.path}**\n\`\`\`${language}\n${file.content}\n\`\`\`\n\n`;
      });
    }

    prompt += `Analyze the changes and return your review as a JSON object following the specified structure.`;
    
    return prompt;
  }

  /**
   * Parse and validate the response from Bob API
   */
  parseReviewResponse(apiResponse) {
    try {
      const content = apiResponse.choices[0].message.content;
      
      // Try to extract JSON from the response (in case there's markdown formatting)
      let jsonStr = content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        // Try to find JSON object directly
        const objMatch = content.match(/\{[\s\S]*\}/);
        if (objMatch) {
          jsonStr = objMatch[0];
        }
      }

      const review = JSON.parse(jsonStr);

      // Validate structure
      if (!review.review_comments || !review.test_stubs || !review.summary) {
        throw new Error('Invalid review structure');
      }

      return review;
    } catch (error) {
      console.error('Failed to parse Bob response:', error);
      // Return a fallback structure
      return {
        review_comments: [],
        test_stubs: [],
        summary: {
          risk_level: 'low',
          one_line: 'Unable to complete automated review',
          top_issue: 'Manual review recommended'
        }
      };
    }
  }

  /**
   * Generate test stubs for untested functions
   * @param {Array} functions - Array of {name, file, signature} objects
   * @param {string} testFramework - Test framework to use
   * @param {Array} usageExamples - Examples of how functions are called
   */
  async generateTestStubs(functions, testFramework, usageExamples) {
    const prompt = `Generate test stubs for the following functions using ${testFramework}.

Functions to test:
${functions.map(f => `- ${f.name} in ${f.file}\n  Signature: ${f.signature}`).join('\n')}

Usage examples from codebase:
${usageExamples.map(ex => `- ${ex.function}: ${ex.example}`).join('\n')}

Return a JSON array of test stubs with this structure:
[
  {
    "function_name": "functionName",
    "file": "path/to/file.js",
    "stub": "complete test code with realistic inputs"
  }
]`;

    try {
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: 'bob-v1',
          messages: [
            {
              role: 'system',
              content: 'You are a test generation expert. Generate complete, runnable test stubs with realistic test data.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.4,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error('Test stub generation error:', error);
      return [];
    }
  }
}

export default new BobService();

// Made with Bob
