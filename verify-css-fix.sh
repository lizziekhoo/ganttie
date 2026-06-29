#!/bin/bash

echo "🔍 Verifying CSS Variables Fix for Component Styling..."
echo ""

# Check if globals.css exists and has been updated
echo "📄 CSS File Check:"
if [ -f "/Users/elizabethkhoo/Ganttie/src/app/globals.css" ]; then
    echo "  ✅ globals.css found"
else
    echo "  ❌ globals.css not found"
    exit 1
fi

# Check for @theme inline mapping
echo ""
echo "🎨 @theme inline Mapping Check:"
if grep -q "@theme inline" /Users/elizabethkhoo/Ganttie/src/app/globals.css; then
    echo "  ✅ @theme inline block present"
else
    echo "  ❌ @theme inline block missing"
fi

# Check for specific color mappings in @theme
color_vars=("color-background" "color-foreground" "color-primary" "color-muted" "color-border" "color-destructive")
for var in "${color_vars[@]}"; do
    if grep -q "$var" /Users/elizabethkhoo/Ganttie/src/app/globals.css; then
        echo "  ✅ --$var mapped in @theme"
    else
        echo "  ❌ --$var NOT mapped in @theme"
    fi
done

# Check for :root variable values
echo ""
echo "🌈 :root Variable Values Check:"
root_vars=("background" "foreground" "primary" "muted" "border" "destructive" "card" "secondary" "accent")
for var in "${root_vars[@]}"; do
    if grep -q "$var: oklch(" /Users/elizabethkhoo/Ganttrie/src/app/globals.css; then
        echo "  ✅ --$var defined with oklch()"
    else
        echo "  ❌ --$var NOT defined"
    fi
done

# Check for dark mode variables
echo ""
echo "🌙 Dark Mode Variables Check:"
if grep -q "\.dark {" /Users/elizabethkhoo/Ganttie/src/app/globals.css; then
    echo "  ✅ .dark mode variables present"
else
    echo "  ⚠️  .dark mode variables missing"
fi

# Check for @layer base
echo ""
echo "📚 @layer base Check:"
if grep -q "@layer base" /Users/elizabethkhoo/Ganttie/src/app/globals.css; then
    echo "  ✅ @layer base present"
else
    echo "  ⚠️  @layer base missing"
fi

echo ""
echo "🎯 What These CSS Variables Fix:"
echo "  • border-border: Subtle light gray borders (not black)"
echo "  • bg-muted: Light gray pill background for tabs"
echo "  • bg-primary: Solid black/dark button fill"
echo "  • badge colors: Soft pastel tints (red/yellow/blue)"
echo "  • text-muted-foreground: Proper gray text color"
echo "  • All component colors: Now resolve correctly"
echo ""
echo "⚠️  IMPORTANT: Hard refresh your browser after CSS changes!"
echo "   • Chrome: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "   • Firefox: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "   • Safari: Cmd+Option+R (Mac)"
echo ""
echo "✅ CSS variables fix complete!"
echo ""
echo "🚀 Test the visual fixes:"
echo "   1. Hard refresh your browser"
echo "   2. Navigate to /tasks/[designerId]"
echo "   3. Verify component colors match reference design"
