'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';

export function TestNotificationsButton() {
  const [isLoading, setIsLoading] = useState(false);
  
  const createTestNotifications = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/notifications/create-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create test notifications');
      }
      
      toast.success(`Created ${data.count} test notifications!`, {
        description: 'Check the notification bell icon in the top bar.',
      });
    } catch (error) {
      console.error('Error creating test notifications:', error);
      toast.error('Failed to create test notifications');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={createTestNotifications}
      disabled={isLoading}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Bell className="h-4 w-4" />
      {isLoading ? 'Creating...' : 'Create Test Notifications'}
    </Button>
  );
} 