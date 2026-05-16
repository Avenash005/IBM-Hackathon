# 🤖 PR Buddy - AI-Powered Pull Request Reviews

PR Buddy is an intelligent GitHub App that automatically reviews pull requests using IBM Bob AI. It provides inline code suggestions, identifies bugs and security issues, generates test stubs, and posts comprehensive review summaries.

## 🎯 Features

- **Automated PR Reviews**: Triggered automatically on PR open/update via GitHub webhooks
- **AI-Powered Analysis**: Uses IBM Bob API to analyze code changes and related files
- **Inline Fix Suggestions**: GitHub-native suggested changes (one-click accept)
- **Test Stub Generation**: Automatically generates test stubs for untested functions
- **Issue Categorization**: Bugs, security, style, and suggestions
- **Risk Assessment**: Low/medium/high risk levels for each PR
- **Interactive Dashboard**: React dashboard to view all reviews and statistics
- **Re-review Capability**: Manually trigger re-reviews from the dashboard

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   GitHub    │─────▶│   Webhook    │─────▶│  IBM Bob    │
│  PR Events  │      │   Handler    │      │     API     │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Review     │
                     │   Service    │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐      ┌─────────────┐
                     │   GitHub     │─────▶│   React     │
                     │     API      │      │  Dashboard  │
                     └──────────────┘      └─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- GitHub account with repository access
- IBM Bob API credentials
- GitHub Personal Access Token or GitHub App

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd pr-buddy

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend

Create `backend/.env` from the example:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
# GitHub Configuration
GITHUB_TOKEN=ghp_your_personal_access_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# IBM Bob API Configuration
BOB_API_URL=https://bob-api.ibm.com/v1
BOB_API_KEY=your_bob_api_key

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Set Up GitHub Webhook

#### Option A: Using ngrok (for local development)

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

#### Option B: Deploy to Railway/Render

Deploy the backend to a cloud service and use the public URL.

#### Configure GitHub Webhook

1. Go to your GitHub repository → Settings → Webhooks → Add webhook
2. **Payload URL**: `https://your-domain.com/api/webhooks/github`
3. **Content type**: `application/json`
4. **Secret**: Your `GITHUB_WEBHOOK_SECRET` from `.env`
5. **Events**: Select "Pull requests"
6. Click "Add webhook"

### 4. Start the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- Dashboard: http://localhost:5173

## 📋 API Endpoints

### Webhook Endpoints

- `POST /api/webhooks/github` - GitHub webhook receiver
- `GET /api/webhooks/health` - Health check
- `GET /api/webhooks/reviews` - Get all reviews with stats
- `GET /api/webhooks/reviews/:owner/:repo/:pullNumber` - Get specific review
- `POST /api/webhooks/reviews/trigger` - Manually trigger a review

### Example: Trigger Manual Review

```bash
curl -X POST http://localhost:3000/api/webhooks/reviews/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "username",
    "repo": "repository",
    "pullNumber": 123
  }'
```

## 🎨 Dashboard Features

The React dashboard provides:

- **Overview Stats**: Total reviews, comments, test stubs, averages
- **Risk Distribution**: Visual breakdown of low/medium/high risk PRs
- **Issue Categories**: Bugs, security, style, suggestions counts
- **Review List**: All reviewed PRs with expandable details
- **Re-review Button**: Trigger new reviews on demand
- **Auto-refresh**: Polls for updates every 30 seconds

## 🧪 Testing the System

### Create a Demo PR with Planted Bugs

Create a test repository and add a file with intentional issues:

```javascript
// demo.js - Example with planted bugs
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {  // Bug: off-by-one error
    total += items[i];
  }
  return total;
}

function processPayment(amount, userId) {
  // Security: No input validation
  const query = `SELECT * FROM users WHERE id = ${userId}`;  // SQL injection
  
  // Bug: No null check
  const user = getUser(userId);
  console.log(user.name);  // Will crash if user is null
  
  return amount * 1.1;
}

// Missing tests for both functions
```

Open a PR with this code, and PR Buddy will:
1. Detect the off-by-one error
2. Flag the SQL injection vulnerability
3. Identify the missing null check
4. Generate test stubs for both functions
5. Post inline suggestions with fixes

## 🔧 Configuration

### Customizing Review Behavior

Edit `backend/src/services/bobService.js` to customize:

- System prompt for Bob
- Temperature and token limits
- Review structure and format

### Adding More File Analysis

Edit `backend/src/services/githubService.js` to:

- Change relevant file detection logic
- Add more test file patterns
- Customize language/framework detection

## 📊 Review Output Format

PR Buddy posts three types of comments:

### 1. Inline Review Comments

```
🐛 BUG: Off-by-one error in loop
Loop condition should be `i < items.length` not `i <= items.length`.
This will cause an array index out of bounds error.

Suggested fix:
```suggestion
for (let i = 0; i < items.length; i++) {
```
```

### 2. Test Stub Suggestions

```
## 🧪 Test Stub Suggestions

### `calculateTotal` in `demo.js`

```javascript
describe('calculateTotal', () => {
  it('should calculate total of items', () => {
    const items = [10, 20, 30];
    expect(calculateTotal(items)).toBe(60);
  });
  
  it('should handle empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });
});
```
```

### 3. Review Summary

```
## 🤖 PR Buddy Review Summary

**Risk Level:** 🚨 HIGH

**Summary:** Multiple critical issues found including security vulnerability and potential crashes

**Top Priority:** Fix SQL injection vulnerability in processPayment function

---
*Powered by IBM Bob AI*
```

## 🚢 Deployment

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy backend
cd backend
railway login
railway init
railway up

# Set environment variables in Railway dashboard
```

### Deploy to Render

1. Connect your GitHub repository
2. Create a new Web Service
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables

### Deploy Frontend to Vercel

```bash
cd frontend
npm install -g vercel
vercel
```

## 🎯 Hackathon Demo Script

### Setup (5 minutes)
1. Show the architecture diagram
2. Explain the workflow: PR → Webhook → Bob → GitHub Comments
3. Open the dashboard showing existing reviews

### Live Demo (10 minutes)
1. Open a prepared PR with 3-4 planted bugs
2. Show the webhook firing in backend logs
3. Wait for Bob to analyze (30-60 seconds)
4. Show inline comments appearing on GitHub
5. Accept one suggested fix with one click
6. Show test stub suggestions
7. Show review summary with risk level
8. Switch to dashboard and show the new review
9. Click "Re-review" button to demonstrate manual trigger

### Metrics Highlight (2 minutes)
- Show stats: X reviews, Y comments, Z test stubs
- Show risk distribution chart
- Show issue categories breakdown

## 🛠️ Troubleshooting

### Webhook not firing
- Check ngrok is running and URL is correct
- Verify webhook secret matches `.env`
- Check GitHub webhook delivery logs

### Bob API errors
- Verify API key is correct
- Check API URL and endpoint
- Review rate limits

### No comments posted
- Check GitHub token has write permissions
- Verify repository access
- Check backend logs for errors

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 🏆 Built for IBM Hackathon

This project demonstrates the power of IBM Bob AI for automated code review and developer productivity.