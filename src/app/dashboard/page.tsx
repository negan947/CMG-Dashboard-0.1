'use client';

import { useAuth } from '@/hooks/use-auth';
import { Doughnut, Pie, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from 'chart.js';

// Register the required Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

export default function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.email ? user.email.split('@')[0] : 'User';

  // Create chart data for each metric card
  const objectivesChartData = {
    datasets: [{
      data: [78, 22],
      backgroundColor: ['#3b82f6', '#e5e7eb'],
      borderWidth: 0,
      cutout: '80%'
    }]
  };

  const leadsChartData = {
    datasets: [{
      data: [24, 76],
      backgroundColor: ['#8b5cf6', '#e5e7eb'],
      borderWidth: 0,
      cutout: '80%'
    }]
  };

  const inquiryChartData = {
    datasets: [{
      data: [65, 35],
      backgroundColor: ['#10b981', '#e5e7eb'],
      borderWidth: 0,
      cutout: '80%'
    }]
  };

  const overviewChartData = {
    datasets: [{
      data: [92, 8],
      backgroundColor: ['#f59e0b', '#e5e7eb'],
      borderWidth: 0,
      cutout: '80%'
    }]
  };

  // Client categories chart data
  const clientCategoriesData = {
    labels: ['E-commerce', 'SaaS', 'Healthcare', 'Education', 'Finance'],
    datasets: [{
      data: [35, 25, 15, 15, 10],
      backgroundColor: [
        '#3b82f6', // Blue
        '#8b5cf6', // Purple
        '#10b981', // Green
        '#f59e0b', // Orange
        '#ef4444', // Red
      ],
      borderWidth: 1
    }]
  };

  // Client activity trend chart data
  const clientActivityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Clients',
        data: [5, 8, 12, 9, 11, 14],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Active Projects',
        data: [12, 15, 18, 22, 25, 28],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  };

  // Client categories chart options
  const categoriesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'center' as const,
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true
      }
    }
  };

  // Mobile-specific categories options
  const mobileChartOptions = {
    ...categoriesOptions,
    plugins: {
      ...categoriesOptions.plugins,
      legend: {
        ...categoriesOptions.plugins.legend,
        position: 'bottom' as const
      }
    }
  };

  // Client activity trend chart options
  const activityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const
      }
    }
  };

  // Determine which chart options to use based on window width
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const pieChartOptions = isMobile ? mobileChartOptions : categoriesOptions;

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Welcome back, {userName}</h1>
        <p className="mt-2 text-sm text-gray-600 md:text-base">
          Here's an overview of your marketing performance and client activities.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm md:p-6">
          <h3 className="text-sm font-medium text-gray-500">Objectives</h3>
          <div className="mt-3 flex items-center">
            <div className="text-2xl font-bold md:text-3xl">78%</div>
            <div className="ml-auto h-14 w-14 md:h-16 md:w-16">
              <Doughnut data={objectivesChartData} options={chartOptions} />
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-4 shadow-sm md:p-6">
          <h3 className="text-sm font-medium text-gray-500">New Leads</h3>
          <div className="mt-3 flex items-center">
            <div className="text-2xl font-bold md:text-3xl">24</div>
            <div className="ml-auto h-14 w-14 md:h-16 md:w-16">
              <Doughnut data={leadsChartData} options={chartOptions} />
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-4 shadow-sm md:p-6">
          <h3 className="text-sm font-medium text-gray-500">Inquiry Success Rate</h3>
          <div className="mt-3 flex items-center">
            <div className="text-2xl font-bold md:text-3xl">65%</div>
            <div className="ml-auto h-14 w-14 md:h-16 md:w-16">
              <Doughnut data={inquiryChartData} options={chartOptions} />
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-4 shadow-sm md:p-6">
          <h3 className="text-sm font-medium text-gray-500">Overview</h3>
          <div className="mt-3 flex items-center">
            <div className="text-2xl font-bold md:text-3xl">92%</div>
            <div className="ml-auto h-14 w-14 md:h-16 md:w-16">
              <Doughnut data={overviewChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="rounded-lg border bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-base font-semibold md:text-lg">Client Categories</h2>
        <div className="mt-4 h-56 md:h-64">
          <Pie data={clientCategoriesData} options={pieChartOptions} />
        </div>
      </div>
      
      <div className="rounded-lg border bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-base font-semibold md:text-lg">Client Activity Trend</h2>
        <div className="mt-4 h-56 md:h-64">
          <Line data={clientActivityData} options={activityOptions} />
        </div>
      </div>
    </div>
  );
} 