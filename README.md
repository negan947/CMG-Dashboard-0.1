# CMG Dashboard - Marketing Agency CRM

[![Powered by Next.js](https://img.shields.io/badge/Powered%20by-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Styled with Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Built with Supabase](https://img.shields.io/badge/Built%20with-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.io)

CMG Dashboard is a comprehensive CRM platform tailored for marketing agencies. It provides a suite of tools to manage clients, handle invoicing, track analytics, and streamline agency operations.

## ✨ Key Features

- **Client Management:** Keep track of all your clients, their projects, and important contact information.
- **Invoice Tracking:** Create, manage, and monitor invoices and payment statuses.
- **Analytics Dashboard:** Visualize key metrics and performance indicators for your agency and clients.
- **User & Agency Profiles:** Manage profiles for team members and the agency itself.
- **Team & Security Settings:** Configure team roles, permissions, and security preferences.
- **Platform Integrations:** Connect with various platforms to consolidate data (feature in development).
- **Notification System:** In-app notifications for important events.
- **Light & Dark Modes:** A sleek, theme-aware interface for user comfort.

## 🛠️ Tech Stack

This project is built with a modern, robust, and scalable tech stack:

- **Framework:** [Next.js](https://nextjs.org/) (v15) with App Router
- **Database & Auth:** [Supabase](https://supabase.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/) for headless components
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) for global client-side state
- **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **Charting:** [Chart.js](https://www.chartjs.org/) & [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **TypeScript** for end-to-end type safety

## 🚀 Getting Started

Follow these instructions to get a local development environment up and running.

### Prerequisites

- [Node.js](https://nodejs.org/) version `18.17.0` or higher.
- `npm` (comes with Node.js).
- Access to the project's Supabase instance.

### 1. Clone the Repository

Clone the project to your local machine:

```bash
git clone <your-repository-url>
cd cmg-dashboard
```

### 2. Install Dependencies

Install the required `npm` packages:

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root of the project. You only need to add the Supabase Service Role Key, which is used for administrative tasks that bypass Row Level Security (RLS).

```
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

**Note:** The Supabase URL and Anon Key are currently hardcoded in `src/lib/supabase-server.ts`. For better security and flexibility, it is recommended to move these to the `.env.local` file as well:

```
# Recommended additions to .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Database Setup

The database schema must be set up in your Supabase project.

⚠️ **Important:** This repository does not currently contain SQL migration files. The schema is assumed to exist on the Supabase project. Please contact the project lead for the schema SQL dump or for access to a development database.

Once your database is ready, you need to generate the TypeScript types for it. This enables full type safety when interacting with the database.

```bash
npm run db:types
```

This command will populate `src/types/supabase.ts` based on your database schema.

## 🏃 Running the Application

- **Development Server:** To run the app in development mode with hot-reloading:

  ```bash
  npm run dev
  ```

  Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Testing:** The project is configured with Jest for unit and integration testing.

  ```bash
  npm test # Run all tests
  npm test:watch # Run tests in watch mode
  ```

- **Production Build:** To create a production-ready build of the application:
  ```bash
  npm run build
  ```
  **Note:** As per project guidelines, do not use `npm run build` during development. Use `npm run dev` exclusively.

## 📂 Codebase Overview

The project follows a standard Next.js App Router structure with some key conventions:

- `src/app/`: Contains all routes, pages, and layouts. The core features are nested under `src/app/dashboard/`.
- `src/components/`: Shared, reusable React components.
- `src/services/`: Houses the business logic for interacting with the Supabase backend. It contains classes like `ProfileService`, `SettingsService`, etc.
- `src/lib/`: Core utilities, helper functions, and configurations.
  - `src/lib/supabase-server.ts`: Handles Supabase client creation on the server.
  - `src/lib/mcp.ts`: Contains a legacy method for making raw SQL queries. New features should prefer using the service layer.
  - `src/lib/schemas/`: Zod schemas for form and data validation.
  - `src/lib/stores/`: Zustand store for global state.
- `src/types/`: Contains TypeScript type definitions, including the auto-generated `supabase.ts`.

## 🌱 Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and create a pull request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is not currently licensed. Please contact the repository owners for more information.
