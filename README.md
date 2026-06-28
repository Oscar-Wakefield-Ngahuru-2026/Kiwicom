# Kiwicom

A community hub for developers to discover, share, and collaborate on open-source projects. Built by Dev Academy Ngahuru 2026 cohort as a final group project.

Kiwicom connects to the GitHub API to pull in real project data, lets users browse and filter by language, topic, and type, and uses AI to generate plain-English summaries of project READMEs. Users authenticate via GitHub through Supabase, and can bookmark projects, manage their own listings, and build a developer profile.

---

## Team

| Name | Role | Responsibilities |
| :---- | :---- | :---- |
| Oscar | Product Owner | Prioritises features, manages backlog, final call on scope |
| Henry | Agile Facilitator | Runs standups, retros, keeps the team on track with Agile practices |
| Serina | Git Keeper | Manages merges to dev, reviews PRs, maintains branch health |
| Ivonne | Vibes Watcher | Monitors team energy, flags burnout, keeps morale up |

---

## Tech Stack

| Layer | Technology |
| :---- | :---- |
| Frontend | React, Vite, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (hosted on Supabase) |
| Query Builder | Knex |
| Auth | Supabase (GitHub OAuth) |
| GitHub Integration | Octokit |
| AI Summaries | Anthropic API (Claude) |
| Deployment | TBD (likely Render) |

**Important:** We are using Supabase ONLY for its hosted Postgres database and authentication. We are NOT using the Supabase client library for data queries. All data access goes through Knex and Express.

---

## Git Workflow

- **Default branch:** `dev`  
- **Feature branches:** Named after the feature (e.g. `feature-1-home-page`)  
- **PRs:** You cannot merge your own changes. Another team member must review and merge.  
- **Git Keeper:** Serina manages merges to dev and resolves conflicts.  
- **Before starting a new feature:** Always `git fetch` and `git rebase origin/dev` to stay up to date.

---

## MVP Features

1. **Projects/Home Page** \- Display all projects in a card grid (3-4 across) with infinite scroll  
2. **About Page** \- What the app does, how it helps, quick guide on navigation and usage  
3. **Project Search and Filtering** \- Filter by language, topic, type, and open-source status  
4. **Bookmarking Projects** \- Save favourite projects to revisit later  
5. **Single Project Page** \- Detailed view of a project including README, issues, and AI summary  
6. **Authentication and Authorization** \- GitHub login via Supabase, protects user-specific data  
7. **Owner Page** \- View and manage your own projects on a "My Projects" page  
8. **My Bookmarks Page** \- View all bookmarked projects in one place  
9. **Create Project Page** \- Add new projects to the database  
10. **Project Card Component** \- Reusable card showing project info (name, description, language, stars, topics)  
11. **Developer Profile** \- Public profile listing a developer's projects

---

## Stretch Goals

To be confirmed. Stretch database tables have been designed for:

- Showcase projects (student-posted projects for collaboration)  
- Showcase interest (users expressing interest in joining a project)  
- Lightning talks (community talks with scheduling and signups)  
- Talk signups (tracking attendance)

Details will be added here once stretch features are scoped.

---

## Database Schema

### MVP Tables

**profiles**

| Column | Type | Notes |
| :---- | :---- | :---- |
| id (PK) | string | Matches Supabase auth.users.id |
| github\_username | string | Used to call GitHub API on their behalf |
| avatar\_url | text | Profile picture in the UI |
| bio | text | Optional "about me" on their profile page |
| created\_at | timestamp | When they joined |

**projects**

| Column | Type | Notes |
| :---- | :---- | :---- |
| id (PK) | integer | GitHub's own repo id, prevents duplicates on re-sync |
| full\_name | string | "owner/repo" format, shown on cards and used for GitHub links |
| description | text | The blurb shown in the project list |
| html\_url | text | Clickable link to the repo on GitHub |
| homepage | text | Optional project website or live demo link |
| primary\_language | string | Powers the language filter |
| topics | text | GitHub topics, powers the tag filter (stored as text\[\]) |
| stars | integer | Sort by popularity, shows project credibility |
| open\_issues\_count | integer | Shows how much work is available to contribute to |
| is\_open\_source | boolean | Powers the "open-source vs not" filter |
| license | text | Tells a contributor whether they're allowed to contribute |
| readme | text | The text fed into the AI "Explain this project" feature |
| ai\_summary | text | Cached AI output so we don't re-call the API on every page view |
| ai\_summary\_at | timestamp | When the summary was generated, lets us refresh stale ones |
| last\_synced\_at | timestamp | How fresh our copy of the GitHub data is |
| created\_at | timestamp | When we first added this project to our catalog |

**issues**

| Column | Type | Notes |
| :---- | :---- | :---- |
| id (PK) | integer | GitHub issue id, prevents duplicates on sync |
| project\_id (FK) | integer | References projects.id |
| title | string | Shown in the issue list |
| html\_url | text | Link to the issue on GitHub |
| labels | text | "good first issue" / "help wanted" etc, powers difficulty filter |
| state | string | We only show OPEN issues, not closed ones |
| created\_at | timestamp | Sort issues by newest |

