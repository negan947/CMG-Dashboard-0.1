import { useState } from 'react';
import { useTheme } from 'next-themes';
import { PlusCircle, Send, Phone, MessageSquare, Clock, CheckCircle2, Calendar, AlertCircle, Activity } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  useClientPulse,
  ClientPulseData,
  TaskFilter
} from '@/hooks/use-client-pulse';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TaskModel,
  CreateTaskInput,
  CreateCommunicationLogInput
} from '@/types/models.types';
import { toast } from 'sonner';

import { CommunicationLogForm } from './CommunicationLogForm';
import { FollowUpForm } from './FollowUpForm';

interface ClientPulseCardProps {
  clientId: number;
  agencyId: number;
  userId: string;
  projectId?: number;
  className?: string;
}

type EngagementHealth = 'healthy' | 'attention' | 'critical';

export function ClientPulseCard({ 
  clientId, 
  agencyId, 
  userId, 
  projectId,
  className 
}: ClientPulseCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [showLogForm, setShowLogForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  
  const clientPulse = useClientPulse(clientId, agencyId);
  
  const {
    communicationLogs,
    tasks
  } = clientPulse;

  // Calculate last contact summary
  const lastContact = communicationLogs
    .sort((a, b) => new Date(b.communicationTimestamp).getTime() - new Date(a.communicationTimestamp).getTime());

  const lastContactSummary = lastContact && lastContact.length > 0
    ? `Last contact was ${formatDistanceToNow(new Date(lastContact[0].communicationTimestamp), { addSuffix: true })}`
    : 'No recent contact';

  // Calculate next follow-up summary
  const nextFollowUp = tasks
    .filter(task => task.status !== 'completed' && task.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];

  const nextFollowUpSummary = nextFollowUp
    ? `Next follow-up is on ${format(new Date(nextFollowUp.dueDate!), 'MMM dd, yyyy')}`
    : 'No upcoming follow-ups';

  // Calculate upcoming tasks (tasks not completed and with a future or today due date)
  const upcomingTasks = tasks.filter(task => 
    task.status !== 'completed' && task.dueDate && new Date(task.dueDate) >= new Date()
  ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  // Calculate engagement health (simplified example)
  // This would need more complex logic based on frequency of contact, task completion, etc.
  const engagementHealth: EngagementHealth = upcomingTasks.length > 0 && upcomingTasks.some(task => new Date(task.dueDate!) < new Date()) ? 'critical' : (upcomingTasks.length > 0 ? 'attention' : 'healthy');

  const handleComplete = async (taskId: number) => {
    try {
      await clientPulse.handleComplete(taskId);
      toast.success('Follow-up marked as completed');
    } catch (error) {
      toast.error('Failed to complete follow-up');
    }
  };
  
  const handleSnooze = async (taskId: number, days: number) => {
    try {
      await clientPulse.handleSnooze(taskId, days);
      toast.success(`Follow-up snoozed for ${days} day${days > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to snooze follow-up');
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isDark ? "bg-zinc-900/70 backdrop-blur-lg border-zinc-800" : "bg-white/80 backdrop-blur-lg",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Client Pulse</span>
            {engagementHealth && (
              <HealthIndicator health={engagementHealth} />
            )}
          </div>
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setShowLogForm(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only">Log Interaction</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {clientPulse.error ? (
          <div className="p-4 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            {clientPulse.error}
          </div>
        ) : clientPulse.isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="mt-2 space-y-4">
              {/* Last Contact */}
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "p-2 rounded-full",
                  isDark ? "bg-zinc-800" : "bg-gray-100"
                )}>
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Last Contact</div>
                  <div className="text-sm text-muted-foreground">{lastContactSummary}</div>
                </div>
              </div>
              
              {/* Next Follow-up */}
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "p-2 rounded-full",
                  isDark ? "bg-zinc-800" : "bg-gray-100"
                )}>
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Next Follow-up</div>
                  <div className="text-sm text-muted-foreground">{nextFollowUpSummary}</div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowLogForm(true)}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  Log Interaction
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowFollowUpForm(true)}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" />
                  Schedule Follow-up
                </Button>
              </div>
              
              {/* Upcoming Follow-ups */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Upcoming Follow-ups</h4>
                {upcomingTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming follow-ups scheduled</p>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {upcomingTasks.map((task: TaskModel) => (
                        <FollowUpItem 
                          key={task.id} 
                          task={task} 
                          onComplete={handleComplete} 
                          onSnooze={handleSnooze} 
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Forms */}
            <AnimatePresence>
              {showLogForm && (
                <CommunicationLogFormModal 
                  clientPulse={clientPulse} 
                  onClose={() => setShowLogForm(false)} 
                  projectId={projectId}
                />
              )}
              {showFollowUpForm && (
                <FollowUpFormModal 
                  clientPulse={clientPulse} 
                  onClose={() => setShowFollowUpForm(false)} 
                  projectId={projectId}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Health Indicator Component
function HealthIndicator({ health }: { health: EngagementHealth }) {
  const colors = {
    healthy: "bg-green-500",
    attention: "bg-amber-500",
    critical: "bg-red-500"
  };
  
  const labels = {
    healthy: "Healthy",
    attention: "Needs Attention",
    critical: "Critical"
  };
  
  return (
    <div className="flex items-center">
      <motion.div 
        className={cn("h-2.5 w-2.5 rounded-full ml-2", colors[health])}
        animate={{ 
          scale: health === 'critical' ? [0.8, 1.2, 0.8] : 1,
          opacity: health === 'critical' ? [0.7, 1, 0.7] : 1 
        }}
        transition={{ 
          repeat: health === 'critical' ? Infinity : 0,
          duration: health === 'critical' ? 1.5 : 0
        }}
      />
      <Badge 
        variant="outline" 
        className={cn("ml-2 text-xs", 
          health === 'critical' ? 'text-red-500 border-red-500/30' : 
          health === 'attention' ? 'text-amber-500 border-amber-500/30' : 
          'text-green-500 border-green-500/30'
        )}
      >
        {labels[health]}
      </Badge>
    </div>
  );
}

// Follow-up Item Component
interface FollowUpItemProps {
  task: TaskModel;
  onComplete: (taskId: number) => Promise<void>;
  onSnooze: (taskId: number, days: number) => Promise<void>;
}

function FollowUpItem({ task, onComplete, onSnooze }: FollowUpItemProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  
  const getDueLabel = () => {
    if (!task.dueDate) return 'No due date';
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDate < today) return `Overdue! Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`;
    if (dueDate.getDate() === today.getDate() && 
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getFullYear() === today.getFullYear()) return 'Due today';
    if (dueDate.getDate() === tomorrow.getDate() &&
        dueDate.getMonth() === tomorrow.getMonth() &&
        dueDate.getFullYear() === tomorrow.getFullYear()) return 'Due tomorrow';
        
    return `Due ${format(dueDate, 'MMM d')}`;
  };
  
  const isCompleted = task.status === 'completed';
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-md p-3 relative overflow-hidden",
        isDark 
          ? "bg-zinc-800/50 hover:bg-zinc-800/80 transition-colors" 
          : "bg-gray-100/80 hover:bg-gray-100 transition-colors",
        isCompleted && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => !isCompleted && onComplete(task.id)}
            className={cn(
              "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
              isCompleted ? "bg-green-500 border-green-500 text-white" : 
              isDark ? "border-zinc-600 hover:border-primary" : "border-gray-300 hover:border-primary"
            )}
          >
            {isCompleted && <CheckCircle2 className="h-4 w-4" />}
          </button>
          
          <div className={cn(isCompleted && "line-through opacity-60")}>
            <div className="font-medium">{task.title}</div>
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 inline mr-1" />
              <span className={cn(
                isOverdue && !isCompleted && "text-red-500"
              )}>
                {getDueLabel()}
              </span>
            </div>
          </div>
        </div>
        
        {!isCompleted && (
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-full"
              onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
            >
              <Clock className="h-3 w-3" />
              <span className="sr-only">Snooze</span>
            </Button>
            
            {showSnoozeOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "absolute right-0 top-7 z-50 p-2 rounded-md shadow-lg w-32",
                  isDark ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-gray-200"
                )}
              >
                <div className="text-xs font-medium mb-1">Snooze for:</div>
                {[1, 3, 7].map(days => (
                  <Button
                    key={days}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-7 mb-1"
                    onClick={() => {
                      onSnooze(task.id, days);
                      setShowSnoozeOptions(false);
                    }}
                  >
                    {days} day{days > 1 ? 's' : ''}
                  </Button>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-4 mt-2">
      {[1, 2].map(i => (
        <div key={i} className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
      
      <div className="flex space-x-2 pt-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
      
      <div className="pt-2">
        <Skeleton className="h-5 w-36 mb-3" />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-14 w-full mb-2" />
        ))}
      </div>
    </div>
  );
}

// Communication Log Form Modal
interface ModalProps {
  clientPulse: ClientPulseData & {
    filteredTasks: TaskModel[];
    setActiveFilter: (filter: TaskFilter) => void;
    setSearchQuery: (query: string) => void;
    handleComplete: (taskId: number) => Promise<void>;
    handleSnooze: (taskId: number, days: number) => Promise<void>;
    createTask: (input: Omit<CreateTaskInput, 'agencyId' | 'createdByUserId' | 'projectId'>) => Promise<boolean>;
    logCommunication: (input: Omit<CreateCommunicationLogInput, 'agencyId' | 'createdByUserId' | 'clientId'>) => Promise<boolean>;
    fetchTasks: () => Promise<void>;
    fetchCommunicationLogs: () => Promise<void>;
  };
  onClose: () => void;
  projectId?: number;
}

function CommunicationLogFormModal({ clientPulse, onClose, projectId }: ModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className={cn(
          "w-full max-w-md rounded-lg p-6 shadow-2xl",
          isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white"
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Log Client Interaction</h2>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 rounded-full" 
            onClick={onClose}
          >
            ✕
          </Button>
        </div>
        
        <CommunicationLogForm 
          logCommunication={clientPulse.logCommunication}
          onSuccess={onClose} 
        />
      </motion.div>
    </motion.div>
  );
}

// Follow Up Form Modal
function FollowUpFormModal({ clientPulse, onClose, projectId }: ModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className={cn(
          "w-full max-w-md rounded-lg p-6 shadow-2xl",
          isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white"
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Schedule Follow-up</h2>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 rounded-full" 
            onClick={onClose}
          >
            ✕
          </Button>
        </div>
        
        <FollowUpForm 
          createTask={clientPulse.createTask}
          projects={clientPulse.projects}
          onSuccess={onClose} 
          projectId={projectId}
        />
      </motion.div>
    </motion.div>
  );
} 