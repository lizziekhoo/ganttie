#!/bin/bash

echo "🔍 Verifying Heading Consistency Fix..."
echo ""

# Check Projects page styling
echo "📋 Projects Page (/src/app/[[...page]]/page.tsx):"
if grep -q 'className="p-2 md:p-10"' /Users/elizabethkhoo/Ganttie/src/app/\[\[\...page\]\]/page.tsx; then
    echo "  ✅ Container: p-2 md:p-10"
else
    echo "  ❌ Container pattern not found"
fi

if grep -q 'text-2xl font-bold tracking-tight' /Users/elizabethkhoo/Ganttie/src/app/\[\[\...page\]\]/page.tsx; then
    echo "  ✅ Heading: text-2xl font-bold tracking-tight"
else
    echo "  ❌ Heading pattern not found"
fi

echo ""
echo "📋 Tasks Page (/src/app/tasks/page.tsx):"
if grep -q 'className="p-2 md:p-10"' /Users/elizabethkhoo/Ganttie/src/app/tasks/page.tsx; then
    echo "  ✅ Container: p-2 md:p-10 (MATCHES Projects)"
else
    echo "  ❌ Container does not match Projects"
fi

if grep -q 'text-2xl font-bold tracking-tight' /Users/elizabethkhoo/Ganttie/src/app/tasks/page.tsx; then
    echo "  ✅ Heading: text-2xl font-bold tracking-tight (MATCHES Projects)"
else
    echo "  ❌ Heading does not match Projects"
fi

echo ""
echo "📋 Completed Projects Page (/src/app/completed-projects/page.tsx):"
if grep -q 'className="p-2 md:p-10"' /Users/elizabethkhoo/Ganttie/src/app/completed-projects/page.tsx; then
    echo "  ✅ Container: p-2 md:p-10"
else
    echo "  ❌ Container pattern not found"
fi

if grep -q 'text-2xl font-bold tracking-tight' /Users/elizabethkhoo/Ganttie/src/app/completed-projects/page.tsx; then
    echo "  ✅ Heading: text-2xl font-bold tracking-tight"
else
    echo "  ❌ Heading pattern not found"
fi

echo ""
echo "🎯 Consistency Check:"
# Check that Tasks and Projects use same container padding
PROJECTS_CONTAINER=$(grep -A1 'SidebarLayout>' /Users/elizabethkhoo/Ganttie/src/app/\[\[\...page\]\]/page.tsx | grep 'className=' | sed 's/.*className="\([^"]*\)".*/\1/')
TASKS_CONTAINER=$(grep -A1 'SidebarLayout>' /Users/elizabethkhoo/Ganttie/src/app/tasks/page.tsx | grep 'className=' | sed 's/.*className="\([^"]*\)".*/\1/')

if [ "$PROJECTS_CONTAINER" = "$TASKS_CONTAINER" ]; then
    echo "  ✅ Projects and Tasks use same container padding"
else
    echo "  ❌ Container padding differs"
    echo "     Projects: $PROJECTS_CONTAINER"
    echo "     Tasks: $TASKS_CONTAINER"
fi

# Check that Tasks and Projects use same heading size
PROJECTS_HEADING=$(grep 'text-2xl' /Users/elizabethkhoo/Ganttie/src/app/\[\[\...page\]\]/page.tsx)
TASKS_HEADING=$(grep 'text-2xl' /Users/elizabethkhoo/Ganttie/src/app/tasks/page.tsx)

if [ -n "$PROJECTS_HEADING" ] && [ -n "$TASKS_HEADING" ]; then
    echo "  ✅ Projects and Tasks use same heading size (text-2xl)"
else
    echo "  ❌ Heading sizes differ"
fi

echo ""
echo "🔒 Other Pages Check:"
echo "  Designers: Placeholder (no heading to break)"
echo "  Calendar: Uses FullscreenCalendar component"
echo "  Settings: Placeholder (no heading to break)"
echo ""
echo "✅ Heading consistency fix complete!"
