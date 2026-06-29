"use client";

import { useState, useEffect } from "react";
import { BentoGrid, BentoCard } from "@/components/projects/bento-grid";
import { initialProjects } from "@/components/projects/bento-demo";

const COMPLETED_KEY = "gantt_completed_ids";

export default function CompletedProjectsPage() {
  const [completed, setCompleted] = useState<typeof initialProjects>([]);

  useEffect(() => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]");
      // Look up full project objects from initialProjects using stored IDs
      setCompleted(initialProjects.filter((p) => ids.includes(p.id)));
    } catch {
      setCompleted([]);
    }
  }, []);

  return (
    <div className="p-2 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Completed Projects</h1>
      </div>

      {completed.length === 0 ? (
        <p className="text-neutral-400 text-sm">No completed projects yet.</p>
      ) : (
        <BentoGrid>
          {completed.map((project) => (
            <BentoCard key={project.id} {...project} />
          ))}
        </BentoGrid>
      )}
    </div>
  );
}