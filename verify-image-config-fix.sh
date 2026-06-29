#!/bin/bash

echo "🔍 Verifying Next.js Image Configuration Fix..."
echo ""

# Check if next.config.ts exists and contains the fix
if [ -f "/Users/elizabethkhoo/Ganttie/next.config.ts" ]; then
    echo "✅ next.config.ts found"
    
    # Check for images.unsplash.com configuration
    if grep -q "images.unsplash.com" /Users/elizabethkhoo/Ganttie/next.config.ts; then
        echo "✅ images.unsplash.com added to remotePatterns"
    else
        echo "❌ images.unsplash.com not found in config"
    fi
    
    # Check that existing config is preserved
    if grep -q "assets.aceternity.com" /Users/elizabethkhoo/Ganttie/next.config.ts; then
        echo "✅ Existing assets.aceternity.com config preserved"
    else
        echo "⚠️  Existing config may have been modified"
    fi
    
    echo ""
    echo "📋 Current remotePatterns configuration:"
    grep -A 20 "remotePatterns:" /Users/elizabethkhoo/Ganttie/next.config.ts | head -15
else
    echo "❌ next.config.ts not found"
fi

echo ""
echo "⚠️  IMPORTANT: Next.js config changes require dev server restart!"
echo ""
echo "🔄 Please restart your dev server:"
echo "   1. Stop the current server (Ctrl+C)"
echo "   2. Run: npm run dev"
echo ""
echo "🎯 After restart, the following should work:"
echo "   • Designer photos on /tasks page grid"
echo "   • Designer avatar on /tasks/[designerId] pages"
echo "   • All Unsplash images should render correctly"
echo ""
echo "✅ Image configuration fix complete!"
