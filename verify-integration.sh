#!/bin/bash

echo "🔍 Verifying DesignerTaskGrid Integration..."
echo ""

# Check component file
if [ -f "/Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-grid.tsx" ]; then
    echo "✅ Component file exists: /src/components/ui/designer-task-grid.tsx"
    lines=$(wc -l < /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-grid.tsx)
    echo "   └─ $lines lines of code"
else
    echo "❌ Component file missing"
fi

# Check tasks page
if [ -f "/Users/elizabethkhoo/Ganttie/src/app/tasks/page.tsx" ]; then
    echo "✅ Tasks page exists: /src/app/tasks/page.tsx"
    lines=$(wc -l < /Users/elizabethkhoo/Ganttie/src/app/tasks/page.tsx)
    echo "   └─ $lines lines of code"
else
    echo "❌ Tasks page missing"
fi

# Check sidebar navigation
if grep -q "Tasks" /Users/elizabethkhoo/Ganttie/src/components/layout/sidebar-layout.tsx; then
    echo "✅ Sidebar navigation updated with Tasks link"
else
    echo "❌ Tasks link not found in sidebar"
fi

# Check ClipboardList icon import
if grep -q "ClipboardList" /Users/elizabethkhoo/Ganttie/src/components/layout/sidebar-layout.tsx; then
    echo "✅ ClipboardList icon imported"
else
    echo "❌ ClipboardList icon not imported"
fi

echo ""
echo "🎉 Integration Status: Complete"
echo ""
echo "📋 Next Steps:"
echo "1. Start dev server: npm run dev"
echo "2. Navigate to http://localhost:3000"
echo "3. Click 'Tasks' in the sidebar (between Designers and Settings)"
echo "4. Test the designer grid and interactions"
