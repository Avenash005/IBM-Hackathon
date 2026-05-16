# 🎯 PR Buddy - Hackathon Demo Guide

## Quick Demo Setup (15 minutes)

### 1. Prerequisites Check
- [ ] Node.js 18+ installed
- [ ] GitHub account ready
- [ ] IBM Bob API credentials
- [ ] ngrok installed (for local demo)

### 2. Fast Setup

```bash
# Windows
.\setup.ps1

# Mac/Linux
chmod +x setup.sh
./setup.sh
```

### 3. Configure Credentials

Edit `backend/.env`:
```env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_WEBHOOK_SECRET=your_secret_123
BOB_API_URL=https://bob-api.ibm.com/v1
BOB_API_KEY=your_bob_key_here
```

### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - ngrok (for webhook):**
```bash
ngrok http 3000
# Copy the HTTPS URL
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Configure GitHub Webhook

1. Go to your test repo → Settings → Webhooks → Add webhook
2. Payload URL: `https://YOUR-NGROK-URL.ngrok.io/api/webhooks/github`
3. Content type: `application/json`
4. Secret: Your `GITHUB_WEBHOOK_SECRET`
5. Events: Select "Pull requests"
6. Save

### 6. Test the System

Create a PR with `demo/buggy-code.js` to trigger the review!

---

## 🎬 Live Demo Script (10 minutes)

### Opening (1 min)
"PR Buddy is an AI-powered code review assistant that automatically reviews pull requests using IBM Bob AI. It catches bugs, security issues, suggests fixes, and even generates test stubs."

### Architecture Overview (2 min)
Show the flow:
1. Developer opens PR
2. GitHub webhook fires
3. PR Buddy fetches diff + related files
4. IBM Bob analyzes the code
5. Comments posted back to GitHub
6. Dashboard shows all reviews

### Live Demo (5 min)

#### Step 1: Show the Dashboard
- Open http://localhost:5173
- Point out: Total reviews, risk distribution, issue categories
- "This is our command center showing all PR reviews"

#### Step 2: Create a PR
- Open your test repo
- Create a new branch: `git checkout -b demo-review`
- Copy `demo/buggy-code.js` to your repo
- Commit and push
- Open a PR on GitHub

#### Step 3: Watch the Magic
- Show backend terminal - webhook received
- "PR Buddy is now analyzing the code with IBM Bob..."
- Wait 30-60 seconds

#### Step 4: Show the Results
- Refresh the PR page
- Point out inline comments:
  - 🐛 Bug: Off-by-one error with suggested fix
  - 🔒 Security: SQL injection vulnerability
  - 💡 Suggestion: Better validation
- Show the "suggestion" button - one-click fix!
- Click to accept a suggested change

#### Step 5: Test Stubs
- Scroll to test stub comment
- "Bob generated complete test stubs with realistic data"
- Show the Jest test code

#### Step 6: Review Summary
- Show the summary comment
- Risk level: HIGH
- Top priority issue highlighted

#### Step 7: Dashboard Update
- Switch to dashboard
- Show the new review appeared
- Click "Details" to expand
- Click "Re-review" button to demonstrate manual trigger

### Closing (2 min)

**Key Features:**
- ✅ Automated reviews on every PR
- ✅ AI-powered analysis using IBM Bob
- ✅ Inline fix suggestions (one-click accept)
- ✅ Test stub generation
- ✅ Risk assessment
- ✅ Beautiful dashboard

**Impact:**
- Catches bugs before merge
- Improves code quality
- Saves review time
- Educates developers
- Increases test coverage

**Tech Stack:**
- Backend: Node.js + Express
- AI: IBM Bob API
- Frontend: React + Tailwind
- Integration: GitHub API + Webhooks

---

## 🐛 Troubleshooting During Demo

### Webhook not firing?
```bash
# Check ngrok is running
curl https://your-ngrok-url.ngrok.io/api/webhooks/health

# Check GitHub webhook deliveries
# Go to repo Settings → Webhooks → Recent Deliveries
```

### Bob API timeout?
- Have a backup: Show pre-recorded screenshots
- Explain: "In production, this takes 30-60 seconds"

### Frontend not loading?
```bash
# Quick restart
cd frontend
npm run dev
```

---

## 📊 Demo Metrics to Highlight

Prepare these talking points:

1. **Speed**: "Reviews complete in under 60 seconds"
2. **Accuracy**: "Catches 10+ issue types: bugs, security, style, suggestions"
3. **Coverage**: "Generates test stubs for untested functions"
4. **Integration**: "Seamless GitHub integration - no context switching"
5. **Scalability**: "Can review unlimited PRs, 24/7"

---

## 🎨 Backup Plan

If live demo fails, have ready:

1. **Screenshots** of:
   - Dashboard with multiple reviews
   - GitHub PR with inline comments
   - Suggested change being accepted
   - Test stub suggestions

2. **Video recording** of:
   - Complete workflow from PR open to comments posted
   - Dashboard interaction

3. **Prepared PR** with:
   - Already reviewed code
   - Comments visible
   - Can show re-review feature

---

## 💡 Judges' Questions - Prepared Answers

**Q: How does it compare to existing tools like SonarQube?**
A: PR Buddy is conversational and context-aware. It understands your codebase, references related files, and provides actionable fixes - not just rule violations.

**Q: What makes IBM Bob special here?**
A: Bob understands code semantics, not just syntax. It can reason about logic bugs, security implications, and generate realistic test data based on actual usage patterns.

**Q: Can it handle large PRs?**
A: Yes! We intelligently select the 5 most relevant files for context. For very large PRs, we can batch the analysis.

**Q: What about false positives?**
A: Bob is trained to only flag real issues. We use temperature=0.3 for consistency and ask it explicitly to "not invent problems."

**Q: How do you ensure security of code sent to Bob?**
A: All communication is encrypted. For enterprise, Bob can be deployed on-premises. We never store code permanently.

**Q: What's the cost per review?**
A: Approximately $0.10-0.50 per PR depending on size. Much cheaper than human review time.

---

## 🚀 Post-Demo: Next Steps

If judges are interested:

1. **Show the code**: Walk through key files
   - `bobService.js` - AI integration
   - `githubService.js` - GitHub API
   - `Dashboard.jsx` - React UI

2. **Discuss roadmap**:
   - Multi-language support
   - Custom rule configuration
   - Team analytics
   - Slack/Teams notifications
   - IDE integration

3. **Business model**:
   - Free tier: 10 reviews/month
   - Pro: $29/month unlimited
   - Enterprise: Custom pricing

---

## ✅ Pre-Demo Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] ngrok tunnel active
- [ ] GitHub webhook configured
- [ ] Test repo ready
- [ ] Demo file ready to commit
- [ ] Dashboard showing some existing reviews
- [ ] Backup screenshots/video ready
- [ ] Laptop charged
- [ ] Internet connection stable
- [ ] Browser tabs organized
- [ ] Terminal windows arranged

---

## 🎤 Opening Hook

"Imagine if every pull request got reviewed by a senior engineer who:
- Never gets tired
- Reviews in under 60 seconds
- Knows your entire codebase
- Suggests exact fixes
- Generates tests automatically

That's PR Buddy. Let me show you."

---

Good luck! 🍀