import { useState, useEffect, useRef } from 'react';
import { Phone, Check, PlusCircle, Calendar, Clock, AlertCircle, MessageSquare, 
  MoreHorizontal, AlarmClock, Bell, ChevronDown, ChevronRight, X, Filter, 
  ArrowUpRight, CheckCircle2, Tag, Search, Info } from 'lucide-react';
import { TaskService } from '@/services/task-service';
import { TaskModel, CreateTaskInput, CommunicationLogModel, CreateCommunicationLogInput } from '@/types/models.types';
import { format, isPast, isToday, addDays, formatDistance } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';

interface ClientFollowUpsProps {
  clientId?: number;
  agencyId?: number;
  className?: string;
}

// Form schema for tasks
const taskFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  category: z.enum(['call', 'meeting', 'email', 'other']).optional(),
});

// Form schema for logging communication
const communicationLogSchema = z.object({
  communicationType: z.enum(['email_sent', 'email_received', 'call_made', 'call_received', 'meeting', 'internal_note']),
  summary: z.string().min(2, "Summary is required"),
});

type TaskFilter = 'all' | 'upcoming' | 'overdue' | 'completed' | 'high';

// Custom hook for managing client pulse data
function useClientPulse(clientId?: number, agencyId?: number) {
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskModel[]>([]);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLogModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeAgencyId, setActiveAgencyId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get user info
  useEffect(() => {
    const getUserInfo = async () => {
      const supabase = createClientComponentClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      
      // Get user's profile to find their agency_id if not provided
      if (!agencyId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id || '')
          .single();
          
        if (profile?.agency_id) setActiveAgencyId(profile.agency_id);
      } else {
        setActiveAgencyId(agencyId);
      }
    };
    
    getUserInfo();
  }, [agencyId]);
  
  // Get projects for client or first project in agency
  useEffect(() => {
    const getProjects = async () => {
      if (!activeAgencyId) return;
      
      const supabase = createClientComponentClient();
      console.log('Fetching projects for agency:', activeAgencyId, 'client:', clientId);
      
      if (clientId) {
        // Get projects for specific client
        const { data: projectsData, error } = await supabase
          .from('projects')
          .select('id, name')
          .eq('client_id', clientId);
          
        console.log('Client projects result:', projectsData?.length || 0, 'Error:', error?.message);
        if (projectsData && projectsData.length > 0) {
          setProjects(projectsData);
        }
      } else {
        // Get any project from the agency to use for new tasks
        const { data: projectsData, error } = await supabase
          .from('projects')
          .select('id, name')
          .eq('agency_id', activeAgencyId)
          .limit(5);
          
        console.log('Agency projects result:', projectsData?.length || 0, 'Error:', error?.message);
        if (projectsData && projectsData.length > 0) {
          setProjects(projectsData);
        }
      }
    };
    
    if (activeAgencyId) {
      getProjects();
    }
  }, [clientId, activeAgencyId]);
  
  const fetchTasks = async () => {
    if (!activeAgencyId) return;
    
    try {
      let clientTasks: TaskModel[] = [];
      
      if (clientId) {
        // Get tasks for specific client
        clientTasks = await TaskService.getTasksByClientId(clientId);
      } else {
        // Get tasks for entire agency
        clientTasks = await TaskService.getTasksByAgencyId(activeAgencyId);
      }
      
      // Sort by status, priority and due date
      const sortedTasks = clientTasks.sort((a, b) => {
        // First sort by status (todo first)
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        
        // Then sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Finally sort by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return a.dueDate ? -1 : 1; // Items with due dates come first
      });
      
      setTasks(sortedTasks);
      applyFilters(sortedTasks, activeFilter, searchQuery);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch communication logs
  const fetchCommunicationLogs = async () => {
    if (!activeAgencyId) return;
    
    try {
      // This would typically call CommunicationLogService
      // For now, we'll simulate it with an empty array
      setCommunicationLogs([]);
    } catch (error) {
      console.error('Failed to fetch communication logs:', error);
    }
  };
  
  useEffect(() => {
    if (activeAgencyId) {
      fetchTasks();
      fetchCommunicationLogs();
    }
  }, [activeAgencyId, clientId]);
  
  // Apply filters when they change
  const applyFilters = (tasksList: TaskModel[], filter: TaskFilter, query: string) => {
    let result = [...tasksList];
    
    // Apply text search
    if (query) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Apply category filter
    switch (filter) {
      case 'upcoming':
        result = result.filter(task => 
          task.status !== 'completed' && 
          task.dueDate && 
          new Date(task.dueDate) >= new Date() && 
          !isToday(new Date(task.dueDate))
        );
        break;
      case 'overdue':
        result = result.filter(task => 
          task.status !== 'completed' && 
          task.dueDate && 
          isPast(new Date(task.dueDate)) && 
          !isToday(new Date(task.dueDate))
        );
        break;
      case 'completed':
        result = result.filter(task => task.status === 'completed');
        break;
      case 'high':
        result = result.filter(task => task.priority === 'high' && task.status !== 'completed');
        break;
      // 'all' doesn't need filtering
    }
    
    setFilteredTasks(result);
  };
  
  useEffect(() => {
    applyFilters(tasks, activeFilter, searchQuery);
  }, [activeFilter, searchQuery, tasks]);
  
  const handleComplete = async (taskId: number) => {
    try {
      await TaskService.completeTask(taskId);
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'completed' } : task
      ));
      toast.success("Task marked as completed");
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error("Failed to update task");
    }
  };
  
  const handleSnooze = async (taskId: number, days: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const currentDueDate = task.dueDate ? new Date(task.dueDate) : new Date();
      const newDueDate = addDays(currentDueDate, days);
      
      await TaskService.updateTask({
        id: taskId,
        dueDate: newDueDate.toISOString()
      });
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, dueDate: newDueDate.toISOString() } : task
      ));
      
      toast.success(`Task snoozed for ${days} day${days !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Failed to snooze task:', error);
      toast.error("Failed to update task");
    }
  };
  
  const createTask = async (data: z.infer<typeof taskFormSchema>) => {
    // Use a local variable to track the project we find or create
    let projectToUse = null;
    
    if (!projects.length) {
      console.warn('No projects found, will search for or create a default project');
      
      try {
        const supabase = createClientComponentClient();
        
        if (!activeAgencyId) {
          console.error('Agency ID is missing - cannot proceed');
          toast.error("Unable to create follow-up: Missing agency information");
          return false;
        }

        // First try to find an existing default project
        const { data: defaultProjects, error: findError } = await supabase
          .from('projects')
          .select('id, name')
          .eq('name', 'Default Project')
          .limit(1);
          
        if (findError) {
          console.error('Error finding default project:', findError);
        } else if (defaultProjects && defaultProjects.length > 0) {
          // Found an existing default project to use
          console.log('Found existing default project:', defaultProjects[0]);
          projectToUse = defaultProjects[0];
          setProjects([projectToUse]); // Update state for future renders
        } else {
          // No default project, try to find any valid client ID to use
          const { data: someClient, error: clientError } = await supabase
            .from('clients')
            .select('id')
            .eq('agency_id', activeAgencyId)
            .limit(1);
            
          if (clientError || !someClient || someClient.length === 0) {
            console.error('No clients found for agency, cannot create project');
            toast.error("Unable to create task: No clients available for your agency");
            return false;
          }
          
          const defaultClientId = someClient[0].id;
          console.log('Found client ID to use for default project:', defaultClientId);
          
          // Create a default project with this client ID
          const projectSlug = 'default-project-' + Date.now();
          
          // Note: The projects table doesn't have agency_id column
          const { data: newProject, error: createError } = await supabase
            .from('projects')
            .insert({
              name: 'Default Project',
              slug: projectSlug,
              description: 'System default project for tasks without a specific client',
              client_id: defaultClientId,
              status: 'active'
            })
            .select('id, name')
            .single();
            
          if (createError) {
            console.error('Error creating default project:', createError, {
              message: createError.message,
              details: createError.details
            });
            toast.error("Unable to create follow-up: Could not create project");
            return false;
          }
          
          if (!newProject) {
            console.error('No project returned after creation');
            toast.error("System error creating project");
            return false;
          }
          
          console.log('Created new default project:', newProject);
          projectToUse = newProject;
          setProjects([newProject]); // Update state for future renders
        }
      } catch (error) {
        console.error('Exception in project setup:', error);
        toast.error("Failed to set up project for task");
        return false;
      }
    } else {
      // Use the first project from state if projects exist
      projectToUse = projects[0];
    }
    
    // Check if we have a project to use (either from state or newly created)
    if (!projectToUse || !projectToUse.id) {
      console.error('No valid project available after attempts');
      toast.error("Could not create task: No valid project available");
      return false;
    }
    
    if (!userId) {
      console.error('User ID is missing');
      toast.error("Unable to create task: Please sign in again");
      return false;
    }
    
    if (!activeAgencyId) {
      console.error('Agency ID is missing');
      toast.error("Unable to create task: No agency context found");
      return false;
    }
    
    const newTask: CreateTaskInput = {
      title: data.title,
      description: data.description,
      // Use the project we found or created
      projectId: projectToUse.id, 
      priority: data.priority,
      dueDate: data.dueDate.toISOString(),
      status: 'todo',
      agencyId: activeAgencyId,
      createdByUserId: userId
    };
    
    try {
      console.log('Creating task with data:', newTask);
      await TaskService.createTask(newTask);
      toast.success("Follow-up created successfully");
      fetchTasks(); // Refresh task list
      return true;
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error("Failed to create follow-up");
      return false;
    }
  };
  
  const logCommunication = async (data: z.infer<typeof communicationLogSchema>) => {
    if (!userId || !activeAgencyId) {
      toast.error("Missing user or agency information");
      return false;
    }
    
    const targetClientId = clientId || 0; // In a real implementation, you'd need to have a valid client ID
    
    if (!targetClientId) {
      toast.error("No client selected for communication log");
      return false;
    }
    
    const newLog: CreateCommunicationLogInput = {
      clientId: targetClientId,
      agencyId: activeAgencyId,
      communicationType: data.communicationType,
      summary: data.summary,
      createdByUserId: userId
    };
    
    try {
      // This would typically call CommunicationLogService.createLog
      // For now we'll just simulate success
      console.log('Would create log:', newLog);
      toast.success("Communication logged successfully");
      return true;
    } catch (error) {
      console.error('Failed to log communication:', error);
      toast.error("Failed to log communication");
      return false;
    }
  };
  
  return {
    tasks: filteredTasks,
    allTasks: tasks,
    communicationLogs,
    isLoading,
    projects,
    userId,
    activeAgencyId,
    activeFilter,
    searchQuery,
    setSearchQuery,
    setActiveFilter,
    handleComplete,
    handleSnooze,
    createTask,
    logCommunication,
    fetchTasks
  };
}

// TaskItem component for displaying a task with expanded details
function TaskItem({ 
  task, 
  onComplete, 
  onSnooze,
  isDark
}: { 
  task: TaskModel; 
  onComplete: (taskId: number) => Promise<void>; 
  onSnooze: (taskId: number, days: number) => Promise<void>;
  isDark: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  
  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete(task.id);
  };
  
  const getDotColor = () => {
    if (task.status === 'completed') return 'bg-green-500';
    
    // For non-completed tasks
    if (task.priority === 'high') return 'bg-red-500';
    if (task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))) 
      return 'bg-red-500';
    if (task.priority === 'medium' || (task.dueDate && isToday(new Date(task.dueDate))))
      return 'bg-yellow-500';
    return 'bg-blue-500';
  };
  
  const getStatusText = () => {
    if (task.status === 'completed') return 'Completed';
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (isPast(dueDate) && !isToday(dueDate)) return 'Overdue';
      if (isToday(dueDate)) return 'Due today';
      return `Due ${format(dueDate, 'MMM d')}`;
    }
    return 'No due date';
  };
  
  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'high':
        return <Badge variant="destructive" className="ml-2">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className={cn("ml-2", isDark ? "bg-yellow-700" : "bg-yellow-200 text-yellow-800")}>Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="ml-2">Low</Badge>;
    }
  };
  
  return (
    <motion.div 
      layout
      className={cn(
        "border-b last:border-0 transition-colors",
        isDark ? "border-zinc-700/50" : "border-gray-200",
        expanded && (isDark ? "bg-zinc-800/50" : "bg-gray-50")
      )}
    >
      <div 
        className="flex items-center justify-between py-3 px-1 cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center flex-grow min-w-0">
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: expanded ? 90 : 0 }}
            className="mr-2 opacity-70"
          >
            <ChevronRight size={16} />
          </motion.div>
          
          <div 
            className={cn(
              "h-2.5 w-2.5 rounded-full mr-2.5 flex-shrink-0",
              getDotColor()
            )}
          />
          
          <div className="flex-grow min-w-0 mr-2">
            <div className="flex items-center">
              <span className="truncate">{task.title}</span>
              {task.priority === 'high' && !expanded && (
                <AlertCircle size={14} className="text-red-500 ml-2 flex-shrink-0" />
              )}
            </div>
            
            {!expanded && (
              <p className={cn(
                "text-xs truncate",
                isDark ? "text-zinc-400" : "text-gray-500"
              )}>
                {getStatusText()}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          <AnimatePresence>
            {!expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <button 
                  onClick={handleComplete}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-green-500 transition p-1"
                  aria-label="Complete task"
                >
                  <Check size={16} />
                </button>
                
                <div className="p-1">
                  <Phone size={16} className={cn(
                    "text-zinc-400",
                    task.priority === 'high' ? "text-red-400" : ""
                  )} />
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-200 transition"
                      aria-label="Task options"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className={isDark ? "bg-zinc-800 border-zinc-700" : ""}>
                    <div className="text-sm font-medium mb-1">Task Options</div>
                    <div className="h-px bg-gray-200 dark:bg-zinc-700 my-1" />
                    
                    <div className="space-y-1 py-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          onComplete(task.id);
                        }}
                      >
                        <CheckCircle2 className="mr-2" size={14} />
                        Mark complete
                      </Button>
                      
                      <div className="h-px bg-gray-200 dark:bg-zinc-700 my-1" />
                      <div className="text-xs text-muted-foreground px-2">Snooze</div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSnooze(task.id, 1);
                        }}
                      >
                        <AlarmClock className="mr-2" size={14} />
                        1 day
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSnooze(task.id, 3);
                        }}
                      >
                        <AlarmClock className="mr-2" size={14} />
                        3 days
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSnooze(task.id, 7);
                        }}
                      >
                        <AlarmClock className="mr-2" size={14} />
                        1 week
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {getPriorityBadge()}
                
                {task.dueDate && (
                  <Badge variant={
                    task.status === 'completed' ? "outline" :
                    isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) ? "destructive" :
                    isToday(new Date(task.dueDate)) ? "default" : "outline"
                  }>
                    <Clock size={12} className="mr-1" />
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </Badge>
                )}
                
                <Badge variant={
                  task.status === 'completed' ? "secondary" : "secondary"
                } className={task.status === 'completed' ? (isDark ? "bg-green-700" : "bg-green-200 text-green-800") : ""}>
                  {task.status === 'completed' ? 'Completed' : 'Pending'}
                </Badge>
              </div>
              
              {task.description && (
                <p className={cn("text-sm mb-3", isDark ? "text-zinc-300" : "text-gray-600")}>
                  {task.description}
                </p>
              )}
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(isDark ? "border-zinc-700 hover:bg-zinc-700" : "")}
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(task.id);
                  }}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Complete
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className={cn(isDark ? "border-zinc-700 hover:bg-zinc-700" : "")}
                    >
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Snooze
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className={isDark ? "bg-zinc-800 border-zinc-700" : ""}>
                    <div className="space-y-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSnooze(task.id, 1);
                        }}
                      >
                        Tomorrow
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSnooze(task.id, 3);
                        }}
                      >
                        In 3 days
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSnooze(task.id, 7);
                        }}
                      >
                        Next week
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(isDark ? "border-zinc-700 hover:bg-zinc-700" : "")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  Log Call
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ClientFollowUps({ clientId, agencyId, className }: ClientFollowUpsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);
  const [openLogDialog, setOpenLogDialog] = useState(false);
  const [modalType, setModalType] = useState<'task' | 'log'>('task');
  
  // Keep track of whether this component has a client context
  const hasClientContext = !!clientId;
  
  const clientPulse = useClientPulse(clientId, agencyId);
  
  // Form setup for tasks
  const taskForm = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: addDays(new Date(), 1),
      category: 'call',
    },
  });
  
  // Form setup for communication logs
  const logForm = useForm<z.infer<typeof communicationLogSchema>>({
    resolver: zodResolver(communicationLogSchema),
    defaultValues: {
      communicationType: 'call_made',
      summary: '',
    },
  });
  
  const onSubmitTask = async (data: z.infer<typeof taskFormSchema>) => {
    // Display loading state with a specific ID
    const toastId = toast.loading("Creating follow-up task...");
    
    const success = await clientPulse.createTask(data);
    
    // Clear the specific loading toast
    toast.dismiss(toastId);
    
    if (success) {
      setOpen(false);
      taskForm.reset();
    }
  };
  
  const onSubmitLog = async (data: z.infer<typeof communicationLogSchema>) => {
    const success = await clientPulse.logCommunication(data);
    if (success) {
      setOpenLogDialog(false);
      logForm.reset();
    }
  };
  
  if (clientPulse.isLoading) {
    return (
      <div className={cn("py-4", className)}>
        <h3 className="text-xl font-semibold mb-4">Delays & Follow-ups</h3>
        <div className="space-y-1.5 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className={cn("h-12 rounded", isDark ? "bg-zinc-800/50" : "bg-gray-200/80")}></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("py-4", className)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Delays & Follow-ups</h3>
        
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            disabled={!hasClientContext}
            onClick={() => {
              setModalType('log');
              setOpenLogDialog(true);
            }}
            title={hasClientContext ? "Log client communication" : "Cannot log communication without a client"}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Log
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={() => {
              setModalType('task');
              setOpen(true);
            }}
            title="Create follow-up task"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
            Task
          </Button>
        </div>
      </div>
      
      {/* Task filters and search */}
      <div className={cn(
        "bg-zinc-900/50 border rounded-lg p-3 mb-4",
        isDark ? "border-zinc-800" : "border-gray-200 bg-white/50"
      )}>
        <div className="mb-3 relative">
          <Search className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5", isDark ? "text-zinc-500" : "text-gray-400")} />
          <Input
            placeholder="Search follow-ups..."
            className={cn(
              "pl-8 py-1 h-8 text-xs",
              isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200"
            )}
            value={clientPulse.searchQuery}
            onChange={(e) => clientPulse.setSearchQuery(e.target.value)}
          />
        </div>
      
        <div className="flex flex-wrap gap-1.5 text-xs">
          <Badge 
            variant={clientPulse.activeFilter === 'all' ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => clientPulse.setActiveFilter('all')}
          >
            All
          </Badge>
          <Badge 
            variant={clientPulse.activeFilter === 'upcoming' ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => clientPulse.setActiveFilter('upcoming')}
          >
            Upcoming
          </Badge>
          <Badge 
            variant={clientPulse.activeFilter === 'overdue' ? "default" : "outline"}
            className={cn(
              "cursor-pointer",
              clientPulse.activeFilter === 'overdue' ? "bg-red-500 hover:bg-red-600" : ""
            )}
            onClick={() => clientPulse.setActiveFilter('overdue')}
          >
            Overdue
          </Badge>
          <Badge 
            variant={clientPulse.activeFilter === 'high' ? "default" : "outline"}
            className={cn(
              "cursor-pointer",
              clientPulse.activeFilter === 'high' ? "bg-red-500 hover:bg-red-600" : ""
            )}
            onClick={() => clientPulse.setActiveFilter('high')}
          >
            High Priority
          </Badge>
          <Badge 
            variant={clientPulse.activeFilter === 'completed' ? "default" : "outline"}
            className={cn(
              "cursor-pointer",
              clientPulse.activeFilter === 'completed' ? (isDark ? "bg-green-700 hover:bg-green-800" : "bg-green-600 hover:bg-green-700") : ""
            )}
            onClick={() => clientPulse.setActiveFilter('completed')}
          >
            Completed
          </Badge>
        </div>
      </div>
      
      {!clientPulse.tasks.length ? (
        <div className={cn(
          "bg-zinc-900/50 rounded-lg p-4 text-center",
          isDark ? "bg-zinc-900/30" : "bg-gray-50"
        )}>
          <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-gray-500")}>
            No follow-ups {clientPulse.activeFilter !== 'all' ? `matching "${clientPulse.activeFilter}" filter` : 'scheduled'}
          </p>
          
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              setModalType('task');
              setOpen(true);
            }}
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
            Create Task
          </Button>
        </div>
      ) : (
        <div className={cn(
          "bg-zinc-900/50 rounded-lg overflow-hidden",
          isDark ? "bg-zinc-900/30" : "bg-white/50",
          "border",
          isDark ? "border-zinc-800" : "border-gray-200"
        )}>
          <AnimatePresence initial={false}>
            <motion.div>
              {clientPulse.tasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onComplete={clientPulse.handleComplete} 
                  onSnooze={clientPulse.handleSnooze}
                  isDark={isDark}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
      
      {/* Task Creation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Follow-up Task</DialogTitle>
            <DialogDescription>
              Create a new follow-up task for this client
            </DialogDescription>
          </DialogHeader>
          
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit(onSubmitTask)} className="space-y-4 mt-1">
              <FormField
                control={taskForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Follow up with client" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={taskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional details..." 
                        className="resize-none h-20"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={taskForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={taskForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="call">
                            <div className="flex items-center">
                              <Phone className="mr-2 h-4 w-4" />
                              <span>Call</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="meeting">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4" />
                              <span>Meeting</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="email">
                            <div className="flex items-center">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              <span>Email</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="other">
                            <div className="flex items-center">
                              <ArrowUpRight className="mr-2 h-4 w-4" />
                              <span>Other</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={taskForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMM d, yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        {/* This would be a date picker, but for simplicity let's just use fixed options */}
                        <div className="p-2 space-y-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={() => {
                              taskForm.setValue("dueDate", new Date());
                            }}
                          >
                            Today
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={() => {
                              taskForm.setValue("dueDate", addDays(new Date(), 1));
                            }}
                          >
                            Tomorrow
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={() => {
                              taskForm.setValue("dueDate", addDays(new Date(), 7));
                            }}
                          >
                            Next week
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-2">
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Communication Log Dialog */}
      <Dialog open={openLogDialog} onOpenChange={setOpenLogDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Communication</DialogTitle>
            <DialogDescription>
              Record details about client interaction
            </DialogDescription>
          </DialogHeader>
          
          <Form {...logForm}>
            <form onSubmit={logForm.handleSubmit(onSubmitLog)} className="space-y-4 mt-1">
              <FormField
                control={logForm.control}
                name="communicationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select communication type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="call_made">
                          <div className="flex items-center">
                            <Phone className="mr-2 h-4 w-4" />
                            <span>Outbound Call</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="call_received">
                          <div className="flex items-center">
                            <Phone className="mr-2 h-4 w-4" />
                            <span>Inbound Call</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="email_sent">
                          <div className="flex items-center">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Email Sent</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="email_received">
                          <div className="flex items-center">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Email Received</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="meeting">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Meeting</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="internal_note">
                          <div className="flex items-center">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Internal Note</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={logForm.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Details of the communication..." 
                        className="resize-none h-28"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-2">
                <Button type="submit">Save Log</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 