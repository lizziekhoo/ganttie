"use client";

import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_PROJECTS, type Project } from "@/lib/projects-data";
import { loadCustomProjects } from "@/lib/custom-projects";

const DAY_MS = 86400000;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_HEADER_H = 30; // px reserved for the date number
const LANE_H = 20; // px per stacked bar lane

const PROJECT_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#8b5cf6",
  "#ef4444", "#14b8a6", "#f97316", "#3b82f6", "#84cc16", "#a855f7",
  "#64748b", "#e11d48",
];
const colorFor = (i: number) => PROJECT_COLORS[i % PROJECT_COLORS.length];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const dayDiff = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY_MS);
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
const monthLabel = (d: Date) => d.toLocaleString("default", { month: "long" }) + " " + d.getFullYear();

type Bar = {
  key: string;
  label: string;
  start: string;
  end: string;
  color: string;
  projectId: string;
  isTask: boolean;
};

type Seg = Bar & { startCol: number; endCol: number; leftPct: number; widthPct: number; lane: number };

// Greedy lane assignment so overlapping bars stack instead of collide.
function allocateLanes(segs: Seg[]): number {
  const lanes: Seg[][] = [];
  for (const seg of segs) {
    let placed = false;
    for (let li = 0; li < lanes.length; li++) {
      if (lanes[li].every((s) => s.endCol < seg.startCol || s.startCol > seg.endCol)) {
        lanes[li].push(seg);
        seg.lane = li;
        placed = true;
        break;
      }
    }
    if (!placed) {
      seg.lane = lanes.length;
      lanes.push([seg]);
    }
  }
  return lanes.length;
}

