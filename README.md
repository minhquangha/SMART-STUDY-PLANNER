# Smart Study Planner Frontend

Frontend client for Smart Study Planner, a study planning dashboard for managing tasks, generating AI-assisted plans, tracking progress, and receiving real-time study reminders.

## Features

- Authentication pages for login and registration
- Protected dashboard routes
- Admin-only user management route
- Task management table with create, edit, delete, status toggle, search, filters, sorting, and pagination
- AI study-plan dialog for generating editable task drafts
- Dashboard overview with study-time metrics, daily completion, streaks, focus score, weekly activity chart, monthly calendar, and recommended next task
- Focus-session timer with study-time logging
- Profile management
- Real-time notification stream with toast messages
- Responsive UI built with Tailwind CSS and shadcn-style components

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS 4
- shadcn/ui-style components
- Radix UI
- lucide-react
- motion
- pnpm

## Project Structure

```text
src/
  components/
    layout/        # Dashboard layout
    tasks/         # Task table, toolbar, forms, AI task dialog
    ui/            # Reusable UI components
  contexts/        # Toast, theme, and notification providers
  hooks/           # Page-level hooks
  pages/           # Home, auth, dashboard, task, profile, admin pages
  routes/          # Protected route guards
  services/        # Axios client and API service wrappers
  styles/          # Global styles
  utils/           # Utility functions and constants
  App.tsx          # App routes
  main.tsx         # React entry point
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Smart Study Planner API running on `http://localhost:3000`

### Installation

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

The app runs on:

```text
http://localhost:5173
```

## Backend Connection

The Axios client is configured in `src/services/api.ts`:

```ts
export const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
})
```

The app uses cookies for authentication, so the backend must enable credentials in CORS.

## Available Routes

| Route | Description |
| --- | --- |
| `/` | Home page |
| `/login` | Login page |
| `/register` | Registration page |
| `/dashboard` | Main study dashboard |
| `/dashboard/tasks` | Task management page |
| `/dashboard/profile` | Profile page |
| `/admin/users` | Admin user management |

## Useful Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm format
pnpm typecheck
pnpm preview
```

## Notes

- The client automatically retries protected API requests once after a `401` response by calling `/refresh`.
- Real-time notifications are consumed from `/me/notifications/stream` with `fetch` and Server-Sent Events parsing.
- Generated AI tasks are shown as editable drafts before being saved through the task API.
