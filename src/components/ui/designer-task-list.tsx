"use client";

import React, { useState } from 'react';
import { Check, Plus, Trash2, Circle, CheckCircle2, Calendar, Flag, FolderKanban } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category: string;
  project?: string;
}

interface DesignerTaskListProps {
  designerId: string;
}

const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    completed: false,
    priority: 'high',
    dueDate: '2024-01-20',
    category: 'work',
  },
  {
    id: '2',
    title: 'Review pull requests',
    completed: true,
    priority: 'medium',
    dueDate: '2024-01-18',
    category: 'work',
  },
  {
    id: '3',
    title: 'Update dependencies',
    completed: false,
    priority: 'low',
    dueDate: '2024-01-25',
    category: 'work',
  },
  {
    id: '4',
    title: 'Grocery shopping',
    completed: false,
    priority: 'medium',
    category: 'personal',
  },
  {
    id: '5',
    title: 'Schedule dentist appointment',
    completed: true,
    priority: 'high',
    dueDate: '2024-01-19',
    category: 'personal',
  },
];

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <div className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium transition-all ${
              task.completed
                ? 'line-through text-muted-foreground'
                : 'text-foreground'
            }`}
          >
            {task.title}
          </span>
          <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
            {task.priority}
          </Badge>
          {task.project && (
            <Badge variant="secondary" className="text-xs">
              <FolderKanban className="w-3 h-3 mr-1" />
              {task.project}
            </Badge>
          )}
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{task.dueDate}</span>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(task.id)}
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );
};

const DesignerTaskList: React.FC<DesignerTaskListProps> = ({ designerId }) => {
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Adapt project names to match the app's actual projects
  const projects = ['Project A', 'Project B', 'Project C', 'Project D', 'Project E', 'Project F'];

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        completed: false,
        priority: newTaskPriority,
        category: 'work',
        dueDate: newTaskDueDate || undefined,
        project: newTaskProject || undefined,
      };
      setTasks([newTask, ...tasks]);
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setNewTaskProject('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const getFilteredTasks = () => {
    switch (activeTab) {
      case 'active':
        return tasks.filter((task) => !task.completed);
      case 'completed':
        return tasks.filter((task) => task.completed);
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();
  const completedCount = tasks.filter((task) => task.completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="w-full space-y-6">
      <Card className="border-border shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Task Tracker</CardTitle>
              <CardDescription className="mt-1">
                Manage your tasks and stay organized
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">
                {completedCount} / {totalCount}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {progressPercentage.toFixed(0)}% completed
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                className="flex-1"
              />
              <Button onClick={addTask} className="gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
            <div className="flex gap-2">
              <Select
                value={newTaskPriority}
                onValueChange={(value: 'low' | 'medium' | 'high') => setNewTaskPriority(value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                placeholder="Due date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="flex-1"
              />
              <Select value={newTaskProject} onValueChange={setNewTaskProject}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4 space-y-2">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Circle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No tasks found</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flag className="w-4 h-4 text-red-500" />
                {tasks.filter((t) => t.priority === 'high' && !t.completed).length} High Priority
              </span>
              <span className="flex items-center gap-1">
                <Circle className="w-4 h-4" />
                {tasks.filter((t) => !t.completed).length} Active
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTasks(tasks.filter((t) => !t.completed))}
              disabled={completedCount === 0}
            >
              Clear Completed
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignerTaskList;
