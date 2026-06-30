"use client";

import { use } from "react";
import InteriorDesignProjectPage from "@/components/projects/interior-design-project";
import { DEFAULT_PROJECTS } from "@/lib/projects-data";
import { findCustomProject } from "@/lib/custom-projects";

// Use 'use' to unwrap the params promise and add 'use client'
export default function GanttPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);

  // Find project from DEFAULT_PROJECTS or provide empty state
  const project = DEFAULT_PROJECTS.find(p => p.id === projectId);

  // Project not found - show empty state
  if (!project) {
    // Fall back to a user-created (custom) project stored in localStorage.
    const custom = findCustomProject(projectId);
    if (custom) {
      const customData = {
        title: custom.name,
        client: custom.client,
        location: custom.location,
        status: custom.status,
        progress: custom.progress,
        startDate: custom.startDate,
        endDate: custom.endDate,
        budget: custom.budget,
        description: custom.description,
        tasks: [],
      };
      return <InteriorDesignProjectPage projectData={customData} />;
    }
    return (
      <div className="p-2 md:p-10">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold tracking-tight mb-4">Project not found</h1>
          <p className="text-muted-foreground mb-6">
            The project you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  // Convert project data structure to match expected component props
  const projectData = {
    title: project.title,
    client: project.clientName,
    location: project.location,
    status: project.status,
    progress: project.progress,
    startDate: project.startDate,
    endDate: project.endDate,
    budget: project.budget,
    description: project.description,
    tasks: project.tasks ?? []
  };

  return <InteriorDesignProjectPage projectData={projectData} />;
}
