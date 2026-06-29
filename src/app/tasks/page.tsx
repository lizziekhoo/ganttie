"use client";

import DesignerTaskGrid from '@/components/ui/designer-task-grid';
import { Designer } from '@/components/ui/designer-task-grid';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/components/layout/sidebar';
import { cn } from '@/lib/utils';

export default function TasksPage() {
  const router = useRouter();
  const { isCollapsed } = useSidebar();

  const handleSelectDesigner = (designer: Designer) => {
    // Navigate to designer-specific task list
    // Once the task list UI is decided, this will navigate to that page
    console.log('Selected designer:', designer);
    // TODO: Implement navigation to designer-specific task page
    // router.push(`/tasks/${designer.id}`);
  };

  const handleInviteDesigner = () => {
    // Invite designer flow
    // This will be implemented when invite functionality is built
    console.log('Invite designer clicked');
    // TODO: Implement invite designer flow
  };

  return (
    <div className="p-2 md:p-10">
      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "max-w-screen-2xl" : "max-w-screen-xl"
      )}>
        <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Individual Tasks</h1>
        <p className="text-muted-foreground">
          Select a designer to view their assigned tasks
        </p>
      </div>

      <DesignerTaskGrid
        onSelectDesigner={handleSelectDesigner}
        onInviteDesigner={handleInviteDesigner}
      />
    </div>
    </div>
  );
}
