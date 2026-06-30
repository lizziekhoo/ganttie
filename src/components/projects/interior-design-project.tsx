"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSidebar } from '@/components/layout/sidebar';
import { MapPin, User, DollarSign, AlertCircle, Plus, X, ListTodo, ChevronRight, ChevronDown, Flag, Bell, List, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoProjectTasks } from '@/lib/projects-data';

// Stable client-side ID generator (Date.now() is flagged impure-in-render).
let _idCounter = 0;
const nextId = () => `local-${++_idCounter}`;

const todayISO = () => new Date().toISOString().split('T')[0];

export interface VariationOrder {
  id: string;
  description: string;
  costImpact: number;
  status: 'pending' | 'approved' | 'rejected';
  loggedBy: string;
  timestamp: string;
  reason?: string;
}

// A logged delay on a task (duration in weeks).
export interface Delay {
  id: string;
  reason: string;
  duration: number;
  date: string;
}

export type SubTaskStatus = 'Pending' | 'Todo' | 'In Progress' | 'In Progress but delayed' | 'Done';
export type SubTaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface SubTask {
  id: string;
  description: string;
  status: SubTaskStatus;
  priority: SubTaskPriority;
  assignee: string;
  reminderTime: string;
  reminderFrequency: string;
}

export interface Task {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  startDate: string;
  endDate: string;
  duration: number;
  assignee: string;
  scope?: string;
  budget?: number;
  lastUpdated?: string;
  phase?: string;
  originalEndDate?: string;
  dependency?: string | null;
  variationOrders?: VariationOrder[];
  delays?: Delay[];
  subTasks?: SubTask[];
}

export interface ProjectData {
  title: string;
  client: string;
  location: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  budget: string;
  description: string;
  tasks: Task[];
}

const subtaskStatusColors: Record<SubTaskStatus, string> = {
  'Pending': 'bg-gray-200 text-gray-800',
  'Todo': 'bg-blue-200 text-blue-800',
  'In Progress': 'bg-yellow-200 text-yellow-800',
  'In Progress but delayed': 'bg-orange-200 text-orange-800',
  'Done': 'bg-green-200 text-green-800',
};

const priorityColors: Record<SubTaskPriority, string> = {
  'Low': 'bg-slate-200 text-slate-800',
  'Medium': 'bg-blue-200 text-blue-800',
  'High': 'bg-orange-200 text-orange-800',
  'Urgent': 'bg-red-200 text-red-800',
};

// Status → color used for list left-border + gantt bars.
const STATUS_HEX: Record<Task['status'], string> = {
  completed: '#22c55e',
  'in-progress': '#3b82f6',
  pending: '#94a3b8',
};
const DELAY_HEX = '#f97316';

// Gantt layout constants (px).
const PHASE_W = 52;
const NAME_W = 176;
const ROW_H = 44;
const HEADER_H = 38;

const defaultProjectData: ProjectData = {
  title: 'Modern Minimalist Living Room',
  client: 'Sarah Johnson',
  location: 'Beverly Hills, CA',
  status: 'In Progress',
  progress: 65,
  startDate: '2024-01-15',
  endDate: '2024-04-30',
  budget: '$85,000',
  description: 'Complete renovation of a 2,500 sq ft living space featuring modern minimalist design with natural materials, neutral color palette, and smart home integration.',
  tasks: demoProjectTasks,
};

