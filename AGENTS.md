<!-- BEGIN:archon-frontend-agent-skill -->
# AGENTS.MD — AI Coding Agent Skill & Architecture Reference Guide

> **Target Project:** `archon-frontend`  
> **Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Zustand, TanStack React Query, Excalidraw, OGL, Sonner, next-themes.

---

## 🎯 Quick Project Summary
`archon-frontend` is a high-performance, real-time System Design & Technical Interview Workspace platform. It provides interactive whiteboarding (Excalidraw/OGL), multi-language code editing, real-time analytics, score report visualizers, user session management, and dark/light theme options.

---

## 🚀 Key Commands & Scripts
- **Development Server:** `npm run dev` (Runs Next.js dev server on http://localhost:3000)
- **Production Build:** `npm run build` (Compiles TypeScript and creates optimized production bundle)
- **Production Start:** `npm run start` (Serves the production build)
- **Linting:** `npm run lint` (Runs ESLint check)

---

## 🏛️ Core Architectural Principles (NON-NEGOTIABLE)

| Principle | Strict Rule |
|---|---|
| **Thin-Shell Routing** | `src/app/` pages are purely routing shells (`page.tsx`, `layout.tsx`). They ONLY import and render feature components. Zero business logic or complex state in `app/`. |
| **Feature-First Modules** | All domain logic lives strictly inside `src/features/[feature_name]/` (`auth`, `interview`, `reports`, `analytics`, `profile`). Each feature owns its `api`, `hooks`, `store`, `components`, `types.ts`, `schema.ts`. |
| **3-Layer Data Flow** | Always flow data through: `API function (src/features/X/api)` ➔ `React Query Hook (src/features/X/hooks)` ➔ `React Component (src/features/X/components)`. |
| **Granular Zustand Stores** | Use dedicated, isolated Zustand stores per domain concern (e.g. `canvas-store.ts`, `editor-store.ts`, `session-store.ts`). Never write monolithic global stores. |
| **Barrel Exports** | Each feature module exposes a clean public API via `index.ts`. External callers MUST import from `@/features/[feature_name]`. |
| **Global UI Primitives** | Shared, domain-agnostic UI primitives belong in `src/components/ui/` or `src/components/shared/`. |
| **Path Aliases** | Always use the `@/` alias for imports (e.g., `@/components/ui/button`, `@/features/interview`, `@/lib/utils`). |

---

## 📂 Project Directory Structure

```
archon-frontend/
├── public/                            # Static assets (favicons, public images, icons)
├── src/
│   ├── app/                           # ⚡ THIN ROUTING SHELL (No business logic)
│   │   ├── (auth)/                    # Route Group: Auth pages (login, signup, forgot-password)
│   │   ├── (dashboard)/               # Route Group: Authenticated dashboard pages (analytics, interviews, reports, settings)
│   │   ├── interview/[id]/            # Fullscreen interactive interview workspace
│   │   ├── report/[id]/               # Interview summary and feedback report view
│   │   ├── layout.tsx                 # Root Layout (wraps providers, fonts, global toasts)
│   │   ├── page.tsx                   # Landing page
│   │   ├── loading.tsx                # Global loading fallback
│   │   ├── error.tsx                  # Global error boundary
│   │   └── not-found.tsx              # Custom 404 page
│   │
│   ├── features/                      # 🏗️ DOMAIN MODULES (All business logic lives here)
│   │   ├── auth/                      # Authentication (login, signup, auth guards, session hook)
│   │   ├── interview/                 # Real-time System Design workspace, canvas, editor, socket hooks
│   │   ├── reports/                   # Performance score breakdowns, feedback timeline
│   │   ├── analytics/                 # User streak calendar, topic distribution charts
│   │   └── profile/                   # Profile settings, avatar upload form
│   │
│   ├── components/                    # 🧩 GLOBAL SHARED UI
│   │   ├── ui/                        # Low-level UI primitives (button, input, card, dialog, badge, skeleton)
│   │   ├── layout/                    # Layout shell elements (navbar, sidebar, theme-toggle, mobile-nav)
│   │   └── shared/                    # Compound shared widgets (data-table, empty-state, error-boundary)
│   │
│   ├── hooks/                         # 🔧 GLOBAL UTILITY HOOKS (Generic only: use-debounce, use-mounted)
│   ├── lib/                           # 🔌 INFRASTRUCTURE (api-client, utils.ts, websocket, query-client)
│   ├── providers/                     # 🌐 REACT CONTEXT PROVIDERS (app-providers, query-provider, theme-provider, auth-provider)
│   ├── types/                         # 📐 GLOBAL SHARED TYPES (api.ts, common.ts)
│   ├── config/                        # ⚙️ APP CONSTANTS & CONFIG (routes.ts, site.ts, navigation.ts)
│   └── styles/                        # 🎨 GLOBAL CSS (globals.css, Tailwind v4 rules)
├── architecture.md                    # In-depth architectural blueprint
├── package.json
└── tsconfig.json
```

---

## 🎨 Styling & Design Guidelines
- **Tailwind CSS v4:** Uses CSS variables for dark/light themes defined in `src/styles/globals.css`.
- **Utility helper:** Always use `cn(...)` from `@/lib/utils` for conditional class joining and tailwind class merging.
- **Icons:** Use `lucide-react` for UI icons.
- **Micro-Animations & Visuals:** Maintain high aesthetic quality with subtle transitions (`transition-colors duration-200`, backdrop blurs, glassmorphism card styling).

---

## 📝 Code Conventions for AI Agents

1. **Client Components:** Add `"use client";` at the top of files using React hooks (`useState`, `useEffect`, `useQuery`, `useStore`) or browser event listeners.
2. **TypeScript:** Strictly type all parameters, return types, component props, and API payloads. Avoid `any`.
3. **API & Data Fetching:** Wrap raw HTTP calls in TanStack Query hooks (`useQuery` / `useMutation`). Do not execute `fetch`/`axios` directly inside React UI components.
4. **State Management:**
   - Server / Async State ➔ TanStack Query (`@tanstack/react-query`)
   - Local UI State ➔ `useState` or `useReducer`
   - Complex Workspace State ➔ Zustand (`zustand`)
5. **Form Validation:** Use `zod` schemas for form input validation.
6. **Error & Loading UX:** Always provide loading skeletons (`Skeleton`) and clean error messages (Sonner toast or `ErrorBoundary`).

<!-- END:archon-frontend-agent-skill -->
