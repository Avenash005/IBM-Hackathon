import githubService from './githubService.js';
import bobService from './bobService.js';

class ReviewService {
  /**
   * Main entry point: Review a PR end-to-end
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} pullNumber - PR number
   */
  async reviewPullRequest(owner, repo, pullNumber) {
    console.log(`Starting review for ${owner}/${repo}#${pullNumber}`);

    try {
      // Step 1: Get PR details and diff
      const { pr, diff, files } = await githubService.getPRDetails(owner, repo, pullNumber);
      console.log(`Fetched PR with ${files.length} changed files`);

      // Step 2: Detect language and test framework
      const language = await githubService.detectLanguage(owner, repo);
      const testFramework = await githubService.detectTestFramework(
        owner,
        repo,
        pr.head.sha,
        language
      );
      console.log(`Detected: ${language} with ${testFramework}`);

      // Step 3: Get relevant files from repository
      const relevantFiles = await githubService.findRelevantFiles(
        owner,
        repo,
        diff,
        pr.head.sha
      );
      console.log(`Found ${relevantFiles.length} relevant files`);

      // Step 4: Send to Bob for AI review
      const review = await bobService.reviewPR(
        diff,
        relevantFiles,
        language,
        testFramework
      );
      console.log(`Bob review complete: ${review.review_comments.length} comments, ${review.test_stubs.length} test stubs`);

      // Step 5: Post review comments with suggested changes
      if (review.review_comments.length > 0) {
        await githubService.postSuggestedChanges(
          owner,
          repo,
          pullNumber,
          pr.head.sha,
          review.review_comments
        );
        console.log('Posted review comments');
      }

      // Step 6: Post test stub suggestions
      if (review.test_stubs.length > 0) {
        await githubService.postTestStubs(
          owner,
          repo,
          pullNumber,
          review.test_stubs
        );
        console.log('Posted test stubs');
      }

      // Step 7: Post review summary
      await githubService.postReviewSummary(
        owner,
        repo,
        pullNumber,
        review.summary
      );
      console.log('Posted review summary');

      // Step 8: Store review in database (for dashboard)
      const reviewRecord = {
        owner,
        repo,
        pullNumber,
        prTitle: pr.title,
        prUrl: pr.html_url,
        author: pr.user.login,
        reviewedAt: new Date().toISOString(),
        riskLevel: review.summary.risk_level,
        commentCount: review.review_comments.length,
        testStubCount: review.test_stubs.length,
        summary: review.summary,
        comments: review.review_comments,
        testStubs: review.test_stubs
      };

      return reviewRecord;
    } catch (error) {
      console.error('Error during PR review:', error);
      throw error;
    }
  }

  /**
   * Re-review a PR (for dashboard "re-review" button)
   */
  async reReviewPullRequest(owner, repo, pullNumber) {
    console.log(`Re-reviewing ${owner}/${repo}#${pullNumber}`);
    return this.reviewPullRequest(owner, repo, pullNumber);
  }

  /**
   * Get review statistics for dashboard
   */
  getReviewStats(reviews) {
    const stats = {
      total: reviews.length,
      byRisk: {
        low: 0,
        medium: 0,
        high: 0
      },
      bySeverity: {
        bug: 0,
        security: 0,
        style: 0,
        suggestion: 0
      },
      totalComments: 0,
      totalTestStubs: 0,
      avgCommentsPerPR: 0
    };

    reviews.forEach(review => {
      stats.byRisk[review.riskLevel]++;
      stats.totalComments += review.commentCount;
      stats.totalTestStubs += review.testStubCount;

      review.comments.forEach(comment => {
        stats.bySeverity[comment.severity]++;
      });
    });

    stats.avgCommentsPerPR = reviews.length > 0 
      ? (stats.totalComments / reviews.length).toFixed(1)
      : 0;

    return stats;
  }
}

export default new ReviewService();

// Made with Bob
