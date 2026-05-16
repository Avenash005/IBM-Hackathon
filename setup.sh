#!/bin/bash

echo "🤖 PR Buddy Setup Script"
echo "========================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"
echo ""

# Create .env file if it doesn't exist
cd ../backend
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created backend/.env - Please edit it with your credentials"
else
    echo "ℹ️  backend/.env already exists"
fi
echo ""

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your credentials:"
echo "   - GITHUB_TOKEN"
echo "   - GITHUB_WEBHOOK_SECRET"
echo "   - BOB_API_KEY"
echo "   - BOB_API_URL"
echo ""
echo "2. Set up GitHub webhook:"
echo "   - Use ngrok for local dev: ngrok http 3000"
echo "   - Add webhook in GitHub repo settings"
echo "   - Webhook URL: https://your-domain/api/webhooks/github"
echo ""
echo "3. Start the application:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "4. Open dashboard: http://localhost:5173"
echo ""

# Made with Bob
