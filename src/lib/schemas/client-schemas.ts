import { z } from 'zod';

export const clientStatusEnum = z.enum(['active', 'inactive', 'lead']);

export const createClientSchema = z.object({
  name: z.string().min(2, { message: 'Client name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zipCode: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  status: clientStatusEnum.default('active'),
  notes: z.string().optional().or(z.literal('')),
  website: z.string().url({ message: 'Invalid URL' }).optional().or(z.literal('')),
  industry: z.string().optional().or(z.literal('')),
  companySize: z.string().optional().or(z.literal('')),
  contactName: z.string().optional().or(z.literal('')),
  contactPosition: z.string().optional().or(z.literal('')),
  // agencyId is crucial but needs to be sourced. For now, schema expects a number.
  // In a real form, this might be a hidden input populated from user context or a select if multiple agencies are managed.
  agencyId: z.number({ required_error: 'Agency ID is required' }).int().positive(),
  // Slug will be derived from name, not directly in the form typically
  // slug: z.string().optional(), 
});

export type CreateClientFormValues = z.infer<typeof createClientSchema>; 