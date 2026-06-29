"use client";

import { BentoCard, BentoGrid } from "@/components/projects/bento-grid";

export const initialProjects = [
  { id: "project-a", name: "Project A", description: "Details here about the project.", href: "/gantt/project-a", cta: "Open", background: <img className="absolute -right-20 -top-20 opacity-60" /> },
  { id: "project-b", name: "Project B", description: "Details here about the project.", href: "/gantt/project-b", cta: "Open", background: <img className="absolute -right-20 -top-20 opacity-60" /> },
  { id: "project-c", name: "Project C", description: "Details here about the project.", href: "/gantt/project-c", cta: "Open", background: <img className="absolute -right-20 -top-20 opacity-60" /> },
  { id: "project-d", name: "Project D", description: "Details here about the project.", href: "/gantt/project-d", cta: "Open", background: <img className="absolute -right-20 -top-20 opacity-60" /> },
  { id: "project-e", name: "Project E", description: "Details here about the project.", href: "/gantt/project-e", cta: "Open", background: <img className="absolute -right-20 -top-20 opacity-60" /> },
  { id: "project-f", name: "Project F", description: "Details here about the project.", href: "/gantt/project-f", cta: "Open", background: <img className="absolute -right-20 -top-20 opacity-60" /> },
  { id: "project-g", name: "Project G", description: "Details here about the project.", href: "/gantt/project-g", cta: "Open", background: <img className="absolute -right-20 -top-20 opacity-60" /> },
  { id: "project-h", name: "Project H", description: "Details here about the project.", href: "/gantt/project-h", cta: "Open", background: <img className="absolute -right-20 -top-20 opacity-60" /> },
  { id: "project-i", name: "Project I", description: "Details here about the project.", href: "/gantt/project-i", cta: "Open", background: <img className="absolute -right-20 -top-20 opacity-60" /> },
  { id: "project-j", name: "Project J", description: "Details here about the project.", href: "/gantt/project-j", cta: "Open", background: <img className="absolute -right-20 -top-20 opacity-60" /> },
  { id: "project-k", name: "Project K", description: "Details here about the project.", href: "/gantt/project-k", cta: "Open", background: <img className="absolute -right-20 -top-20 opacity-60" /> },
  { id: "project-l", name: "Project L", description: "Details here about the project.", href: "/gantt/project-l", cta: "Open", background: <img className="absolute -right-20 -top-20 opacity-60" /> },
];

interface BentoDemoProps {
  projects: typeof initialProjects;
  editMode?: boolean;
  selectedIds?: Set<string>;
  toggleSelect?: (id: string) => void;
}

export function BentoDemo({
  projects,
  editMode = false,
  selectedIds = new Set(),
  toggleSelect = () => {},
}: BentoDemoProps) {
  return (
    <BentoGrid>
      {projects.map((project) => (
        <div
          key={project.id}
          className={`relative transition-opacity duration-200 ${
            editMode && !selectedIds.has(project.id) ? "opacity-60" : "opacity-100"
          }`}
        >
          {editMode ? (
            <BentoCard {...project} />
          ) : (
            <BentoCard {...project} />
          )}
          {editMode && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleSelect(project.id); }}
              className={`absolute top-3 right-3 z-10 h-6 w-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                selectedIds.has(project.id)
                  ? "border-black bg-black text-white scale-110"
                  : "border-neutral-300 bg-white text-transparent hover:border-neutral-500"
              }`}
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,6 5,9 10,3" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </BentoGrid>
  );
}