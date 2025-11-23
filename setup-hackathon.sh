#!/bin/bash

# 🚀 Hackathon Setup Script
# Run this to get your demo ready ASAP

echo "🎯 HACKATHON SETUP - World → Stellar Bridge Demo"
echo "=================================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local..."
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
    echo ""
    echo "⚠️  ACTION REQUIRED:"
    echo "1. Get Crossmint API key from: https://www.crossmint.com/console"
    echo "2. Add it to .env.local as CROSSMINT_API_KEY=your_key_here"
    echo "3. If you have DATABASE_URL, add it to .env.local"
    echo ""
else
    echo "✅ .env.local already exists"
fi

# Generate Prisma client (skip migration if no DB)
echo "📦 Generating Prisma client..."
if grep -q "DATABASE_URL=" .env.local 2>/dev/null; then
    npx prisma generate
else
    echo "⚠️  No DATABASE_URL found, using dummy for generation..."
    DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate
fi
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 NEXT STEPS:"
echo "=============="
echo ""
echo "1. Add your Crossmint API key to .env.local:"
echo "   CROSSMINT_API_KEY=your_staging_key_here"
echo ""
echo "2. Start dev server:"
echo "   npm run dev"
echo ""
echo "3. In another terminal, start ngrok:"
echo "   ngrok http 3000"
echo ""
echo "4. Configure World App with ngrok URL"
echo ""
echo "5. Test at: http://localhost:3000/bridge"
echo ""
echo "📚 Full guide: See HACKATHON_QUICKSTART.md"
echo ""
