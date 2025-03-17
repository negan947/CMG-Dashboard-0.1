# CMG Dashboard UI Style Guide

## Card Component Guidelines

To maintain visual consistency across the application, follow these guidelines when creating new pages or components.

### GlassCard Component

The `GlassCard` component is the primary container component used throughout the application. It provides a consistent, themed glass-like appearance with proper support for both light and dark modes.

```tsx
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

// In your component:
const { theme } = useTheme();
const isDark = theme !== "light";

// Basic usage
<GlassCard contentClassName="p-6">
  <h2>Card Content</h2>
</GlassCard>

// With title and description
<GlassCard
  title="Card Title"
  description="Card description text"
  contentClassName="p-6"
>
  <div>Card content here</div>
</GlassCard>

// With color variant
<GlassCard
  color="blue" // Options: blue, purple, green, amber, indigo, red, cyan, pink
  contentClassName="p-6"
>
  <div>Card content here</div>
</GlassCard>

// With styling variant
<GlassCard
  variant="default" // Options: default, subtle, outline
  contentClassName="p-6"
>
  <div>Card content here</div>
</GlassCard>
```

### MetricCard Component

The `MetricCard` component is used for displaying key metrics with a donut chart visualization.

```tsx
import { MetricCard } from "@/components/ui/charts";

<MetricCard
  title="Metric Name"
  value={75}
  suffix="%"
  color="blue" // Options: blue, purple, green, amber, indigo, red
/>;
```

### Page Background Layout

For consistent background styling across pages, include the following elements:

```tsx
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// In your component:
const { theme } = useTheme();
const isDark = theme !== "light";

return (
  <div className="relative min-h-screen">
    {/* Colorful background with gradient */}
    <div
      className={cn(
        "fixed inset-0 -z-10",
        isDark
          ? "bg-gradient-to-br from-[#0F0F12] via-[#171720] to-[#1C1C25]"
          : "bg-gradient-to-br from-[#E8EDFF] via-[#F0F5FF] to-[#F5F9FF]"
      )}
    />

    {/* Glowing accent orbs for visual effect */}
    <div
      className={cn(
        "fixed -top-20 -left-20 -z-5 h-72 w-72 rounded-full blur-[100px]",
        isDark ? "bg-purple-900 opacity-[0.15]" : "bg-purple-400 opacity-[0.18]"
      )}
    />
    <div
      className={cn(
        "fixed top-1/3 right-1/4 -z-5 h-60 w-60 rounded-full blur-[80px]",
        isDark ? "bg-blue-900 opacity-[0.15]" : "bg-blue-400 opacity-[0.18]"
      )}
    />
    <div
      className={cn(
        "fixed bottom-1/4 -right-10 -z-5 h-48 w-48 rounded-full blur-[70px]",
        isDark ? "bg-fuchsia-900 opacity-[0.1]" : "bg-pink-300 opacity-[0.15]"
      )}
    />
    <div
      className={cn(
        "fixed top-2/3 left-1/4 -z-5 h-36 w-36 rounded-full blur-[60px]",
        isDark ? "bg-indigo-900 opacity-[0.1]" : "bg-indigo-400 opacity-[0.15]"
      )}
    />

    {/* Subtle brushed metal texture overlay */}
    <div
      className={cn(
        "fixed inset-0 -z-9 opacity-[0.05] pointer-events-none",
        isDark ? "block" : "hidden"
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='600' height='600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat",
      }}
    />

    {/* Page content container */}
    <div className="space-y-6 md:space-y-8 relative z-10 py-2">
      {/* Your page content with GlassCard components */}
    </div>
  </div>
);
```

## Theme Colors

Use these color values consistently across the application:

### Dark Mode Colors

- Background: `from-[#0F0F12] via-[#171720] to-[#1C1C25]`
- Text (primary): `text-zinc-100`
- Text (secondary): `text-zinc-300`
- Text (tertiary): `text-zinc-400`

### Light Mode Colors

- Background: `from-[#E8EDFF] via-[#F0F5FF] to-[#F5F9FF]`
- Text (primary): `text-gray-800`
- Text (secondary): `text-gray-600`
- Text (tertiary): `text-gray-500`

### Accent Colors

- Blue: `hsl(220, 80%, 60%)`
- Purple: `hsl(280, 70%, 65%)`
- Green: `hsl(150, 70%, 50%)`
- Amber: `hsl(35, 95%, 55%)`
- Indigo: `hsl(240, 70%, 65%)`
- Red: `hsl(0, 80%, 65%)`
- Cyan: `hsl(190, 80%, 55%)`
- Pink: `hsl(320, 70%, 65%)`

## Typography Guidelines

- Page Titles: `text-2xl font-bold md:text-3xl`
- Card Titles: `text-base font-semibold md:text-lg`
- Regular Text: `text-sm md:text-base`
- Small Text: `text-xs`

## Grid Layouts

- For metric cards: `grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4`
- For content cards: `grid grid-cols-1 gap-6 lg:grid-cols-2` or `grid grid-cols-1 gap-6 lg:grid-cols-3`

## Shadow Effects

- Card shadows (dark mode): `shadow-[0_15px_40px_rgba(0,0,0,0.2)]`
- Card shadows (light mode): `shadow-[0_10px_25px_rgba(0,0,0,0.08)]`

## Spacing

- Card padding: `p-6`
- Vertical spacing between cards: `space-y-6 md:space-y-8`
- Gap between grid items: `gap-4 md:gap-6`

## Dark Mode Implementation

Always check for current theme with:

```tsx
const { theme } = useTheme();
const isDark = theme !== "light";
```

Then use conditional classes with the `cn()` utility:

```tsx
className={cn(
  "base-class-for-both-modes",
  isDark ? "dark-mode-class" : "light-mode-class"
)}
```
