import express from 'express';
import passport from 'passport';
import User from '../models/User.js';
import { generateToken, protect } from '../middleware/auth.js';

const router = express.Router();

// Note: Passport strategy is now configured in index.js
// This ensures it's set up before routes are registered

/**
 * @route   GET /api/auth/github
 * @desc    Initiate GitHub OAuth
 * @access  Public
 */
router.get('/github',
  passport.authenticate('github', { 
    scope: ['user:email', 'repo', 'write:discussion'] 
  })
);

/**
 * @route   GET /api/auth/github/callback
 * @desc    GitHub OAuth callback
 * @access  Public
 */
router.get('/github/callback',
  passport.authenticate('github', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
    session: false
  }),
  (req, res) => {
    // Check if user exists
    if (!req.user || !req.user._id) {
      console.error('Auth callback: User not found in request');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=user_not_found`);
    }

    // Generate JWT token
    const token = generateToken(req.user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-githubAccessToken')
      .populate('repositories');

    res.json({
      success: true,
      data: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @route   PUT /api/auth/settings
 * @desc    Update user settings
 * @access  Private
 */
router.put('/settings', protect, async (req, res) => {
  try {
    const { theme, notifications, reviewRules } = req.body;

    const user = await User.findById(req.user._id);

    if (theme) {
      user.settings.theme = theme;
    }

    if (notifications) {
      user.settings.notifications = {
        ...user.settings.notifications,
        ...notifications
      };
    }

    if (reviewRules) {
      user.settings.reviewRules = reviewRules;
    }

    await user.save();

    res.json({
      success: true,
      data: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/auth/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: user.stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get stats',
      error: error.message
    });
  }
});

export default router;

// Made with Bob
