# Dashboard Performance Optimization Guide

## Problem Summary

The dashboard is experiencing significant lag when switching between pages due to:

1. All pages are client-side rendered with `'use client'`
2. Each page loads fresh data on every navigation
3. No data caching between page transitions
4. Heavy visual effects (gradients, blurs, animations)
5. Authentication state checking on each navigation

## Implementation Steps

### Step 1: Install Required Dependencies

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Step 2: Set Up React Query Provider

Create `src/providers/query-provider.tsx`:

```tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Update `src/app/layout.tsx` to wrap the app:

```tsx
import { QueryProvider } from "@/providers/query-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {/* existing providers */}
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

### Step 3: Convert Pages to Use Server Components

For pages that don't need interactivity on load, convert to server components:

1. Remove `'use client'` directive
2. Make the component async
3. Fetch data directly in the component
4. Pass data to a client component for interactivity

Example:

```tsx
// src/app/dashboard/invoices/page.tsx (Server Component)
import { InvoiceService } from "@/services/invoice-service";
import InvoicesClientPage from "./client";

export default async function InvoicesPage() {
  const invoices = await InvoiceService.getInvoices();
  return <InvoicesClientPage initialData={invoices} />;
}
```

### Step 4: Implement Data Caching with React Query

Replace existing hooks with React Query versions:

```tsx
// Before (fetches on every mount)
const { invoices, isLoading } = useInvoices();

// After (uses cached data)
const { data: invoices, isLoading } = useInvoicesQuery();
```

### Step 5: Add Navigation Prefetching

Use the `OptimizedSidebar` component that prefetches data on hover:

```tsx
// In DashboardLayout.tsx
import { OptimizedSidebar } from "./OptimizedSidebar";

// Replace <Sidebar /> with:
<OptimizedSidebar
  isOpen={sidebarOpen}
  isMobile={isMobile}
  onClose={closeSidebar}
/>;
```

### Step 6: Optimize Visual Effects

Reduce heavy visual effects in `DashboardLayout.tsx`:

1. Remove or simplify gradient orbs
2. Reduce blur effects
3. Use CSS transforms instead of filters where possible

```css
/* Replace heavy backdrop-filter with lighter alternatives */
.sidebar {
  /* Before: backdrop-filter: blur(12px); */
  /* After: background-color with opacity */
  background-color: rgba(20, 20, 25, 0.95);
}
```

### Step 7: Implement Route-Based Code Splitting

Use dynamic imports for heavy components:

```tsx
const InvoiceViewer = dynamic(
  () => import("@/components/invoices/InvoiceViewer"),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);
```

### Step 8: Add Performance Monitoring

Add the PerformanceMonitor component to track improvements:

```tsx
// In app/layout.tsx or dashboard/layout.tsx
import { PerformanceMonitor } from "@/components/dev/PerformanceMonitor";

// Add before closing body tag
{
  process.env.NODE_ENV === "development" && <PerformanceMonitor />;
}
```

## Expected Results

After implementing these optimizations:

1. **Initial Load**: 50-70% faster due to server-side rendering
2. **Navigation**: 80-90% faster due to cached data
3. **Hover Prefetch**: Near-instant page transitions
4. **Memory Usage**: Reduced by ~30% with proper cache management

## Monitoring Performance

Use the built-in performance monitor to track:

- Navigation times
- Render performance
- Cache hit rates (in React Query DevTools)

Target metrics:

- Navigation: < 200ms
- Time to Interactive: < 500ms
- Cache hit rate: > 80%

## Rollout Strategy

1. Start with one page (e.g., Invoices)
2. Measure performance improvements
3. Apply to other pages gradually
4. Monitor for any issues
5. Adjust cache times based on usage patterns
