'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Globe, MapPin, Briefcase, Building, FileText, CalendarDays, Layers, ListChecks, RotateCw, AlertTriangle, Inbox } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { ClientModel, ClientStatus, ProjectModel, ProjectStatus } from '@/types/models.types';
import { format } from 'date-fns';
import { ProjectService } from '@/services/ProjectService';

interface ClientDetailModalProps {
  client: ClientModel | null;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

const getInitials = (name: string = '') => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: 30, transition: { duration: 0.2, ease: 'easeIn' } },
};

type Tab = 'overview' | 'projects';

export function ClientDetailModal({
  client,
  isOpen,
  onClose,
  isDark,
}: ClientDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      setActiveTab('overview');
      setProjects([]);
      setProjectsError(null);
    } else {
      document.removeEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && activeTab === 'projects' && client && client.id) {
      const fetchProjects = async () => {
        setIsLoadingProjects(true);
        setProjectsError(null);
        try {
          const fetchedProjects = await ProjectService.getProjectsByClientId(client.id);
          setProjects(fetchedProjects);
        } catch (error) {
          console.error("Failed to fetch projects:", error);
          setProjectsError(error instanceof Error ? error.message : 'Could not load projects.');
        }
        setIsLoadingProjects(false);
      };
      fetchProjects();
    }
  }, [isOpen, activeTab, client]);

  if (!client) return null;

  const clientName = client.name || 'Unnamed Client';
  const clientStatus = client.status || ClientStatus.INACTIVE;

  const detailItemClass = cn("flex items-start space-x-3 p-3 rounded-lg", isDark ? "hover:bg-zinc-700/50" : "hover:bg-slate-100/70");
  const iconClass = cn("h-5 w-5 flex-shrink-0 mt-1", isDark ? "text-sky-400" : "text-sky-500");
  const labelClass = cn("text-xs font-medium", isDark ? "text-zinc-400" : "text-slate-500");
  const valueClass = cn("text-sm", isDark ? "text-zinc-100" : "text-slate-700");
  const sectionTitleClass = cn("text-sm font-semibold mb-3 uppercase tracking-wider", isDark ? "text-sky-400" : "text-sky-600");

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Contact Information */}
      <section>
        <h4 className={sectionTitleClass}>Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          {client.email && (
            <div className={detailItemClass}>
              <Mail className={iconClass} />
              <div>
                <p className={labelClass}>Email</p>
                <a href={`mailto:${client.email}`} className={cn(valueClass, isDark ? "hover:text-sky-300" : "hover:text-sky-500", "break-all")}>{client.email}</a>
              </div>
            </div>
          )}
          {client.phone && (
            <div className={detailItemClass}>
              <Phone className={iconClass} />
              <div>
                <p className={labelClass}>Phone</p>
                <p className={valueClass}>{client.phone}</p>
              </div>
            </div>
          )}
          {client.website && (
            <div className={detailItemClass}>
              <Globe className={iconClass} />
              <div>
                <p className={labelClass}>Website</p>
                <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noopener noreferrer" className={cn(valueClass, isDark ? "hover:text-sky-300" : "hover:text-sky-500", "break-all")}>
                  {client.website}
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Address Information */}
      {(client.address || client.city || client.state || client.country) && (
        <section>
          <h4 className={sectionTitleClass}>Address</h4>
          <div className={detailItemClass}>
            <MapPin className={iconClass} />
            <div>
              <p className={labelClass}>Location</p>
              <p className={valueClass}>
                {client.address && <span>{client.address}<br/></span>}
                {client.city && <span>{client.city}, </span>}
                {client.state && <span>{client.state} </span>}
                {client.zipCode && <span>{client.zipCode}<br/></span>}
                {client.country && <span>{client.country}</span>}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Company Information */}
      {(client.industry || client.companySize) && (
        <section>
          <h4 className={sectionTitleClass}>Company Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          {client.industry && (
            <div className={detailItemClass}>
              <Briefcase className={iconClass} />
              <div>
                <p className={labelClass}>Industry</p>
                <p className={valueClass}>{client.industry}</p>
              </div>
            </div>
          )}
          {client.companySize && (
            <div className={detailItemClass}>
              <Building className={iconClass} />
              <div>
                <p className={labelClass}>Company Size</p>
                <p className={valueClass}>{client.companySize}</p>
              </div>
            </div>
          )}
          </div>
        </section>
      )}
      
      {/* Contact Person */}
      {(client.contactName || client.contactPosition) && (
        <section>
          <h4 className={sectionTitleClass}>Key Contact</h4>
            <div className={detailItemClass}>
              <User className={iconClass} />
              <div>
                {client.contactName && <p className={valueClass}>{client.contactName}</p>}
                {client.contactPosition && <p className={cn(labelClass, "!mt-0")}>{client.contactPosition}</p>}
              </div>
            </div>
        </section>
      )}

      {/* Notes */}
      {client.notes && (
        <section>
          <h4 className={sectionTitleClass}>Notes</h4>
          <div className={cn(detailItemClass, "block")}>
            <FileText className={cn(iconClass, "float-left mr-3 !mt-0")} />
            <p className={cn(valueClass, "whitespace-pre-wrap")}>{client.notes}</p>
          </div>
        </section>
      )}
      
      {/* Timestamps */}
      <section>
        <h4 className={sectionTitleClass}>Record Timestamps</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          {client.createdAt && (
              <div className={detailItemClass}>
                  <CalendarDays className={iconClass} />
                  <div>
                      <p className={labelClass}>Created At</p>
                      <p className={valueClass}>{format(new Date(client.createdAt), "PPpp")}</p>
                  </div>
              </div>
          )}
          {client.updatedAt && (
              <div className={detailItemClass}>
                  <CalendarDays className={iconClass} />
                  <div>
                      <p className={labelClass}>Last Updated</p>
                      <p className={valueClass}>{format(new Date(client.updatedAt), "PPpp")}</p>
                  </div>
              </div>
          )}
          </div>
      </section>
    </div>
  );

  const renderProjectsTab = () => {
    if (isLoadingProjects) {
      return (
        <div className="flex flex-col items-center justify-center h-40 space-y-3">
          <RotateCw className={cn("h-8 w-8 animate-spin", isDark ? "text-sky-300" : "text-sky-500")} />
          <p className={cn(valueClass, isDark ? "text-zinc-300" : "text-slate-600")}>Loading projects...</p>
        </div>
      );
    }

    if (projectsError) {
      return (
        <div className={cn("flex flex-col items-center justify-center h-40 space-y-3 p-4 rounded-lg", isDark ? "bg-red-900/20" : "bg-red-50/70")}>
          <AlertTriangle className={cn("h-8 w-8", isDark ? "text-red-400" : "text-red-500")} />
          <p className={cn(valueClass, isDark ? "text-red-300" : "text-red-700", "text-center")}>Error: {projectsError}</p>
        </div>
      );
    }

    if (projects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-40 space-y-3">
          <Inbox className={cn("h-10 w-10", isDark ? "text-zinc-500" : "text-slate-400")} />
          <p className={cn(valueClass, isDark ? "text-zinc-400" : "text-slate-500")}>No projects found for this client.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {projects.map((project) => (
          <GlassCard 
            key={project.id} 
            className={cn("transition-all", isDark ? "border border-zinc-700/30" : "border border-slate-300/40")}
            contentClassName="p-4"
          >
            <h5 className={cn("font-semibold mb-1", valueClass)}>{project.name}</h5>
            {project.description && (
              <p className={cn("text-xs mb-2", isDark ? "text-zinc-400" : "text-slate-500", "line-clamp-2")}>
                {project.description}
              </p>
            )}
            <div className="flex items-center justify-between text-xs">
              <span 
                className={cn(
                    "px-1.5 py-0.5 font-medium rounded-full",
                    project.status === ProjectStatus.ACTIVE ? (isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600") :
                    project.status === ProjectStatus.COMPLETED ? (isDark ? "bg-sky-500/20 text-sky-400" : "bg-sky-100 text-sky-600") :
                    project.status === ProjectStatus.PLANNED ? (isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600") :
                    project.status === ProjectStatus.ON_HOLD ? (isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-600") :
                    (isDark ? "bg-zinc-600 text-zinc-300" : "bg-slate-200 text-slate-500")
                )}
              >
                {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Unknown'}
              </span>
              <span className={isDark ? "text-zinc-500" : "text-slate-400"}>
                Updated: {format(new Date(project.updatedAt), "MMM d, yyyy")}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    );
  };

  const TabButton: React.FC<{
    tabName: Tab;
    label: string;
    icon: React.ElementType;
  }> = ({ tabName, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={cn(
        "flex items-center space-x-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-150",
        activeTab === tabName
          ? (isDark ? "bg-sky-600/30 text-sky-300 shadow-sm" : "bg-sky-100 text-sky-700 shadow-sm")
          : (isDark ? "text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-200" : "text-slate-500 hover:bg-slate-200/70 hover:text-slate-700")
      )}
    >
      <Icon className={cn("h-4 w-4", activeTab === tabName && (isDark ? "text-sky-300" : "text-sky-600"))} />
      <span>{label}</span>
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-3xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard
              className="max-h-[90vh] flex flex-col shadow-2xl dark:shadow-sky-900/50"
            >
              {/* Header */}
              <div className={cn("flex items-center justify-between p-4 border-b", isDark ? "border-zinc-700" : "border-slate-200")}>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    {client.avatarUrl && <AvatarImage src={client.avatarUrl} alt={clientName} />}
                    <AvatarFallback className={cn(isDark ? "bg-sky-700 text-sky-100" : "bg-sky-100 text-sky-600", "text-xl")}>
                      {getInitials(clientName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className={cn("text-xl font-semibold", isDark ? "text-zinc-50" : "text-slate-800")}>
                      {clientName}
                    </h3>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded-full",
                        clientStatus === ClientStatus.ACTIVE ? (isDark ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700") :
                        clientStatus === ClientStatus.LEAD ? (isDark ? "bg-yellow-500/20 text-yellow-300" : "bg-yellow-100 text-yellow-700") :
                        (isDark ? "bg-zinc-600 text-zinc-300" : "bg-slate-200 text-slate-600")
                      )}
                    >
                      {clientStatus.charAt(0).toUpperCase() + clientStatus.slice(1)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDark ? "text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100" : "text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                  )}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className={cn("flex items-center space-x-2 p-3 border-b", isDark ? "border-zinc-700/60 bg-zinc-800/20" : "border-slate-200/70 bg-slate-50/50")}>
                <TabButton tabName="overview" label="Overview" icon={ListChecks} />
                <TabButton tabName="projects" label="Projects" icon={Layers} />
              </div>

              {/* Scrollable Content Area for Tabs */}
              <div className="p-6 overflow-y-auto">
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'projects' && renderProjectsTab()}
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 