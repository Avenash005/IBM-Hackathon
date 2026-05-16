# 🚀 PR Buddy v2.0 - Upgrade Guide

## What's New in v2.0

### ✨ Major Features Added

1. **GitHub OAuth Authentication**
   - Users can sign in with their GitHub account
   - Secure token management with JWT
   - Session persistence

2. **Multi-Repository Management**
   - Add/remove multiple repositories
   - Repository-specific settings
   - Per-repository statistics

3. **User Profiles & Settings**
   - Personal dashboard
   - Customizable review rules
   - Notification preferences
   - Theme settings (dark/light mode)

4. **Database Integration**
   - MongoDB for persistent storage
   - User data management
   - Review history tracking
   - Repository statistics

5. **Enhanced API**
   - RESTful API with authentication
   - Protected routes
   - Repository CRUD operations
   - Advanced filtering and search

---

## 📋 Prerequisites

### New Requirements

1. **MongoDB**
   - Install MongoDB locally OR use MongoDB Atlas (cloud)
   - Default connection: `mongodb://localhost:27017/pr-buddy`

2. **GitHub OAuth App**
   - Create a GitHub OAuth application
   - Get Client ID and Client Secret

3. **Additional Environment Variables**
   - JWT secret for token generation
   - Session secret
   - OAuth credentials

---

## 🔧 Installation Steps

### Step 1: Install MongoDB

#### Option A: Local Installation

**Windows:**
```powershell
# Download from https://www.mongodb.com/try/download/community
# Or use Chocolatey
choco install mongodb

# Start MongoDB
mongod
```

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `MONGODB_URI` in `.env`

### Step 2: Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name:** PR Buddy
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID**
6. Generate a new **Client Secret** and copy it

### Step 3: Update Environment Variables

Edit `backend/.env`:

```env
# Existing variables
GITHUB_TOKEN=your_personal_access_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret
BOB_API_URL=https://bob-api.ibm.com/v1
BOB_API_KEY=your_bob_api_key
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# NEW: GitHub OAuth
GITHUB_CLIENT_ID=your_oauth_client_id_here
GITHUB_CLIENT_SECRET=your_oauth_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# NEW: Database
MONGODB_URI=mongodb://localhost:27017/pr-buddy
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pr-buddy

# NEW: JWT & Session
JWT_SECRET=your-random-secret-key-min-32-chars
JWT_EXPIRE=7d
SESSION_SECRET=another-random-secret-key-min-32-chars
```

**Generate secure secrets:**
```bash
# In Node.js REPL or terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Install New Dependencies

```bash
cd backend
npm install
```

New packages installed:
- `mongoose` - MongoDB ODM
- `passport` - Authentication middleware
- `passport-github2` - GitHub OAuth strategy
- `jsonwebtoken` - JWT token generation
- `bcryptjs` - Password hashing
- `express-session` - Session management
- `cookie-parser` - Cookie parsing
- `express-validator` - Input validation

### Step 5: Start MongoDB

Make sure MongoDB is running:

```bash
# Check if MongoDB is running
mongosh

# Or start it
mongod
```

### Step 6: Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 PR Buddy backend running on port 3000
🔐 Auth endpoint: http://localhost:3000/api/auth/github
📝 Webhook endpoint: http://localhost:3000/api/webhooks/github
📊 Dashboard API: http://localhost:3000/api/webhooks/reviews
💚 Health check: http://localhost:3000/api/webhooks/health
📚 API docs: http://localhost:3000/
```

---

## 🎨 Frontend Updates (Coming Next)

The frontend will be updated with:

1. **Login Page** - GitHub OAuth sign-in
2. **Authentication Context** - Manage user state
3. **Protected Routes** - Require authentication
4. **Repository Management** - Add/remove repos UI
5. **User Profile** - View and edit profile
6. **Dark Mode** - Theme toggle
7. **Search & Filter** - Enhanced navigation

---

## 📊 New API Endpoints

### Authentication

```bash
# Initiate GitHub OAuth login
GET /api/auth/github

# Get current user
GET /api/auth/me
Headers: Authorization: Bearer <token>

# Logout
POST /api/auth/logout
Headers: Authorization: Bearer <token>

# Update settings
PUT /api/auth/settings
Headers: Authorization: Bearer <token>
Body: { "theme": "dark", "notifications": {...} }

# Get user stats
GET /api/auth/stats
Headers: Authorization: Bearer <token>
```

### Repositories

```bash
# Get all user repositories
GET /api/repositories
Headers: Authorization: Bearer <token>

# Add a repository
POST /api/repositories
Headers: Authorization: Bearer <token>
Body: { "owner": "username", "name": "repo-name" }

# Get repository details
GET /api/repositories/:id
Headers: Authorization: Bearer <token>

# Update repository settings
PUT /api/repositories/:id
Headers: Authorization: Bearer <token>
Body: { "settings": {...} }

# Delete repository
DELETE /api/repositories/:id
Headers: Authorization: Bearer <token>

# Get repository stats
GET /api/repositories/:id/stats
Headers: Authorization: Bearer <token>

# Get repository reviews
GET /api/repositories/:id/reviews?page=1&limit=20&riskLevel=high
Headers: Authorization: Bearer <token>
```

