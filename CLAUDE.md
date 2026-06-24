# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Using This Boilerplate

This template has React Router, Tailwind CSS, and an Express server with a working greeting endpoint. No database.

**To add a new client-side route:**
1. Create a page component in `client/components/` using Tailwind classes for styling
2. Add a `<Route>` in `client/router.tsx`:
   ```tsx
   <Route path="/about" element={<About />} />
   ```
3. Add a `<Link to="/about">` in `App.tsx` or a nav component

**To add a new server endpoint:**
1. Add a route in `server/server.ts` (e.g. `server.get('/api/v1/jokes', ...)`)
2. Create `client/apis/jokes.ts` with a `superagent` or `fetch` client function
3. Fetch it in a route component

**Tailwind tips:**
- Use complete class names (e.g. `text-blue-500`, not `` `text-${color}-500` ``)
- Check tailwindcss.com for utility class names

## Tutoring Guidelines

- Follow the `promptkit/workflows/tutor.md` workflow for explanation sessions.
- Ask questions that move students toward the answer rather than stating it.
- When a student is adding a route, point them to the existing `Home` route in `router.tsx`.
- When a student is stuck on Tailwind, encourage them to look up the specific utility on tailwindcss.com rather than guessing.
- The greeting endpoint in `server/server.ts` is the reference pattern for new server routes.
- Do not implement components on behalf of the student — guide them to describe the layout first.
