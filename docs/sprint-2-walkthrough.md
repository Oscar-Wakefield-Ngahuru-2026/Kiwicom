# Sprint 2 — GitHub API Integration Walkthrough

*Serina, Dev Academy Ngahuru 2026 — Kiwicom group project*

---

## User Story

The big picture for me was that our home page needed real projects to show. Our database was empty. GitHub has the data. So Sprint 2 was about building the bridge between GitHub and us — making them talk to each other so users see real stars, descriptions, languages, and beginner-friendly issues instead of placeholders.

To do this I needed to Seed, Refresh, Search, and find Issues.

### With Ticket A I did the Seed.

I wanted a list of 9 hand-picked repos. I wanted all of them in our database with real GitHub data. I wanted to run a script and get a populated catalogue.

To do this you run `npm run db:seed-github`. The script reads a JSON file with `owner/repo` strings, asks GitHub for each one's data, runs it through the normaliser, and saves it to Supabase. It's safe to re-run — won't duplicate.

The result is that the home page goes from empty to showing React, Vue, Vite, freeCodeCamp etc. with real stars and descriptions.

### With Ticket B I did the Refresh.

GitHub data goes stale. A project might have 100 stars when we seeded it and 105 today. I wanted a way to update one project's stats without re-seeding the whole catalogue.

To do this you hit `POST /api/v1/projects/:id/refresh`. The server looks up that project, asks GitHub for current data, updates the row, and also pulls the latest beginner-friendly issues. It then returns the refreshed project.

The proof that it worked is that the Kiwicom repo had 7 open issues on Friday when I seeded it. By Saturday morning three had closed. The refresh route caught that — `openIssuesCount` went from 7 to 4. That was the route doing its actual job, not parroting cached data.

### With Ticket C I did the live search.

What I wanted here was that if a visitor wants to look up a repo we don't have in the catalogue, they shouldn't be stuck — they should be able to search GitHub directly.

This was accomplished with `GET /api/v1/github/search?q=tldraw` which proxies straight to GitHub's search and returns normalised results. It is important to note that it doesn't save anything to our database. Search results are transient.

You might ask why not save them. If we saved every search result, our DB would balloon with random repos the user might never look at again. Search is a discovery action, not a curation action. If they want to add a project to the catalogue, that's a separate flow.

### Ticket D was in regards to issues that could arise.

My thought process here was we might have beginners who want projects they can contribute to. GitHub has a "good first issue" label convention. And we can pull those for each project so we can show them.

When you refresh a project, the route now also pulls issues tagged `good first issue` or `help wanted` and stores them in the `issues` table. `GET /api/v1/projects/:id/issues` returns them.

This is what the Difficulty filter on the detail page will eventually read from. A beginner sees "this project has 11 good-first-issues, looks approachable" — a more advanced user sees "this one has none, the queue is empty."

---

## The shared pieces

All four of the features lean on three small shared pieces that make the features possible.

They are:

### Octokit

The library that talks to GitHub. Think of it as a librarian who already knows where every shelf is and how to ask for things. We give it our personal access token at startup, and from then on it handles authentication, retries on rate limits, and gives us proper TypeScript types for everything.

Why not raw fetch? Octokit is GitHub-maintained, comes with auto-generated types for every endpoint, and handles auth + pagination + retries. Writing all that by hand would be ~200 lines of code we don't need to maintain.

### The normaliser

GitHub's API uses snake_case (`full_name`, `stargazers_count`). Our codebase uses camelCase (`fullName`, `stars`). One small function — `normalizeGitHubRepo` — translates one to the other.

Analogy: a customs officer at the border. Everything coming in from GitHub gets translated to our team's language before it can enter the rest of the codebase.

Why do we centralise it? If GitHub ever renamed a field, we'd update one function, not 14 places. And if anywhere downstream sees a snake_case key, we know it's a leak — there's exactly one entry point to inspect.

### The boundary helpers (`projectColumns` and `projectToRow`)

This piece is the biggest and most important. It is also the one piece that surprised me the most and worth explaining in greater detail.

The Postgres columns are snake_case (`full_name`). Our code is camelCase (`fullName`). We need to translate both directions, so we need helpers:

- **Direction: Reading from Database** → Helper: `projectColumns` array → Knex SELECT aliases. Postgres labels values with camelCase names so reads come back ready to use.
- **Direction: Writing to DB** → Helper: `projectToRow` function → Camel-to-snake mapping for INSERT/UPDATE; only writes the columns the caller actually wanted to change.

Henry's `projectColumns` array does the read direction. I added `projectToRow` for the write direction. They are a matched pair. Like a two-way translator at a customs gate. Without `projectToRow`, every write site would have to repeat the same 14-line camelCase-to-snake_case mapping by hand.

The bonus: `projectToRow`'s `if (... !== undefined)` checks mean partial updates only touch the columns the caller explicitly set. Without that, calling `updateProject(id, { stars: 42 })` could accidentally wipe `description`, `readme`, every other field with NULL.

---

## Why I built it the way I did

**Why Octokit, not raw fetch**

- Octokit ships with TypeScript types for every GitHub endpoint
- We get auto-complete and type-checking for free
- Writing the equivalent by hand would be 200+ lines of plumbing for no benefit

**Why REST, not GraphQL**

- GraphQL is more powerful but adds a query-language the team would need to learn
- Our use case (fetching one repo's metadata at a time) is what REST is good at
- Our rate limit budget (5000/hr authenticated) is far more than we need

**Why two separate label-filtered calls for issues**

- GitHub's `labels=A,B` query parameter is AND, not OR
- It only returns issues that have both labels, not either
- So I make one call per label (one for `good first issue`, one for `help wanted`)
- Then merge the results and dedupe by id

**Why a transaction for `replaceIssuesForProject`**

- It wipes existing issues then inserts new ones
- If the insert failed halfway through, the project's issues would be deleted with no new ones in place
- The transaction means both succeed or both fail — never half-done

**Why the dialect guard on the autoincrement migration**

- The SQL is Postgres-only — `CREATE SEQUENCE` doesn't exist in SQLite
- Our tests use SQLite in-memory
- Without the guard, every test that runs migrations would crash on this file
- The guard makes the migration a no-op on SQLite and runs normally on Postgres

**Why I removed the snake_case `ProjectRow` bridge in apiClient**

- I had a snake_case translation layer in apiClient earlier
- I removed it once the server started returning camelCase JSON (after adopting `projectColumns`)
- The point of the boundary helpers is that everything outside the database functions sees camelCase only
- Once the server stopped sending snake_case, the apiClient bridge was redundant

---

## The smoke test discovery

I did a smoke test after all 39 unit tests passed. Lint passed. I opened the dev server, hit the refresh route against next.js, then queried the issues endpoint expecting to see labeled issues stored.

It returned zero.

The bug was that my original fetcher asked GitHub for the first 100 open issues then filtered for labels in JS. GitHub returns newest-first. Next.js has 4,153 open issues. The labeled ones were buried far below position 100. I never saw them.

The fix was to filter at the API call instead — make one call per label so the first 100 returned are the labeled ones, not buried.

My lesson here:

> "Unit tests catch logic bugs. Smoke tests catch wiring bugs you didn't think to mock. My mock issue array had 2 items — not 200. The unit test never saw 'what if the labeled ones are at position 187'. Only hitting real GitHub revealed it."

---

## A note before you read it

Read this when you have time. There's a lot here and I know some of these patterns are new.

If questions come up, please put them in the thread — I'll answer in writing. I find live questions hard. If I take a second to think before answering, that's not me being stuck, it's me getting the right answer. And if I need to come back to you later, please don't take it personally.
