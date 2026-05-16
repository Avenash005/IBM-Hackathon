# 🔑 GitHub Token Setup Guide

## Required Permissions for PR Buddy

PR Buddy needs a GitHub Personal Access Token (PAT) with specific permissions to read PRs, post comments, and access repository files.

## Step-by-Step Token Creation

### 1. Go to GitHub Settings

1. Click your profile picture (top right)
2. Click **Settings**
3. Scroll down to **Developer settings** (bottom left)
4. Click **Personal access tokens**
5. Click **Tokens (classic)** or **Fine-grained tokens**

---

## Option A: Classic Token (Easier, Recommended for Demo)

### Required Scopes:

Select these permissions when creating the token:

#### ✅ **repo** (Full control of private repositories)
This includes:
- `repo:status` - Access commit status
- `repo_deployment` - Access deployment status
- `public_repo` - Access public repositories
- `repo:invite` - Access repository invitations
- `security_events` - Read and write security events

**Why needed:** To read PR diffs, files, and post review comments

#### ✅ **write:discussion** (Read and write team discussions)
**Why needed:** To post comments on PRs

#### ✅ **read:org** (Read org and team membership)
**Why needed:** To access organization repositories (if applicable)

### Steps:

1. Click **Generate new token** → **Generate new token (classic)**
2. Give it a name: `PR Buddy Token`
3. Set expiration: Choose based on your needs (30 days for demo, no expiration for production)
4. Select scopes:
   - ✅ Check **repo** (this will check all sub-items)
   - ✅ Check **write:discussion**
   - ✅ Check **read:org** (if using org repos)
5. Click **Generate token**
6. **IMPORTANT:** Copy the token immediately (you won't see it again!)
7. Paste it in your `backend/.env` file as `GITHUB_TOKEN`

---

## Option B: Fine-Grained Token (More Secure, Production)

Fine-grained tokens give more granular control and are repository-specific.

### Steps:

1. Click **Generate new token** → **Generate new token (fine-grained)**
2. **Token name:** `PR Buddy Token`
3. **Expiration:** Choose based on needs
4. **Repository access:** 
   - Select **Only select repositories**
   - Choose the repositories you want PR Buddy to access

### Required Permissions:

#### Repository Permissions:

- **Contents:** `Read-only` ✅
  - To read repository files and diffs

- **Pull requests:** `Read and write` ✅
  - To read PR details and post review comments

- **Metadata:** `Read-only` ✅
  - Automatically included, needed for basic repo info

- **Commit statuses:** `Read-only` ✅
  - To read commit information

#### Organization Permissions (if using org repos):

- **Members:** `Read-only` ✅
  - To read organization membership

### Complete Setup:

1. Set all the permissions above
2. Click **Generate token**
3. Copy the token
4. Add to `backend/.env`:
   ```env
   GITHUB_TOKEN=github_pat_YOUR_TOKEN_HERE
   ```

---

## Testing Your Token

### Test 1: Check Token Validity

```bash
# Replace YOUR_TOKEN with your actual token
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/user
```

Should return your user information.

### Test 2: Check Repository Access

```bash
# Replace owner/repo with your repository
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/owner/repo
```

Should return repository details.

### Test 3: Check PR Access

```bash
# Replace owner/repo/123 with your PR
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/owner/repo/pulls/123
```

Should return PR details.

---

## Common Issues & Solutions

### ❌ "Bad credentials" error
**Solution:** Token is invalid or expired. Generate a new one.

### ❌ "Not Found" error
**Solution:** Token doesn't have access to the repository. Check:
- Repository is not private (or token has `repo` scope)
- Fine-grained token includes this repository
- Organization settings allow personal access tokens

### ❌ "Resource not accessible by integration"
**Solution:** Token lacks required permissions. Add:
- `repo` scope for classic tokens
- `Pull requests: Read and write` for fine-grained tokens

### ❌ Can't post comments
**Solution:** Need `write:discussion` or `Pull requests: Read and write` permission

---

## Security Best Practices

### ✅ DO:
- Use fine-grained tokens for production
- Set expiration dates
- Limit repository access to only what's needed
- Store token in `.env` file (never commit it!)
- Rotate tokens regularly
- Use different tokens for different projects

### ❌ DON'T:
- Commit tokens to Git
- Share tokens publicly
- Use tokens with more permissions than needed
- Use the same token across multiple projects
- Set "no expiration" for production tokens

---

## Quick Reference

### Minimum Permissions for PR Buddy:

**Classic Token:**
```
✅ repo (full)
✅ write:discussion
```

**Fine-Grained Token:**
```
✅ Contents: Read-only
✅ Pull requests: Read and write
✅ Metadata: Read-only
```

---

## Example .env Configuration

```env
# GitHub Configuration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Classic token
# OR
GITHUB_TOKEN=github_pat_xxxxxxxxxxxxxxxxxxxxxxxx      # Fine-grained token

GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
GITHUB_APP_ID=                                        # Optional: for GitHub App
GITHUB_PRIVATE_KEY_PATH=                              # Optional: for GitHub App

# IBM Bob API Configuration
BOB_API_URL=https://bob-api.ibm.com/v1
BOB_API_KEY=your_bob_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

---

## Verification Checklist

Before running PR Buddy, verify:

- [ ] Token is copied to `backend/.env`
- [ ] Token has `repo` scope (classic) or `Pull requests: Read and write` (fine-grained)
- [ ] Token has access to your test repository
- [ ] Token is not expired
- [ ] `.env` file is in `.gitignore`
- [ ] Backend can start without errors: `cd backend && npm run dev`

---

## Need Help?

If you're still having issues:

1. Check the backend logs for specific error messages
2. Verify token permissions in GitHub Settings
3. Try creating a new token with all recommended scopes
4. Test the token with curl commands above
5. Check if your organization has restrictions on personal access tokens

---

## For GitHub App (Advanced)

If you want to use a GitHub App instead of a personal token:

1. Create a GitHub App in your organization settings
2. Set permissions: Repository → Pull requests (Read & write)
3. Generate a private key
4. Install the app on your repositories
5. Use the app ID and private key in `.env`

This is more complex but better for production deployments.