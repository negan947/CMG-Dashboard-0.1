import { z } from 'zod';

/**
 * General app settings schema
 */
export const generalSettingsSchema = z.object({
  agency_name: z.string().min(2, { message: 'Agency name must be at least 2 characters' }).max(100),
  agency_email: z.string().email({ message: 'Please enter a valid email address' }),
  agency_logo_url: z.string().url().optional().nullable(),
  agency_website: z.string().url().optional().nullable(),
  agency_phone: z.string().max(20).optional(),
  default_currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).default('USD'),
  timezone: z.string().optional(),
  date_format: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  time_format: z.enum(['12h', '24h']).default('12h'),
});

/**
 * Billing settings schema
 */
export const billingSettingsSchema = z.object({
  billing_address: z.object({
    street: z.string().min(1, { message: 'Street is required' }),
    city: z.string().min(1, { message: 'City is required' }),
    state: z.string().optional(),
    postal_code: z.string().min(1, { message: 'Postal code is required' }),
    country: z.string().min(1, { message: 'Country is required' }),
  }),
  tax_id: z.string().optional(),
  default_payment_method: z.enum(['credit_card', 'wire_transfer', 'paypal']).default('credit_card'),
  auto_invoice: z.boolean().default(true),
  payment_terms: z.enum(['immediate', '15_days', '30_days', '60_days']).default('30_days'),
});

/**
 * Notification settings schema
 */
export const notificationSettingsSchema = z.object({
  email_notifications: z.object({
    new_client: z.boolean().default(true),
    invoice_paid: z.boolean().default(true),
    invoice_overdue: z.boolean().default(true),
    project_update: z.boolean().default(true),
    task_assigned: z.boolean().default(true),
    team_message: z.boolean().default(true),
  }),
  notification_emails: z.array(z.string().email()).optional(),
  send_weekly_summary: z.boolean().default(true),
  send_monthly_report: z.boolean().default(true),
});

/**
 * Team member schema
 */
export const teamMemberSchema = z.object({
  id: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  role: z.enum(['owner', 'admin', 'member', 'guest']).default('member'),
  can_manage_clients: z.boolean().default(false),
  can_manage_invoices: z.boolean().default(false),
  can_manage_team: z.boolean().default(false),
  can_access_reports: z.boolean().default(true),
});

/**
 * Team settings schema
 */
export const teamSettingsSchema = z.object({
  team_members: z.array(teamMemberSchema).optional(),
  invite_token_expiry_days: z.number().min(1).max(30).default(7),
  default_role: z.enum(['member', 'admin', 'guest']).default('member'),
});

/**
 * Security settings schema
 */
export const securitySettingsSchema = z.object({
  two_factor_authentication: z.boolean().default(false),
  session_timeout_minutes: z.number().min(5).max(1440).default(120), // Default 2 hours
  password_expiration_days: z.number().min(30).max(365).default(90), // Default 90 days
  failed_login_attempts: z.number().min(3).max(10).default(5),
  ip_restriction: z.array(z.string()).optional(),
  audit_logging: z.boolean().default(true),
});

/**
 * Integration settings schema
 */
export const integrationSettingsSchema = z.object({
  google_analytics_id: z.string().optional(),
  facebook_pixel_id: z.string().optional(),
  slack_webhook_url: z.string().url().optional().nullable(),
  zapier_webhook_url: z.string().url().optional().nullable(),
  google_calendar_sync: z.boolean().default(false),
  github_integration: z.boolean().default(false),
  api_key_enabled: z.boolean().default(false),
});

// Type exports
export type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;
export type BillingSettingsFormValues = z.infer<typeof billingSettingsSchema>;
export type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;
export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;
export type TeamSettingsFormValues = z.infer<typeof teamSettingsSchema>;
export type SecuritySettingsFormValues = z.infer<typeof securitySettingsSchema>;
export type IntegrationSettingsFormValues = z.infer<typeof integrationSettingsSchema>; 