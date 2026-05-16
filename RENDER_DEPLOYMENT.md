# 🚀 Render Deployment Guide for PR Buddy Backend

This guide will help you deploy the PR Buddy backend to Render.com.

## Prerequisites

1. A [Render.com](https://render.com) account (free tier available)
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account for database (free tier available)
3. GitHub repository with your code
4. GitHub OAuth App credentials
5. IBM Bob API credentials

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Whitelist all IP addresses (0.0.0.0/0) for Render access
5. Get your connection string (replace `<password>` with your actual password):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/pr-buddy?retryWrites=true&w=majority
   ```

## Step 2: Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: PR Buddy
   - **Homepage URL**: `https://your-app-name.onrender.com`
   - **Authorization callback URL**: `https://your-app-name.onrender.com/api/auth/github/callback`
4. Save the **Client ID** and **Client Secret**

## Step 3: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub (including the `render.yaml` file in the root)
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file
6. Click "Apply" to create the service

### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `pr-buddy-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

## Step 4: Configure Environment Variables

In your Render service dashboard, go to "Environment" and add these variables:

### Required Variables

```bash
# Node Environment
NODE_ENV=production
PORT=10000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pr-buddy?retryWrites=true&w=majority

# GitHub Configuration
GITHUB_TOKEN=ghp_your_personal_access_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/github/callback

# IBM Bob API
BOB_API_URL=https://bob-api.ibm.com/v1
BOB_API_KEY=your_bob_api_key

# Security (Render can auto-generate these)
JWT_SECRET=your-random-jwt-secret-key
SESSION_SECRET=your-random-session-secret-key

# Frontend URL (update after deploying frontend)
FRONTEND_URL=https://your-frontend-app.onrender.com
```

### How to Get Each Variable:

1. **GITHUB_TOKEN**: 
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` and `admin:repo_hook` scopes

2. **GITHUB_WEBHOOK_SECRET**: 
   - Generate a random string: `openssl rand -hex 32`

3. **GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET**: 
   - From Step 2 (GitHub OAuth App)

4. **BOB_API_KEY**: 
   - From your IBM Bob API account

5. **JWT_SECRET & SESSION_SECRET**: 
   - Let Render auto-generate or use: `openssl rand -hex 32`

## Step 5: Deploy

1. Click "Create Web Service" (or "Apply" if using Blueprint)
2. Render will build and deploy your application
3. Wait for the deployment to complete (usually 2-5 minutes)
4. Your backend will be available at: `https://your-app-name.onrender.com`

## Step 6: Verify Deployment

Test your endpoints:

```bash
# Health check
curl https://your-app-name.onrender.com/api/webhooks/health

# API info
curl https://your-app-name.onrender.com/

# Expected response:
{
  "name": "PR Buddy API",
  "version": "2.0.0",
  "description": "AI-powered PR review using IBM Bob with authentication"
}
```

## Step 7: Configure GitHub Webhook

1. Go to your GitHub repository → Settings → Webhooks
2. Click "Add webhook"
3. Configure:
   - **Payload URL**: `https://your-app-name.onrender.com/api/webhooks/github`
   - **Content type**: `application/json`
   - **Secret**: Your `GITHUB_WEBHOOK_SECRET` value
   - **Events**: Select "Pull requests"
4. Click "Add webhook"

## Step 8: Update Frontend Configuration

Update your frontend's API URL to point to your Render backend:

```javascript
// frontend/src/services/api.js
const API_URL = 'https://your-app-name.onrender.com';
```

## Troubleshooting

### Common Issues

1. **Build fails**: 
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node version compatibility

2. **Database connection fails**:
   - Verify MongoDB Atlas connection string
   - Check if IP whitelist includes 0.0.0.0/0
   - Ensure database user has correct permissions

3. **GitHub OAuth fails**:
   - Verify callback URL matches exactly
   - Check CLIENT_ID and CLIENT_SECRET are correct
   - Ensure FRONTEND_URL is set correctly

4. **Service crashes on startup**:
   - Check environment variables are set
   - Review logs in Render dashboard
   - Verify all required variables are present

### Viewing Logs

1. Go to your service in Render dashboard
2. Click "Logs" tab
3. View real-time logs and errors

### Free Tier Limitations

- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month of runtime (enough for one service)

## Monitoring

### Health Check

Render automatically monitors: `https://your-app-name.onrender.com/api/webhooks/health`

### Manual Checks

```bash
# Check service status
curl https://your-app-name.onrender.com/api/webhooks/health

# View recent reviews
curl https://your-app-name.onrender.com/api/webhooks/reviews
```

## Updating Your Deployment

### Automatic Deploys

Render automatically deploys when you push to your connected branch:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

### Manual Deploy

1. Go to Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

## Environment-Specific Configuration

### Development
```bash
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Production (Render)
```bash
NODE_ENV=production
FRONTEND_URL=https://your-frontend-app.onrender.com
```

## Security Best Practices

1. ✅ Use strong, random secrets for JWT and SESSION
2. ✅ Never commit `.env` files to Git
3. ✅ Rotate secrets periodically
4. ✅ Use HTTPS only (Render provides this automatically)
5. ✅ Keep dependencies updated
6. ✅ Monitor logs for suspicious activity

## Cost Optimization

### Free Tier Tips

1. Use MongoDB Atlas free tier (512MB storage)
2. Deploy only one service on free tier
3. Consider upgrading if you need:
   - No spin-down
   - More resources
   - Custom domains

## Support

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **GitHub Issues**: Create an issue in your repository

## Next Steps

1. ✅ Deploy frontend to Render or Vercel
2. ✅ Update FRONTEND_URL in backend environment variables
3. ✅ Update API_URL in frontend configuration
4. ✅ Test end-to-end flow
5. ✅ Set up monitoring and alerts

---

🎉 **Congratulations!** Your PR Buddy backend is now running on Render!