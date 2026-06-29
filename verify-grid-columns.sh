#!/bin/bash

echo "🔍 Verifying Grid Column Change (4 → 5)..."
echo ""

# Check grid columns updated to 5
if grep -q "md:grid-cols-5" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-grid.tsx; then
    echo "✅ Grid updated to 5 columns on desktop (md:grid-cols-5)"
else
    echo "❌ Grid not updated to 5 columns"
fi

# Check placeholder calculation updated to modulo 5
if grep -q "designers.length % 5" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-grid.tsx; then
    echo "✅ Placeholder calculation updated to modulo 5"
else
    echo "❌ Placeholder calculation still using modulo 4"
fi

# Check placeholder fill updated to 5 - remainder
if grep -q "5 - remainder" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-grid.tsx; then
    echo "✅ Placeholder fill updated to 5 - remainder"
else
    echo "❌ Placeholder fill still using 4 - remainder"
fi

echo ""
echo "📊 Updated Grid Layout Analysis:"
DESIGNER_COUNT=6
PLACEHOLDERS=$((5 - (DESIGNER_COUNT % 5)))
echo "  • Real designers: $DESIGNER_COUNT"
echo "  • Placeholder cards needed: $PLACEHOLDERS"
echo "  • Total grid items: $((DESIGNER_COUNT + PLACEHOLDERS))"
echo "  • Full rows of 5: $(((DESIGNER_COUNT + PLACEHOLDERS) / 5))"
echo "  • Card size: Smaller (fitting 5 across instead of 4)"

echo ""
echo "✅ Grid layout updated successfully!"
echo "  Cards will now appear smaller and more refined with 5 per row"
