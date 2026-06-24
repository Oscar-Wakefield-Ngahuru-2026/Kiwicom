@promptkit/

# AGENTS.md

## Project Overview

boilerplate-react-tw-routing is a full-stack starter template: React + TypeScript + Vite + Tailwind CSS + React Router on the frontend, Express on the backend (no database). Ships with a working `/api/v1/greeting` endpoint and client-side routing pre-configured.

**Key Technologies:**
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Router, `superagent`
- **Backend**: Node.js, Express.js, TypeScript, CORS middleware
- **Build**: Vite (client), esbuild (server), npm-run-all
- **Testing**: Vitest
- **Linting/Formatting**: ESLint, Prettier

**Architecture:**
- `client/`: React SPA — `client/router.tsx` defines routes; `client/components/App.tsx` is the root layout
- `server/`: Express backend — `server/server.ts` has `/api/v1/greeting` example and CORS
- No database; no Knex
- API base path: `/api/v1`

## Building and Running

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start client (`http://localhost:5173`) and server (`http://localhost:3000`) |
| `npm run build` | Production build (Vite + esbuild) |
| `npm start` | Start production server |
| `npm test -- --run` | Run all tests once |
| `npm run lint` | Check code with ESLint |
| `npm run format` | Format code with Prettier |

**Important:** Always use `npm run dev`. Opening `index.html` directly won't load TypeScript.

## Development Conventions

- **Styling**: Tailwind CSS utility classes in JSX. Config in `tailwind.config.js` — scans `index.html` and `client/**/*.tsx`.
- **Routing**: React Router v7. Routes defined in `client/router.tsx`.
- **CORS**: Server uses `cors('*')` — suitable for local dev; restrict for production.

## Architecture Decisions

- **Full-stack without a database**: Backend provides in-memory API responses (greeting list). Add Knex + SQLite if persistence is needed — or switch to a fullstack boilerplate.
- **CORS enabled**: Unlike the fullstack boilerplates (which Vite-proxy API calls), this template uses explicit CORS middleware so client and server can run independently.
- **React Router with `<Outlet />`**: `App.tsx` is the layout shell; child routes render via `<Outlet />`. Add pages as `<Route>` children in `router.tsx`.
- **`esbuild` for server bundling**: The server is compiled separately from Vite — production build produces both `dist/` (client) and a bundled server.

## Key Conventions

- Add new server routes in `server/server.ts` or extract to a routes file and mount it.
- Add new client routes in `client/router.tsx` as nested `<Route>` children.
- Use Tailwind utility classes in JSX — avoid inline styles.
- All React Router imports come from `react-router` (v7), not `react-router-dom`.
- **Note:** This template uses strict ESLint and Prettier rules. Follow them exactly when extending the boilerplate.

## Potential Pitfalls

- **No database**: Add Knex + SQLite manually or switch to `boilerplate-fullstack-routing` if persistence is needed.
- **Tailwind purge**: Dynamically constructed class strings (e.g. `` `text-${color}` ``) won't be included in production builds — always write complete class names.
- **CORS `'*'` in production**: Restrict origins before deploying.
- **`<Outlet />` must stay in `App.tsx`**: Removing it breaks child route rendering.

## Related Documentation

- [AGENTS.md](AGENTS.md): Shared AI context file — source of truth for all agent briefings.
- [CLAUDE.md](CLAUDE.md): Claude Code context (imports AGENTS.md; may include tutoring guidelines if used in educational settings).
- [GEMINI.md](GEMINI.md): Gemini AI context (self-contained copy of this file's content).

## PromptKit Quick Reference
- Review the available artefacts when the student requests them:
  - Protocol: `promptkit/protocols/setup.md` — instructions for updating these CLI briefings.
  - Workflow: `promptkit/workflows/tutor.md` — guide for tutoring/explanation sessions.
  - Workflow: `promptkit/workflows/reflect.md` — guide for documenting outcomes and next steps.
- Student notes live in `promptkit/notes/`; The table in `progress-journal.md` is main place to update with reflections. Instructor Activities are in `promptkit/activities/` (read-only).
- When new workflows arrive, expect additional files under `promptkit/workflows/`.
