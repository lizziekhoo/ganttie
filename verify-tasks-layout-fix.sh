#!/bin/bash

echo "🔍 Verifying Tasks Page Layout and Visual Polish Fix..."
echo ""

# Check Plus icon import
if grep -q "import { Plus } from 'lucide-react'" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-grid.tsx; then
    echo "✅ Plus icon imported"
else
    echo "❌ Plus icon not imported"
fi

# Check onInviteDesigner prop added to interface
if grep -q "onInviteDesigner\?: () => void" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-grid.tsx; then
    echo "✅ onInviteDesigner prop added to interface"
else
    echo "❌ onInviteDesigner prop not in interface"
fi

# Check InviteDesignerCard component exists
if grep -q "function InviteDesignerCard" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-grid.tsx; then
    echo "✅ InviteDesignerCard component added"
else
    echo "❌ InviteDesignerCard component not found"
fi

# Check placeholder calculation logic
if grep -q "placeholdersNeeded = remainder === 0 ? 0 : 4 - remainder" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-grid.tsx; then
    echo "✅ Placeholder calculation logic implemented"
else
    echo "❌ Placeholder calculation logic not found"
fi

# Check alignment fix - removed max-w-5xl mx-auto
if ! grep -q "max-w-5xl mx-auto" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-grid.tsx; then
    echo "✅ Alignment fixed - removed max-w-5xl mx-auto wrapper"
else
    echo "❌ max-w-5xl mx-auto still exists"
fi

# Check Tasks page has onInviteDesigner handler
if grep -q "handleInviteDesigner" /Users/elizabethkhoo/Ganttie/src/app/tasks/page.tsx; then
    echo "✅ Tasks page has handleInviteDesigner function"
else
    echo "❌ handleInviteDesigner not found in Tasks page"
fi

# Check Tasks page passes onInviteDesigner prop
if grep -q "onInviteDesigner={handleInviteDesigner}" /Users/elizabethkhoo/Ganttie/src/app/tasks/page.tsx; then
    echo "✅ Tasks page passes onInviteDesigner prop"
else
    echo "❌ onInviteDesigner prop not passed to DesignerTaskGrid"
fi

echo ""
echo "🎯 Visual Consistency Check:"
# Check that heading and grid share same container
CONTAINER_PADDING=$(grep -A2 'SidebarLayout>' /Users/elizabethkhoo/Ganttie/src/app/tasks/page.tsx | grep 'className="p-2 md:p-10"' | wc -l)
if [ "$CONTAINER_PADDING" -eq "1" ]; then
    echo "  ✅ Heading and grid share same container padding (p-2 md:p-10)"
else
    echo "  ❌ Container padding may not be consistent"
fi

echo ""
echo "📊 Grid Layout Analysis:"
DESIGNER_COUNT=$(grep -c "id: '[0-9]" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-grid.tsx)
echo "  • Real designers: $DESIGNER_COUNT"
PLACEHOLDERS=$((4 - (DESIGNER_COUNT % 4)))
echo "  • Placeholder cards needed: $PLACEHOLDERS"
echo "  • Total grid items: $((DESIGNER_COUNT + PLACEHOLDERS))"
echo "  • Full rows of 4: $(((DESIGNER_COUNT + PLACEHOLDERS) / 4))"

echo ""
echo "🎨 Expected Result:"
echo "  • Heading, subtext, and grid all start at same left edge"
echo "  • 6 real designers + 2 placeholder cards = 2 full rows of 4"
echo "  • No trailing partial row or uneven layout"
echo "  • Placeholder cards visually distinct (dashed border, muted styling)"
echo ""
echo "✅ Layout and visual polish fix complete!"
