import { UserRole } from './auth.types';

/**
 * Base model with common fields
 */
export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Agency model represents a marketing agency
 */
export interface Agency {
  id: string;
  name: string;
  slug?: string | null;
  logoUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  taxId: string | null;
  billingDetails: Record<string, any> | null;
  settings: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Agency Model type alias for database operations
 */
export type AgencyModel = Agency;

/**
 * Input type for creating a new agency
 */
export interface CreateAgencyInput {
  name: string;
  slug?: string;
}

/**
 * Input type for updating an agency
 */
export interface UpdateAgencyInput {
  id: number;
  name: string;
  slug?: string;
}

/**
 * Agency User model represents users belonging to an agency
 */
export interface AgencyUser {
  id: string;
  userId: string;
  agencyId: string;
  role: AgencyUserRole;
  status: AgencyUserStatus;
  invitationAcceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Agency User Role enum
 */
export enum AgencyUserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

/**
 * Agency User Status enum
 */
export enum AgencyUserStatus {
  ACTIVE = 'active',
  INVITED = 'invited',
  DISABLED = 'disabled',
}

/**
 * Client model represents a client or potential client of an agency
 */
export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  status: ClientStatus;
  notes: string | null;
  avatarUrl: string | null;
  website: string | null;
  industry: string | null;
  companySize: string | null;
  contactName: string | null;
  contactPosition: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Client Model type alias for database operations
 */
export type ClientModel = Client;

/**
 * Input type for creating a new client
 */
export interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  status?: ClientStatus;
  notes?: string;
  avatarUrl?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  contactName?: string;
  contactPosition?: string;
  agencyId?: number;
}

/**
 * Input type for updating a client
 */
export interface UpdateClientInput {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  status?: ClientStatus;
  notes?: string;
  avatarUrl?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  contactName?: string;
  contactPosition?: string;
}

/**
 * Client Status enum
 */
export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LEAD = 'lead',
}

/**
 * Project Status enum
 */
export enum ProjectStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Project model represents a project for a client
 */
export interface Project {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  clientId: string;
  agencyId?: string | null;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project Model type alias for database operations
 */
export type ProjectModel = Project;

/**
 * Input type for creating a new project
 */
export interface CreateProjectInput {
  name: string;
  slug?: string;
  description?: string;
  clientId: number;
  agencyId?: number;
  status?: ProjectStatus;
}

/**
 * Input type for updating a project
 */
export interface UpdateProjectInput {
  id: number;
  name?: string;
  slug?: string;
  description?: string;
  clientId?: number;
  agencyId?: number;
  status?: ProjectStatus;
}

/**
 * Invoice model represents an invoice issued to a client
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId: string | null;
  agencyId: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paymentDate: Date | null;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discountAmount: number;
  discountType: 'fixed' | 'percentage';
  totalAmount: number;
  notes: string | null;
  paymentMethod: string | null;
  footerText: string | null;
  createdByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  pdf_url: string | null;
  client?: ClientModel;
  items?: InvoiceItemModel[];
}

/**
 * Invoice Model type alias for database operations
 */
export type InvoiceModel = Invoice;

/**
 * Input type for creating a new invoice
 */
export interface CreateInvoiceInput {
  invoiceNumber?: string; // Optional, generated by the service if not provided
  clientId: number;
  projectId?: number | null;
  agencyId: number;
  status?: InvoiceStatus;
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string
  subtotal?: number;
  taxAmount?: number;
  taxRate?: number;
  discountAmount?: number;
  discountType?: 'fixed' | 'percentage';
  totalAmount?: number;
  notes?: string;
  footerText?: string;
  createdByUserId?: string;
}

/**
 * Input type for updating an invoice
 */
export interface UpdateInvoiceInput {
  id: number;
  clientId?: number;
  projectId?: number | null;
  status?: InvoiceStatus;
  issueDate?: string; // ISO date string
  dueDate?: string; // ISO date string
  paymentDate?: string | null; // ISO date string
  subtotal?: number;
  taxAmount?: number;
  taxRate?: number;
  discountAmount?: number;
  discountType?: 'fixed' | 'percentage';
  totalAmount?: number;
  notes?: string;
  paymentMethod?: string;
  footerText?: string;
}

/**
 * Invoice Status enum
 */
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

/**
 * Invoice Item model represents a line item on an invoice
 */
export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number | null;
  discountAmount: number | null;
  totalAmount: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Invoice Item Model type alias for database operations
 */
export type InvoiceItemModel = InvoiceItem;

/**
 * Input type for creating a new invoice item
 */
export interface CreateInvoiceItemInput {
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discountAmount?: number;
  totalAmount?: number; // Optional, calculated by the service if not provided
  sortOrder?: number;
}

/**
 * Input type for updating an invoice item
 */
export interface UpdateInvoiceItemInput {
  id: number;
  invoiceId: number; // Required to update the invoice totals
  description?: string;
  quantity?: number;
  unitPrice?: number;
  taxRate?: number;
  discountAmount?: number;
  totalAmount?: number; // Optional, calculated by the service if not provided
  sortOrder?: number;
}

/**
 * Database models with snake_case properties (as they would appear in Postgres)
 */
export namespace DbModels {
  export interface Agency {
    id: string;
    name: string;
    logo_url: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    country: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    tax_id: string | null;
    billing_details: Record<string, any> | null;
    settings: Record<string, any> | null;
    created_at: string;
    updated_at: string;
  }

