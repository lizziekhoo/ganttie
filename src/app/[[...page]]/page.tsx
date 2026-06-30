"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/layout/sidebar";
import { BentoDemo, initialProjects } from "@/components/projects/bento-demo";
import { DeleteBar } from "@/components/projects/delete-bar";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  type CustomProject,
  type GridProject,
  loadCustomProjects,
  saveCustomProjects,
  createCustomProject,
} from "@/lib/custom-projects";

const ACTIVE_KEY = "gantt_active_ids";
const COMPLETED_KEY = "gantt_completed_ids";

const toGrid = (c: CustomProject): GridProject => ({
  id: c.id,
  name: c.name,
  description: c.description,
  href: `/gantt/${c.id}`,
  cta: "Open",
  background: <img className="absolute -right-20 -top-20 opacity-60" alt="" />,
});

const emptyForm = {
  name: "", client: "", location: "", budget: "",
  startDate: "", endDate: "", description: "",
};

export default function Home() {
  const { isCollapsed } = useSidebar();
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [projects, setProjects] = useState<GridProject[]>(initialProjects);
  const [customProjects, setCustomProjects] = useState<CustomProject[]>([]);
  const hasLoaded = useRef(false);

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  // LOAD — runs once on mount
  useEffect(() => {
    let completedIds: string[] = [];
    try {
      const activeIds: string[] | null = JSON.parse(localStorage.getItem(ACTIVE_KEY) || "null");
      completedIds = JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]");

      const builtIns = activeIds !== null
        ? initialProjects.filter((p) => activeIds.includes(p.id))
        : initialProjects.filter((p) => !completedIds.includes(p.id));

      const customs = loadCustomProjects().filter((c) => !completedIds.includes(c.id));
      setCustomProjects(customs);
      setProjects([...customs.map(toGrid), ...builtIns]);
    } catch {
      setProjects(initialProjects);
    } finally {
      hasLoaded.current = true;
    }
  }, []);

  // SAVE — only after load
  useEffect(() => {
    if (!hasLoaded.current) return;
    const builtInIds = projects
      .filter((p) => initialProjects.some((ip) => ip.id === p.id))
      .map((p) => p.id);
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(builtInIds));
    saveCustomProjects(customProjects);
  }, [projects, customProjects]);

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
    setCustomProjects((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
    setEditMode(false);
  };

  const handleComplete = () => {
    try {
      const existing: string[] = JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]");
      localStorage.setItem(COMPLETED_KEY, JSON.stringify([...existing, ...Array.from(selectedIds)]));
    } catch {}
    setProjects((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setCustomProjects((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
    setEditMode(false);
  };

  const handleCreateProject = () => {
    if (!form.name.trim()) {
      alert("Please enter a project name");
      return;
    }
    const cp = createCustomProject({
      name: form.name.trim(),
      description: form.description.trim() || "No description yet.",
      client: form.client.trim(),
      location: form.location.trim(),
      budget: form.budget.trim() || "—",
      startDate: form.startDate || new Date().toISOString().split("T")[0],
      endDate: form.endDate || form.startDate || new Date().toISOString().split("T")[0],
      status: "Planning",
      progress: 0,
    });
    setCustomProjects((prev) => [cp, ...prev]);
    setProjects((prev) => [toGrid(cp), ...prev]);
    setForm({ ...emptyForm });
    setShowNewDialog(false);
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
            <InteractiveHoverButton className="w-24" onClick={() => setShowNewDialog(true)}>New</InteractiveHoverButton>
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

      {/* New project dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>Create a new project. It will appear on your grid and open with an empty task list.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Kitchen Remodel" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Client name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget</label>
              <Input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g., $50,000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description of the project" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
