# Deploying PR Buddy to Vercel

## Prerequisites
- Vercel account
- GitHub repository connected to Vercel

## Step 1: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

## Step 2: Configure Environment Variables in Vercel Dashboard

Go to your Vercel project → Settings → Environment Variables and add:

### GitHub Configuration
```
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_WEBHOOK_SECRET=bob_hackathon_secure_2026_x9K2pL
```

### GitHub OAuth
```
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=https://your-vercel-app.vercel.app/api/auth/github/callback
```

### IBM Bob API
```
BOB_API_URL=https://bob.ibm.com/v1
BOB_API_KEY=your_bob_api_key
```

### Database
```
MONGODB_URI=your_mongodb_connection_string
```

### JWT & Session
```
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
SESSION_SECRET=your_session_secret_key
SESSION_EXPIRE=7d
```

### Server Configuration
```
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## Step 3: Deploy

### Option A: Deploy via Vercel Dashboard
1. Go to Vercel Dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click "Deploy"

### Option B: Deploy via CLI
```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Step 4: Update GitHub Webhook URL

After deployment, update your GitHub webhook URL to:
```
https://your-vercel-app.vercel.app/api/webhooks/github
```

## Step 5: Update OAuth Callback URL

Update your GitHub OAuth App callback URL to:
```
https://your-vercel-app.vercel.app/api/auth/github/callback
```

## Important Notes

### Vercel Serverless Functions
- Vercel uses serverless functions, so each request is stateless
- In-memory storage (like the `reviews` array) won't persist between requests
- Consider using MongoDB to store reviews instead

### Cold Starts
- First request after inactivity may be slower due to cold starts
- This is normal for serverless deployments

### Logs
- View logs in Vercel Dashboard → Your Project → Logs
- Or use CLI: `vercel logs`

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Ensure `package.json` has correct dependencies
- Check build logs in Vercel Dashboard

### Webhook Not Working
- Verify webhook URL is correct
- Check webhook secret matches
- View logs to see if requests are reaching your app

### Database Connection Issues
- Ensure MongoDB URI is correct
- Check if your MongoDB allows connections from Vercel IPs
- MongoDB Atlas: Add `0.0.0.0/0` to IP whitelist for Vercel

### OAuth Not Working
- Verify callback URL matches exactly
- Check client ID and secret are correct
- Ensure FRONTEND_URL is set correctly

## Testing Your Deployment

1. **Health Check:**
   ```
   https://your-vercel-app.vercel.app/api/webhooks/health
   ```

2. **API Docs:**
   ```
   https://your-vercel-app.vercel.app/
   ```

3. **GitHub OAuth:**
   ```
   https://your-vercel-app.vercel.app/api/auth/github
   ```

## Differences from Render Deployment

| Feature | Render | Vercel |
|---------|--------|--------|
| Type | Long-running server | Serverless functions |
| State | Persistent | Stateless |
| Cold starts | No | Yes |
| Configuration | `render.yaml` | `vercel.json` |
| Logs | Real-time | Per-request |

## Recommended: Use MongoDB for Reviews

Since Vercel is stateless, update `backend/src/routes/webhooks.js` to store reviews in MongoDB instead of in-memory array.

Example:
```javascript
import Review from '../models/Review.js';

// Instead of: reviews.push(review);
await Review.create(review);

// Instead of: reviews.find(...)
const review = await Review.findOne({ owner, repo, pullNumber });
```

This ensures reviews persist across serverless function invocations.