const InteriorDesignProjectPage: React.FC<{ projectData?: ProjectData }> = ({
  projectData = defaultProjectData
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState<Task[]>(projectData.tasks || []);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null;

  // Task-tab view toggle + phase collapse + subtask accordions.
  const [taskView, setTaskView] = useState<'list' | 'gantt'>('list');
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});

  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task> & { dependency?: string }>({
    name: '', status: 'pending', startDate: '', duration: 1,
    assignee: '', phase: '', scope: '', dependency: 'none'
  });

  // Add dialog state (delays / VOs / subtasks on the selected task).
  const [addDelayOpen, setAddDelayOpen] = useState(false);
  const [addVOOpen, setAddVOOpen] = useState(false);
  const [addSubtaskOpen, setAddSubtaskOpen] = useState(false);
  const [newDelay, setNewDelay] = useState<Partial<Delay>>({ reason: '', duration: 1, date: '' });
  const [newVO, setNewVO] = useState<Partial<VariationOrder>>({
    description: '', reason: '', costImpact: 0, timestamp: '', status: 'pending'
  });
  const [newSubtask, setNewSubtask] = useState<Partial<SubTask>>({
    description: '', status: 'Pending', priority: 'Medium', assignee: '',
    reminderTime: '09:00', reminderFrequency: 'Weekdays'
  });

  // Measure gantt timeline width for drawing dependency arrows.
  const ganttBodyRef = useRef<HTMLDivElement>(null);
  const [timelineWidth, setTimelineWidth] = useState(0);
  useEffect(() => {
    const el = ganttBodyRef.current;
    if (!el) return;
    const update = () => setTimelineWidth(Math.max(0, el.offsetWidth - PHASE_W - NAME_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [taskView, activeTab]);

  const { isCollapsed } = useSidebar();

  // ── Derived data ───────────────────────────────────────────────────────────
  const phaseOrder: string[] = [];
  tasks.forEach(t => {
    const p = t.phase || 'Unassigned';
    if (!phaseOrder.includes(p)) phaseOrder.push(p);
  });
  const existingPhases = phaseOrder.filter(p => p !== 'Unassigned');

  const allVariationOrders = tasks.flatMap(task =>
    (task.variationOrders || []).map(vo => ({ ...vo, taskName: task.name }))
  );
  const approvedVOs = allVariationOrders.filter(vo => vo.status === 'approved');
  const pendingVOs = allVariationOrders.filter(vo => vo.status === 'pending');
  const approvedVOImpact = approvedVOs.reduce((s, vo) => s + vo.costImpact, 0);
  const pendingVOImpact = pendingVOs.reduce((s, vo) => s + vo.costImpact, 0);
  const recentVOs = [...allVariationOrders]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  const openSubtasks = tasks.flatMap(t =>
    (t.subTasks || []).filter(s => s.status !== 'Done').map(s => ({ sub: s, taskName: t.name }))
  );

  const depName = (id: string | null | undefined) =>
    (id ? tasks.find(t => t.id === id)?.name : undefined) || '';

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
      'in-progress': 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
      pending: 'bg-muted text-muted-foreground'
    };
    return variants[status] || variants.pending;
  };

  const getVOStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      approved: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20',
      rejected: 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
    };
    return variants[status] || 'bg-muted text-muted-foreground';
  };

  const getDelayDuration = (task: Task): number =>
    (task.delays || []).reduce((sum, d) => sum + d.duration, 0);

  const getBarColor = (task: Task) => {
    if ((task.delays || []).length > 0) return 'bg-orange-500';
    switch (task.status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  const statusHex = (task: Task) =>
    (task.delays || []).length > 0 ? DELAY_HEX : STATUS_HEX[task.status];

  const getWeeksBetween = (start: string, end: string): number =>
    Math.ceil(Math.abs(new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24 * 7));

  const getTaskPosition = (task: Task, totalWeeks: number) => {
    const startWeek = Math.max(0, getWeeksBetween(projectData.startDate, task.startDate));
    const duration = Math.max(1, getWeeksBetween(task.startDate, task.endDate));
    let leftPct = (startWeek / totalWeeks) * 100;
    let widthPct = (duration / totalWeeks) * 100;
    if (leftPct < 0) { widthPct += leftPct; leftPct = 0; }
    if (leftPct + widthPct > 100) widthPct = 100 - leftPct;
    return { left: leftPct, width: Math.max(0, widthPct) };
  };

  // ── Mutations ──────────────────────────────────────────────────────────────
  const updateSelectedTask = (updater: (t: Task) => Task) => {
    if (!selectedTaskId) return;
    setTasks(prev => prev.map(t => (t.id === selectedTaskId ? updater(t) : t)));
  };

  const setTaskField = <K extends keyof Task>(key: K, value: Task[K]) =>
    updateSelectedTask(t => ({ ...t, [key]: value }));

  const handleAddTask = () => {
    if (!newTask.name || !newTask.assignee || !newTask.startDate) {
      alert('Please fill in all required fields');
      return;
    }
    const startDate = new Date(newTask.startDate!);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (newTask.duration ?? 1));
    const dep = newTask.dependency && newTask.dependency !== 'none' ? newTask.dependency : null;

    const task: Task = {
      id: nextId(),
      name: newTask.name!,
      status: newTask.status as Task['status'],
      startDate: newTask.startDate!,
      endDate: endDate.toISOString().split('T')[0],
      duration: newTask.duration ?? 1,
      assignee: newTask.assignee!,
      phase: newTask.phase?.trim() || existingPhases[0] || 'Phase 1',
      scope: newTask.scope?.trim() || undefined,
      dependency: dep,
      lastUpdated: todayISO()
    };
    setTasks([...tasks, task]);
    setNewTask({ name: '', status: 'pending', startDate: '', duration: 1, assignee: '', phase: '', scope: '', dependency: 'none' });
    setShowAddTaskForm(false);
  };

  const handleAddDelay = () => {
    if (!newDelay.reason?.trim() || !newDelay.duration) {
      alert('Please fill in a reason and duration');
      return;
    }
    const delay: Delay = {
      id: nextId(),
      reason: newDelay.reason!.trim(),
      duration: newDelay.duration!,
      date: newDelay.date || todayISO()
    };
    updateSelectedTask(t => ({ ...t, delays: [...(t.delays || []), delay] }));
    setNewDelay({ reason: '', duration: 1, date: '' });
    setAddDelayOpen(false);
  };

  const handleAddVariationOrder = () => {
    if (!newVO.description?.trim()) {
      alert('Please enter a description');
      return;
    }
    const vo: VariationOrder = {
      id: nextId(),
      description: newVO.description!.trim(),
      reason: newVO.reason?.trim() || '',
      costImpact: newVO.costImpact ?? 0,
      status: newVO.status ?? 'pending',
      loggedBy: selectedTask?.assignee || 'Project Manager',
      timestamp: newVO.timestamp || todayISO()
    };
    updateSelectedTask(t => ({ ...t, variationOrders: [...(t.variationOrders || []), vo] }));
    setNewVO({ description: '', reason: '', costImpact: 0, timestamp: '', status: 'pending' });
    setAddVOOpen(false);
  };

  const handleAddSubtask = () => {
    if (!newSubtask.description?.trim()) {
      alert('Please enter a subtask description');
      return;
    }
    const subtask: SubTask = {
      id: nextId(),
      description: newSubtask.description!.trim(),
      status: newSubtask.status ?? 'Pending',
      priority: newSubtask.priority ?? 'Medium',
      assignee: newSubtask.assignee?.trim() || '',
      reminderTime: newSubtask.reminderTime ?? '09:00',
      reminderFrequency: newSubtask.reminderFrequency ?? 'Weekdays'
    };
    updateSelectedTask(t => ({ ...t, subTasks: [...(t.subTasks || []), subtask] }));
    setNewSubtask({ description: '', status: 'Pending', priority: 'Medium', assignee: '', reminderTime: '09:00', reminderFrequency: 'Weekdays' });
    setAddSubtaskOpen(false);
  };

  const toggleSubtaskDone = (taskId: string, subId: string) => {
    setTasks(prev => prev.map(t => t.id !== taskId ? t : {
      ...t,
      subTasks: (t.subTasks || []).map(s => s.id === subId
        ? { ...s, status: s.status === 'Done' ? 'Todo' : 'Done' } : s)
    }));
  };

  const togglePhase = (phase: string) =>
    setCollapsedPhases(prev => ({ ...prev, [phase]: !prev[phase] }));

  // ── Views ──────────────────────────────────────────────────────────────────
  const renderTaskList = () => {
    if (tasks.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-8">No tasks yet. Add one to get started.</p>;
    }
    return (
      <div className="space-y-4">
        {phaseOrder.map(phase => {
          const phaseTasks = tasks.filter(t => (t.phase || 'Unassigned') === phase);
          const collapsed = collapsedPhases[phase];
          return (
            <div key={phase} className="rounded-lg border border-border overflow-hidden">
              <div
                onClick={() => togglePhase(phase)}
                className="flex items-center justify-between px-3 py-2 bg-muted/60 cursor-pointer hover:bg-muted transition-colors"
              >
                <span className="font-semibold text-sm flex items-center gap-2">
                  {collapsed
                    ? <ChevronRight className="w-4 h-4" />
                    : <ChevronDown className="w-4 h-4" />}
                  {phase}
                </span>
                <span className="text-xs text-muted-foreground">{phaseTasks.length} tasks</span>
              </div>
              {!collapsed && phaseTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className="flex items-center gap-3 px-3 border-t border-border cursor-pointer hover:bg-muted/40 transition-colors"
                  style={{ borderLeft: `3px solid ${statusHex(task)}` }}
                >
                  <div className="flex-1 min-w-0 py-2">
                    <div className="text-sm font-medium truncate">{task.name}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      {task.dependency && depName(task.dependency) && (
                        <span>depends on {depName(task.dependency)}</span>
                      )}
                      {getDelayDuration(task) > 0 && (
                        <span className="text-orange-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />Delayed {getDelayDuration(task)}w
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const renderGantt = () => {
    const totalWeeks = Math.max(1, getWeeksBetween(projectData.startDate, projectData.endDate));
    const weekDate = (i: number) => {
      const d = new Date(projectData.startDate);
      d.setDate(d.getDate() + i * 7);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (tasks.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-8">No tasks to display on the timeline yet.</p>;
    }

    // Flatten visible rows (collapsed phase → stub row) for uniform geometry.
    type Row = { kind: 'task'; task: Task; phase: string; firstInPhase: boolean }
      | { kind: 'stub'; phase: string };
    const rows: Row[] = [];
    phaseOrder.forEach(phase => {
      const phaseTasks = tasks.filter(t => (t.phase || 'Unassigned') === phase);
      if (collapsedPhases[phase]) { rows.push({ kind: 'stub', phase }); return; }
      phaseTasks.forEach((task, idx) => rows.push({ kind: 'task', task, phase, firstInPhase: idx === 0 }));
    });

    // Geometry per visible task (px within the timeline column).
    const geo: Record<string, { y: number; leftPx: number; rightPx: number }> = {};
    rows.forEach((row, i) => {
      if (row.kind !== 'task') return;
      const pos = getTaskPosition(row.task, totalWeeks);
      geo[row.task.id] = {
        y: i * ROW_H + ROW_H / 2,
        leftPx: (pos.left / 100) * timelineWidth,
        rightPx: ((pos.left + pos.width) / 100) * timelineWidth,
      };
    });
    const arrows = tasks
      .filter(t => t.dependency && geo[t.id] && geo[t.dependency])
      .map(t => {
        const pred = geo[t.dependency as string];
        const succ = geo[t.id];
        const midX = pred.rightPx + 10;
        const d = `M ${pred.rightPx.toFixed(1)} ${pred.y.toFixed(1)} L ${midX.toFixed(1)} ${pred.y.toFixed(1)} L ${midX.toFixed(1)} ${succ.y.toFixed(1)} L ${succ.leftPx.toFixed(1)} ${succ.y.toFixed(1)}`;
        return <path key={t.id} d={d} stroke={DELAY_HEX} strokeWidth={1.5} fill="none" markerEnd="url(#dep-arrow)" />;
      });

    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {new Date(projectData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {' — '}
          {new Date(projectData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {' '}({totalWeeks} weeks)
        </p>
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex bg-muted border-b border-border" style={{ height: HEADER_H }}>
            <div style={{ width: PHASE_W }} className="text-[10px] text-muted-foreground flex items-center justify-center border-r border-border">Phase</div>
            <div style={{ width: NAME_W }} className="text-xs font-semibold flex items-center px-2 border-r border-border">Task</div>
            <div className="flex-1 flex min-w-0">
              {Array.from({ length: totalWeeks }, (_, i) => (
                <div key={i} className="flex-1 text-center text-[9px] text-muted-foreground border-l border-border first:border-l-0 flex items-center justify-center px-0.5">
                  {weekDate(i)}
                </div>
              ))}
            </div>
          </div>

          {/* Body + arrow overlay */}
          <div ref={ganttBodyRef} className="relative">
            {timelineWidth > 0 && (
              <svg
                className="absolute pointer-events-none"
                style={{ left: PHASE_W + NAME_W, top: 0, width: timelineWidth, height: rows.length * ROW_H, overflow: 'visible' }}
              >
                <defs>
                  <marker id="dep-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill={DELAY_HEX} />
                  </marker>
                </defs>
                {arrows}
              </svg>
            )}
            {rows.map((row) => {
              if (row.kind === 'stub') {
                return (
                  <div key={`stub-${row.phase}`} className="flex items-center bg-muted/30 cursor-pointer hover:bg-muted/60 transition-colors border-b border-border last:border-b-0" style={{ height: ROW_H }} onClick={() => togglePhase(row.phase)}>
                    <div style={{ width: PHASE_W }} className="text-[10px] font-medium flex items-center justify-center border-r border-border">
                      <ChevronRight className="w-3 h-3" />
                    </div>
                    <div style={{ width: NAME_W }} className="text-xs font-medium px-2 truncate border-r border-border">{row.phase} (collapsed)</div>
                    <div className="flex-1" />
                  </div>
                );
              }
              const { task, firstInPhase, phase } = row;
              const pos = getTaskPosition(task, totalWeeks);
              const weeks = Math.max(1, getWeeksBetween(task.startDate, task.endDate));
              const collapsed = collapsedPhases[phase];
              return (
                <div key={task.id} className="flex items-stretch border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors" style={{ height: ROW_H }}>
                  <div style={{ width: PHASE_W }} className="border-r border-border flex flex-col items-center justify-center cursor-pointer" onClick={(e) => { e.stopPropagation(); togglePhase(phase); }}>
                    {firstInPhase && !collapsed && <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                    {firstInPhase && collapsed && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <div
                    onClick={() => setSelectedTaskId(task.id)}
                    style={{ width: NAME_W, borderLeft: `3px solid ${statusHex(task)}` }}
                    className="text-xs font-medium px-2 flex items-center cursor-pointer truncate border-r border-border"
                  >
                    <span className="truncate">{task.name}</span>
                  </div>
                  <div className="flex-1 relative min-w-0">
                    <div
                      className={cn('absolute top-1/2 -translate-y-1/2 h-5 rounded flex items-center justify-center text-[10px] font-medium text-white', getBarColor(task))}
                      style={{ left: `${pos.left}%`, width: `${pos.width}%`, minWidth: '1.5rem' }}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      {weeks}w
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSubtasks = () => {
    const withSubs = tasks.filter(t => (t.subTasks || []).length > 0);
    if (withSubs.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-8">No subtasks yet. Open a task to add subtasks.</p>;
    }
    return (
      <div className="space-y-3">
        {withSubs.map(task => {
          const subs = task.subTasks || [];
          const done = subs.filter(s => s.status === 'Done').length;
          const expanded = expandedSubtasks[task.id];
          return (
            <div key={task.id} className="rounded-lg border border-border overflow-hidden">
              <div
                onClick={() => setExpandedSubtasks(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                className="flex items-center justify-between px-3 py-2 bg-muted/40 cursor-pointer hover:bg-muted transition-colors"
              >
                <span className="font-medium text-sm flex items-center gap-2">
                  {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {task.name}
                </span>
                <span className="text-xs text-muted-foreground">{done}/{subs.length} done</span>
              </div>
              {expanded && subs.map(st => (
                <div key={st.id} className="flex items-start gap-3 px-3 py-2 border-t border-border">
                  <Checkbox checked={st.status === 'Done'} onCheckedChange={() => toggleSubtaskDone(task.id, st.id)} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <div className="text-sm">{st.description}</div>
                    <div className="flex gap-1 flex-wrap">
                      <Badge className={cn('text-xs', subtaskStatusColors[st.status])}>{st.status}</Badge>
                      <Badge className={cn('text-xs', priorityColors[st.priority])}>
                        <Flag className="w-3 h-3 mr-1" />{st.priority}
                      </Badge>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{st.assignee || 'Unassigned'}</span>
                      <span className="flex items-center gap-1"><Bell className="w-3 h-3" />{st.reminderTime} • {st.reminderFrequency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const renderAddTaskForm = () => (
    <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Add New Task</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowAddTaskForm(false)}><X className="w-4 h-4" /></Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Task Name</label>
          <Input type="text" placeholder="Enter task name" value={newTask.name || ''} onChange={e => setNewTask({ ...newTask, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Assignee / Team</label>
          <Input type="text" placeholder="Enter assignee" value={newTask.assignee || ''} onChange={e => setNewTask({ ...newTask, assignee: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <Input type="date" value={newTask.startDate || ''} onChange={e => setNewTask({ ...newTask, startDate: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Duration (days)</label>
          <Input type="number" min="1" value={newTask.duration ?? 1} onChange={e => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 1 })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phase</label>
          <Select value={newTask.phase || existingPhases[0] || 'Phase 1'} onValueChange={v => setNewTask({ ...newTask, phase: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {existingPhases.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              <SelectItem value="Phase 1">Phase 1</SelectItem>
              <SelectItem value="Phase 2">Phase 2</SelectItem>
              <SelectItem value="Phase 3">Phase 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Scope</label>
          <Input type="text" placeholder="e.g., Planning, Electrical" value={newTask.scope || ''} onChange={e => setNewTask({ ...newTask, scope: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={newTask.status as string} onValueChange={v => setNewTask({ ...newTask, status: v as Task['status'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Dependency</label>
          <Select value={newTask.dependency || 'none'} onValueChange={v => setNewTask({ ...newTask, dependency: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No dependency</SelectItem>
              {tasks.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <Button onClick={handleAddTask} className="gap-2"><Plus className="w-4 h-4" />Add Task</Button>
      </div>
    </div>
  );

  return (
    <div className="p-2 md:p-10">
      <div className={cn("transition-all duration-300", isCollapsed ? "max-w-screen-2xl" : "max-w-screen-xl")}>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{projectData.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2"><User className="w-4 h-4" /><span className="text-sm">{projectData.client}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span className="text-sm">{projectData.location}</span></div>
              </div>
            </div>
            <Badge className={getStatusBadge(projectData.status.toLowerCase().replace(' ', '-'))}>{projectData.status}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle></CardHeader><CardContent><div className="space-y-2"><div className="text-2xl font-bold">{projectData.progress}%</div><Progress value={projectData.progress} className="h-2" /></div></CardContent></Card>
            <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Budget</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{projectData.budget}</div></CardContent></Card>
            <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Start Date</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{new Date(projectData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div></CardContent></Card>
            <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">End Date</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{new Date(projectData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div></CardContent></Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="task">Task</TabsTrigger>
              <TabsTrigger value="subtask">Subtask</TabsTrigger>
            </TabsList>

            {/* ── Overview ── */}
            <TabsContent value="overview" className="space-y-4 mt-6">
              <Card><CardHeader><CardTitle>Project Description</CardTitle></CardHeader><CardContent><p className="text-muted-foreground leading-relaxed">{projectData.description}</p></CardContent></Card>

              <Card>
                <CardHeader><CardTitle>Project Summary</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div><h4 className="font-semibold mb-2 text-sm">Completed</h4><div className="text-2xl font-bold text-green-500">{tasks.filter(t => t.status === 'completed').length}</div></div>
                    <div><h4 className="font-semibold mb-2 text-sm">In Progress</h4><div className="text-2xl font-bold text-blue-500">{tasks.filter(t => t.status === 'in-progress').length}</div></div>
                    <div><h4 className="font-semibold mb-2 text-sm">Pending</h4><div className="text-2xl font-bold text-muted-foreground">{tasks.filter(t => t.status === 'pending').length}</div></div>
                    <div><h4 className="font-semibold mb-2 text-sm">Total Tasks</h4><div className="text-2xl font-bold">{tasks.length}</div></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Variation Orders</CardTitle><CardDescription>Cost changes and approved adjustments across all tasks</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div><h4 className="font-semibold mb-1 text-xs text-muted-foreground">Approved</h4><div className="text-xl font-bold text-green-500">{approvedVOs.length}</div></div>
                    <div><h4 className="font-semibold mb-1 text-xs text-muted-foreground">Pending</h4><div className="text-xl font-bold text-yellow-600">{pendingVOs.length}</div></div>
                    <div><h4 className="font-semibold mb-1 text-xs text-muted-foreground">Approved Impact</h4><div className="text-xl font-bold text-green-500">${approvedVOImpact.toLocaleString()}</div></div>
                    <div><h4 className="font-semibold mb-1 text-xs text-muted-foreground">Pending Impact</h4><div className="text-xl font-bold text-yellow-600">${pendingVOImpact.toLocaleString()}</div></div>
                  </div>
                  {recentVOs.length > 0 ? (
                    <div className="border-t border-border pt-4 space-y-3">
                      <h4 className="text-sm font-semibold">Recent</h4>
                      {recentVOs.map(vo => (
                        <div key={vo.id} className="flex items-start justify-between gap-3 p-3 border border-border rounded-lg bg-muted/30">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{vo.description}</div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground"><span className="truncate">{vo.taskName}</span><span>•</span><span>{new Date(vo.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-semibold whitespace-nowrap">{vo.costImpact >= 0 ? '+' : ''}${vo.costImpact.toLocaleString()}</span>
                            <Badge className={getVOStatusBadge(vo.status)}>{vo.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (<p className="text-sm text-muted-foreground border-t border-border pt-4">No variation orders logged</p>)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><ListTodo className="w-4 h-4" />Open Subtasks</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('subtask')} className="gap-1 text-xs">View all <ChevronRight className="w-3 h-3" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {openSubtasks.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-3">{openSubtasks.length} open across {tasks.filter(t => (t.subTasks || []).some(s => s.status !== 'Done')).length} tasks</p>
                      {openSubtasks.slice(0, 3).map(({ sub, taskName }) => (
                        <div key={sub.id} className="flex items-center gap-3 p-2 border border-border rounded-lg">
                          <Checkbox checked={false} onCheckedChange={() => setActiveTab('subtask')} />
                          <span className="text-sm flex-1 truncate">{sub.description}</span>
                          <span className="text-xs text-muted-foreground truncate">{taskName}</span>
                          <Badge className={cn('text-xs', priorityColors[sub.priority])}>{sub.priority}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (<p className="text-sm text-muted-foreground">All caught up — no open subtasks.</p>)}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Task (List / Gantt toggle) ── */}
            <TabsContent value="task" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle>Tasks</CardTitle>
                      <CardDescription>Grouped by phase — click a task for details</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex rounded-md border border-border p-0.5">
                        <button onClick={() => setTaskView('list')} className={cn('inline-flex items-center gap-1 px-3 py-1 text-xs rounded-sm transition-colors', taskView === 'list' ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/50')}><List className="w-3.5 h-3.5" />List</button>
                        <button onClick={() => setTaskView('gantt')} className={cn('inline-flex items-center gap-1 px-3 py-1 text-xs rounded-sm transition-colors', taskView === 'gantt' ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/50')}><BarChart3 className="w-3.5 h-3.5" />Gantt</button>
                      </div>
                      <Button onClick={() => setShowAddTaskForm(!showAddTaskForm)} className="gap-2"><Plus className="w-4 h-4" />Add Task</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {showAddTaskForm && renderAddTaskForm()}
                  {taskView === 'list' ? renderTaskList() : renderGantt()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Subtask ── */}
            <TabsContent value="subtask" className="space-y-4 mt-6">
              <Card>
                <CardHeader><CardTitle>Subtasks</CardTitle><CardDescription>Grouped by parent task</CardDescription></CardHeader>
                <CardContent>{renderSubtasks()}</CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* ── Task detail dialog ── */}
          <Dialog open={selectedTask !== null} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
            <DialogContent className="sm:max-w-2xl">
              {selectedTask && (
                <>
                  <DialogHeader>
                    <DialogTitle>{selectedTask.name}</DialogTitle>
                    <DialogDescription>
                      {selectedTask.scope ? `Scope: ${selectedTask.scope}` : 'Task details'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4">
                    <div><div className="text-xs text-muted-foreground">Start Date</div><div className="font-medium text-sm">{selectedTask.startDate}</div></div>
                    <div><div className="text-xs text-muted-foreground">End Date</div><div className="font-medium text-sm">{selectedTask.endDate}</div></div>
                    <div><div className="text-xs text-muted-foreground">Original End Date</div><div className="font-medium text-sm">{selectedTask.originalEndDate || selectedTask.endDate}</div></div>
                    <div><div className="text-xs text-muted-foreground mb-1">Status</div><Badge className={getStatusBadge(selectedTask.status)}>{selectedTask.status.replace('-', ' ')}</Badge></div>
                  </div>

                  {/* Editable tagging + dependency */}
                  <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Phase</label>
                      <Select value={selectedTask.phase || 'Unassigned'} onValueChange={v => setTaskField('phase', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {existingPhases.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          <SelectItem value="Unassigned">Unassigned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Scope</label>
                      <Input value={selectedTask.scope || ''} onChange={e => setTaskField('scope', e.target.value)} placeholder="e.g., Electrical" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Dependency</label>
                      <Select value={selectedTask.dependency || 'none'} onValueChange={v => setTaskField('dependency', v === 'none' ? null : v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No dependency</SelectItem>
                          {tasks.filter(t => t.id !== selectedTask.id).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {selectedTask.dependency && depName(selectedTask.dependency) && (
                    <p className="text-xs text-muted-foreground -mt-2">Depends on {depName(selectedTask.dependency)}</p>
                  )}

                  {/* Delays */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-600" />Delays ({getDelayDuration(selectedTask)} weeks total)</div>
                      <Button variant="outline" size="sm" onClick={() => setAddDelayOpen(true)} className="gap-1"><Plus className="w-3 h-3" />Add Delay</Button>
                    </div>
                    {(selectedTask.delays || []).length > 0 ? (
                      <div className="space-y-2">
                        {(selectedTask.delays || []).map(delay => (
                          <div key={delay.id} className="p-3 rounded-md bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-900">
                            <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium">{delay.reason}</span><Badge variant="outline">{delay.duration} {delay.duration === 1 ? 'week' : 'weeks'}</Badge></div>
                            <div className="text-xs text-muted-foreground mt-1">Logged on {delay.date}</div>
                          </div>
                        ))}
                      </div>
                    ) : (<p className="text-sm text-muted-foreground">No delays logged</p>)}
                  </div>

                  {/* Variation Orders */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4" />Variation Orders ({(selectedTask.variationOrders || []).length})</div>
                      <Button variant="outline" size="sm" onClick={() => setAddVOOpen(true)} className="gap-1"><Plus className="w-3 h-3" />Add VO</Button>
                    </div>
                    {(selectedTask.variationOrders || []).length > 0 ? (
                      <div className="space-y-2">
                        {(selectedTask.variationOrders || []).map(vo => (
                          <div key={vo.id} className="p-3 rounded-md bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium">{vo.description}</span>
                              <div className="flex items-center gap-2"><Badge variant="outline" className="gap-1"><DollarSign className="w-3 h-3" />{vo.costImpact}</Badge><Badge className={getVOStatusBadge(vo.status)}>{vo.status}</Badge></div>
                            </div>
                            {vo.reason && <div className="text-sm text-muted-foreground mt-1">{vo.reason}</div>}
                            <div className="text-xs text-muted-foreground mt-1">Logged on {vo.timestamp} by {vo.loggedBy}</div>
                          </div>
                        ))}
                      </div>
                    ) : (<p className="text-sm text-muted-foreground">No variation orders</p>)}
                  </div>

                  {/* Subtasks */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold flex items-center gap-2"><ListTodo className="w-4 h-4" />Subtasks ({(selectedTask.subTasks || []).length})</div>
                      <Button variant="outline" size="sm" onClick={() => setAddSubtaskOpen(true)} className="gap-1"><Plus className="w-3 h-3" />Add Subtask</Button>
                    </div>
                    {(selectedTask.subTasks || []).length > 0 ? (
                      <div className="space-y-2">
                        {(selectedTask.subTasks || []).map(st => (
                          <div key={st.id} className="flex items-start gap-3 p-3 rounded-md border border-border">
                            <Checkbox checked={st.status === 'Done'} onCheckedChange={() => toggleSubtaskDone(selectedTask.id, st.id)} className="mt-1" />
                            <div className="flex-1 space-y-1">
                              <div className="text-sm font-medium">{st.description}</div>
                              <div className="flex gap-1 flex-wrap">
                                <Badge className={cn('text-xs', subtaskStatusColors[st.status])}>{st.status}</Badge>
                                <Badge className={cn('text-xs', priorityColors[st.priority])}><Flag className="w-3 h-3 mr-1" />{st.priority}</Badge>
                              </div>
                              <div className="flex gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><User className="w-3 h-3" />{st.assignee || 'Unassigned'}</span>
                                <span className="flex items-center gap-1"><Bell className="w-3 h-3" />{st.reminderTime} • {st.reminderFrequency}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (<p className="text-sm text-muted-foreground">No subtasks</p>)}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Add Delay */}
          <Dialog open={addDelayOpen} onOpenChange={setAddDelayOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Delay</DialogTitle><DialogDescription>Log a delay for this task</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><label className="text-sm font-medium">Reason</label><Textarea value={newDelay.reason || ''} onChange={e => setNewDelay({ ...newDelay, reason: e.target.value })} placeholder="e.g., Material delivery delayed" rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-medium">Duration (weeks)</label><Input type="number" min="1" value={newDelay.duration ?? 1} onChange={e => setNewDelay({ ...newDelay, duration: parseInt(e.target.value) || 1 })} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Date</label><Input type="date" value={newDelay.date || ''} onChange={e => setNewDelay({ ...newDelay, date: e.target.value })} /></div>
                </div>
                <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setAddDelayOpen(false)}>Cancel</Button><Button onClick={handleAddDelay}>Add Delay</Button></div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Variation Order */}
          <Dialog open={addVOOpen} onOpenChange={setAddVOOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Variation Order</DialogTitle><DialogDescription>Log a variation order for this task</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><label className="text-sm font-medium">Description</label><Input value={newVO.description || ''} onChange={e => setNewVO({ ...newVO, description: e.target.value })} placeholder="e.g., Add extra power outlets" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Reason</label><Textarea value={newVO.reason || ''} onChange={e => setNewVO({ ...newVO, reason: e.target.value })} placeholder="Why this variation is needed" rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-medium">Cost ($)</label><Input type="number" step="0.01" value={newVO.costImpact ?? 0} onChange={e => setNewVO({ ...newVO, costImpact: parseFloat(e.target.value) || 0 })} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={newVO.status} onValueChange={v => setNewVO({ ...newVO, status: v as VariationOrder['status'] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select></div>
                </div>
                <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setAddVOOpen(false)}>Cancel</Button><Button onClick={handleAddVariationOrder}>Add Variation Order</Button></div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Subtask */}
          <Dialog open={addSubtaskOpen} onOpenChange={setAddSubtaskOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Subtask</DialogTitle><DialogDescription>Create a new subtask for this task</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><label className="text-sm font-medium">Description</label><Textarea value={newSubtask.description || ''} onChange={e => setNewSubtask({ ...newSubtask, description: e.target.value })} placeholder="e.g., Install new wiring throughout apartment" rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={newSubtask.status} onValueChange={v => setNewSubtask({ ...newSubtask, status: v as SubTask['status'] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Todo">Todo</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="In Progress but delayed">In Progress but delayed</SelectItem><SelectItem value="Done">Done</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Priority</label><Select value={newSubtask.priority} onValueChange={v => setNewSubtask({ ...newSubtask, priority: v as SubTask['priority'] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Urgent">Urgent</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-2"><label className="text-sm font-medium">Assignee</label><Input value={newSubtask.assignee || ''} onChange={e => setNewSubtask({ ...newSubtask, assignee: e.target.value })} placeholder="e.g., John Electrician" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-medium">Reminder Time</label><Input type="time" value={newSubtask.reminderTime || '09:00'} onChange={e => setNewSubtask({ ...newSubtask, reminderTime: e.target.value })} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Reminder Frequency</label><Select value={newSubtask.reminderFrequency} onValueChange={v => setNewSubtask({ ...newSubtask, reminderFrequency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Daily">Daily</SelectItem><SelectItem value="Weekdays">Weekdays</SelectItem><SelectItem value="Weekly">Weekly</SelectItem></SelectContent></Select></div>
                </div>
                <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setAddSubtaskOpen(false)}>Cancel</Button><Button onClick={handleAddSubtask}>Add Subtask</Button></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default InteriorDesignProjectPage;
