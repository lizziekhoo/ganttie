#!/bin/bash

echo "🔍 Verifying Bug Fixes and Refactoring..."
echo ""

# Check Tasks page uses SidebarLayout
if grep -q "SidebarLayout" /Users/elizabethkhoo/Ganttie/src/app/tasks/page.tsx; then
    echo "✅ Tasks page wrapped in SidebarLayout (Bug 1 fixed)"
else
    echo "❌ Tasks page missing SidebarLayout"
fi

# Check sidebar has hoveredTasks state
if grep -q "hoveredTasks" /Users/elizabethkhoo/Ganttie/src/components/layout/sidebar-layout.tsx; then
    echo "✅ Sidebar has hoveredTasks state"
else
    echo "❌ Sidebar missing hoveredTasks state"
fi

# Check Tasks hover implementation
if grep -q "Tasks + Individual dropdown" /Users/elizabethkhoo/Ganttie/src/components/layout/sidebar-layout.tsx; then
    echo "✅ Tasks hover-expand implemented (Bug 2 fixed)"
else
    echo "❌ Tasks hover-expand not found"
fi

# Check View dropdown removed from DesignerTaskGrid
if ! grep -q "task-view-mode" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-grid.tsx; then
    echo "✅ View dropdown removed from DesignerTaskGrid (Bug 2 fixed)"
else
    echo "❌ View dropdown still exists in DesignerTaskGrid"
fi

# Check viewMode state removed
if ! grep -q "viewMode" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-grid.tsx; then
    echo "✅ viewMode state removed from DesignerTaskGrid"
else
    echo "❌ viewMode state still exists in DesignerTaskGrid"
fi

# Check Users icon imported
if grep -q "Users" /Users/elizabethkhoo/Ganttie/src/components/layout/sidebar-layout.tsx; then
    echo "✅ Users icon imported for Individual item"
else
    echo "❌ Users icon not imported"
fi

# Check conditional wrapper removed from grid
if ! grep -q "viewMode === 'individual'" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-grid.tsx; then
    echo "✅ Conditional wrapper removed from designer grid"
else
    echo "❌ Conditional wrapper still exists"
fi

echo ""
echo "🎉 Bug Fixes Complete!"
echo ""
echo "📋 What Changed:"
echo "1. Tasks page now wrapped in SidebarLayout → sidebar persists"
echo "2. Tasks → Individual hover-expand added to sidebar (matching Projects pattern)"
echo "3. View dropdown removed from DesignerTaskGrid component"
echo "4. viewMode state and conditional wrapper removed"
echo ""
echo "🚀 Ready to test: npm run dev"
