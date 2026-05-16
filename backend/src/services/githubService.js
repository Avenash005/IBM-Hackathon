import { Octokit } from '@octokit/rest';
import parseDiff from 'parse-diff';

class GitHubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
  }

  /**
   * Get PR details including diff and metadata
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} pullNumber - PR number
   */
  async getPRDetails(owner, repo, pullNumber) {
    try {
      // Get PR metadata
      const { data: pr } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber
      });

      // Get PR diff
      const { data: diff } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
        mediaType: {
          format: 'diff'
        }
      });

      // Get list of changed files
      const { data: files } = await this.octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber
      });

      return {
        pr,
        diff,
        files
      };
    } catch (error) {
      console.error('Error fetching PR details:', error);
      throw error;
    }
  }

  /**
   * Get file content from repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - File path
   * @param {string} ref - Git reference (branch, commit, tag)
   */
  async getFileContent(owner, repo, path, ref) {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (data.type === 'file') {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return content;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching file ${path}:`, error.message);
      return null;
    }
  }

  /**
   * Get multiple files from repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Array<string>} paths - Array of file paths
   * @param {string} ref - Git reference
   */
  async getMultipleFiles(owner, repo, paths, ref) {
    const filePromises = paths.map(path => 
      this.getFileContent(owner, repo, path, ref)
        .then(content => ({ path, content }))
        .catch(() => ({ path, content: null }))
    );

    const files = await Promise.all(filePromises);
    return files.filter(f => f.content !== null);
  }

  /**
   * Find relevant files based on changed files
   * Uses heuristics: imports, similar names, test files, config files
   */
  async findRelevantFiles(owner, repo, changedFiles, ref) {
    const relevantPaths = new Set();
    const parsedFiles = parseDiff(changedFiles);

    // Analyze each changed file to find related files
    for (const file of parsedFiles) {
      if (!file.to || file.to === '/dev/null') continue;

      const filePath = file.to;
      const dir = filePath.substring(0, filePath.lastIndexOf('/'));

      // Add test file if exists
      const testPath = this.getTestFilePath(filePath);
      if (testPath) relevantPaths.add(testPath);

      // Add files in same directory (limit to 2)
      try {
        const { data: dirContents } = await this.octokit.repos.getContent({
          owner,
          repo,
          path: dir || '.',
          ref
        });

        if (Array.isArray(dirContents)) {
          dirContents
            .filter(item => item.type === 'file' && item.path !== filePath)
            .slice(0, 2)
            .forEach(item => relevantPaths.add(item.path));
        }
      } catch (error) {
        // Directory might not exist or be accessible
      }
    }

    // Limit to 5 most relevant files
    const paths = Array.from(relevantPaths).slice(0, 5);
    return this.getMultipleFiles(owner, repo, paths, ref);
  }

  /**
   * Get corresponding test file path
   */
  getTestFilePath(filePath) {
    const ext = filePath.substring(filePath.lastIndexOf('.'));
    const baseName = filePath.substring(0, filePath.lastIndexOf('.'));
    
    // Common test patterns
    const patterns = [
      `${baseName}.test${ext}`,
      `${baseName}.spec${ext}`,
      filePath.replace('/src/', '/test/'),
      filePath.replace('/src/', '/__tests__/')
    ];

    return patterns[0]; // Return first pattern for now
  }

  /**
   * Post review comments on PR
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} pullNumber - PR number
   * @param {string} commitId - Commit SHA to comment on
   * @param {Array} comments - Array of review comments
   */
  async postReviewComments(owner, repo, pullNumber, commitId, comments) {
    try {
      const reviewComments = comments.map(comment => ({
        path: comment.file,
        line: comment.line,
        body: this.formatCommentBody(comment)
      }));

      const { data } = await this.octokit.pulls.createReview({
        owner,
        repo,
        pull_number: pullNumber,
        commit_id: commitId,
        event: 'COMMENT',
        comments: reviewComments
      });

      return data;
    } catch (error) {
      console.error('Error posting review comments:', error);
      throw error;
    }
  }

  /**
   * Post review with suggested changes (inline fix suggestions)
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} pullNumber - PR number
   * @param {string} commitId - Commit SHA
   * @param {Array} comments - Array of comments with suggested fixes
   */
  async postSuggestedChanges(owner, repo, pullNumber, commitId, comments) {
    try {
      const reviewComments = comments.map(comment => {
        let body = this.formatCommentBody(comment);
        
        // Add GitHub suggestion syntax if there's a suggested fix
        if (comment.suggested_fix) {
          body += `\n\n**Suggested fix:**\n\`\`\`suggestion\n${comment.suggested_fix}\n\`\`\``;
        }

        return {
          path: comment.file,
          line: comment.line,
          body
        };
      });

      const { data } = await this.octokit.pulls.createReview({
        owner,
        repo,
        pull_number: pullNumber,
        commit_id: commitId,
        event: 'COMMENT',
        comments: reviewComments
      });

      return data;
    } catch (error) {
      console.error('Error posting suggested changes:', error);
      throw error;
    }
  }

  /**
   * Post test stub suggestions as a single comment
   */
  async postTestStubs(owner, repo, pullNumber, testStubs) {
    if (!testStubs || testStubs.length === 0) return;

    let body = '## 🧪 Test Stub Suggestions\n\n';
    body += 'PR Buddy detected functions that may need test coverage:\n\n';

    testStubs.forEach(stub => {
      body += `### \`${stub.function_name}\` in \`${stub.file}\`\n\n`;
      body += '```javascript\n' + stub.stub + '\n```\n\n';
    });

    try {
      await this.octokit.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body
      });
    } catch (error) {
      console.error('Error posting test stubs:', error);
    }
  }

  /**
   * Post review summary
   */
  async postReviewSummary(owner, repo, pullNumber, summary) {
    const riskEmoji = {
      low: '✅',
      medium: '⚠️',
      high: '🚨'
    };

    let body = '## 🤖 PR Buddy Review Summary\n\n';
    body += `**Risk Level:** ${riskEmoji[summary.risk_level]} ${summary.risk_level.toUpperCase()}\n\n`;
    body += `**Summary:** ${summary.one_line}\n\n`;
    
    if (summary.top_issue) {
      body += `**Top Priority:** ${summary.top_issue}\n\n`;
    }

    body += '---\n*Powered by IBM Bob AI*';

    try {
      await this.octokit.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body
      });
    } catch (error) {
      console.error('Error posting review summary:', error);
    }
  }

  /**
   * Format comment body with severity badge
   */
  formatCommentBody(comment) {
    const severityEmoji = {
      bug: '🐛',
      security: '🔒',
      style: '💅',
      suggestion: '💡'
    };

    let body = `${severityEmoji[comment.severity]} **${comment.severity.toUpperCase()}:** ${comment.summary}\n\n`;
    body += comment.detail;

    return body;
  }

  /**
   * Detect primary language from repository
   */
  async detectLanguage(owner, repo) {
    try {
      const { data: languages } = await this.octokit.repos.listLanguages({
        owner,
        repo
      });

      // Get language with most bytes
      const primaryLanguage = Object.entries(languages)
        .sort((a, b) => b[1] - a[1])[0];

      return primaryLanguage ? primaryLanguage[0].toLowerCase() : 'javascript';
    } catch (error) {
      return 'javascript'; // Default fallback
    }
  }

  /**
   * Detect test framework from package.json or requirements.txt
   */
  async detectTestFramework(owner, repo, ref, language) {
    const frameworkMap = {
      javascript: ['jest', 'mocha', 'jasmine', 'vitest'],
      python: ['pytest', 'unittest', 'nose'],
      java: ['junit', 'testng'],
      go: ['testing']
    };

    try {
      if (language === 'javascript' || language === 'typescript') {
        const packageJson = await this.getFileContent(owner, repo, 'package.json', ref);
        if (packageJson) {
          const pkg = JSON.parse(packageJson);
          const deps = { ...pkg.dependencies, ...pkg.devDependencies };
          
          for (const framework of frameworkMap.javascript) {
            if (deps[framework]) return framework;
          }
        }
      } else if (language === 'python') {
        const requirements = await this.getFileContent(owner, repo, 'requirements.txt', ref);
        if (requirements) {
          for (const framework of frameworkMap.python) {
            if (requirements.includes(framework)) return framework;
          }
        }
      }
    } catch (error) {
      // Fallback to defaults
    }

    // Default frameworks
    const defaults = {
      javascript: 'jest',
      typescript: 'jest',
      python: 'pytest',
      java: 'junit',
      go: 'testing'
    };

    return defaults[language] || 'jest';
  }
}

export default new GitHubService();

// Made with Bob
