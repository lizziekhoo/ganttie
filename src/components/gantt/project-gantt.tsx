"use client";

import { useState } from "react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const sampleTasks: Task[] = [
  {
    start: new Date(2026, 0, 1),
    end: new Date(2026, 0, 15),
    name: "Client Brief & Discovery",
    id: "task-1",
    type: "task",
    progress: 100,
    styles: { progressColor: "#000", progressSelectedColor: "#333" },
  },
  {
    start: new Date(2026, 0, 14),
    end: new Date(2026, 1, 10),
    name: "Concept Design",
    id: "task-2",
    type: "task",
    progress: 80,
    dependencies: ["task-1"],
    styles: { progressColor: "#000", progressSelectedColor: "#333" },
  },
  {
    start: new Date(2026, 1, 9),
    end: new Date(2026, 2, 5),
    name: "Material Selection",
    id: "task-3",
    type: "task",
    progress: 40,
    dependencies: ["task-2"],
    styles: { progressColor: "#000", progressSelectedColor: "#333" },
  },
  {
    start: new Date(2026, 2, 4),
    end: new Date(2026, 4, 1),
    name: "FF&E Procurement",
    id: "task-4",
    type: "task",
    progress: 10,
    dependencies: ["task-3"],
    styles: { progressColor: "#000", progressSelectedColor: "#333" },
  },
  {
    start: new Date(2026, 3, 15),
    end: new Date(2026, 5, 30),
    name: "Construction & Fit-Out",
    id: "task-5",
    type: "task",
    progress: 0,
    dependencies: ["task-4"],
    styles: { progressColor: "#000", progressSelectedColor: "#333" },
  },
  {
    start: new Date(2026, 6, 1),
    end: new Date(2026, 6, 20),
    name: "Styling & Installation",
    id: "task-6",
    type: "task",
    progress: 0,
    dependencies: ["task-5"],
    styles: { progressColor: "#000", progressSelectedColor: "#333" },
  },
  {
    start: new Date(2026, 6, 21),
    end: new Date(2026, 6, 25),
    name: "Photography",
    id: "milestone-1",
    type: "milestone",
    progress: 0,
    dependencies: ["task-6"],
    styles: { progressColor: "#000", progressSelectedColor: "#333" },
  },
];

export function ProjectGantt({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [view, setView] = useState<ViewMode>(ViewMode.Month);

  const handleTaskChange = (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
  };

  const handleProgressChange = (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
  };

  const projectName = projectId
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const viewOptions = [
    { label: "Day", value: ViewMode.Day },
    { label: "Week", value: ViewMode.Week },
    { label: "Month", value: ViewMode.Month },
  ];

  return (
    <div className="flex flex-col h-full p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-neutral-600" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight">{projectName}</h1>
        </div>

        <div className="flex items-center gap-1 border border-neutral-200 rounded-lg p-1">
          {viewOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setView(opt.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === opt.value
                  ? "bg-black text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Gantt
          tasks={tasks}
          viewMode={view}
          onDateChange={handleTaskChange}
          onProgressChange={handleProgressChange}
          listCellWidth="200px"
          ganttHeight={420}
          columnWidth={view === ViewMode.Month ? 200 : view === ViewMode.Week ? 100 : 60}
          todayColor="rgba(0,0,0,0.05)"
        />
      </div>
    </div>
  );
}