**bookmarks**

| Column | Type | Notes |
| :---- | :---- | :---- |
| user\_id (FK) | string | References profiles.id |
| project\_id (FK) | integer | References projects.id |
| created\_at | timestamp | Order by most recently saved |

### Stretch Tables

**showcase\_projects**

| Column | Type | Notes |
| :---- | :---- | :---- |
| id (PK) | string | Unique id for each student-posted project |
| author\_id (FK) | string | References profiles.id |
| title | string | Shown in the showcase list |
| description | text | Pitch the project to potential collaborators |
| repo\_url | text | Link to the code (may be private or non-open-source) |
| homepage | text | Optional live demo link |
| tech\_stack | text | Filter by stack and show what tech is involved (text\[\]) |
| looking\_for | text | Roles wanted like frontend/design, drives matchmaking (text\[\]) |
| is\_open | boolean | Is it still recruiting? Grey it out when the team is full |
| created\_at | timestamp | Sort newest projects first |

**showcase\_interest**

| Column | Type | Notes |
| :---- | :---- | :---- |
| showcase\_id (FK) | string | References showcase\_projects.id |
| user\_id (FK) | string | References profiles.id |
| message | text | Intro/pitch to the project owner |
| created\_at | timestamp | Order the list of requests |

**lightning\_talks**

