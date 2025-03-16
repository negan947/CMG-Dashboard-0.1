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
 * Client model represents a client of an agency
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
 * Client Status enum
 */
export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LEAD = 'lead',
}

/**
 * Agency Client relationship model
 */
export interface AgencyClient {
  id: string;
  agencyId: string;
  clientId: string;
  status: ClientStatus;
  managerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project model represents a project for a client
 */
export interface Project {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  agencyId: string;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  budget: number | null;
  budgetCurrency: string | null;
  budgetType: BudgetType | null;
  estimatedHours: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project Status enum
 */
export enum ProjectStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

/**
 * Budget Type enum
 */
export enum BudgetType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
}

/**
 * Invoice model
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  agencyId: string;
  projectId: string | null;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  amount: number;
  currency: string;
  notes: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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
 * Invoice Item model
 */
export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number | null;
  taxAmount: number | null;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
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