# Archon Frontend — Architecture Reference Guide

---

## Architectural Principles

| Principle | Rule |
|---|---|
| **Feature-First** | Every domain owns its api, hooks, store, types, components |
| **Thin-Shell Routing** | `app/` pages only import and render. Zero logic. |
| **3-Layer Data Flow** | `API fn → React Query Hook → Component` |
| **Granular Stores** | One Zustand store per concern, never one monolith |
| **Barrel Exports** | Every feature has `index.ts` as its public API |

---

## Overall Visual Tree Structure

This is the target tree layout for the project:

```
archon-frontend/
├── public/                            # Static assets served at /
│   ├── favicon.ico
│   └── images/                        # OG images, logos
│
├── src/
│   ├── app/                           # ⚡ THIN ROUTING SHELL — No business logic
│   │   ├── (auth)/                    # Route Group (shared auth layout, no /auth in URL)
│   │   │   ├── layout.tsx             # Centered card layout for auth pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx           # → renders <LoginForm /> from features/auth
│   │   │   ├── signup/
│   │   │   │   └── page.tsx           # → renders <SignupForm /> from features/auth
│   │   │   └── forgot-password/
│   │   │       └── page.tsx           # → renders <ForgotPasswordForm />
│   │   │
│   │   ├── (dashboard)/               # Route Group (shared dashboard layout)
│   │   │   ├── layout.tsx             # Sidebar + Navbar shell
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # Dashboard overview
│   │   │   ├── interviews/
│   │   │   │   └── page.tsx           # Interview listing page
│   │   │   ├── reports/
│   │   │   │   └── page.tsx           # Reports listing page
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx           # Analytics dashboard
│   │   │   └── settings/
│   │   │       └── page.tsx           # User settings
│   │   │
│   │   ├── interview/
│   │   │   └── [id]/
│   │   │       ├── page.tsx           # → renders <InterviewWorkspace />
│   │   │       └── loading.tsx        # Skeleton for interview workspace
│   │   │
│   │   ├── report/
│   │   │   └── [id]/
│   │   │       └── page.tsx           # → renders <ReportView />
│   │   │
│   │   ├── api/                       # Next.js API routes
│   │   │   └── health/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx                 # Root layout (providers, fonts, metadata)
│   │   ├── page.tsx                   # Landing page
│   │   ├── loading.tsx                # Global loading state
│   │   ├── error.tsx                  # Global error boundary
│   │   └── not-found.tsx              # 404 page
│   │
│   ├── features/                      # 🏗️ DOMAIN MODULES — All business logic lives here
│   │   │
│   │   ├── auth/
│   │   │   ├── api/                   # Raw API calls (HTTP layer)
│   │   │   │   ├── login.ts
│   │   │   │   ├── signup.ts
│   │   │   │   ├── logout.ts
│   │   │   │   ├── me.ts
│   │   │   │   └── forgot-password.ts
│   │   │   ├── hooks/                 # React Query wrappers
│   │   │   │   ├── use-login.ts
│   │   │   │   ├── use-signup.ts
│   │   │   │   ├── use-user.ts
│   │   │   │   └── use-logout.ts
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── signup-form.tsx
│   │   │   │   ├── forgot-password-form.tsx
│   │   │   │   └── auth-guard.tsx
│   │   │   ├── schema.ts             # Zod schemas (loginSchema, signupSchema)
│   │   │   ├── types.ts              # User, AuthResponse, LoginPayload
│   │   │   └── index.ts              # Barrel export (public API of this feature)
│   │   │
│   │   ├── interview/                 # 🎯 CORE FEATURE — System Design Workspace
│   │   │   ├── api/
│   │   │   │   ├── get-interview.ts
│   │   │   │   ├── list-interviews.ts
│   │   │   │   ├── create-interview.ts
│   │   │   │   ├── submit-solution.ts
│   │   │   │   └── get-problems.ts
│   │   │   ├── hooks/
│   │   │   │   ├── use-interview.ts
│   │   │   │   ├── use-interviews.ts
│   │   │   │   ├── use-create-interview.ts
│   │   │   │   ├── use-canvas.ts
│   │   │   │   ├── use-code-sync.ts
│   │   │   │   └── use-interview-ws.ts
│   │   │   ├── store/                 # Granular Zustand stores
│   │   │   │   ├── canvas-store.ts
│   │   │   │   ├── editor-store.ts
│   │   │   │   ├── session-store.ts
│   │   │   │   └── peer-store.ts
│   │   │   ├── components/
│   │   │   │   ├── canvas/            # Whiteboard components
│   │   │   │   │   ├── canvas-board.tsx
│   │   │   │   │   ├── node-palette.tsx
│   │   │   │   │   ├── connection-line.tsx
│   │   │   │   │   └── canvas-toolbar.tsx
│   │   │   │   ├── editor/            # Code editor panel
│   │   │   │   │   ├── code-editor.tsx
│   │   │   │   │   ├── language-selector.tsx
│   │   │   │   │   └── output-panel.tsx
│   │   │   │   ├── chat/              # Communication panel
│   │   │   │   │   ├── chat-panel.tsx
│   │   │   │   │   └── message-bubble.tsx
│   │   │   │   ├── workspace-layout.tsx
│   │   │   │   ├── interview-timer.tsx
│   │   │   │   └── problem-statement.tsx
│   │   │   ├── providers/
│   │   │   │   └── interview-ws-provider.tsx
│   │   │   ├── utils/
│   │   │   │   ├── canvas-helpers.ts
│   │   │   │   └── serialize.ts
│   │   │   ├── constants.ts
│   │   │   ├── schema.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── reports/
│   │   │   ├── api/
│   │   │   │   ├── get-report.ts
│   │   │   │   └── list-reports.ts
│   │   │   ├── hooks/
│   │   │   │   ├── use-report.ts
│   │   │   │   └── use-reports.ts
│   │   │   ├── components/
│   │   │   │   ├── report-card.tsx
│   │   │   │   ├── score-breakdown.tsx
│   │   │   │   └── feedback-timeline.tsx
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── api/
│   │   │   │   └── get-analytics.ts
│   │   │   ├── hooks/
│   │   │   │   └── use-analytics.ts
│   │   │   ├── components/
│   │   │   │   ├── performance-chart.tsx
│   │   │   │   ├── topic-distribution.tsx
│   │   │   │   └── streak-calendar.tsx
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── profile/
│   │       ├── api/
│   │       │   ├── get-profile.ts
│   │       │   └── update-profile.ts
│   │       ├── hooks/
│   │       │   └── use-profile.ts
│   │       ├── components/
│   │       │   ├── profile-form.tsx
│   │       │   └── avatar-upload.tsx
│   │       ├── schema.ts
│   │       ├── types.ts
│   │       └── index.ts
│   │
│   ├── components/                    # 🧩 GLOBAL SHARED UI — Feature-agnostic
│   │   ├── ui/                        # Atomic primitives (Button, Input, Dialog, etc.)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/                    # Shell / chrome components
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── dashboard-shell.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   └── mobile-nav.tsx
│   │   │
│   │   └── shared/                    # Reusable compound components
│   │       ├── data-table.tsx
│   │       ├── empty-state.tsx
│   │       ├── error-boundary.tsx
│   │       ├── page-header.tsx
│   │       └── confirm-dialog.tsx
│   │
│   ├── hooks/                         # 🔧 GLOBAL UTILITY HOOKS — Truly generic only
│   │   ├── use-debounce.ts
│   │   ├── use-local-storage.ts
│   │   ├── use-media-query.ts
│   │   ├── use-lock-body-scroll.ts
│   │   └── use-mounted.ts
│   │
│   ├── lib/                           # 🔌 INFRA / THIRD-PARTY CONFIG
│   │   ├── api-client.ts
│   │   ├── websocket.ts
│   │   ├── query-client.ts
│   │   ├── utils.ts
│   │   └── env.ts
│   │
│   ├── providers/                     # 🌐 GLOBAL CONTEXT PROVIDERS
│   │   ├── app-providers.tsx
│   │   ├── query-provider.tsx
│   │   ├── theme-provider.tsx
│   │   └── auth-provider.tsx
│   │
│   ├── types/                         # 📐 GLOBAL SHARED TYPES
│   │   ├── api.ts
│   │   └── common.ts
│   │
│   ├── config/                        # ⚙️ APP CONFIGURATION
│   │   ├── routes.ts
│   │   ├── site.ts
│   │   └── navigation.ts
│   │
│   └── styles/
│       └── globals.css
│
├── middleware.ts                       # Next.js middleware
├── .env.local
├── .env.example
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Detailed Directory & File Descriptions

### `src/app/` — Routing Shell
> Next.js App Router pages. These are **thin wrappers** that import components from `features/` and render them. No business logic here.

| Path | Purpose |
|---|---|
| `(auth)/layout.tsx` | Shared layout for auth pages (centered card, minimal chrome) |
| `(auth)/login/page.tsx` | Renders `<LoginForm />` from `features/auth` |
| `(auth)/signup/page.tsx` | Renders `<SignupForm />` from `features/auth` |
| `(auth)/forgot-password/page.tsx` | Renders `<ForgotPasswordForm />` |
| `(dashboard)/layout.tsx` | Shared layout with Sidebar + Navbar for all dashboard routes |
| `(dashboard)/dashboard/page.tsx` | Dashboard overview — renders feature components |
| `(dashboard)/interviews/page.tsx` | Interview listing page |
| `(dashboard)/reports/page.tsx` | Reports listing page |
| `(dashboard)/analytics/page.tsx` | Analytics dashboard |
| `(dashboard)/settings/page.tsx` | User settings |
| `interview/[id]/page.tsx` | Full-screen interview workspace (no dashboard shell) |
| `report/[id]/page.tsx` | Individual report detail view |
| `api/health/route.ts` | Health check endpoint (useful for monitoring) |
| `layout.tsx` | **Root layout** — wraps all pages with global providers, fonts, metadata |
| `page.tsx` | Landing / marketing page |
| `loading.tsx` | Global loading fallback (skeleton) |
| `error.tsx` | Global error boundary UI |
| `not-found.tsx` | Custom 404 page |

---

### `src/features/` — Domain Modules
> **All business logic lives here.** Each feature is a self-contained module.

#### `features/auth/` — Authentication & Authorization

| Path | Purpose |
|---|---|
| `api/login.ts` | `POST /auth/login` — raw HTTP call via `apiClient` |
| `api/signup.ts` | `POST /auth/signup` — returns `AuthResponse` |
| `api/logout.ts` | `POST /auth/logout` — clears session |
| `api/me.ts` | `GET /auth/me` — fetches current authenticated user |
| `api/forgot-password.ts` | `POST /auth/forgot-password` — sends reset email |
| `hooks/use-login.ts` | `useMutation` wrapping `loginApi`. Handles loading/error. |
| `hooks/use-signup.ts` | `useMutation` wrapping `signupApi` |
| `hooks/use-user.ts` | `useQuery` wrapping `meApi`. Cached user session. |
| `hooks/use-logout.ts` | `useMutation` wrapping `logoutApi`. Clears query cache. |
| `components/login-form.tsx` | Login UI — uses `useLogin()` hook |
| `components/signup-form.tsx` | Signup UI — uses `useSignup()` hook |
| `components/forgot-password-form.tsx` | Reset password form |
| `components/auth-guard.tsx` | HOC/wrapper that redirects unauthenticated users |
| `schema.ts` | Zod schemas: `loginSchema`, `signupSchema`, `resetSchema` |
| `types.ts` | `User`, `AuthResponse`, `LoginPayload`, `SignupPayload` |
| `index.ts` | Barrel export — the public API of this feature |

#### `features/interview/` — Core Interview Workspace

| Path | Purpose |
|---|---|
| `api/get-interview.ts` | `GET /interviews/:id` — fetch single interview |
| `api/list-interviews.ts` | `GET /interviews` — paginated list |
| `api/create-interview.ts` | `POST /interviews` — start new session |
| `api/submit-solution.ts` | `POST /interviews/:id/submit` — submit final answer |
| `api/get-problems.ts` | `GET /problems` — fetch problem catalog |
| `hooks/use-interview.ts` | `useQuery` for single interview data |
| `hooks/use-interviews.ts` | `useQuery` for interview list |
| `hooks/use-create-interview.ts` | `useMutation` for creating interviews |
| `hooks/use-canvas.ts` | Canvas interaction logic (add/move/delete nodes) |
| `hooks/use-code-sync.ts` | Syncs code editor state via WebSocket |
| `hooks/use-interview-ws.ts` | WebSocket event subscription & dispatch |
| `store/canvas-store.ts` | **Zustand** — nodes, edges, viewport, zoom, selected tool |
| `store/editor-store.ts` | **Zustand** — active file, language, cursor positions |
| `store/session-store.ts` | **Zustand** — timer, interview phase, problem details |
| `store/peer-store.ts` | **Zustand** — connected peers, their cursors, presence |
| `components/canvas/` | Whiteboard: `canvas-board`, `node-palette`, `toolbar` |
| `components/editor/` | Code editor: `code-editor`, `language-selector`, `output-panel` |
| `components/chat/` | Communication: `chat-panel`, `message-bubble` |
| `components/workspace-layout.tsx` | Main orchestrator — splits canvas/editor/chat panels |
| `components/interview-timer.tsx` | Countdown timer with phase transitions |
| `components/problem-statement.tsx` | Problem description sidebar |
| `providers/interview-ws-provider.tsx` | WebSocket context (connects on mount, disconnects on unmount) |
| `utils/canvas-helpers.ts` | Grid snapping, node positioning math |
| `utils/serialize.ts` | Canvas state ↔ JSON for WebSocket sync |
| `constants.ts` | Interview phases, default canvas config, time limits |
| `schema.ts` | Zod schemas for solution submission |
| `types.ts` | `CanvasNode`, `EditorState`, `Peer`, `InterviewPhase` |
| `index.ts` | Barrel export |

#### `features/reports/` — Interview Reports & Feedback

| Path | Purpose |
|---|---|
| `api/get-report.ts` | Fetch single report with scores & feedback |
| `api/list-reports.ts` | Paginated report history |
| `hooks/use-report.ts` | `useQuery` for single report |
| `hooks/use-reports.ts` | `useQuery` for report list |
| `components/report-card.tsx` | Summary card (score, date, topic) |
| `components/score-breakdown.tsx` | Radar/bar chart of skill scores |
| `components/feedback-timeline.tsx` | Chronological AI feedback items |
| `types.ts` | `Report`, `ScoreBreakdown`, `FeedbackItem` |
| `index.ts` | Barrel export |

#### `features/analytics/` — Performance Analytics

| Path | Purpose |
|---|---|
| `api/get-analytics.ts` | Fetch aggregated user analytics |
| `hooks/use-analytics.ts` | `useQuery` for analytics data |
| `components/performance-chart.tsx` | Score trend over time |
| `components/topic-distribution.tsx` | Pie/donut chart of topics practiced |
| `components/streak-calendar.tsx` | GitHub-style activity calendar |
| `types.ts` | `AnalyticsOverview`, `TopicStats`, `StreakData` |
| `index.ts` | Barrel export |

#### `features/profile/` — User Profile Management

| Path | Purpose |
|---|---|
| `api/get-profile.ts` | Fetch user profile details |
| `api/update-profile.ts` | `PATCH /profile` — update name, bio, avatar |
| `hooks/use-profile.ts` | React Query hook for profile CRUD |
| `components/profile-form.tsx` | Editable profile fields |
| `components/avatar-upload.tsx` | Image upload with preview |
| `schema.ts` | Zod: `updateProfileSchema` |
| `types.ts` | `Profile`, `UpdateProfilePayload` |
| `index.ts` | Barrel export |

---

### `src/components/` — Global Shared UI
> Feature-agnostic, reusable across the entire app. If a component is used by 2+ features, it lives here.

| Path | Purpose |
|---|---|
| `ui/button.tsx` | Primary, secondary, ghost, destructive variants |
| `ui/input.tsx` | Text input with label, error, helper text |
| `ui/dialog.tsx` | Modal dialog (shadcn-style) |
| `ui/dropdown-menu.tsx` | Dropdown with keyboard navigation |
| `ui/avatar.tsx` | User avatar with fallback initials |
| `ui/badge.tsx` | Status badges (active, completed, failed) |
| `ui/card.tsx` | Content card container |
| `ui/skeleton.tsx` | Loading skeleton placeholder |
| `ui/tooltip.tsx` | Hover tooltip |
| `ui/index.ts` | Barrel export for all UI primitives |
| `layout/navbar.tsx` | Top navigation bar |
| `layout/sidebar.tsx` | Collapsible dashboard sidebar |
| `layout/footer.tsx` | Global footer |
| `layout/dashboard-shell.tsx` | Sidebar + content wrapper |
| `layout/theme-toggle.tsx` | Light ↔ Dark mode button |
| `layout/mobile-nav.tsx` | Hamburger menu for mobile |
| `shared/data-table.tsx` | Generic sortable/filterable table |
| `shared/empty-state.tsx` | "No data" illustration + CTA |
| `shared/error-boundary.tsx` | Catch + display runtime errors |
| `shared/page-header.tsx` | Page title + breadcrumbs + action buttons |
| `shared/confirm-dialog.tsx` | "Are you sure?" confirmation modal |

---

### `src/hooks/` — Global Utility Hooks
> **Only truly generic hooks.** If a hook mentions a feature name, it belongs in that feature.

| Hook | Purpose |
|---|---|
| `use-debounce.ts` | Debounce any rapidly-changing value |
| `use-local-storage.ts` | Persist state to localStorage with SSR safety |
| `use-media-query.ts` | Responsive breakpoint detection |
| `use-lock-body-scroll.ts` | Prevent body scroll (for modals) |
| `use-mounted.ts` | Returns `true` after hydration (SSR-safe guard) |

---

### `src/lib/` — Infrastructure & Third-Party Config
> Low-level utilities that features depend on but don't own.

| File | Purpose |
|---|---|
| `api-client.ts` | Axios/fetch instance with baseURL, auth interceptor, error transform |
| `websocket.ts` | WebSocket manager: connect, reconnect, heartbeat, event dispatch |
| `query-client.ts` | TanStack Query defaults (staleTime, retry, gcTime) |
| `utils.ts` | `cn()` (clsx + twMerge), `formatDate()`, `capitalize()` |
| `env.ts` | Zod-validated env vars — app crashes on boot if misconfigured |

---

### `src/providers/` — Global Context Providers

| File | Purpose |
|---|---|
| `app-providers.tsx` | Composes all providers into one component for clean `layout.tsx` |
| `query-provider.tsx` | Wraps app in `QueryClientProvider` |
| `theme-provider.tsx` | Wraps app in `next-themes` ThemeProvider |
| `auth-provider.tsx` | Syncs auth state, handles token refresh on app load |

---

### `src/types/` — Global Shared Types

| File | Purpose |
|---|---|
| `api.ts` | `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError` |
| `common.ts` | `ID`, `Timestamp`, `SelectOption`, generic utility types |

---

### `src/config/` — App Configuration

| File | Purpose |
|---|---|
| `routes.ts` | `ROUTES.LOGIN`, `ROUTES.DASHBOARD` — centralized route constants |
| `site.ts` | App name, description, OG image, SEO metadata defaults |
| `navigation.ts` | Sidebar menu items: `{ label, icon, href, badge? }[]` |

---

### `src/styles/`

| File | Purpose |
|---|---|
| `globals.css` | Tailwind directives, CSS variables for light/dark themes |

---

### Root Files

| File | Purpose |
|---|---|
| `middleware.ts` | Next.js edge middleware — auth redirects, route protection |
| `.env.local` | Local secrets (API URL, keys) — never committed |
| `.env.example` | Template showing required env vars for the team |
