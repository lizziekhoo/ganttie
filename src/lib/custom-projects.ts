import type { ReactNode } from "react";

// A user-created project (persisted as a full object so it survives reload
// even though it isn't part of the static `initialProjects` list).
export interface CustomProject {
  id: string;
  name: string;
  description: string;
  client: string;
  location: string;
  budget: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
}

// Shape required by a grid card (BentoCard).
export interface GridProject {
  id: string;
  name: string;
  description: string;
  href: string;
  cta: string;
  background: ReactNode;
}

export const CUSTOM_KEY = "gantt_custom_projects";

export function loadCustomProjects(): CustomProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    const parsed = raw ? (JSON.parse(raw) as CustomProject[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomProjects(list: CustomProject[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota / serialization errors */
  }
}

export function findCustomProject(id: string): CustomProject | undefined {
  return loadCustomProjects().find((p) => p.id === id);
}

export function createCustomProject(input: Omit<CustomProject, "id">): CustomProject {
  return { ...input, id: crypto.randomUUID() };
}