---

## 🗄️ Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  githubId: String,
  username: String,
  email: String,
  displayName: String,
  avatar: String,
  githubAccessToken: String (encrypted),
  repositories: [ObjectId],
  settings: {
    theme: String,
    notifications: Object,
    reviewRules: Map
  },
  stats: {
    totalReviews: Number,
    totalComments: Number,
    totalTestStubs: Number,
    avgQualityScore: Number
  },
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Repositories Collection

```javascript
{
  _id: ObjectId,
  owner: String,
  name: String,
  fullName: String,
  userId: ObjectId,
  githubId: Number,
  description: String,
  language: String,
  isPrivate: Boolean,
  webhookId: String,
  settings: {
    autoReview: Boolean,
    customRules: Map,
    notifications: Object
  },
  stats: {
    totalReviews: Number,
    avgQualityScore: Number,
    riskDistribution: Object
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Reviews Collection

```javascript
{
  _id: ObjectId,
  repositoryId: ObjectId,
  userId: ObjectId,
  owner: String,
  repo: String,
  pullNumber: Number,
  prTitle: String,
  prUrl: String,
  author: String,
  commitSha: String,
  riskLevel: String,
  qualityScore: Number,
  commentCount: Number,
  testStubCount: Number,
  summary: Object,
  comments: Array,
  testStubs: Array,
  feedback: {
    helpful: Number,
    notHelpful: Number,
    falsePositives: Array
  },
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication Flow

### 1. User Login

```
User clicks "Sign in with GitHub"
  ↓
Frontend redirects to: /api/auth/github
  ↓
Backend redirects to GitHub OAuth
  ↓
User authorizes on GitHub
  ↓
GitHub redirects to: /api/auth/github/callback
  ↓
Backend creates/updates user in database
  ↓
Backend generates JWT token
  ↓
Backend redirects to: /auth/callback?token=<jwt>
  ↓
Frontend stores token and redirects to dashboard
```

### 2. Authenticated Requests

```javascript
// Frontend sends token in header
fetch('/api/repositories', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

// Backend middleware verifies token
// Attaches user to req.user
// Proceeds to route handler
```

---

## 🧪 Testing the Upgrade

### 1. Test Database Connection

```bash
curl http://localhost:3000/api/webhooks/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "reviewCount": 0
}
```

### 2. Test OAuth Flow

1. Open browser: `http://localhost:3000/api/auth/github`
2. Authorize on GitHub
3. Should redirect to frontend with token
4. Check MongoDB:
   ```bash
   mongosh
   use pr-buddy
   db.users.find()
   ```

### 3. Test API Endpoints

```bash
# Get your token from the OAuth callback
TOKEN="your_jwt_token_here"

# Test authenticated endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/me

# Add a repository
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"owner":"username","name":"repo"}' \
  http://localhost:3000/api/repositories
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
1. Check if MongoDB is running: `mongosh`
2. Start MongoDB: `mongod` or `brew services start mongodb-community`
3. Check connection string in `.env`

### OAuth Callback Error

**Error:** `redirect_uri_mismatch`

**Solution:**
1. Check GitHub OAuth app settings
2. Callback URL must match exactly: `http://localhost:3000/api/auth/github/callback`
3. Update `GITHUB_CALLBACK_URL` in `.env`

### JWT Token Invalid

**Error:** `Invalid token` or `Not authorized`

**Solution:**
1. Check `JWT_SECRET` is set in `.env`
2. Token might be expired (default 7 days)
3. Re-login to get new token

### User Not Found After Login

**Solution:**
1. Check MongoDB connection
2. Check user was created: `db.users.find()`
3. Check GitHub OAuth scopes include `user:email`

---

## 📈 Migration from v1.0

If you have existing reviews from v1.0:

### Option 1: Fresh Start (Recommended)
- Start with clean database
- All new reviews will be stored in MongoDB

### Option 2: Migrate Existing Data
- Export reviews from in-memory storage
- Import into MongoDB using migration script (coming soon)

---

## 🎯 Next Steps

1. ✅ Backend authentication complete
2. ⏳ Frontend updates (in progress)
3. ⏳ Repository management UI
4. ⏳ User profile page
5. ⏳ Dark mode
6. ⏳ Search and filters

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Passport.js Documentation](http://www.passportjs.org/)
- [JWT.io](https://jwt.io/)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

## 🆘 Need Help?

Check the following files for more information:
- `ROADMAP.md` - Full feature roadmap
- `README.md` - General documentation
- `GITHUB_TOKEN_SETUP.md` - Token setup guide
- `DEMO_GUIDE.md` - Demo instructions

---

**Congratulations! 🎉 Your backend is now upgraded to v2.0 with authentication and multi-repo support!**