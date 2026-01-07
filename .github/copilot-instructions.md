# Campus Food - AI Coding Guidelines

## Architecture Overview
- **Next.js 13+ App Router** with TypeScript, Tailwind CSS, and shadcn/ui components
- **Authentication**: Clerk for customers (synced to MongoDB via AuthContext), localStorage mocks for vendors/admins
- **Data Layer**: MongoDB with Mongoose (users), localStorage for demo data (vendors, orders, menus)
- **State Management**: TanStack Query for server state, React Context for auth
- **Roles**: Customer (/home), Vendor (/portal/vendor), Admin (/portal/admin) with separate dashboards

## Key Patterns
- **API Routes**: Use `app/api/` with `NextResponse`, authenticate via `currentUser()` from Clerk
- **Components**: Client-side (`"use client"`), shadcn/ui base, animations with framer-motion
- **Auth Flow**: Wrap features with `<SignedIn>/<SignedOut>`, use `useAuth()` hook for profile data
- **Forms**: react-hook-form + zod validation, display errors with toast (sonner)
- **Navigation**: next/navigation, role-based redirects (e.g., customers to /home)
- **Styling**: Tailwind classes, custom variants via class-variance-authority, responsive design

## Conventions
- **File Structure**: Components in `src/components/`, UI primitives in `ui/`, dashboard in `dashboard/`
- **Imports**: Absolute paths with `@/` alias (e.g., `@/components/ui/button`)
- **Data Types**: Define interfaces in component files or `src/data/mockData.ts`
- **Mock Data**: Use localStorage for demo features, structure as JSON arrays/objects
- **Error Handling**: Try/catch in async functions, toast notifications for user feedback

## Examples
- **Adding a new dashboard component**: Place in `src/components/dashboard/`, export from index if shared
- **API endpoint**: `app/api/user/profile/route.js` - GET/POST/PUT for profile CRUD
- **Protected route**: Check `useUser()` from Clerk, redirect if unauthenticated
- **Vendor registration**: Store in localStorage `vendorRequests` array, admin approves to `approvedVendors`

## Development Workflow
- `npm run dev` for local development, `npm run build` for production
- ESLint configured for React/Next.js, run `npm run lint` before commits
- Environment variables: `MONGODB_URI`, Clerk keys in `.env.local`
- Demo mode: Vendors/orders use localStorage, switch to MongoDB collections for persistence

Focus on user experience: smooth animations, clear feedback, mobile-responsive design.</content>
<parameter name="filePath">c:\Users\zamic\Documents\Campus Food\.github\copilot-instructions.md