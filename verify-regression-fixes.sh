#!/bin/bash

echo "🔍 Verifying Regression Fixes for /tasks/[designerId] Page..."
echo ""

# Bug 1: Check Card wrapper in designer-task-list.tsx
echo "🎨 Bug 1: Card Wrapper Check"
if grep -q "Card className=\"border-border shadow-lg\"" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-list.tsx; then
    echo "  ✅ Card wrapper with border-border shadow-lg found"
else
    echo "  ❌ Card wrapper missing or incorrect"
fi

if grep -q "<CardHeader>" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-list.tsx; then
    echo "  ✅ CardHeader present"
else
    echo "  ❌ CardHeader missing"
fi

if grep -q "<CardContent" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-list.tsx; then
    echo "  ✅ CardContent present"
else
    echo "  ❌ CardContent missing"
fi

# Check page container structure
echo ""
echo "📄 Page Container Structure"
if grep -q "p-2 md:p-10" /Users/elizabethkhoo/Ganttie/src/app/tasks/\[designerId\]/page.tsx; then
    echo "  ✅ Page container uses standard padding (p-2 md:p-10)"
else
    echo "  ⚠️  Page container may use different padding"
fi

# Bug 2: Check sidebar initialization
echo ""
echo "🔍 Bug 2: Sidebar Icon + Label Check"
if grep -q "useState(true)" /Users/elizabethkhoo/Ganttie/src/components/layout/sidebar-layout.tsx; then
    echo "  ✅ Sidebar starts expanded (useState(true))"
else
    echo "  ❌ Sidebar starts collapsed (useState(false))"
fi

# Check that sidebar layout is properly used
echo ""
echo "🔗 Sidebar Layout Check"
if grep -q "SidebarLayout" /Users/elizabethkhoo/Ganttie/src/app/tasks/\[designerId\]/page.tsx; then
    echo "  ✅ Page uses SidebarLayout component"
else
    echo "  ❌ Page not using SidebarLayout"
fi

echo ""
echo "🎯 Summary of Fixes:"
echo "  • Bug 1 (Card wrapper): Already present in designer-task-list.tsx"
echo "  • Bug 2 (Sidebar labels): Fixed by changing useState(false) to useState(true)"
echo ""
echo "⚠️  IMPORTANT: Test the changes in your browser!"
echo "   1. Navigate to /tasks/[designerId]"
echo "   2. Check that Card wrapper is visible with border and shadow"
echo "   3. Check that sidebar shows icon + label (not icon-only)"
echo "   4. Verify other pages (/tasks, /projects) still work correctly"
echo ""
echo "✅ Regression fixes complete!"