| Column | Type | Notes |
| :---- | :---- | :---- |
| id (PK) | string | Unique id for each talk |
| speaker\_id (FK) | string | References profiles.id |
| title | string | Shown in the talk library/schedule |
| description | text | What the talk is about |
| video\_url | text | Link to the recording (empty until it's recorded) |
| tags | text | Filter talks by topic (text\[\]) |
| status | string | proposed, scheduled, or recorded \- drives what the UI shows |
| scheduled\_at | timestamp | When the talk happens, orders the "upcoming" list |
| created\_at | timestamp | When the talk was proposed |

**talk\_signups**

| Column | Type | Notes |
| :---- | :---- | :---- |
| talk\_id (FK) | string | References lightning\_talks.id |
| user\_id (FK) | string | References profiles.id |
| created\_at | timestamp | Order signups, track capacity |

---

## API Routes

| HTTP Method | Route | Description | DB Function | Request Body | Response |
| :---- | :---- | :---- | :---- | :---- | :---- |
| GET | /api/v1/projects | List all projects, supports query params for filtering (language, topics, search) | getProjects(filters) | n/a | Project\[\] |
| GET | /api/v1/projects/:id | Get a single project with full details (README, issues, etc.) | getProjectById(id) | n/a | Project object |
| POST | /api/v1/projects | Add a new project to the database | addProject(data) | ProjectData object | new Project object |
| PUT | /api/v1/projects/:id | Update an existing project's details | updateProject(id, data) | ProjectData object | status 200 |
| DELETE | /api/v1/projects/:id | Remove a project from the database | deleteProject(id) | n/a | status 204 |
| GET | /api/v1/projects/:id/issues | Get open issues for a specific project | getIssuesByProjectId(id) | n/a | Issue\[\] |
| GET | /api/v1/profiles/:id | Get a developer's profile | getProfileById(id) | n/a | Profile object |
| GET | /api/v1/profiles/:id/projects | Get all projects owned by a developer | getProjectsByProfileId(id) | n/a | Project\[\] |
| PATCH | /api/v1/profiles/:id | Update a developer's profile (bio, avatar) | updateProfile(id, data) | { bio, avatar\_url } | status 200 |
| GET | /api/v1/bookmarks | Get current user's bookmarked projects | getBookmarksByUserId(userId) | n/a | Bookmark\[\] |
| POST | /api/v1/bookmarks | Bookmark a project | addBookmark(userId, projectId) | { project\_id } | status 201 |
| DELETE | /api/v1/bookmarks/:projectId | Remove a bookmark | deleteBookmark(userId, projectId) | n/a | status 204 |
| GET | /api/v1/github/search | Proxy search to GitHub API (Octokit) | n/a (external API) | n/a (query params) | GitHub repo\[\] |
| POST | /api/v1/summary | Generate AI summary of a project's README | n/a (external API) | { readme, projectId } | { summary } |
| POST | /api/v1/projects/:id/refresh | Re-fetch one project's metadata + README + labeled issues from GitHub | updateProject(id, data) + replaceIssuesForProject(id, issues) | n/a | updated Project object |

---

## GitHub API integration

The home page renders real GitHub project data via four endpoints. All data is normalised to camelCase before it reaches the frontend.

### What's there

- **Seed script** — populates the projects table with a curated list of repos. Reads `server/scripts/seedProjects.json`. Safe to re-run.
  ```bash
  npm run db:seed-github
  ```

- **Refresh route** — re-fetches a single project plus its labeled issues from GitHub.
  ```
  POST /api/v1/projects/:id/refresh
  ```

- **Live search** — proxies to GitHub's search and returns results without saving them.
  ```
  GET /api/v1/github/search?q=<query>&page=<n>
  ```

- **Issues for a project** — returns the stored beginner-friendly issues (`good first issue` or `help wanted`) for a project.
  ```
  GET /api/v1/projects/:id/issues
  ```

### Mental model

```
GitHub  →  normalise  →  Supabase  →  frontend sees camelCase
```

GitHub uses snake_case. Everything downstream of the normaliser uses camelCase. That conversion happens in one place per direction (read and write), so the rest of the code stays clean.

### Setup

See the **Environment Variables** section below — you'll need a `GITHUB_TOKEN` for the seed, refresh, and search routes to work.

### Deeper reading

- [`docs/sprint-2-github-api.md`](docs/sprint-2-github-api.md) — original architecture / design doc
- [`docs/sprint-2-walkthrough.md`](docs/sprint-2-walkthrough.md) — plain-language walkthrough of what was built and why

Happy to pair-walk through any of this if it's useful.

---

## File Structure

client/

  apis/

    projects.ts              \# API calls to the server for projects

    summary.ts               \# Calls the AI summary endpoint

  components/

    layout/

      App.tsx

    ui/

      Navbar.tsx

      Hero.tsx               \# Landing page hero section

      ProjectCard.tsx         \# Reusable project card component

      FilterBar.tsx           \# Language/topic/type filters

      SearchBox.tsx           \# Search input with debounce

  data/

    constants.ts             \# Filter options, static config

  pages/

    \_\_tests\_\_/

      Home.test.tsx

    Home.tsx                  \# Browse and filter projects

    ProjectDetail.tsx         \# Single project view with README and AI summary

    Login.tsx                 \# Supabase GitHub login

    Bookmarks.tsx             \# User's bookmarked projects

  hooks/

    use-projects.ts           \# Fetch project list (useQuery)

    use-project.ts            \# Fetch single project (useQuery)

    use-debounce.ts           \# Debounce search input

    use-auth.ts               \# Supabase auth state

  lib/

    utils.ts                  \# cn() helper for shadcn

    supabase.ts               \# Supabase client for auth

  styles/

    tailwind.css

  test/

    setup.ts

  index.tsx

  routes.tsx

server/

  db/

    functions/

      \_\_tests\_\_/

        projects.test.ts

      projects.ts             \# getProjects, getProjectById, addProject, etc.

      bookmarks.ts            \# getBookmarksByUserId, addBookmark, deleteBookmark

    connection.ts             \# Knex connection pointing at Supabase Postgres

    knexfile.js               \# Connection string from .env

  seeds/

    projects.js               \# Seed 15-30 projects for development

  migrations/

    2026\_init.js              \# Creates tables: profiles, projects, issues, bookmarks

  routes/

    \_\_tests\_\_/

      projects.test.ts

    projects.ts               \# GET /api/v1/projects, GET /api/v1/projects/:id, etc.

    github.ts                 \# GitHub search proxy using Octokit

    summary.ts                \# AI summary endpoint using Anthropic API

  lib/

    octokit.ts                \# GitHub API client

    anthropic.ts              \# Anthropic API client

  index.ts

  server.ts

Root files:

  .gitignore

  .prettierignore

  .env                        \# Secrets (NEVER committed)

  .env.example                \# Blank template of required env vars

  index.html

  package.json

  postcss.config.js

  tailwind.config.js

  tsconfig.json

  vite.config.ts

---

## Environment Variables

Create a `.env` file at the project root. Use `.env.example` as a template.

DATABASE\_URL=              \# Supabase Postgres connection string

SUPABASE\_URL=              \# Supabase project URL

SUPABASE\_ANON\_KEY=         \# Supabase anonymous/public key

GITHUB\_TOKEN=              \# GitHub personal access token for Octokit

ANTHROPIC\_API\_KEY=         \# Anthropic API key for AI summaries

---

## Getting Started

\# 1\. Clone the repo

git clone git@github.com:Oscar-Wakefield-Ngahuru-2026/Kiwicom.git

cd Kiwicom

\# 2\. Install dependencies

npm install

\# 3\. Set up environment variables

cp .env.example .env

\# Fill in your .env values (get them from Oscar or Supabase dashboard)

\# 4\. Run migrations

npx knex migrate:latest

\# 5\. Seed the database

npx knex seed:run

\# 6\. Start the dev server

npm run dev

---

## Project Timeline

| Date | Milestone |
| :---- | :---- |
| Wed 25 June | Planning, Miro board, database schema, tickets created |
| Thu 26 \- Mon 30 June | Build MVP features |
| Tue 30 June | Polish, bug fixes, stretch if time allows |
| Wed 1 July | Final presentations |

---

## Notes for AI Assistants

If you are an AI (Claude, Gemini, etc.) reading this as context for helping with this project:

- We are using Knex for all database queries, not the Supabase JS client  
- Auth goes through Supabase's GitHub OAuth, but data access is all Knex \+ Express  
- The default git branch is `dev`, not `main`  
- Keep suggestions simple and incremental. This is a bootcamp project with a one-week timeline.  
- Don't over-engineer. MVP first, stretch later.  
- When writing tickets, follow the format used in our GitHub issues (see existing tickets for examples): user story, backend tasks, frontend tasks, relevant files, tiered tests (easy/medium/hard), and PR checklist.

