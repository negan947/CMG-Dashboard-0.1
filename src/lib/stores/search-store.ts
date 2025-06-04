import { create } from 'zustand';
import { availableWidgets } from '@/components/dashboard/widgets/registry';
import { DashboardService } from '@/services/dashboard-service';
import { ClientService } from '@/services/client-service';
import { InvoiceService } from '@/services/invoice-service';
import { ProjectService } from '@/services/project-service';
import { ClientModel, InvoiceModel, ProjectModel } from '@/types/models.types';
import { AnalyticsService } from '@/services/analytics-service';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'widget' | 'page' | 'client' | 'invoice' | 'project';
  url: string;
  category: string;
  iconName?: string;
  metadata?: Record<string, any>;
}

// Define interfaces for search results that may have mixed casing due to different data sources
interface InvoiceSearchResult {
  id: number;
  status: string;
  // Properties in camelCase (from Model)
  invoiceNumber?: string;
  totalAmount?: number;
  clientName?: string;
  // Properties in snake_case (from raw queries)
  invoice_number?: string;
  total_amount?: number;
  client_name?: string;
}

interface ProjectSearchResult {
  id: number;
  name: string;
  status: string;
  // Properties in camelCase (from Model)
  clientId?: number;
  // Properties in snake_case (from raw queries)
  client_id?: number;
  client_name?: string;
}

interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  isOpen: boolean;
  setQuery: (query: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  search: () => Promise<void>;
  clearResults: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  isSearching: false,
  isOpen: false,
  
  setQuery: (query) => set({ query }),
  
  setIsOpen: (isOpen) => set({ isOpen }),
  
  search: async () => {
    const { query } = get();
    
    if (!query || query.length < 2) {
      set({ results: [] });
      return;
    }
    
    set({ isSearching: true });
    
    try {
      // Gather search results from different sources
      const results: SearchResult[] = [];
      
      // 1. Search dashboard widgets from registry
      const widgetResults = Object.values(availableWidgets).map(widget => ({
        id: `widget-${widget.id}`,
        title: widget.name,
        description: widget.description,
        type: 'widget' as const,
        url: '/dashboard', // Base URL for dashboard
        category: 'Dashboard Widget',
        iconName: getIconForWidgetType(widget.id),
        metadata: { widgetType: widget.id }
      })).filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.description.toLowerCase().includes(query.toLowerCase())
      );
      
      results.push(...widgetResults);
      
      // 2. Search main pages
      const pageResults = [
        {
          id: 'page-dashboard',
          title: 'Dashboard',
          description: 'View your main dashboard',
          type: 'page' as const,
          url: '/dashboard',
          category: 'Pages',
          iconName: 'LayoutDashboard'
        },
        {
          id: 'page-clients',
          title: 'Clients',
          description: 'Manage your clients',
          type: 'page' as const,
          url: '/dashboard/clients',
          category: 'Pages',
          iconName: 'Users'
        },
        {
          id: 'page-invoices',
          title: 'Invoices',
          description: 'Manage your invoices',
          type: 'page' as const,
          url: '/dashboard/invoices',
          category: 'Pages',
          iconName: 'FileText'
        },
        {
          id: 'page-settings',
          title: 'Settings',
          description: 'Adjust your account settings',
          type: 'page' as const,
          url: '/dashboard/settings',
          category: 'Pages',
          iconName: 'Settings'
        },
        {
          id: 'page-profile',
          title: 'Profile',
          description: 'Edit your profile information',
          type: 'page' as const,
          url: '/dashboard/profile',
          category: 'Pages',
          iconName: 'User'
        },
        {
          id: 'page-analytics',
          title: 'Analytics',
          description: 'View performance analytics',
          type: 'page' as const,
          url: '/dashboard/analytics',
          category: 'Pages',
          iconName: 'BarChart'
        },
        {
          id: 'page-platforms',
          title: 'Platforms',
          description: 'Manage connected platforms',
          type: 'page' as const,
          url: '/dashboard/platforms',
          category: 'Pages',
          iconName: 'Globe'
        },
        {
          id: 'page-support',
          title: 'Support',
          description: 'Get help and support',
          type: 'page' as const,
          url: '/dashboard/support',
          category: 'Pages',
          iconName: 'HelpCircle'
        }
      ].filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.description.toLowerCase().includes(query.toLowerCase())
      );
      
      results.push(...pageResults);
      
      // 3. If user has widgets, search through those
      try {
        const dashboardService = DashboardService.getInstance();
        const userData = JSON.parse(localStorage.getItem('auth-store') || '{}');
        const userId = userData?.state?.user?.id;
        
        if (userId) {
          const userWidgets = await dashboardService.getUserDashboardWidgets(userId);
          
          // Only include user widgets that match the search
          const userWidgetResults = userWidgets
            .filter(widget => 
              widget.config.title?.toLowerCase().includes(query.toLowerCase())
            )
            .map(widget => {
              const widgetDef = availableWidgets[widget.type];
              return {
                id: `user-widget-${widget.id}`,
                title: widget.config.title || widgetDef?.name || 'Unnamed Widget',
                description: `Your ${widgetDef?.name || ''} widget`,
                type: 'widget' as const,
                url: '/dashboard',
                category: 'Your Widgets',
                iconName: getIconForWidgetType(widget.type),
                metadata: { 
                  widgetId: widget.id,
                  widgetType: widget.type
                }
              };
            });
          
          results.push(...userWidgetResults);
        }
      } catch (error) {
        console.error('Error fetching user widgets for search:', error);
      }
      
      // 4. Search clients
      try {
        const clientService = ClientService.getInstance();
        const clients = await clientService.searchClients(query);
        
        if (clients && clients.length > 0) {
          const clientResults: SearchResult[] = clients.map((client: ClientModel) => ({
            id: `client-${client.id}`,
            title: client.name,
            description: client.contactName ? `Contact: ${client.contactName}` : client.email || 'Client',
            type: 'client' as const,
            url: `/dashboard/clients/${client.id}`,
            category: 'Clients',
            iconName: 'Building',
            metadata: { clientId: client.id }
          }));
          
          results.push(...clientResults);
        }
      } catch (error) {
        console.error('Error searching clients:', error);
      }
      
      // 5. Search invoices
      try {
        const invoiceService = InvoiceService.getInstance();
        const invoices = await invoiceService.searchInvoices(query);
        
        if (invoices && invoices.length > 0) {
          const invoiceResults: SearchResult[] = invoices.map((invoice: any) => {
            // Get the invoice number using either camelCase or snake_case property
            const invoiceNumber = invoice.invoiceNumber || invoice.invoice_number || 'Unknown';
            // Get amount using either property naming convention
            const amount = invoice.totalAmount || invoice.total_amount || 0;
            // Get client name using either property
            const clientName = invoice.clientName || invoice.client_name || 'Client';
            
            return {
              id: `invoice-${invoice.id}`,
              title: `Invoice #${invoiceNumber}`,
              description: `${clientName} - ${invoice.status} - $${amount}`,
              type: 'invoice' as const,
              url: `/dashboard/invoices/${invoice.id}`,
              category: 'Invoices',
              iconName: 'FileText',
              metadata: { invoiceId: invoice.id }
            };
          });
          
          results.push(...invoiceResults);
        }
      } catch (error) {
        console.error('Error searching invoices:', error);
      }
      
      // 6. Search projects
      try {
        const projectService = ProjectService.getInstance();
        const projects = await projectService.searchProjects(query);
        
        if (projects && projects.length > 0) {
          const projectResults: SearchResult[] = projects.map((project: any) => {
            // Get client ID using either camelCase or snake_case property
            const clientId = project.clientId || project.client_id || 0;
            // Get client name using either naming convention
            const clientName = project.client_name || 'Client';
            
            return {
              id: `project-${project.id}`,
              title: project.name,
              description: `${clientName} - ${project.status}`,
              type: 'project' as const,
              url: `/dashboard/clients/${clientId}?tab=projects&project=${project.id}`,
              category: 'Projects',
              iconName: 'Briefcase',
              metadata: { projectId: project.id, clientId }
            };
          });
          
          results.push(...projectResults);
        }
      } catch (error) {
        console.error('Error searching projects:', error);
      }
      
      // Add a new section to search analytics metrics specifically for engagement-related terms
      try {
        if (query.toLowerCase().includes('engagement') || 
            query.toLowerCase().includes('conversion') || 
            query.toLowerCase().includes('performance') ||
            query.toLowerCase().includes('analytics')) {
          
          const analyticsService = AnalyticsService.getInstance();
          
          // Add analytics page result
          results.push({
            id: 'page-analytics-dashboard',
            title: 'Analytics Dashboard',
            description: 'View performance metrics and trends',
            type: 'page' as const,
            url: '/dashboard/analytics',
            category: 'Analytics',
            iconName: 'BarChart3'
          });
          
          // Add relevant metrics from analytics
          const metrics = await analyticsService.getMetrics();
          
          const metricResults = metrics
            .filter(metric => 
              metric.metric_name.toLowerCase().includes(query.toLowerCase())
            )
            .map(metric => ({
              id: `metric-${metric.id}`,
              title: metric.metric_name,
              description: `${metric.current_value}${metric.period} (${metric.change_percentage > 0 ? '+' : ''}${metric.change_percentage}%)`,
              type: 'widget' as const,
              url: '/dashboard/analytics',
              category: 'Analytics Metrics',
              iconName: 'TrendingUp',
              metadata: { metricId: metric.id }
            }));
          
          results.push(...metricResults);
          
          // Add performance trends if searching for engagement
          if (query.toLowerCase().includes('engagement')) {
            results.push({
              id: 'performance-trends',
              title: 'Performance Trends',
              description: 'Engagement, Conversion and Revenue trends over time',
              type: 'widget' as const,
              url: '/dashboard/analytics',
              category: 'Analytics',
              iconName: 'LineChart',
              metadata: { widgetType: 'performanceTrends' }
            });
          }
        }
      } catch (error) {
        console.error('Error searching analytics data:', error);
      }
      
      set({ 
        results,
        isSearching: false
      });
    } catch (error) {
      console.error('Search error:', error);
      set({ isSearching: false });
    }
  },
  
  clearResults: () => set({ results: [] })
}));

// Helper function to get icon names for widget types
function getIconForWidgetType(type: string): string {
  switch (type) {
    case 'metricsCard':
      return 'BarChart';
    case 'clientTrends':
      return 'LineChart';
    case 'pieChart':
      return 'PieChart';
    case 'dataTable':
      return 'Table';
    default:
      return 'Box';
  }
} 