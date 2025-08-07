# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application that serves as a chatbot analytics and conversation management dashboard. It integrates with Chatbase API for conversation data and uses MySQL for data persistence.

## Common Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Authentication**: Clerk
- **Database**: MySQL (External Server)
- **State Management**: Zustand, React Query (TanStack Query)
- **Styling**: Tailwind CSS, shadcn/ui components
- **Internationalization**: i18next
- **External API**: Chatbase API

### Key Architectural Patterns

1. **Authentication Flow**: 
   - Clerk handles authentication
   - Middleware (`middleware.ts`) syncs Clerk users with MySQL
   - Protected routes redirect to `/sign-in` if not authenticated
   - Root path `/` redirects to `/conversations` for authenticated users

2. **API Structure**:
   - All API routes under `/app/api/`
   - Server-side API calls use Chatbase API key from environment
   - Client-side requests include Clerk auth token
   - Caching layer (`lib/services/cache.ts`) for Chatbase data

3. **Data Flow**:
   - Chatbase API → Cache/MySQL → Frontend
   - Analytics processing in `lib/utils/analytics.ts`
   - Conversations stored in MySQL for persistence

4. **Component Architecture**:
   - UI components in `components/ui/` (shadcn/ui based)
   - Feature components organized by domain (analytics, conversations)
   - Layout components handle navigation and authentication state

## Environment Variables

Required environment variables:
- `MYSQL_HOST`: MySQL server host
- `MYSQL_USER`: MySQL username
- `MYSQL_PASSWORD`: MySQL password
- `MYSQL_DATABASE`: MySQL database name
- `MYSQL_PORT`: MySQL port (default: 3306)
- `CHATBASE_API_KEY`: Chatbase API key (server-side only)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key

## Key Files and Their Purposes

- `middleware.ts`: Handles authentication and user sync with MySQL
- `lib/api/chatbase.ts`: Chatbase API client with caching
- `lib/db/mysql.ts`: MySQL connection pool configuration
- `lib/db/queries.ts`: Database query helpers and utilities
- `lib/services/cache.ts`: Caching service for API responses
- `app/layout.tsx`: Root layout with providers (Clerk, Theme, i18n)
- `components/new-version/sidebar.tsx`: Main navigation sidebar

## Database Schema

Main tables in MySQL:
- `users`: Synced from Clerk, stores user profile data and preferences
- `conversations`: Cached conversation data from Chatbase
- `sync_status`: Tracks synchronization status for chatbot data
- `translations`: Custom translations for chatbot responses
- `daily_analytics`: Analytics aggregation table (defined but not actively used)

## API Endpoints

- `/api/conversations`: CRUD operations for conversations
- `/api/analytics`: Analytics data aggregation
- `/api/translations`: Manage chatbot response translations
- `/api/sync-status`: Check Chatbase sync status
- `/api/user/chatbot-preference`: User chatbot preferences

## Development Notes

1. **Type Safety**: All API responses are validated with Zod schemas
2. **Error Handling**: API routes return consistent error responses
3. **Caching Strategy**: Conversations cached in MySQL to reduce API calls
4. **Database Queries**: Using parameterized queries to prevent SQL injection
5. **Connection Pooling**: MySQL connection pool with 10 connections
6. **Mobile Responsive**: Sidebar collapses on mobile devices
7. **Dark Mode**: Default theme with system preference support
8. **i18n Support**: English and Chinese languages available

## Database Migration

To set up the MySQL database:
1. Copy `.env.example` to `.env.local` and configure your credentials
2. Create the database: `./scripts/setup-database.sh` (or manually create `chatbot_analytics` database)
3. Run the SQL schema in `database/migrations/001_create_schema.sql`
4. Test connection with `node scripts/test-db.js`
5. Use `/api/user/sync` endpoint to sync users from Clerk to MySQL

## Cleanup and Optimization Notes

Recent optimizations completed:
- Removed Supabase dependencies and type definitions
- Consolidated Tailwind configuration (using TypeScript version)
- Secured database setup script (no hardcoded credentials)
- Added `.env.example` for proper environment variable documentation
- Removed unused dependencies (dotenv, next-i18next, supabase packages)