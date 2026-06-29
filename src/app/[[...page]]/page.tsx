"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/layout/sidebar";
import { BentoDemo, initialProjects } from "@/components/projects/bento-demo";
import { DeleteBar } from "@/components/projects/delete-bar";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

const ACTIVE_KEY = "gantt_active_ids";
const COMPLETED_KEY = "gantt_completed_ids";

export default function Home() {
  const { isCollapsed } = useSidebar();
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [projects, setProjects] = useState(initialProjects);
  // Prevents the save effect from firing before the load effect has run
  const hasLoaded = useRef(false);

  // LOAD — runs once on mount
  useEffect(() => {
    try {
      const activeIds: string[] = JSON.parse(localStorage.getItem(ACTIVE_KEY) || "null");
      const completedIds: string[] = JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]");

      if (activeIds !== null) {
        setProjects(initialProjects.filter((p) => activeIds.includes(p.id)));
      } else {
        // First ever visit — exclude anything already completed
        setProjects(initialProjects.filter((p) => !completedIds.includes(p.id)));
      }
    } catch {
      setProjects(initialProjects);
    } finally {
      hasLoaded.current = true;
    }
  }, []);

  // SAVE — only runs after load has completed, never on first render
  useEffect(() => {
    if (!hasLoaded.current) return;
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(projects.map((p) => p.id)));
  }, [projects]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    setSelectedIds(new Set());
  };

  const handleDelete = () => {
    setProjects((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    setEditMode(false);
  };

  const handleComplete = () => {
    try {
      const existing: string[] = JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]");
      localStorage.setItem(COMPLETED_KEY, JSON.stringify([...existing, ...Array.from(selectedIds)]));
    } catch {}
    setProjects((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    setEditMode(false);
  };

  return (
      <div className="p-2 md:p-10">
        <div className={cn(
          "transition-all duration-300",
          isCollapsed ? "max-w-screen-2xl" : "max-w-screen-xl"
        )}>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <div className="flex items-center gap-3">
            <InteractiveHoverButton className="w-24">New</InteractiveHoverButton>
            <IconHoverButton onClick={handleEditToggle} isActive={editMode}>
              <Pencil className="h-4 w-4" />
            </IconHoverButton>
          </div>
        </div>

        <BentoDemo
          projects={projects}
          editMode={editMode}
          selectedIds={selectedIds}
          toggleSelect={toggleSelect}
        />
      </div>

      <DeleteBar
        count={selectedIds.size}
        onDelete={handleDelete}
        onComplete={handleComplete}
        visible={editMode && selectedIds.size > 0}
      />
      </div>
  );
}

function IconHoverButton({
  onClick,
  isActive = false,
  className,
  children,
}: {
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-neutral-300 bg-white transition-all duration-300",
        className
      )}
    >
      <div
        className={cn(
          "absolute bottom-0 left-0 rounded-full bg-black transition-all duration-300",
          isActive
            ? "h-full w-full scale-[2] opacity-100"
            : "h-2 w-2 opacity-0 group-hover:h-full group-hover:w-full group-hover:scale-[2] group-hover:opacity-100"
        )}
      />
      <span className={cn("relative z-10 transition-colors duration-300", isActive ? "text-white" : "text-black group-hover:text-white")}>
        {children}
      </span>
    </button>
  );
}