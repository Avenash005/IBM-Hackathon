import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import User from './models/User.js';
import webhookRoutes from './routes/webhooks.js';
import authRoutes from './routes/auth.js';
import repositoryRoutes from './routes/repositories.js';

// Load environment variables FIRST
dotenv.config();

// Configure GitHub OAuth Strategy BEFORE initializing routes
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          // Update existing user
          user.githubAccessToken = accessToken;
          user.lastLoginAt = new Date();
          user.avatar = profile.photos[0]?.value || user.avatar;
          user.displayName = profile.displayName || user.displayName;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            githubId: profile.id,
            username: profile.username,
            email: profile.emails[0]?.value || `${profile.username}@github.com`,
            displayName: profile.displayName || profile.username,
            avatar: profile.photos[0]?.value,
            githubAccessToken: accessToken
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  console.log('✅ GitHub OAuth strategy configured');
} else {
  console.warn('⚠️  GitHub OAuth not configured - GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET required');
  console.warn('💡 Authentication routes will not work without OAuth configuration');
}

const app = express();

// Connect to database (async, but don't block server startup)
connectDB().catch(err => {
  console.error('Failed to connect to database:', err.message);
});
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Use raw body for webhook signature verification
app.use('/api/webhooks/github', bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/webhooks', webhookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/repositories', repositoryRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'PR Buddy API',
    version: '2.0.0',
    description: 'AI-powered PR review using IBM Bob with authentication',
    endpoints: {
      // Authentication
      login: 'GET /api/auth/github',
      me: 'GET /api/auth/me',
      logout: 'POST /api/auth/logout',
      settings: 'PUT /api/auth/settings',
      
      // Repositories
      repositories: 'GET /api/repositories',
      addRepo: 'POST /api/repositories',
      repoDetails: 'GET /api/repositories/:id',
      updateRepo: 'PUT /api/repositories/:id',
      deleteRepo: 'DELETE /api/repositories/:id',
      repoStats: 'GET /api/repositories/:id/stats',
      repoReviews: 'GET /api/repositories/:id/reviews',
      
      // Webhooks
      webhook: 'POST /api/webhooks/github',
      reviews: 'GET /api/webhooks/reviews',
      health: 'GET /api/webhooks/health',
      trigger: 'POST /api/webhooks/reviews/trigger'
    },
    features: [
      'GitHub OAuth Authentication',
      'Multi-repository management',
      'User profiles and settings',
      'Repository-specific reviews',
      'Custom review rules',
      'Statistics and analytics'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PR Buddy backend running on port ${PORT}`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/github`);
  console.log(`📝 Webhook endpoint: http://localhost:${PORT}/api/webhooks/github`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/webhooks/reviews`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/webhooks/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
});

export default app;
