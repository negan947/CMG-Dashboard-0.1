import { createClient } from '@/lib/supabase';

/**
 * Creates test notifications for the specified user
 * This is for testing purposes only and should be removed in production
 * 
 * @param userId The UUID of the user to create notifications for
 * @param agencyId Optional agency ID to associate with the notifications
 */
export async function createTestNotifications(userId: string, agencyId?: number) {
  if (!userId) {
    console.error('User ID is required to create test notifications');
    return;
  }

  // Sample notification data
  const notifications = [
    {
      user_id: userId,
      agency_id: agencyId || null,
      title: 'Welcome to CMG Dashboard',
      content: 'Thanks for joining our platform. Get started by exploring your dashboard.',
      type: 'info',
      read: false
    },
    {
      user_id: userId,
      agency_id: agencyId || null,
      title: 'New Client Added',
      content: 'You have successfully added a new client to your account.',
      type: 'success',
      read: false
    },
    {
      user_id: userId,
      agency_id: agencyId || null,
      title: 'Invoice Due Soon',
      content: 'You have an invoice due in the next 3 days. Please review it.',
      type: 'warning',
      read: false
    },
    {
      user_id: userId,
      agency_id: agencyId || null,
      title: 'Task Assignment',
      content: 'You have been assigned a new task by your team leader.',
      type: 'info',
      read: false
    },
    {
      user_id: userId,
      agency_id: agencyId || null,
      title: 'System Maintenance',
      content: 'Scheduled maintenance will occur on Sunday at 2 AM UTC.',
      type: 'info',
      read: true
    }
  ];

  try {
    const supabase = createClient();
    
    // Insert notifications
    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();
    
    if (error) {
      console.error('Error creating test notifications:', error);
      return;
    }
    
    console.log('Test notifications created:', data);
    return data;
  } catch (err) {
    console.error('Error creating test notifications:', err);
  }
} 