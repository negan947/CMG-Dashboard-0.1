export const APP_ROUTES = {
  HOME: '/',
  
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  RESET_PASSWORD: '/auth/reset-password',
  UPDATE_PASSWORD: '/auth/update-password',
  AUTH_CALLBACK: '/auth/callback',

  // Dashboard
  DASHBOARD: '/dashboard',
  DASHBOARD_CLIENTS: '/dashboard/clients',
  DASHBOARD_PROJECTS: '/dashboard/projects',
  DASHBOARD_INVOICES: '/dashboard/invoices',
  DASHBOARD_PROFILE: '/dashboard/profile',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  // Add other specific dashboard or app routes here as needed
};

// Function to create dynamic routes if necessary, e.g., /dashboard/clients/[id]
export const createDynamicRoute = {
  dashboardClient: (clientId: string) => `${APP_ROUTES.DASHBOARD_CLIENTS}/${clientId}`,
  dashboardProject: (projectId: string) => `${APP_ROUTES.DASHBOARD_PROJECTS}/${projectId}`,
  dashboardInvoice: (invoiceId: string) => `${APP_ROUTES.DASHBOARD_INVOICES}/${invoiceId}`,
}; 