export function FullscreenCalendar() {
  const router = useRouter();
  const today = new Date();

  // Hydrate-safe: only fold in localStorage custom projects after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const projects: (Project & { color: string })[] = useMemo(() => {
    const customs = mounted ? loadCustomProjects() : [];
    const list: Project[] = [
      ...DEFAULT_PROJECTS,
      ...customs.map((c) => ({
        id: c.id, title: c.name, clientName: c.client, location: c.location,
        status: c.status, progress: c.progress, startDate: c.startDate, endDate: c.endDate,
        budget: c.budget, description: c.description, tasks: [],
      })),
    ];
    return list.map((p, i) => ({ ...p, color: colorFor(i) }));
  }, [mounted]);

  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const isProjectVisible = (id: string) => visible[id] !== false;
  const toggleVisible = (id: string) => setVisible((p) => ({ ...p, [id]: !(p[id] !== false) }));
  const toggleExpand = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  // Continuous week list spanning all projects (±1 month buffer), Monday-first.
  const weeks: Date[][] = useMemo(() => {
    const src = projects.length ? projects : DEFAULT_PROJECTS;
    let minS = src[0].startDate;
    let maxE = src[0].endDate;
    for (const p of src) {
      if (p.startDate < minS) minS = p.startDate;
      if (p.endDate > maxE) maxE = p.endDate;
    }
    const s0 = new Date(minS);
    const start = new Date(s0.getFullYear(), s0.getMonth() - 1, 1); // 1 month buffer before
    const e0 = new Date(maxE);
    const endFirst = new Date(e0.getFullYear(), e0.getMonth() + 2, 1); // ~1 month buffer after
    const firstMonday = addDays(startOfDay(start), -((startOfDay(start).getDay() + 6) % 7));
    const out: Date[][] = [];
    let d = firstMonday;
    while (d < endFirst) {
      const w: Date[] = [];
      for (let i = 0; i < 7; i++) w.push(addDays(d, i));
      out.push(w);
      d = addDays(d, 7);
    }
    return out;
  }, [projects]);

  // Mark the week that contains the 1st of each month (for month headers).
  const leadMonthKeys: (string | null)[] = useMemo(() => {
    const seen = new Set<string>();
    return weeks.map((w) => {
      let lead: string | null = null;
      for (const day of w) {
        if (day.getDate() === 1) {
          const k = monthKey(day);
          if (!seen.has(k)) { seen.add(k); lead = k; }
        }
      }
      return lead;
    });
  }, [weeks]);

  // The busiest month (most overlapping projects) — default scroll target.
  const busiestKey = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of DEFAULT_PROJECTS) {
      let d = new Date(p.startDate);
      const end = new Date(p.endDate);
      d = new Date(d.getFullYear(), d.getMonth(), 1);
      const stop = new Date(end.getFullYear(), end.getMonth(), 1);
      while (d <= stop) {
        const k = monthKey(d);
        counts[k] = (counts[k] || 0) + 1;
        d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      }
    }
    let best: string | null = null;
    let bestN = -1;
    for (const [k, n] of Object.entries(counts)) {
      if (n > bestN) { bestN = n; best = k; }
    }
    return best;
  }, []);

  // All bars across visible (and expanded) projects.
  const allBars: Bar[] = useMemo(() => {
    const bars: Bar[] = [];
    for (const p of projects) {
      if (!isProjectVisible(p.id)) continue;
      if (expanded[p.id] && p.tasks && p.tasks.length > 0) {
        for (const t of p.tasks) {
          bars.push({
            key: `${p.id}:${t.id}`, label: t.name, start: t.startDate, end: t.endDate,
            color: p.color, projectId: p.id, isTask: true,
          });
        }
      } else {
        bars.push({
          key: p.id, label: p.title, start: p.startDate, end: p.endDate,
          color: p.color, projectId: p.id, isTask: false,
        });
      }
    }
    return bars;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, visible, expanded]);

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const scrollRef = useRef<HTMLDivElement>(null);
  const busiestRef = useRef<HTMLDivElement>(null);
  // On first mount, scroll the busiest month into view.
  useEffect(() => {
    const el = scrollRef.current;
    const target = busiestRef.current;
    if (el && target) el.scrollTo({ top: Math.max(0, target.offsetTop - 8) });
  }, [busiestKey]);

  return (
    <div className="flex flex-col h-full p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 className="text-2xl font-bold tracking-tight">Projects — bird&apos;s-eye</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          {projects.map((p) => {
            const on = isProjectVisible(p.id);
            const exp = !!expanded[p.id];
            return (
              <button
                key={p.id}
                onClick={() => toggleVisible(p.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full border text-xs transition-opacity",
                  on ? "opacity-100 border-neutral-200" : "opacity-40 border-neutral-200"
                )}
                title={on ? "Hide" : "Show"}
              >
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="font-medium text-neutral-700">{p.title}</span>
                {on && (p.tasks?.length ?? 0) > 0 && (
                  <span
                    onClick={(e) => { e.stopPropagation(); toggleExpand(p.id); }}
                    className="ml-0.5 inline-flex items-center text-neutral-400 hover:text-neutral-700"
                    title={exp ? "Collapse tasks" : "Expand tasks"}
                  >
                    {exp ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable continuous grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto border-l border-t border-neutral-100 relative">
        {/* Sticky day-of-week header */}
        <div className="sticky top-0 z-20 grid grid-cols-7 bg-background border-b border-neutral-100">
          {DAY_LABELS.map((label) => (
            <div key={label} className="text-xs font-medium uppercase tracking-wider text-neutral-400 text-center py-2">{label}</div>
          ))}
        </div>

        {weeks.map((week, wi) => {
          const weekStart = startOfDay(week[0]);
          const weekEnd = addDays(weekStart, 6);
          const segs: Seg[] = [];
          for (const b of allBars) {
            const bs = startOfDay(new Date(b.start));
            const be = startOfDay(new Date(b.end));
            const is = bs > weekStart ? bs : weekStart;
            const ie = be < weekEnd ? be : weekEnd;
            if (is > ie) continue;
            const startCol = clamp(dayDiff(weekStart, is), 0, 6);
            const endCol = clamp(dayDiff(weekStart, ie), 0, 6);
            segs.push({
              ...b, startCol, endCol, lane: 0,
              leftPct: (startCol / 7) * 100,
              widthPct: ((endCol - startCol + 1) / 7) * 100,
            });
          }
          segs.sort((a, b) => a.startCol - b.startCol);
          const lanes = allocateLanes(segs);
          const rowMinHeight = DAY_HEADER_H + lanes * LANE_H + 6;
          const lead = leadMonthKeys[wi];

          return (
            <Fragment key={wi}>
              {lead && (
                <div
                  ref={lead === busiestKey ? busiestRef : undefined}
                  className="sticky top-9 z-10 px-2 py-1 bg-background/95 border-b border-neutral-100"
                >
                  <span className="text-sm font-semibold text-neutral-700">{monthLabel(week.find((d) => monthKey(d) === lead) || week[0])}</span>
                </div>
              )}
              <div className="relative grid grid-cols-7 border-b border-neutral-100" style={{ minHeight: rowMinHeight }}>
                {week.map((date, ci) => (
                  <div key={ci} className="border-r border-neutral-100 p-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-7 h-7 text-sm rounded-full font-medium",
                        isToday(date) ? "bg-black text-white" : "text-neutral-800"
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                ))}
                {segs.map((seg) => (
                  <button
                    key={seg.key}
                    onClick={() => (seg.isTask ? router.push(`/gantt/${seg.projectId}`) : toggleExpand(seg.projectId))}
                    className="absolute rounded px-1.5 text-[10px] leading-tight font-medium text-white truncate flex items-center hover:brightness-110 transition-filter z-10"
                    style={{
                      left: `${seg.leftPct}%`,
                      width: `calc(${seg.widthPct}% - 4px)`,
                      marginLeft: 2,
                      top: DAY_HEADER_H + seg.lane * LANE_H,
                      height: LANE_H - 3,
                      backgroundColor: seg.color,
                      opacity: seg.isTask ? 0.85 : 1,
                    }}
                    title={seg.isTask ? `${seg.label} — open project` : `${seg.label} — click to expand tasks`}
                  >
                    {seg.label}
                  </button>
                ))}
              </div>
            </Fragment>
          );
        })}
      </div>

      <p className="text-xs text-neutral-400 mt-3">
        Scroll to see all months. Click a project bar to expand its tasks; click a task bar to open that project.
      </p>
    </div>
  );
}
