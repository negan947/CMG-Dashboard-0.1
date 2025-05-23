import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import { SWRConfig } from 'swr'

// Mock data factories
export const mockTask = (overrides = {}) => ({
  id: 1,
  title: 'Test Task',
  description: 'Test description',
  projectId: 1,
  assigneeId: 1,
  status: 'todo' as const,
  priority: 'medium' as const,
  dueDate: '2023-12-31T00:00:00Z',
  agencyId: 1,
  createdByUserId: 'user-1',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
})

export const mockClient = (overrides = {}) => ({
  id: '1',
  name: 'Test Client',
  email: 'test@example.com',
  phone: '+1234567890',
  address: '123 Test St',
  city: 'Test City',
  state: 'TS',
  zipCode: '12345',
  country: 'Test Country',
  status: 'active' as const,
  notes: 'Test notes',
  avatarUrl: null,
  website: 'https://test.com',
  industry: 'Technology',
  companySize: '10-50',
  contactName: 'John Doe',
  contactPosition: 'CEO',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides,
})

export const mockProject = (overrides = {}) => ({
  id: '1',
  name: 'Test Project',
  slug: 'test-project',
  description: 'Test project description',
  clientId: '1',
  agencyId: '1',
  status: 'active' as const,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides,
})

export const mockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: '2023-01-01T00:00:00Z',
  phone: null,
  confirmed_at: '2023-01-01T00:00:00Z',
  last_sign_in_at: '2023-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides,
})

export const mockSession = (userOverrides = {}) => ({
  user: mockUser(userOverrides),
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Date.now() + 3600000,
  expires_in: 3600,
  token_type: 'Bearer',
})

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark'
  swrConfig?: any
}

function AllTheProviders({ 
  children, 
  theme = 'light',
  swrConfig = {}
}: { 
  children: React.ReactNode
  theme?: 'light' | 'dark'
  swrConfig?: any
}) {
  return (
    <SWRConfig 
      value={{ 
        provider: () => new Map(), 
        dedupingInterval: 0,
        ...swrConfig 
      }}
    >
      <ThemeProvider attribute="class" defaultTheme={theme}>
        {children}
      </ThemeProvider>
    </SWRConfig>
  )
}

export const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { theme, swrConfig, ...renderOptions } = options || {}
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders theme={theme} swrConfig={swrConfig}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Mock Supabase responses
export const mockSupabaseQuery = {
  success: (data: any) => ({ data, error: null }),
  error: (message: string) => ({ data: null, error: { message } }),
  empty: () => ({ data: [], error: null }),
}

// Mock SWR hooks
export const mockSWRResponse = {
  loading: { data: undefined, error: undefined, isLoading: true, mutate: jest.fn() },
  success: (data: any) => ({ data, error: undefined, isLoading: false, mutate: jest.fn() }),
  error: (error: any) => ({ data: undefined, error, isLoading: false, mutate: jest.fn() }),
}

// Helper to wait for async operations in tests
export const waitForAsyncOperation = () => new Promise(resolve => setTimeout(resolve, 0))

// Helper to trigger resize events for responsive testing
export const triggerResize = (width: number, height: number) => {
  global.innerWidth = width
  global.innerHeight = height
  global.dispatchEvent(new Event('resize'))
}

// Helper to mock form submissions
export const mockFormEvent = (formData: Record<string, any>) => ({
  preventDefault: jest.fn(),
  target: {
    elements: Object.keys(formData).reduce((acc, key) => {
      acc[key] = { value: formData[key] }
      return acc
    }, {} as any),
  },
})

// Re-export everything from RTL
export * from '@testing-library/react'
export { customRender as render } 