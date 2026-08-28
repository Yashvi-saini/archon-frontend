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
4. **WebSocket:** Use the `useInterviewWs` hook (`src/features/interview/hooks/use-interview-ws.ts`) to connect to `/ai/chat`. Never manage WebSocket instances directly inside components.
5. **Path Aliases:** Always use `@/` for imports. Never use relative `../../..` paths across feature boundaries.
6. **State Management:**
   - Server / Async State ➔ TanStack Query (`@tanstack/react-query`)
   - Local UI State ➔ `useState` or `useReducer`
   - Complex Workspace State ➔ Zustand (`zustand`)
7. **Form Validation:** Use `zod` schemas for form input validation.
8. **Error & Loading UX:** Always provide loading skeletons (`Skeleton`) and clean error messages (Sonner toast or `ErrorBoundary`).

---

## 🌐 Real Backend API Contract (Base URL: `https://archon.monu14.me`)

All authenticated endpoints require `Authorization: Bearer <access_token>`.
Tokens are stored in `localStorage` under keys `archon_access_token` / `archon_refresh_token`.

### Auth Endpoints (no `/api/v1` prefix)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Register user (`name`, `email`, `password`) → returns `UserResponse` |
| `POST` | `/verify-email` | ❌ | Verify OTP after registration (`email`, `otp`) |
| `POST` | `/resend-otp` | ❌ | Resend OTP (`email`, `intent: "register"\|"forgot_password"`) |
| `POST` | `/login` | ❌ | Login → returns `{ access_token, refresh_token }` |
| `POST` | `/logout` | ✅ | Logout + invalidate `refresh_token` |
| `POST` | `/refresh` | ❌ | Refresh access token using `refresh_token` |
| `POST` | `/forgot-password` | ❌ | Send reset OTP email |
| `POST` | `/verify-reset-otp` | ❌ | Verify reset OTP → returns `{ reset_token }` |
| `POST` | `/reset-password` | ❌ | Reset password using `reset_token` + `new_password` |
| `GET` | `/login/{provider}` | ❌ | OAuth redirect (`google` or `github`) |
| `GET` | `/callback/{provider}` | ❌ | OAuth callback — redirects to frontend with tokens in query |

### Interview Endpoints (`/api/v1/` prefix)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/interviews/start` | ✅ | Start interview. Body: `{ difficulty: "easy"\|"medium"\|"hard" }`. Returns `{ session_id, question }` |
| `GET` | `/api/v1/interviews/{id}/report` | ✅ | Get report by session ID. `200` = done, `202` = still evaluating (poll every 5s) |

### AI Chat WebSocket

**URL:** `wss://archon.monu14.me/ai/chat?session_id=<id>&token=<access_token>`  
Auth token goes as a **query parameter** (not a header — WebSocket handshake limitation).

#### Every outgoing frame must use this envelope:
```json
{ "type": "<event_type>", "data": <any JSON value> }
```

#### Supported outgoing event types:

| `type` | `data` shape | When to send |
|---|---|---|
| `chat` | `"plain text string"` | User sends a chat message |
| `node_added` | `{ id, type, label, x, y }` | New shape placed on canvas |
| `node_updated` | `{ id, type, label, x, y }` | Shape moved or label changed |
| `node_deleted` | `{ id }` | Shape deleted from canvas |
| `edge_added` | `{ id, source, target, type }` | Arrow connecting two nodes added |
| `edge_updated` | `{ id, source, target, type }` | Arrow reconnected |
| `edge_deleted` | `{ id }` | Arrow deleted |

#### Incoming message from server:
```json
{ "role": "ai" | "user", "content": "message text" }
```

#### Excalidraw → WebSocket diffing pattern:
Excalidraw's `onChange` fires on every canvas change. The workspace diffs the new element list against the previous snapshot using `prevElementsRef` and emits only the delta as WS events. See `workspace-layout.tsx` and `use-interview-ws.ts`.

- `rectangle`, `ellipse`, `diamond` → treated as **nodes**
- `arrow`, `line` → treated as **edges** (only emitted if both ends are bound to nodes via `startBinding`/`endBinding`)
- `text` elements are labels — extracted via `containerId` matching and included in node payloads
- Node semantic type (`"database"`, `"cache"`, `"load_balancer"`, etc.) is inferred from the label text

### Key Response Shapes

```ts
// POST /api/v1/interviews/start
interface StartInterviewResponse {
  session_id: string;
  question: {
    id: string; title: string; difficulty: string;
    time_limit_minutes: number; expected_topics: string[];
  };
}

// POST /login
interface LoginResponse { access_token: string; refresh_token: string; }

// GET /api/v1/interviews/:id/report
interface InterviewReport {
  id: string; user_id: number; question_id: string;
  score: number; feedback: number[];
  started_at: string; ended_at: string;
}
```

### Existing Implementation Files

| File | Purpose |
|---|---|
| `src/features/interview/types.ts` | All types: WsEnvelope, WsNodeData, WsEdgeData, WsIncomingMessage, ExcalidrawElementSnapshot |
| `src/features/auth/api/auth.ts` | Auth API calls + `sanitizeBackendError()` |
| `src/features/interview/api/interview.ts` | `startInterview()`, `getInterviewReport()`, `buildChatWsUrl()` (includes `&token=`) |
| `src/features/interview/hooks/use-start-interview.ts` | `useMutation` for starting a session |
| `src/features/interview/hooks/use-interview-report.ts` | `useQuery` with 5s polling for report |
| `src/features/interview/hooks/use-interview-ws.ts` | WS lifecycle: `sendChat()`, `sendNodeEvent()`, `sendNodeDeleted()`, `sendEdgeEvent()`, `sendEdgeDeleted()` |
| `src/features/interview/components/workspace-layout.tsx` | Excalidraw onChange → diff → WS emission logic |
| `src/features/interview/components/canvas/whiteboard-canvas.tsx` | Excalidraw component with `onSceneChange` prop |
| `src/providers/query-provider.tsx` | `QueryClientProvider` — mounted in root `layout.tsx` |
| `src/providers/auth-provider.tsx` | Auth context, token storage, route guards |

<!-- END:archon-frontend-agent-skill -->
