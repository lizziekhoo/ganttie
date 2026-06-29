"use client";

import React, { useState } from 'react';
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
import { Calendar, CheckCircle2, Circle, Clock, MapPin, User, DollarSign, AlertCircle, Plus, X, ListTodo, ChevronRight, Flag, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoProjectTasks, demoActionItems } from '@/lib/projects-data';

// Stable client-side ID generator for locally-added items (Date.now()/Math.random()
// are flagged impure-in-render by react-hooks/purity).
let _idCounter = 0;
const nextId = () => `local-${++_idCounter}`;

export interface VariationOrder {
  id: string;
  description: string;
  costImpact: number;
  status: 'pending' | 'approved' | 'rejected';
  loggedBy: string;
  timestamp: string;
  reason?: string;
}

// A standalone actionable item (no due date, optional assignee).
export interface ActionItem {
  id: string;
  text: string;
  done: boolean;
  assignee?: string;
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
  category: string;
  budget?: number;
  lastUpdated?: string;
  variationOrders?: VariationOrder[];
  phase?: string;
  scope?: string;
  originalEndDate?: string;
  dependency?: string | null;
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
  actionItems: ActionItem[];
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
  actionItems: demoActionItems,
};

const InteriorDesignProjectPage: React.FC<{ projectData?: ProjectData }> = ({
  projectData = defaultProjectData
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedTaskVO, setExpandedTaskVO] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(projectData.tasks || []);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null;
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
  // NOTE: Local state resets on page refresh - for development only
  // In production, this should be connected to a backend API
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: '',
    status: 'pending',
    startDate: '',
    endDate: '',
    duration: 1,
    assignee: '',
    category: 'General'
  });

  // Action items (to-do list) — standalone actionable items, no due date.
  const [actionItems, setActionItems] = useState<ActionItem[]>(projectData.actionItems || []);
  const [newActionItem, setNewActionItem] = useState<{ text: string; assignee: string }>({
    text: '',
    assignee: ''
  });

  const { isCollapsed } = useSidebar();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
      'in-progress': 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
      pending: 'bg-muted text-muted-foreground'
    };
    return variants[status] || variants.pending;
  };

  const getStalenessInfo = (task: Task) => {
    if (task.status === 'completed' || task.status === 'pending') {
      return { isStale: false, daysSinceUpdate: 0 };
    }

    if (!task.lastUpdated) {
      return { isStale: true, daysSinceUpdate: Infinity, text: 'Never updated' };
    }

    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(task.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      isStale: daysSinceUpdate > 5,
      daysSinceUpdate,
      text: daysSinceUpdate > 5 ? `No update in ${daysSinceUpdate} days` : `Updated ${daysSinceUpdate}d ago`
    };
  };

  const getTotalCost = (task: Task) => {
    const baseCost = task.budget || 0;
    const voImpact = (task.variationOrders || [])
      .filter(vo => vo.status === 'approved')
      .reduce((sum, vo) => sum + vo.costImpact, 0);
    return baseCost + voImpact;
  };

  const getPendingVOImpact = (task: Task) => {
    return (task.variationOrders || [])
      .filter(vo => vo.status === 'pending')
      .reduce((sum, vo) => sum + vo.costImpact, 0);
  };

  const handleAddTask = () => {
    if (!newTask.name || !newTask.assignee || !newTask.startDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Calculate end date based on start date and duration
    const startDate = new Date(newTask.startDate!);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + newTask.duration!);

    const task: Task = {
      id: nextId(),
      name: newTask.name!,
      status: newTask.status!,
      startDate: newTask.startDate!,
      endDate: endDate.toISOString().split('T')[0],
      duration: newTask.duration!,
      assignee: newTask.assignee!,
      category: newTask.category || 'General',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setTasks([...tasks, task]);
    setNewTask({
      name: '',
      status: 'pending',
      startDate: '',
      endDate: '',
      duration: 1,
      assignee: '',
      category: 'General'
    });
    setShowAddTaskForm(false);
  };

  const handleAddActionItem = () => {
    const text = newActionItem.text.trim();
    if (!text) {
      alert('Please enter an action item');
      return;
    }

    const item: ActionItem = {
      id: nextId(),
      text,
      done: false,
      ...(newActionItem.assignee.trim() ? { assignee: newActionItem.assignee.trim() } : {})
    };

    setActionItems([...actionItems, item]);
    setNewActionItem({ text: '', assignee: '' });
  };

  const getDelayDuration = (task: Task): number =>
    (task.delays || []).reduce((sum, d) => sum + d.duration, 0);

  // Append a delay/VO/subtask to the selected task. Updates only `tasks`;
  // the derived `selectedTask` reflects the change automatically.
  const updateSelectedTask = (updater: (t: Task) => Task) => {
    if (!selectedTaskId) return;
    setTasks(prev => prev.map(t => (t.id === selectedTaskId ? updater(t) : t)));
  };

  const handleAddDelay = () => {
    if (!selectedTaskId || !newDelay.reason?.trim() || !newDelay.duration) {
      alert('Please fill in a reason and duration');
      return;
    }
    const delay: Delay = {
      id: nextId(),
      reason: newDelay.reason!.trim(),
      duration: newDelay.duration!,
      date: newDelay.date || new Date().toISOString().split('T')[0]
    };
    updateSelectedTask(t => ({ ...t, delays: [...(t.delays || []), delay] }));
    setNewDelay({ reason: '', duration: 1, date: '' });
    setAddDelayOpen(false);
  };

  const handleAddVariationOrder = () => {
    if (!selectedTaskId || !newVO.description?.trim()) {
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
      timestamp: newVO.timestamp || new Date().toISOString().split('T')[0]
    };
    updateSelectedTask(t => ({ ...t, variationOrders: [...(t.variationOrders || []), vo] }));
    setNewVO({ description: '', reason: '', costImpact: 0, timestamp: '', status: 'pending' });
    setAddVOOpen(false);
  };

  const handleAddSubtask = () => {
    if (!selectedTaskId || !newSubtask.description?.trim()) {
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
    setNewSubtask({
      description: '', status: 'Pending', priority: 'Medium', assignee: '',
      reminderTime: '09:00', reminderFrequency: 'Weekdays'
    });
    setAddSubtaskOpen(false);
  };

  const handleToggleActionItem = (id: string) => {
    setActionItems(actionItems.map(item => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const handleDeleteActionItem = (id: string) => {
    setActionItems(actionItems.filter(item => item.id !== id));
  };

  // Flatten all variation orders across tasks, tagged with their parent task name.
  const allVariationOrders = tasks.flatMap(task =>
    (task.variationOrders || []).map(vo => ({ ...vo, taskName: task.name }))
  );

  const approvedVOs = allVariationOrders.filter(vo => vo.status === 'approved');
  const pendingVOs = allVariationOrders.filter(vo => vo.status === 'pending');
  const approvedVOImpact = approvedVOs.reduce((sum, vo) => sum + vo.costImpact, 0);
  const pendingVOImpact = pendingVOs.reduce((sum, vo) => sum + vo.costImpact, 0);
  const recentVOs = [...allVariationOrders]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  const getVOStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      approved: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20',
      rejected: 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
    };
    return variants[status] || 'bg-muted text-muted-foreground';
  };

  const openActionItems = actionItems.filter(item => !item.done);

  const getWeeksBetween = (start: string, end: string): number =>
    Math.ceil(Math.abs(new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24 * 7));

  const getBarColor = (task: Task) => {
    if ((task.delays || []).length > 0) return 'bg-orange-500';
    switch (task.status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const renderGantt = () => {
    const totalWeeks = Math.max(1, getWeeksBetween(projectData.startDate, projectData.endDate));

    const getTaskPosition = (task: Task) => {
      const startWeek = Math.max(0, getWeeksBetween(projectData.startDate, task.startDate));
      const duration = Math.max(1, getWeeksBetween(task.startDate, task.endDate));
      let leftPct = (startWeek / totalWeeks) * 100;
      let widthPct = (duration / totalWeeks) * 100;
      if (leftPct < 0) {
        widthPct += leftPct;
        leftPct = 0;
      }
      if (leftPct + widthPct > 100) widthPct = 100 - leftPct;
      return { left: `${leftPct}%`, width: `${Math.max(0, widthPct)}%` };
    };

    if (tasks.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-8">
          No tasks to display on the timeline yet.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {new Date(projectData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {' — '}
          {new Date(projectData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {' '}({totalWeeks} weeks)
        </p>

        <div className="border border-border rounded-lg overflow-hidden">
          {/* Week header */}
          <div className="bg-muted p-3 border-b border-border flex">
            <div className="w-48 shrink-0 font-semibold text-sm">Task</div>
            <div className="flex-1 flex min-w-0">
              {Array.from({ length: totalWeeks }, (_, i) => (
                <div
                  key={i}
                  className="flex-1 text-center text-[10px] text-muted-foreground border-l border-border first:border-l-0"
                >
                  W{i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Task rows */}
          <div className="max-h-[480px] overflow-y-auto">
            {tasks.map(task => {
              const position = getTaskPosition(task);
              const weeks = Math.max(1, getWeeksBetween(task.startDate, task.endDate));
              const delayWeeks = getDelayDuration(task);
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className="border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center p-3">
                    <div className="w-48 shrink-0 pr-3 space-y-1">
                      <div className="font-medium text-sm truncate">{task.name}</div>
                      <div className="flex gap-1 flex-wrap">
                        {task.phase && <Badge variant="outline" className="text-xs">{task.phase}</Badge>}
                        {task.scope && <Badge variant="outline" className="text-xs">{task.scope}</Badge>}
                        <Badge className={cn('text-xs', getStatusBadge(task.status))}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      {delayWeeks > 0 && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <AlertCircle className="w-3 h-3" />
                          Delayed by {delayWeeks} {delayWeeks === 1 ? 'week' : 'weeks'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 relative h-9 min-w-0">
                      <div
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2 h-6 rounded flex items-center justify-center text-[10px] font-medium text-white',
                          getBarColor(task)
                        )}
                        style={{ left: position.left, width: position.width, minWidth: '1.75rem' }}
                      >
                        {weeks}w
                      </div>
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

  return (
    <div className="p-2 md:p-10">
      <div className={cn("transition-all duration-300", isCollapsed ? "max-w-screen-2xl" : "max-w-screen-xl")}>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{projectData.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{projectData.client}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{projectData.location}</span>
                </div>
              </div>
            </div>
            <Badge className={getStatusBadge(projectData.status.toLowerCase().replace(' ', '-'))}>
              {projectData.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{projectData.progress}%</div>
                <Progress value={projectData.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectData.budget}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Start Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(projectData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">End Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(projectData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="todo">To-Do List</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{projectData.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Completed Tasks</h4>
                    <div className="text-2xl font-bold text-green-500">
                      {tasks.filter(t => t.status === 'completed').length}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">In Progress</h4>
                    <div className="text-2xl font-bold text-blue-500">
                      {tasks.filter(t => t.status === 'in-progress').length}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Pending Tasks</h4>
                    <div className="text-2xl font-bold text-muted-foreground">
                      {tasks.filter(t => t.status === 'pending').length}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Total Tasks</h4>
                    <div className="text-2xl font-bold">{tasks.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Variation Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Variation Orders</CardTitle>
                <CardDescription>Cost changes and approved adjustments across all tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold mb-1 text-xs text-muted-foreground">Approved</h4>
                    <div className="text-xl font-bold text-green-500">{approvedVOs.length}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-xs text-muted-foreground">Pending</h4>
                    <div className="text-xl font-bold text-yellow-600">{pendingVOs.length}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-xs text-muted-foreground">Approved Impact</h4>
                    <div className="text-xl font-bold text-green-500">${approvedVOImpact.toLocaleString()}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-xs text-muted-foreground">Pending Impact</h4>
                    <div className="text-xl font-bold text-yellow-600">${pendingVOImpact.toLocaleString()}</div>
                  </div>
                </div>

                {recentVOs.length > 0 ? (
                  <div className="border-t border-border pt-4 space-y-3">
                    <h4 className="text-sm font-semibold">Recent</h4>
                    {recentVOs.map(vo => (
                      <div key={vo.id} className="flex items-start justify-between gap-3 p-3 border border-border rounded-lg bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{vo.description}</div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span className="truncate">{vo.taskName}</span>
                            <span>•</span>
                            <span>{new Date(vo.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-semibold whitespace-nowrap">
                            {vo.costImpact >= 0 ? '+' : ''}${vo.costImpact.toLocaleString()}
                          </span>
                          <Badge className={getVOStatusBadge(vo.status)}>{vo.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground border-t border-border pt-4">No variation orders logged</p>
                )}
              </CardContent>
            </Card>

            {/* Action items snapshot */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4" />
                    Action Items
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('todo')} className="gap-1 text-xs">
                    View all <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {openActionItems.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-3">
                      {openActionItems.length} open of {actionItems.length} total
                    </p>
                    {openActionItems.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-2 border border-border rounded-lg">
                        <Checkbox checked={false} onCheckedChange={() => setActiveTab('todo')} />
                        <span className="text-sm flex-1">{item.text}</span>
                        {item.assignee && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            {item.assignee}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">All caught up — no open action items.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="todo" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>To-Do List</CardTitle>
                  <CardDescription>Actionable items — no due dates, optional assignee</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{actionItems.filter(i => i.done).length} of {actionItems.length} done</span>
                  {actionItems.length > 0 && (
                    <span>{Math.round((actionItems.filter(i => i.done).length / actionItems.length) * 100)}%</span>
                  )}
                </div>
                {actionItems.length > 0 && (
                  <Progress
                    value={(actionItems.filter(i => i.done).length / actionItems.length) * 100}
                    className="h-2"
                  />
                )}

                {/* Add item */}
                <div className="flex flex-col sm:flex-row gap-2 p-3 border border-border rounded-lg bg-muted/30">
                  <Input
                    type="text"
                    placeholder="Add an action item (e.g. Call the electrician)"
                    value={newActionItem.text}
                    onChange={(e) => setNewActionItem({ ...newActionItem, text: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddActionItem(); }}
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    placeholder="Assignee (optional)"
                    value={newActionItem.assignee}
                    onChange={(e) => setNewActionItem({ ...newActionItem, assignee: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddActionItem(); }}
                    className="sm:w-48"
                  />
                  <Button onClick={handleAddActionItem} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>

                {/* List */}
                {actionItems.length > 0 ? (
                  <div className="space-y-2">
                    {actionItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <Checkbox
                          checked={item.done}
                          onCheckedChange={() => handleToggleActionItem(item.id)}
                        />
                        <span className={cn("text-sm flex-1", item.done && "line-through text-muted-foreground")}>
                          {item.text}
                        </span>
                        {item.assignee && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            {item.assignee}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteActionItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                          aria-label="Delete action item"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No action items yet. Add one above to get started.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Task List</CardTitle>
                    <CardDescription>All tasks and their current status</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddTaskForm(!showAddTaskForm)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddTaskForm && (
                  <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Add New Task</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowAddTaskForm(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Task Name</label>
                        <Input
                          type="text"
                          placeholder="Enter task name"
                          value={newTask.name}
                          onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Assignee/Team</label>
                        <Input
                          type="text"
                          placeholder="Enter assignee"
                          value={newTask.assignee}
                          onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Input
                          type="date"
                          value={newTask.startDate}
                          onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Duration (days)</label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Duration"
                          value={newTask.duration}
                          onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Input
                          type="text"
                          placeholder="e.g., Planning, Design, Construction"
                          value={newTask.category}
                          onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={newTask.status}
                          onValueChange={(value) => setNewTask({ ...newTask, status: value as Task['status'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button onClick={handleAddTask} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{task.name}</h4>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.assignee}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span>{task.duration} days</span>
                          </div>
                          {getDelayDuration(task) > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                              <AlertCircle className="w-3 h-3" />
                              Delayed by {getDelayDuration(task)} weeks
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {task.category}
                        </Badge>
                        <Badge className={getStatusBadge(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gantt" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>Visual representation of task schedule and dependencies</CardDescription>
              </CardHeader>
              <CardContent>
                {renderGantt()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Task detail dialog */}
        <Dialog open={selectedTask !== null} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
          <DialogContent className="sm:max-w-2xl">
            {selectedTask && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedTask.name}</DialogTitle>
                  <DialogDescription>
                    {[selectedTask.phase, selectedTask.scope].filter(Boolean).join(' • ') || 'Task details'}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Start Date</div>
                    <div className="font-medium text-sm">{selectedTask.startDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">End Date</div>
                    <div className="font-medium text-sm">{selectedTask.endDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Original End Date</div>
                    <div className="font-medium text-sm">{selectedTask.originalEndDate || selectedTask.endDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Status</div>
                    <Badge className={getStatusBadge(selectedTask.status)}>
                      {selectedTask.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Delays */}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      Delays ({getDelayDuration(selectedTask)} weeks total)
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setAddDelayOpen(true)} className="gap-1">
                      <Plus className="w-3 h-3" /> Add Delay
                    </Button>
                  </div>
                  {(selectedTask.delays || []).length > 0 ? (
                    <div className="space-y-2">
                      {(selectedTask.delays || []).map(delay => (
                        <div key={delay.id} className="p-3 rounded-md bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-900">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">{delay.reason}</span>
                            <Badge variant="outline">{delay.duration} {delay.duration === 1 ? 'week' : 'weeks'}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Logged on {delay.date}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No delays logged</p>
                  )}
                </div>

                {/* Variation Orders */}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Variation Orders ({(selectedTask.variationOrders || []).length})
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setAddVOOpen(true)} className="gap-1">
                      <Plus className="w-3 h-3" /> Add VO
                    </Button>
                  </div>
                  {(selectedTask.variationOrders || []).length > 0 ? (
                    <div className="space-y-2">
                      {(selectedTask.variationOrders || []).map(vo => (
                        <div key={vo.id} className="p-3 rounded-md bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">{vo.description}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="gap-1">
                                <DollarSign className="w-3 h-3" />{vo.costImpact}
                              </Badge>
                              <Badge className={getVOStatusBadge(vo.status)}>{vo.status}</Badge>
                            </div>
                          </div>
                          {vo.reason && <div className="text-sm text-muted-foreground mt-1">{vo.reason}</div>}
                          <div className="text-xs text-muted-foreground mt-1">Logged on {vo.timestamp} by {vo.loggedBy}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No variation orders</p>
                  )}
                </div>

                {/* Subtasks */}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <ListTodo className="w-4 h-4" />
                      Subtasks ({(selectedTask.subTasks || []).length})
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setAddSubtaskOpen(true)} className="gap-1">
                      <Plus className="w-3 h-3" /> Add Subtask
                    </Button>
                  </div>
                  {(selectedTask.subTasks || []).length > 0 ? (
                    <div className="space-y-2">
                      {(selectedTask.subTasks || []).map(st => (
                        <div key={st.id} className="flex items-start gap-3 p-3 rounded-md border border-border">
                          <Checkbox checked={st.status === 'Done'} className="mt-1" />
                          <div className="flex-1 space-y-1">
                            <div className="text-sm font-medium">{st.description}</div>
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
                  ) : (
                    <p className="text-sm text-muted-foreground">No subtasks</p>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Delay dialog */}
        <Dialog open={addDelayOpen} onOpenChange={setAddDelayOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Delay</DialogTitle>
              <DialogDescription>Log a delay for this task</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason</label>
                <Textarea
                  value={newDelay.reason || ''}
                  onChange={e => setNewDelay({ ...newDelay, reason: e.target.value })}
                  placeholder="e.g., Material delivery delayed"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (weeks)</label>
                  <Input
                    type="number" min="1"
                    value={newDelay.duration ?? 1}
                    onChange={e => setNewDelay({ ...newDelay, duration: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={newDelay.date || ''}
                    onChange={e => setNewDelay({ ...newDelay, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddDelayOpen(false)}>Cancel</Button>
                <Button onClick={handleAddDelay}>Add Delay</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Variation Order dialog */}
        <Dialog open={addVOOpen} onOpenChange={setAddVOOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Variation Order</DialogTitle>
              <DialogDescription>Log a variation order for this task</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={newVO.description || ''}
                  onChange={e => setNewVO({ ...newVO, description: e.target.value })}
                  placeholder="e.g., Add extra power outlets"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason</label>
                <Textarea
                  value={newVO.reason || ''}
                  onChange={e => setNewVO({ ...newVO, reason: e.target.value })}
                  placeholder="Why this variation is needed"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost ($)</label>
                  <Input
                    type="number" step="0.01"
                    value={newVO.costImpact ?? 0}
                    onChange={e => setNewVO({ ...newVO, costImpact: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={newVO.status}
                    onValueChange={v => setNewVO({ ...newVO, status: v as VariationOrder['status'] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddVOOpen(false)}>Cancel</Button>
                <Button onClick={handleAddVariationOrder}>Add Variation Order</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Subtask dialog */}
        <Dialog open={addSubtaskOpen} onOpenChange={setAddSubtaskOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Subtask</DialogTitle>
              <DialogDescription>Create a new subtask for this task</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newSubtask.description || ''}
                  onChange={e => setNewSubtask({ ...newSubtask, description: e.target.value })}
                  placeholder="e.g., Install new wiring throughout apartment"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={newSubtask.status}
                    onValueChange={v => setNewSubtask({ ...newSubtask, status: v as SubTask['status'] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Todo">Todo</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="In Progress but delayed">In Progress but delayed</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={newSubtask.priority}
                    onValueChange={v => setNewSubtask({ ...newSubtask, priority: v as SubTask['priority'] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assignee</label>
                <Input
                  value={newSubtask.assignee || ''}
                  onChange={e => setNewSubtask({ ...newSubtask, assignee: e.target.value })}
                  placeholder="e.g., John Electrician"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reminder Time</label>
                  <Input
                    type="time"
                    value={newSubtask.reminderTime || '09:00'}
                    onChange={e => setNewSubtask({ ...newSubtask, reminderTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reminder Frequency</label>
                  <Select
                    value={newSubtask.reminderFrequency}
                    onValueChange={v => setNewSubtask({ ...newSubtask, reminderFrequency: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekdays">Weekdays</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddSubtaskOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSubtask}>Add Subtask</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
};

export default InteriorDesignProjectPage;