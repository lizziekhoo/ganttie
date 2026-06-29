"use client";

import DesignerTaskList from "@/components/ui/designer-task-list";
import { DEFAULT_DESIGNERS, Designer } from "@/components/ui/designer-task-grid";
import { useParams, useRouter } from "next/navigation";
import { useSidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

function DesignerTasksContent({ designer, designerId }: { designer: Designer; designerId: string }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="p-2 md:p-10">
      {/* Designer Header */}
      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "max-w-screen-2xl" : "max-w-screen-xl"
      )}>
        <div className="flex items-center gap-6 mb-8">
          <div className="relative w-16 h-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={designer.image}
              alt={designer.name}
              className="rounded-full object-cover w-16 h-16"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{designer.name}</h1>
            <p className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground mt-1">
              {designer.role}
            </p>
          </div>
        </div>

        {/* Designer Task List */}
        <DesignerTaskList designerId={designerId} />
      </div>
    </div>
  );
}

function NotFoundContent() {
  const router = useRouter();

  return (
    <div className="p-2 md:p-10">
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Designer not found</h1>
        <p className="text-muted-foreground mb-6">
          The designer you're looking for doesn't exist.
        </p>
        <button
          onClick={() => router.push('/tasks')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Back to Tasks
        </button>
      </div>
    </div>
  );
}

export default function DesignerTasksPage() {
  const params = useParams();
  const designerId = params.designerId as string;

  // Find the designer by ID
  const designer = DEFAULT_DESIGNERS.find(d => d.id === designerId);

  // Handle designer not found
  if (!designer) {
    return <NotFoundContent />;
  }

  return <DesignerTasksContent designer={designer} designerId={designerId} />;
}
