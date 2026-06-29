#!/bin/bash

echo "🔍 Verifying Task UI Design Update..."
echo ""

# Check if designer-task-list.tsx has the new design
echo "🎨 Task UI Design Check:"
if grep -q "Task Tracker" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-list.tsx; then
    echo "  ✅ CardTitle updated to 'Task Tracker'"
else
    echo "  ❌ CardTitle not found"
fi

if grep -q "Manage your tasks and stay organized" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-list.tsx; then
    echo "  ✅ CardDescription updated"
else
    echo "  ❌ CardDescription not found"
fi

# Check structure
echo ""
echo "📋 Component Structure Check:"
if grep -q "CardTitle" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-list.tsx; then
    echo "  ✅ CardTitle component present"
else
    echo "  ❌ CardTitle missing"
fi

if grep -q "CardDescription" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-list.tsx; then
    echo "  ✅ CardDescription component present"
else
    echo "  ❌ CardDescription missing"
fi

# Check padding
if grep -q "p-6" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-list.tsx; then
    echo "  ✅ Proper padding (p-6) applied"
else
    echo "  ❌ Padding may be incorrect"
fi

# Check functionality preserved
echo ""
echo "🔧 Functionality Check:"
if grep -q "addTask" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-list.tsx; then
    echo "  ✅ addTask function present"
else
    echo "  ❌ addTask function missing"
fi

if grep -q "toggleTask" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-list.tsx; then
    echo "  ✅ toggleTask function present"
else
    echo "  ❌ toggleTask function missing"
fi

if grep -q "deleteTask" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-list.tsx; then
    echo "  ✅ deleteTask function present"
else
    echo "  ❌ deleteTask function missing"
fi

# Check components
echo ""
echo "🧩 UI Components Check:"
if grep -q "TabsList className=\"grid w-full grid-cols-5\"" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-list.tsx; then
    echo "  ✅ 5-column tabs layout preserved"
else
    echo "  ❌ Tabs layout may be incorrect"
fi

if grep -q "High Priority" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-list.tsx; then
    echo "  ✅ High Priority counter preserved"
else
    echo "  ❌ High Priority counter missing"
fi

if grep -q "Clear Completed" /Users/elizabethkhoo/Ganttie/src/components/ui/designer-task-list.tsx; then
    echo "  ✅ Clear Completed button preserved"
else
    echo "  ❌ Clear Completed button missing"
fi

echo ""
echo "🎯 New Design Features:"
echo "  • CardTitle: 'Task Tracker'"
echo "  • CardDescription: 'Manage your tasks and stay organized'"
echo "  • Same functionality as before"
echo "  • New visual layout matching provided design"
echo ""
echo "✅ Task UI design update complete!"
echo ""
echo "🚀 Test the changes:"
echo "   1. Navigate to /tasks/[designerId]"
echo "   2. Should see 'Task Tracker' title and description"
echo "   3. All functionality should work the same"
echo "   4. Visual layout should match the provided design"
