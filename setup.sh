#!/bin/bash

# ============================================
# LENN-AI SETUP SCRIPT
# ============================================
# This script helps you set up the development environment

set -e  # Exit on error

echo "🧠 Lenn-AI Setup Script"
echo "======================="
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your credentials:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo "   - GEMINI_API_KEY"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found"
    echo "   Install with: npm install -g supabase"
    echo ""
else
    echo "✅ Supabase CLI installed: $(supabase --version)"
    echo ""
fi

# Summary
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your credentials"
echo "2. Deploy Supabase Edge Functions:"
echo "   supabase functions deploy gemini-chat"
echo "   supabase functions deploy gemini-material"
echo "   supabase functions deploy gemini-lecturer"
echo "3. Set Gemini API key secret:"
echo "   supabase secrets set GEMINI_API_KEY=your-key"
echo "4. Run development server:"
echo "   npm run dev"
echo ""
echo "📘 Full deployment guide: ./DEPLOYMENT.md"
echo "🔒 Security docs: ./README_SECURITY.md"