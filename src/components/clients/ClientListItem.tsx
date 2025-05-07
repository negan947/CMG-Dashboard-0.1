'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChevronRight, Facebook, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

// Assuming Client type is defined elsewhere and imported, or define inline for now if not globally available
// For now, let's copy the interface here. Ideally, it should be in types/models.types.ts or similar
interface Platform {
  name: string;
  stats: string; // This was in the original, but not directly used in the list item display for detailed stats
}

interface Client {
  id: string;
  name: string;
  status: string;
  initials: string;
  progress: number;
  platforms: Platform[];
}

interface ClientListItemProps {
  client: Client;
  isDark: boolean;
  onClick: (client: Client) => void;
  index: number; // For stagger animation delay
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05, // Stagger delay
      duration: 0.3,
      ease: "easeOut"
    }
  })
};

export function ClientListItem({ client, isDark, onClick, index }: ClientListItemProps) {
  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      layout
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <GlassCard 
        key={client.id}
        contentClassName="p-4 cursor-pointer transition-all duration-200"
        onClick={() => onClick(client)}
        color="dynamic"
        baseColor={isDark ? [30, 35, 60] : [230, 235, 250]}
        glowOpacity={0.08}
        className="overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback className={cn(
                isDark ? "bg-zinc-700 text-zinc-200" : "bg-blue-100 text-blue-600"
              )}>
                {client.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className={cn("font-semibold", isDark ? "text-zinc-100" : "text-gray-800")}>
                {client.name}
              </h4>
              <p className={cn("text-xs", isDark ? "text-zinc-400" : "text-gray-500")}>
                {client.status}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-right mr-3">
              <div className={cn(
                "w-20 h-1.5 rounded-full overflow-hidden mb-1",
                isDark ? "bg-zinc-700" : "bg-gray-200"
              )}>
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
                  style={{ width: `${client.progress}%` }}
                ></div>
              </div>
              <span className={cn("text-xs font-medium", isDark ? "text-zinc-300" : "text-gray-600")}>
                {client.progress}%
              </span>
            </div>
            <ChevronRight className={cn("h-5 w-5", isDark ? "text-zinc-500" : "text-gray-400")} />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-dashed">
          <div className="flex items-center justify-between text-xs">
            {client.platforms.map((platform, idx) => (
              <div key={idx} className={cn("flex items-center", isDark ? "text-zinc-400" : "text-gray-500")}>
                {platform.name === 'META' && <Facebook className="h-3.5 w-3.5 mr-1 text-blue-500" />}
                {platform.name === 'Google' && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-1 text-red-500"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.5,18.33 21.5,12.33C21.5,11.76 21.45,11.43 21.35,11.1Z"></path></svg>}
                {platform.name === 'TikTok' && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 mr-1 text-black dark:text-white"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>}
                <span className="font-medium mr-0.5 whitespace-nowrap">{platform.name}:</span>
                <TrendingUp className={cn("h-3 w-3 ml-auto", client.progress > 75 ? "text-green-500" : client.progress > 40 ? "text-yellow-500" : "text-red-500")} />
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
} 