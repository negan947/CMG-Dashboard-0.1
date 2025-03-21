import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

interface SupportRequest {
  id: string;
  client: string;
  time: string;
  type: string;
  subtype: string;
  status: "Completed" | "Not Completed";
  icon: React.ReactNode;
}

export function SupportRequestsCard() {
  const { theme } = useTheme();
  const isDark = theme !== "light";

  // Sample support requests data based on the screenshot
  const supportRequests: SupportRequest[] = [
    {
      id: "1",
      client: "Enayati SA",
      time: "Yesterday, 2:00 PM",
      type: "Invoice",
      subtype: "Issue",
      status: "Not Completed",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-md bg-slate-800 text-white">
          <svg width="10" height="10" className="sm:w-10 sm:h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.99988V4.99988M12 8.99988V16.9999M12 20.9999V18.9999M21 12.9999H19M16 12.9999H8M5 12.9999H3" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      ),
    },
    {
      id: "2",
      client: "Alfredo Torres",
      time: "Yesterday, 10:00 AM",
      type: "Budget",
      subtype: "Raise",
      status: "Completed",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-md bg-slate-800 text-white">
          <svg width="10" height="10" className="sm:w-10 sm:h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 10.9999C20 15.4183 16.4183 18.9999 12 18.9999C7.58172 18.9999 4 15.4183 4 10.9999C4 6.58163 7.58172 2.99988 12 2.99988C16.4183 2.99988 20 6.58163 20 10.9999Z" 
                  stroke="currentColor" strokeWidth="2"/>
            <path d="M10.1667 9C10.0313 9 9.90104 9.05268 9.80415 9.14645C9.70726 9.24022 9.65278 9.36739 9.65278 9.5C9.65278 9.63261 9.70726 9.75978 9.80415 9.85355C9.90104 9.94732 10.0313 10 10.1667 10H13.8333C13.9688 10 14.099 9.94732 14.1958 9.85355C14.2927 9.75978 14.3472 9.63261 14.3472 9.5C14.3472 9.36739 14.2927 9.24022 14.1958 9.14645C14.099 9.05268 13.9688 9 13.8333 9H10.1667Z" 
                  fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
            <path d="M10.1667 12C10.0313 12 9.90104 12.0527 9.80415 12.1464C9.70726 12.2402 9.65278 12.3674 9.65278 12.5C9.65278 12.6326 9.70726 12.7598 9.80415 12.8536C9.90104 12.9473 10.0313 13 10.1667 13H13.8333C13.9688 13 14.099 12.9473 14.1958 12.8536C14.2927 12.7598 14.3472 12.6326 14.3472 12.5C14.3472 12.3674 14.2927 12.2402 14.1958 12.1464C14.099 12.0527 13.9688 12 13.8333 12H10.1667Z" 
                  fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
          </svg>
        </div>
      ),
    },
    {
      id: "3",
      client: "Decathlon",
      time: "Yesterday, 4:00 AM",
      type: "Payment",
      subtype: "META",
      status: "Completed",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-md bg-slate-800 text-white">
          <svg width="10" height="10" className="sm:w-10 sm:h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 10.9999C20 15.4183 16.4183 18.9999 12 18.9999C7.58172 18.9999 4 15.4183 4 10.9999C4 6.58163 7.58172 2.99988 12 2.99988C16.4183 2.99988 20 6.58163 20 10.9999Z" 
                  stroke="currentColor" strokeWidth="2"/>
            <path d="M10.1667 9C10.0313 9 9.90104 9.05268 9.80415 9.14645C9.70726 9.24022 9.65278 9.36739 9.65278 9.5C9.65278 9.63261 9.70726 9.75978 9.80415 9.85355C9.90104 9.94732 10.0313 10 10.1667 10H13.8333C13.9688 10 14.099 9.94732 14.1958 9.85355C14.2927 9.75978 14.3472 9.63261 14.3472 9.5C14.3472 9.36739 14.2927 9.24022 14.1958 9.14645C14.099 9.05268 13.9688 9 13.8333 9H10.1667Z" 
                  fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
            <path d="M10.1667 12C10.0313 12 9.90104 12.0527 9.80415 12.1464C9.70726 12.2402 9.65278 12.3674 9.65278 12.5C9.65278 12.6326 9.70726 12.7598 9.80415 12.8536C9.90104 12.9473 10.0313 13 10.1667 13H13.8333C13.9688 13 14.099 12.9473 14.1958 12.8536C14.2927 12.7598 14.3472 12.6326 14.3472 12.5C14.3472 12.3674 14.2927 12.2402 14.1958 12.1464C14.099 12.0527 13.9688 12 13.8333 12H10.1667Z" 
                  fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
          </svg>
        </div>
      ),
    },
    {
      id: "4",
      client: "Pompe.ro",
      time: "1 Month Ago, 4:00 PM",
      type: "Subscription",
      subtype: "Transfer",
      status: "Not Completed",
      icon: (
        <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-md bg-slate-800 text-white">
          <svg width="10" height="10" className="sm:w-10 sm:h-10 md:w-14 md:h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ),
    },
  ];

  return (
    <GlassCard className="h-full">
      <div className="p-1.5 sm:p-2.5 md:p-4">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
          <h3 className={cn(
            "text-[10px] sm:text-sm md:text-base font-semibold",
            isDark ? "text-zinc-100" : "text-gray-800"
          )}>
            Support Requests
          </h3>
          <button 
            className={cn(
              "rounded-full p-0.5 sm:p-1 transition-colors",
              isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
            )}
            aria-label="More options"
          >
            <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>

        <div className="space-y-1 sm:space-y-2 md:space-y-3">
          {supportRequests.map((request) => (
            <div 
              key={request.id} 
              className={cn(
                "flex items-center p-1 sm:p-1.5 md:p-2 rounded-lg transition-colors",
                isDark ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"
              )}
            >
              <div className="flex items-center flex-1 min-w-0 space-x-1 sm:space-x-2 md:space-x-3">
                {request.icon}
                <div className="min-w-0 flex-shrink">
                  <h4 className={cn(
                    "text-[9px] sm:text-xs md:text-sm font-medium truncate",
                    isDark ? "text-zinc-200" : "text-gray-800"
                  )}>
                    {request.client}
                  </h4>
                  <p className={cn(
                    "text-[7px] sm:text-[10px] md:text-xs truncate",
                    isDark ? "text-zinc-400" : "text-gray-500"
                  )}>
                    {request.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center ml-1.5 mr-0.5 sm:ml-2 sm:mr-1">
                <div className="text-right">
                  <div className={cn(
                    "text-[9px] sm:text-xs md:text-sm font-medium",
                    isDark ? "text-zinc-300" : "text-gray-700"
                  )}>
                    {request.type}
                  </div>
                  <div className={cn(
                    "text-[7px] sm:text-[10px] md:text-xs",
                    isDark ? "text-zinc-400" : "text-gray-500"
                  )}>
                    {request.subtype}
                  </div>
                </div>
              </div>
              
              <div className={cn(
                "text-[9px] sm:text-xs md:text-sm font-medium text-right ml-0.5 sm:ml-1 min-w-[65px] sm:min-w-[80px]",
                request.status === "Completed" 
                  ? "text-green-500" 
                  : "text-red-500"
              )}>
                {request.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
} 