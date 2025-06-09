# CMG Dashboard - Advanced Marketing Agency CRM

<p align="center">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/15f8121d-4458-444a-a28a-7e0bfa9d83df/logo.png" alt="CMG Dashboard Logo" width="150">
</p>

<h1 align="center">CMG Dashboard</h1>

<p align="center">
  A comprehensive, multi-tenant CRM platform engineered for modern marketing agencies.
</p>

<p align="center">
  <a href="https://nextjs.org" target="_blank"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js"></a>
  <a href="https://supabase.io" target="_blank"><img src="https://img.shields.io/badge/Supabase-DB%20&%20Auth-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase"></a>
  <a href="https://tailwindcss.com" target="_blank"><img src="https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS"></a>
  <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge" alt="License"></a>
</p>

---

CMG Dashboard is a powerful, enterprise-ready CRM designed to be the central nervous system for marketing agencies. It provides a rich suite of tools for managing clients, projects, and finances, all within a secure, multi-tenant architecture.

## TOC

- [Live Demo](#live-demo)
- [Key Features](#-key-features)
- [Technical Architecture](#-technical-architecture)
- [Tech Stack](#-tech-stack)
- [Design System](#-design-system)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Codebase Guide](#-codebase-guide)
- [Contributing](#-contributing)

## Live Demo

_(Note: Add a link to the deployed application here)_
[https://your-live-demo-url.com](https://your-live-demo-url.com)

## ✨ Key Features

- **Multi-Tenant Agency Management:** Securely manage multiple agencies, each with its own isolated data, clients, and team members.
- **Comprehensive Client Profiles:** Maintain detailed client records, including contacts, project history, and communication logs.
- **Financial Tracking:** Create, send, and track invoices with status management (Draft, Sent, Paid, Overdue).
- **Advanced Analytics:** A rich dashboard with customizable widgets to visualize key performance indicators (KPIs) for clients and agency performance.
- **User & Role Management:** Granular control over team members with distinct roles and permissions.
- **Centralized Settings:** Manage agency-wide settings, including branding, billing, and security configurations.
- **Real-time Notifications:** In-app notification system to keep users informed of important events.
- **Themeable Interface:** A sleek and modern UI with full support for both Light and Dark modes.

## 🏛️ Technical Architecture

The application is built on a robust, scalable architecture leveraging Next.js and Supabase.

### High-Level Overview

```mermaid
graph TD
    subgraph Browser
        A[Next.js Client Components]
    end

    subgraph Vercel Server
        B[Next.js Server Components]
        C[API Routes]
        D[Middleware]
    end

    subgraph Supabase
        E[PostgreSQL Database]
        F[Auth]
        G[Storage]
        H[Edge Functions]
    end

    A -- "RSC Payloads" --> B
    A -- "API Calls" --> C
    B -- "Server-side Functions" --> E
    B -- "Server-side Auth" --> F
    C -- "Database Operations" --> E
    D -- "Intercepts Requests" --> A
    D -- "Intercepts Requests" --> B
    D -- "Intercepts Requests" --> C
    D -- "Session Refresh" --> F

    style A fill:#D6EAF8,stroke:#3498DB
    style B fill:#D1F2EB,stroke:#1ABC9C
    style C fill:#D5F5E3,stroke:#2ECC71
    style D fill:#FCF3CF,stroke:#F1C40F
    style E fill:#FADBD8,stroke:#E74C3C
    style F fill:#EBDEF0,stroke:#8E44AD
    style G fill:#E8DAEF,stroke:#9B59B6
    style H fill:#E8DAEF,stroke:#9B59B6
```

### Authentication & Security

- **JWT-based Auth:** Supabase handles user authentication, issuing JWTs that are stored securely in cookies.
- **Middleware Protection:** All incoming requests are intercepted by `src/middleware.ts`. This middleware:
  - Refreshes user sessions.
  - Redirects unauthenticated users from protected routes to the login page.
  - Enforces strict Content Security Policies (CSP) and other security headers.
- **Row Level Security (RLS):** Data is protected at the database level using PostgreSQL's RLS, ensuring tenants can only access their own data.
- **Admin Client:** For administrative tasks, a Supabase client with the `service_role_key` is used in secure server-side environments to bypass RLS.

## 🛠️ Tech Stack

This project leverages a curated set of modern technologies for a performant and developer-friendly experience.

| Category          | Technology                                                                                                          | Purpose                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Framework**     | [Next.js](https://nextjs.org/) (v15)                                                                                | Full-stack web framework with App Router                |
| **Backend & DB**  | [Supabase](https://supabase.io/)                                                                                    | Database, Authentication, and Storage                   |
| **Styling**       | [Tailwind CSS](https://tailwindcss.com/)                                                                            | Utility-first CSS framework                             |
| **UI Components** | [Radix UI](https://www.radix-ui.com/)                                                                               | Headless components for accessibility and functionality |
| **State**         | [Zustand](https://github.com/pmndrs/zustand)                                                                        | Minimalist global client-side state management          |
| **Forms**         | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)                                           | Efficient form handling and robust schema validation    |
| **Charting**      | [Chart.js](https://www.chartjs.org/) & [Recharts](https://recharts.org/)                                            | Data visualization                                      |
| **Icons**         | [Lucide React](https://lucide.dev/)                                                                                 | Simply beautiful and consistent icons                   |
| **Language**      | [TypeScript](https://www.typescriptlang.org/)                                                                       | End-to-end type safety                                  |
| **Linting**       | [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)                                                    | Code quality and consistent formatting                  |
| **Testing**       | [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Unit and integration testing                            |

## 🎨 Design System

The UI is built upon a flexible design system configured in `tailwind.config.js`.

- **CSS Variables:** The entire color palette and styling system (borders, radii) is powered by CSS variables, allowing for dynamic theming.
- **Theming:** Light and dark modes are managed by `next-themes`, configured in the root layout (`src/app/layout.tsx`). The theme is applied globally by adding a `dark` or `light` class to the `<html>` element.
- **Fonts:** The project uses `Geist Sans` for UI text and `Geist Mono` for code, loaded via `next/font`.
- **Animation:** UI animations are handled with `tailwindcss-animate`.

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

- **Node.js:** `v18.17.0` or higher.
- **npm:** `v8.x` or higher.
- **Supabase Account:** Access to the project's Supabase instance.

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd cmg-dashboard
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root. The only required variable for local development is the `SUPABASE_SERVICE_ROLE_KEY`.

```properties
# .env.local
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

You can find this key in your Supabase project settings under `API` > `Project API Keys`.

> **Note:** The Supabase URL and Anon Key are hardcoded in `src/lib/supabase-server.ts`. For production, it's recommended to move these to environment variables.

### 5. Setup Database & Types

The project relies on a pre-existing database schema on Supabase.

⚠️ **No Migrations:** This repository does not contain SQL migration files. For local development, you will need to either:
a) Get a SQL schema dump from the project lead.
b) Connect to a shared development instance of the Supabase database.

Once your database is accessible, generate TypeScript types for full type-safety:

```bash
npm run db:types
```

This script introspects your Supabase schema and generates `src/types/supabase.ts`.

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## ⚙️ Development Workflow

### Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Creates a production build. **Do not use for development.**
- `npm run lint`: Lints the codebase for errors.
- `npm run test`: Runs all Jest tests.
- `npm run db:types`: Generates TypeScript types from the Supabase schema.

### Coding Standards

- **Follow Existing Patterns:** Adhere to the architecture and patterns established in the codebase.
- **Services for DB Interaction:** All database operations should be encapsulated within service classes in `src/services/`. Avoid direct database calls from components.
- **Error Handling:** Use centralized error handlers and the `AppError` class.
- **Environment Variables:** All secrets and environment-specific configurations must be handled through environment variables.

### Testing

The project uses Jest and React Testing Library. Test files are co-located with their corresponding modules in `__tests__` directories.

- Run all tests with `npm test`.
- Run tests for a specific area (e.g., services) with `npm run test:services`.

## 📂 Codebase Guide

| Path                 | Description                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/app/`           | **Routes & Pages:** All application routes, layouts, and pages, following the App Router convention. |
| `src/app/dashboard/` | Core CRM feature modules (Clients, Invoices, Analytics, etc.).                                       |
| `src/components/`    | **Reusable UI:** Shared React components (buttons, cards, inputs).                                   |
| `src/services/`      | **Business Logic:** Service classes that encapsulate all interactions with the Supabase backend.     |
| `src/lib/`           | **Core Utilities:** Helpers, constants, and configuration files.                                     |
| `src/lib/schemas/`   | **Zod Schemas:** Validation schemas for forms and API data.                                          |
| `src/lib/stores/`    | **Zustand Stores:** Definitions for global client-side state.                                        |
| `src/context/`       | **React Context:** Application-wide providers (e.g., `AuthProvider`).                                |
| `src/types/`         | **TypeScript Types:** Global type definitions. `supabase.ts` is auto-generated.                      |
| `src/middleware.ts`  | **Security & Routing:** Intercepts requests for authentication, redirection, and security headers.   |

## 🌱 Contributing

We welcome contributions! Please follow these steps:

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/your-feature-name`).
3.  Commit your changes (`git commit -m 'feat: Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/your-feature-name`).
5.  Open a Pull Request for review.
