import express from 'express';
import crypto from 'crypto';
import reviewService from '../services/reviewService.js';

const router = express.Router();

// In-memory storage for reviews (replace with database in production)
const reviews = [];

/**
 * Verify GitHub webhook signature
 */
function verifySignature(req, res, next) {
  const signature = req.headers['x-hub-signature-256'];
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!signature || !secret) {
    console.warn('Missing signature or secret');
    return next();
  }

  // Use rawBody that was captured in the middleware
  const payload = req.rawBody || JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  if (signature !== digest) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
}

/**
 * GitHub webhook endpoint
 * Handles pull_request events
 */
router.post('/github', verifySignature, async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  console.log(`Received GitHub event: ${event}`);

  // Respond quickly to GitHub
  res.status(200).json({ message: 'Webhook received' });

  // Process asynchronously
  try {
    if (event === 'pull_request') {
      await handlePullRequestEvent(payload);
    } else if (event === 'ping') {
      console.log('Ping event received - webhook is configured correctly');
    } else {
      console.log(`Unhandled event type: ${event}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
  }
});

/**
 * Handle pull_request events
 */
async function handlePullRequestEvent(payload) {
  const action = payload.action;
  const pr = payload.pull_request;
  const repo = payload.repository;

  console.log(`PR #${pr.number} ${action} in ${repo.full_name}`);

  // Only review on opened or synchronize (new commits)
  if (action === 'opened' || action === 'synchronize') {
    const [owner, repoName] = repo.full_name.split('/');

    try {
      console.log(`Starting review for PR #${pr.number}...`);
      
      const review = await reviewService.reviewPullRequest(
        owner,
        repoName,
        pr.number
      );

      // Store review for dashboard
      reviews.push(review);
      console.log(`Review complete for PR #${pr.number}`);
    } catch (error) {
      console.error(`Failed to review PR #${pr.number}:`, error);
    }
  }
}

/**
 * Get all reviews (for dashboard)
 */
router.get('/reviews', (req, res) => {
  const stats = reviewService.getReviewStats(reviews);
  res.json({
    reviews: reviews.sort((a, b) => 
      new Date(b.reviewedAt) - new Date(a.reviewedAt)
    ),
    stats
  });
});

/**
 * Get a specific review
 */
router.get('/reviews/:owner/:repo/:pullNumber', (req, res) => {
  const { owner, repo, pullNumber } = req.params;
  
  const review = reviews.find(r => 
    r.owner === owner && 
    r.repo === repo && 
    r.pullNumber === parseInt(pullNumber)
  );

  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  res.json(review);
});

/**
 * Trigger manual review (for re-review button)
 */
router.post('/reviews/trigger', async (req, res) => {
  const { owner, repo, pullNumber } = req.body;

  if (!owner || !repo || !pullNumber) {
    return res.status(400).json({ 
      error: 'Missing required fields: owner, repo, pullNumber' 
    });
  }

  try {
    // Start review asynchronously
    reviewService.reReviewPullRequest(owner, repo, pullNumber)
      .then(review => {
        // Update or add review
        const existingIndex = reviews.findIndex(r => 
          r.owner === owner && 
          r.repo === repo && 
          r.pullNumber === pullNumber
        );

        if (existingIndex >= 0) {
          reviews[existingIndex] = review;
        } else {
          reviews.push(review);
        }
      })
      .catch(error => {
        console.error('Re-review failed:', error);
      });

    res.json({ message: 'Review triggered', owner, repo, pullNumber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    reviewCount: reviews.length
  });
});

export default router;

// Made with Bob
