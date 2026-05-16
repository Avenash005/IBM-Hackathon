import express from 'express';
import { protect } from '../middleware/auth.js';
import Repository from '../models/Repository.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import githubService from '../services/githubService.js';

const router = express.Router();

/**
 * @route   GET /api/repositories
 * @desc    Get all repositories for current user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const repositories = await Repository.find({ 
      userId: req.user._id,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: repositories.length,
      data: repositories.map(repo => repo.getPublicInfo())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repositories',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/repositories/:id
 * @desc    Get single repository
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    res.json({
      success: true,
      data: repository.getPublicInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repository',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/repositories
 * @desc    Add a new repository
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { owner, name } = req.body;

    if (!owner || !name) {
      return res.status(400).json({
        success: false,
        message: 'Owner and name are required'
      });
    }

    const fullName = `${owner}/${name}`;

    // Check if repository already exists
    const existingRepo = await Repository.findOne({ fullName, userId: req.user._id });
    if (existingRepo) {
      return res.status(400).json({
        success: false,
        message: 'Repository already added'
      });
    }

    // Fetch repository details from GitHub
    const { data: repoData } = await githubService.octokit.repos.get({
      owner,
      repo: name
    });

    // Create repository
    const repository = await Repository.create({
      owner,
      name,
      fullName,
      userId: req.user._id,
      githubId: repoData.id,
      description: repoData.description,
      language: repoData.language,
      isPrivate: repoData.private
    });

    // Add repository to user's list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { repositories: repository._id }
    });

    // TODO: Create webhook on GitHub
    // This would require the user's GitHub token with proper permissions

    res.status(201).json({
      success: true,
      message: 'Repository added successfully',
      data: repository.getPublicInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add repository',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/repositories/:id
 * @desc    Update repository settings
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    const { settings } = req.body;

    if (settings) {
      repository.settings = {
        ...repository.settings,
        ...settings
      };
    }

    await repository.save();

    res.json({
      success: true,
      message: 'Repository updated successfully',
      data: repository.getPublicInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update repository',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/repositories/:id
 * @desc    Remove repository
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    // Soft delete - mark as inactive
    repository.isActive = false;
    await repository.save();

    // Remove from user's repository list
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { repositories: repository._id }
    });

    // TODO: Remove webhook from GitHub

    res.json({
      success: true,
      message: 'Repository removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove repository',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/repositories/:id/stats
 * @desc    Get repository statistics
 * @access  Private
 */
router.get('/:id/stats', protect, async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    // Get recent reviews
    const recentReviews = await Review.find({
      repositoryId: repository._id
    })
    .sort({ reviewedAt: -1 })
    .limit(10)
    .select('pullNumber prTitle riskLevel qualityScore reviewedAt');

    res.json({
      success: true,
      data: {
        stats: repository.stats,
        recentReviews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repository stats',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/repositories/:id/reviews
 * @desc    Get all reviews for a repository
 * @access  Private
 */
router.get('/:id/reviews', protect, async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }

    const { page = 1, limit = 20, riskLevel, search } = req.query;

    const query = { repositoryId: repository._id };

    if (riskLevel) {
      query.riskLevel = riskLevel;
    }

    if (search) {
      query.$or = [
        { prTitle: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    const reviews = await Review.find(query)
      .sort({ reviewedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments(query);

    res.json({
      success: true,
      data: reviews.map(review => review.getPublicData()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

export default router;

// Made with Bob
