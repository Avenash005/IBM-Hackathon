# ⚡ PR Buddy - Quick Start (5 Minutes)

## 🚀 Fastest Way to Run

### Step 1: Install Dependencies (2 min)
```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### Step 2: Setup MongoDB (1 min)
**Option A - MongoDB Atlas (Easiest):**
1. Go to https://mongodb.com/cloud/atlas
2. Sign up free
3. Create cluster
4. Get connection string
5. Use in `.env`

**Option B - Local:**
```bash
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt install mongodb
```

### Step 3: Create GitHub OAuth App (1 min)
1. https://github.com/settings/developers
2. New OAuth App
3. Callback: `http://localhost:3000/api/auth/github/callback`
4. Copy Client ID & Secret

### Step 4: Configure (1 min)
```bash
# backend/.env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
MONGODB_URI=mongodb://localhost:27017/pr-buddy
JWT_SECRET=any_random_string_min_32_chars
SESSION_SECRET=another_random_string
GITHUB_TOKEN=your_github_pat
BOB_API_KEY=your_bob_key
BOB_API_URL=https://bob-api.ibm.com/v1

# frontend/.env
VITE_API_URL=http://localhost:3000/api
```

### Step 5: Run (30 sec)
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### Step 6: Test
Open http://localhost:5173 → Click "Sign in with GitHub" → Done! 🎉

---

## 📋 What You Get

✅ GitHub OAuth login
✅ User authentication
✅ Dark/light mode
✅ PR review dashboard
✅ Database persistence
✅ Protected routes

---

## 🐛 Quick Fixes

**MongoDB Error?**
```bash
# Use Atlas instead (free, no install)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pr-buddy
```

**OAuth Error?**
- Check callback URL matches exactly
- Verify Client ID/Secret in `.env`

**Port in use?**
```bash
# Change ports in .env
PORT=3001  # backend
# frontend: edit vite.config.js
```

---

## 📚 Full Docs
- `UPGRADE_GUIDE.md` - Complete setup
- `ROADMAP.md` - All features
- `README.md` - Project overview

---

**That's it! You're running PR Buddy v2.0 with authentication! 🚀**