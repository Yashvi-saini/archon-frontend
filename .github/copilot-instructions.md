# GitHub Copilot Instructions for archon-frontend

Refer to `AGENTS.md` for full project guidelines and architecture details.

## Core Directives:
- **Thin-Shell Routing:** Keep `src/app/` thin. Delegate logic to `src/features/`.
- **Feature Modules:** Organize code into `src/features/[feature_name]/` (`auth`, `interview`, `reports`, `analytics`, `profile`).
- **Data Flow:** Raw API ➔ React Query Hook ➔ UI Component.
- **State:** React Query for server state, Zustand for workspace state.
- **Path Aliases:** Use `@/` alias for all internal imports.
- **Styling:** Use Tailwind CSS v4 and `cn()` from `@/lib/utils`.
