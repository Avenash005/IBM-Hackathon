import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import webhookRoutes from './routes/webhooks.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'PR Buddy API',
    version: '1.0.0',
    description: 'AI-powered PR review using IBM Bob',
    endpoints: {
      webhook: 'POST /api/webhooks/github',
      reviews: 'GET /api/webhooks/reviews',
      health: 'GET /api/webhooks/health',
      trigger: 'POST /api/webhooks/reviews/trigger'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PR Buddy backend running on port ${PORT}`);
  console.log(`📝 Webhook endpoint: http://localhost:${PORT}/api/webhooks/github`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/webhooks/reviews`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/webhooks/health`);
});

export default app;

// Made with Bob
