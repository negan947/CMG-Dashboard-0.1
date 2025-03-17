'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Info, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function AdminNotificationsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [link, setLink] = useState('');
  const [isRead, setIsRead] = useState(false);
  const [agencyId, setAgencyId] = useState<string>('none');
  const [agencies, setAgencies] = useState<{id: number, name: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [allUsers, setAllUsers] = useState<{ id: string; email: string }[]>([]);
  
  useEffect(() => {
    // Get current user and agencies
    const fetchData = async () => {
      setIsLoading(true);
      const supabase = createClient();
      
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          toast.error('Could not verify your identity. You may need to log in again.');
          setIsLoading(false);
          return;
        }

        if (!user) {
          console.warn('No user found');
          toast.error('You need to be logged in to access this page');
          setIsLoading(false);
          return;
        }
        
        setCurrentUser(user);
        setSelectedUserId(user.id); // Default to current user
        
        console.log('Current user:', user);
        
        // FORCE FETCHING USERS REGARDLESS OF ADMIN STATUS FOR DEBUGGING
        try {
          console.log('Attempting to fetch all users...');
          // Directly use the RPC function to get users
          const { data: userData, error: usersError } = await supabase
            .rpc('get_all_users');
          
          console.log('RPC response:', { userData, usersError });
            
          if (usersError) {
            console.error('Error fetching users:', usersError);
            // Fallback to just the current user
            setAllUsers([{ id: user.id, email: user.email || 'Current User' }]);
          } else if (userData && userData.length > 0) {
            console.log('Users fetched successfully:', userData.length, userData);
            setAllUsers(userData);
          } else {
            console.log('No users returned from function');
            // Fallback to just the current user if no data
            setAllUsers([{ id: user.id, email: user.email || 'Current User' }]);
          }
        } catch (err) {
          console.error('Failed to fetch users:', err);
          // Fallback to just current user
          setAllUsers([{ id: user.id, email: user.email || 'Current User' }]);
        }
        
        // Get agencies
        const { data: agencyData, error: agencyError } = await supabase
          .from('agencies')
          .select('id, name')
          .order('name');
        
        if (agencyError) {
          console.error('Error fetching agencies:', agencyError);
          toast.error('Could not load agencies');
        } else {
          setAgencies(agencyData || []);
        }
      } catch (error) {
        console.error('Error in initialization:', error);
        toast.error('An error occurred while loading the page');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Debug: Log when allUsers changes
  useEffect(() => {
    console.log('All users state updated:', allUsers);
  }, [allUsers]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('You must be logged in to create notifications');
      return;
    }
    
    if (!title || !content) {
      toast.error('Title and content are required');
      return;
    }
    
    // Use the selected user or default to current user
    const targetUserId = selectedUserId || currentUser.id;
    
    setIsSubmitting(true);
    
    try {
      // Check if creating for current user or another user
      if (targetUserId === currentUser.id) {
        // Creating for the current user - use direct Supabase client
        const supabase = createClient();
        
        const notificationData = {
          user_id: targetUserId,
          agency_id: (agencyId && agencyId !== 'none') ? parseInt(agencyId) : null,
          title,
          content,
          type,
          link: link || null,
          read: isRead,
        };
        
        console.log('Creating notification for self:', notificationData);
        
        const { data, error } = await supabase
          .from('notifications')
          .insert(notificationData)
          .select();
        
        if (error) {
          console.error('Error creating notification:', error);
          throw error;
        }
      } else {
        // Creating for another user - use the admin API endpoint
        const notificationData = {
          user_id: targetUserId,
          agency_id: (agencyId && agencyId !== 'none') ? parseInt(agencyId) : null,
          title,
          content,
          type,
          link: link || null,
          read: isRead,
        };
        
        console.log('Creating notification for other user:', notificationData);
        
        const response = await fetch('/api/admin/create-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notificationData),
          credentials: 'include', // Include cookies with the request
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error from API:', errorData);
          throw new Error(errorData.error || 'Failed to create notification');
        }
      }
      
      toast.success('Notification created successfully!');
      
      // Reset form
      setTitle('');
      setContent('');
      setType('info');
      setLink('');
      setIsRead(false);
      setAgencyId('none');
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to create notification. You might not have permission.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }
  
  // Not logged in state
  if (!currentUser) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto text-center p-6 border rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-6">You need to be logged in to use this feature.</p>
          <Button 
            onClick={() => window.location.href = '/auth/login'}
            className="w-full"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }
  
  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Admin: Create Notification</h1>
        <p className="text-muted-foreground mb-8">
          Create notifications for any user in the system
        </p>
        
        {/* Notification Preview */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Preview</h2>
          <div className={`flex gap-3 p-4 border rounded-lg ${
            isDark 
              ? 'bg-zinc-800/40 border-zinc-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="shrink-0 mt-0.5">
              {getTypeIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">
                  {title || 'Notification Title'}
                </p>
                <div className="text-xs text-gray-500">
                  just now
                </div>
              </div>
              <p className="text-sm mt-1">
                {content || 'Notification content will appear here...'}
              </p>
              {link && (
                <div className="text-xs text-blue-500 mt-1">
                  View details →
                </div>
              )}
            </div>
            {!isRead && (
              <div className="shrink-0 self-center">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              </div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New Client Added"
              required
            />
          </div>
          
          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="A new client has been added to your account."
              rows={3}
              required
            />
          </div>
          
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select 
              value={type} 
              onValueChange={(value) => setType(value as any)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select notification type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span>Info</span>
                  </div>
                </SelectItem>
                <SelectItem value="success">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Success</span>
                  </div>
                </SelectItem>
                <SelectItem value="warning">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Warning</span>
                  </div>
                </SelectItem>
                <SelectItem value="error">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span>Error</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="link">Link (optional)</Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/dashboard/clients/123"
            />
          </div>
          
          {/* Is Read */}
          <div className="flex items-center space-x-2">
            <Switch 
              id="is-read" 
              checked={isRead} 
              onCheckedChange={setIsRead} 
            />
            <Label htmlFor="is-read">Mark as read</Label>
          </div>
          
          {/* Agency */}
          <div className="space-y-2">
            <Label htmlFor="agency">Agency (optional)</Label>
            <Select 
              value={agencyId} 
              onValueChange={setAgencyId}
            >
              <SelectTrigger id="agency">
                <SelectValue placeholder="Select agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {agencies.map((agency) => (
                  <SelectItem key={agency.id} value={agency.id.toString()}>
                    {agency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Target User */}
          <div className="space-y-2">
            <Label htmlFor="target-user">Target User</Label>
            <Select 
              value={selectedUserId} 
              onValueChange={setSelectedUserId}
            >
              <SelectTrigger id="target-user">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={currentUser?.id}>
                  Current user ({currentUser?.email})
                </SelectItem>
                {allUsers.length > 1 && (
                  <>
                    <SelectItem value="all-users" disabled>
                      ---- Other Users ----
                    </SelectItem>
                    {allUsers
                      .filter(u => u.id !== currentUser?.id)
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.email}
                        </SelectItem>
                      ))}
                  </>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Select which user will receive this notification
            </p>
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Notification'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 