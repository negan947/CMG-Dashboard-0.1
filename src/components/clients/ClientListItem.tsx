'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ClientModel, ClientStatus } from '@/types/models.types';

interface Client extends ClientModel {
  initials: string;
}

interface ClientListItemProps {
  client: Client;
  isDark: boolean;
  onClick: (client: Client) => void;
  index: number;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut"
    }
  })
};

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

export function ClientListItem({ client, isDark, onClick, index }: ClientListItemProps) {
  const clientName = client.name || 'Unnamed Client';
  const clientStatus = client.status || ClientStatus.INACTIVE;

  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      layout
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="group"
    >
      <GlassCard 
        key={client.id}
        contentClassName="p-4 cursor-pointer transition-all duration-200"
        onClick={() => onClick(client)}
        className={cn("overflow-hidden", isDark ? "border border-zinc-700/30" : "border border-slate-300/50")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
              <AvatarFallback className={cn(
                isDark ? "bg-zinc-600 text-zinc-200" : "bg-blue-100 text-blue-600",
                "group-hover:bg-sky-500/20 group-hover:text-sky-500 dark:group-hover:bg-sky-500/20 dark:group-hover:text-sky-300 transition-colors duration-150"
              )}>
                {client.initials || getInitials(clientName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h4 className={cn(
                "font-semibold truncate", 
                isDark ? "text-zinc-100" : "text-gray-800",
                "group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-150"
              )}>
                {clientName}
              </h4>
              <div>
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-xs font-medium rounded-full inline-block mt-1",
                    clientStatus === ClientStatus.ACTIVE ? (isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700") :
                    clientStatus === ClientStatus.LEAD ? (isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-700") :
                    (isDark ? "bg-zinc-600 text-zinc-400" : "bg-slate-200 text-slate-600")
                  )}
                >
                  {clientStatus.charAt(0).toUpperCase() + clientStatus.slice(1)}
                </span>
                {client.contactName && (
                  <p className={cn("text-xs truncate mt-1", isDark ? "text-zinc-400 group-hover:text-sky-500" : "text-slate-500 group-hover:text-sky-600")}>
                    Contact: {client.contactName}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center ml-2">
            <ChevronRight className={cn(
                "h-5 w-5 flex-shrink-0", 
                isDark ? "text-zinc-500" : "text-gray-400",
                "group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-150"
            )} />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
} 