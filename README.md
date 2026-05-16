# Smart Study Planner API

Backend API for Smart Study Planner, a full-stack study planning app that helps learners manage tasks, generate AI-assisted study plans, track progress, and receive deadline reminders.

## Features

- JWT authentication with HTTP-only access cookies and refresh-token sessions
- User-scoped task CRUD APIs
- Server-side task search, filtering, pagination, and sorting
- AI study-plan generation with Google Gemini
- Dashboard overview data for daily tasks, weekly activity, monthly calendar, streaks, focus score, and recommended next task
- Focus-session study-time tracking
- Real-time notifications with Server-Sent Events
- Deadline reminder notifications with duplicate prevention
- Admin user management with search, pagination, role updates, user deletion, and task-count aggregation
- Avatar upload support with Cloudinary

## Tech Stack

- Node.js
- Express 5
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Zod
- Google Generative AI SDK
- Cloudinary
- Multer
- pnpm

## Project Structure

```text
src/
  api/
    admin/             # Admin user management routes
    me/                # Authenticated user routes
      notifications/   # Notification list, read status, SSE stream
      profile/         # Profile, avatar, study-time routes
      status/          # Dashboard overview route
      tasks/           # Task CRUD and today-task routes
    public/            # Auth routes
    users/             # User-related routes
  config/              # Database connection
  middlewares/         # Auth, admin guard, validation, global error handler
  models/              # Mongoose models
  scripts/             # Utility scripts
  services/            # Notification and Cloudinary services
  utils/               # API responses, auth cookies, validation helpers
  index.ts             # Express app entry point
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- MongoDB database
- Gemini API key
- Cloudinary account, only required for avatar uploads

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the backend root:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3-flash-preview

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Run Development Server

```bash
pnpm dev
```

The API runs on:

```text
http://localhost:3000
```

The backend currently allows CORS requests from:

```text
http://localhost:5173
```

## API Overview

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/register` | Create a new account |
| POST | `/login` | Log in and set auth cookies |
| POST | `/refresh` | Refresh the access token |
| POST | `/logout` | Delete the refresh session and clear cookies |

### Current User

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/me/session` | Check authenticated session |
| GET | `/me/profile` | Get current user profile |
| PATCH | `/me/profile` | Update profile fields |
| PATCH | `/me/profile/study-time` | Add focus-session study time |
| POST | `/api/users/avatar` | Upload user avatar |

### Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/me/tasks` | List tasks with filters, search, pagination, and sorting |
| GET | `/me/tasks/today` | List tasks due today |
| POST | `/me/tasks` | Create a task |
| PUT | `/me/tasks/:id` | Update a task |
| DELETE | `/me/tasks/:id` | Delete a task |
| POST | `/me/tasks/generate` | Generate study-task drafts with Gemini |

Supported task query parameters:

```text
status
priority
search
sort=deadline|priority|status|recommended|recent
date=YYYY-MM-DD
page
limit
```

### Dashboard

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/me/status/overview` | Get dashboard metrics, activity, calendar, and recommended task |

Optional query parameter:

```text
month=YYYY-MM
```

### Notifications

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/me/notifications` | List recent notifications and unread count |
| GET | `/me/notifications/stream` | Subscribe to real-time notifications with SSE |
| PATCH | `/me/notifications/read-all` | Mark all notifications as read |
| PATCH | `/me/notifications/:id/read` | Mark one notification as read |
| DELETE | `/me/notifications/:id` | Delete one notification |

### Admin

Admin routes require an authenticated user with the `admin` role.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/admin/session` | Check admin session |
| GET | `/admin/users` | List users with search, pagination, and task counts |
| PATCH | `/admin/users/:id/role` | Update user role |
| DELETE | `/admin/users/:id` | Delete a user and their tasks |

## Useful Scripts

```bash
pnpm dev
pnpm create-admin
```

## Notes

- Access and refresh tokens are stored as HTTP-only cookies.
- Task data is always scoped to the authenticated user.
- The notification service starts a deadline reminder loop when the server starts.
- The frontend client is expected to run on `http://localhost:5173`.