  export interface AgencyUser {
    id: string;
    user_id: string;
    agency_id: string;
    role: string;
    status: string;
    invitation_accepted_at: string | null;
    created_at: string;
    updated_at: string;
  }

  export interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    country: string | null;
    status: string;
    notes: string | null;
    avatar_url: string | null;
    website: string | null;
    industry: string | null;
    company_size: string | null;
    contact_name: string | null;
    contact_position: string | null;
    created_at: string;
    updated_at: string;
  }

  export interface AgencyClient {
    id: string;
    agency_id: string;
    client_id: string;
    status: string;
    manager_id: string | null;
    created_at: string;
    updated_at: string;
  }

  export interface Project {
    id: string;
    name: string;
    description: string | null;
    client_id: string;
    agency_id: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
    budget: number | null;
    budget_currency: string | null;
    budget_type: string | null;
    estimated_hours: number | null;
    created_at: string;
    updated_at: string;
  }

  export interface Invoice {
    id: string;
    invoice_number: string;
    client_id: string;
    agency_id: string;
    project_id: string | null;
    status: string;
    issue_date: string;
    due_date: string;
    amount: number;
    currency: string;
    notes: string | null;
    paid_at: string | null;
    created_at: string;
    updated_at: string;
  }

  export interface InvoiceItem {
    id: string;
    invoice_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number | null;
    tax_amount: number | null;
    total_amount: number;
    created_at: string;
    updated_at: string;
  }
}

/**
 * Profile model
 */
export interface Profile extends BaseModel {
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  job_title?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  bio?: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    [key: string]: any;
  };
  skills?: string[];
}

// Communication Logs Types
export interface CommunicationLogModel {
  id: string;
  clientId: number;
  agencyId: number;
  communicationTimestamp: string;
  communicationType: 'email_sent' | 'email_received' | 'call_made' | 'call_received' | 'meeting' | 'internal_note';
  summary: string;
  createdByUserId: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunicationLogInput {
  clientId: number;
  agencyId: number;
  communicationType: 'email_sent' | 'email_received' | 'call_made' | 'call_received' | 'meeting' | 'internal_note';
  summary: string;
  createdByUserId: string;
  metadata?: any;
  communicationTimestamp?: string; // Optional, defaults to NOW()
}

export interface UpdateCommunicationLogInput {
  id: string;
  communicationType?: 'email_sent' | 'email_received' | 'call_made' | 'call_received' | 'meeting' | 'internal_note';
  summary?: string;
  metadata?: any;
  communicationTimestamp?: string;
}

// Task Types (incorporating agency_id and created_by_user_id)
export interface TaskModel {
  id: number;
  title: string;
  description?: string;
  projectId: number;
  assigneeId?: number;
  status: 'todo' | 'inprogress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  agencyId?: number;
  createdByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: number;
  assigneeId?: number;
  status?: 'todo' | 'inprogress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  agencyId?: number;
  createdByUserId?: string;
}

export interface UpdateTaskInput {
  id: number;
  title?: string;
  description?: string;
  projectId?: number;
  assigneeId?: number;
  status?: 'todo' | 'inprogress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  agencyId?: number;
} 