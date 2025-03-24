import { z } from 'zod';

/**
 * Basic profile update schema
 */
export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(100).optional(),
  job_title: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  department: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  timezone: z.string().optional(),
  avatar_url: z.string().url({ message: 'Please enter a valid URL' }).optional().nullable(),
});

/**
 * Social links schema
 */
export const socialLinksSchema = z.object({
  linkedin: z.string().url({ message: 'Please enter a valid LinkedIn URL' }).optional().nullable(),
  twitter: z.string().url({ message: 'Please enter a valid Twitter URL' }).optional().nullable(),
  facebook: z.string().url({ message: 'Please enter a valid Facebook URL' }).optional().nullable(),
  instagram: z.string().url({ message: 'Please enter a valid Instagram URL' }).optional().nullable(),
  github: z.string().url({ message: 'Please enter a valid GitHub URL' }).optional().nullable(),
  website: z.string().url({ message: 'Please enter a valid website URL' }).optional().nullable(),
});

/**
 * User preferences schema
 */
export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.enum(['en', 'es', 'fr', 'de', 'it']).default('en'),
  date_format: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  time_format: z.enum(['12h', '24h']).default('12h'),
  email_notifications: z.boolean().default(true),
  push_notifications: z.boolean().default(true),
  project_notifications: z.boolean().default(true),
  task_notifications: z.boolean().default(true),
  client_notifications: z.boolean().default(true),
  team_notifications: z.boolean().default(true),
  dashboard_layout: z.enum(['grid', 'list']).default('grid'),
  login_notification: z.boolean().default(true),
});

/**
 * Password change schema
 */
export const passwordChangeSchema = z.object({
  current_password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  new_password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirm_password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

// Type exports
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
export type SocialLinksFormValues = z.infer<typeof socialLinksSchema>;
export type UserPreferencesFormValues = z.infer<typeof userPreferencesSchema>;
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>; 