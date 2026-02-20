#!/bin/bash

echo "🚀 Kilo-Nod Demo Setup"
echo "====================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent

cd web
npm install --silent
cd ..

echo "✓ Dependencies installed"
echo ""

# Create demo GIF placeholder
cat > demo.gif.txt << 'EOF'
[Demo GIF Placeholder]

To create the actual demo GIF:
1. Start the system: npm run dev
2. Run the mock: npm run mock
3. Use a screen recorder (e.g., peek, byzanz, or OBS)
4. Record the permission overlay in action
5. Convert to GIF and replace this file

Recommended tools:
- Linux: peek, byzanz-record
- macOS: Kap, Gifox
- Windows: ScreenToGif
EOF

echo "✓ Demo placeholder created"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Terminal 1: npm run dev     (starts server + web UI)"
echo "2. Terminal 2: npm run mock    (runs mock Kilo CLI)"
echo "3. Browser: http://localhost:3000"
echo ""
echo "Keyboard shortcuts:"
echo "  A - Approve"
echo "  R - Reject"
echo "  1-4 - Auto-approve for N minutes"
echo ""
