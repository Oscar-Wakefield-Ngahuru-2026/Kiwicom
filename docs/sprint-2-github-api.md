# Sprint 2 — GitHub API Integration

**Owner:** Serina
**Window:** Fri 26 June → Sun 28 June (build) → Mon-Tue (review + polish) → Wed 1 July (showcase)
**Shipping as:** one PR with a separate commit per ticket, targeting `dev`

This doc covers what's being built, why, and how the pieces fit together. Read this before the PR if you can — it'll make the code review way less confusing.

---

## What is this in plain words?

Kiwicom shows a catalogue of GitHub projects to visitors. To do that, we need to *talk to GitHub itself* — fetching real project data, refreshing it, letting users search, and pulling in beginner-friendly issues.

This Sprint 2 work is the whole "talking to GitHub" layer.

Think of it like running a museum that displays artefacts. We need:
- Someone who fetches new artefacts to display (seed)
- Someone who dusts and updates the labels on what's already there (refresh)
- A way for visitors to ask "do you have anything about X?" even if it's not in our collection (live search)
- Up-to-date notes about what each artefact needs (issues)

That's the four tickets. Same four jobs, different angles.

---

## What ships

**Ticket A — Seed**
Fill the projects table with around 15-30 real GitHub repos so the site has content on day one. Think of this as stocking the shop before opening.

**Ticket B — Refresh**
Update an existing project's stars, open issues, and other live numbers. Like checking the date on the milk in the fridge — keeps the cached info fresh.

**Ticket C — Live search**
A search box that asks GitHub directly. The user types something, we search *all of GitHub*, not just our small catalogue. Results show without saving them.

**Ticket D — Issues**
Pull each project's "good first issue" and "help wanted" tags into our database. This is what powers the "Difficulty" filter on the detail page — so a beginner can find something they can actually contribute to.

---

## How it fits together

There's one shared piece of code all four tickets rely on, and four pieces of code that do the actual work.

**The shared piece** is a translator function. We feed it a raw response from GitHub, and it hands back the data in our team's format. That's it. One function, one job: turn GitHub's data shape into our data shape.

**The four feature pieces** each do their own thing, but they all call the translator first. Like a customs officer at an airport — every passenger goes through the same translator before entering the country, no matter where they're heading next.

```
                  GitHub API
                      │
                      ▼
              ┌────────────────┐
              │  Translator    │   <-- one shared function
              │  (normalizer)  │
              └────────────────┘
                      │
       ┌──────────┬───┴──┬──────────┐
       ▼          ▼      ▼          ▼
     Seed     Refresh  Search    Issues
```

This shape means: if we ever change how a GitHub field is translated, we change it in one place and all four tickets get the update. No copy-pasted translation logic scattered around.

---

## A note about field names

GitHub uses snake_case (`full_name`, `stargazers_count`). Our team uses camelCase (`fullName`, `stars`). The team has a hard rule: no snake_case anywhere in our code.

So how do we read GitHub's data without snake_case appearing in our code?

**The translator function is the one allowed exception.** It's the only place where snake_case is allowed to touch our code — because it's literally reading data from a system we don't control. Everywhere else stays camelCase.

Think of it like importing a foreign product. The product comes in its original packaging (snake_case). We unbox it at customs (the translator function), and from then on it's in our packaging (camelCase). Nobody downstream has to know what the original packaging looked like.

This pattern already exists in `client/apiClient.ts` for the same reason — the server speaks snake_case at the moment, so the client has a similar boundary.

---

## Where the code will live

```
server/
├── lib/
│   └── github/                  <-- everything GitHub-related is in here
│       ├── octokit.ts           <-- the shared GitHub client (with auth set up)
│       ├── normalizer.ts        <-- the translator function
│       ├── normalizer.test.ts   <-- tests for the translator
│       └── README.md            <-- notes for future devs
├── db/
│   └── functions/
│       ├── projects.ts          <-- already exists, gets updateProject added
│       └── issues.ts            <-- new file for Ticket D
├── routes/
│   ├── projects.ts              <-- already exists, gets POST /:id/refresh for Ticket B
│   ├── github.ts                <-- new — search route (C) + issues route (D)
│   └── __tests__/
│       └── github.test.ts       <-- tests for the new routes
└── scripts/
    └── seed-from-github.ts      <-- the seed script (Ticket A entry point)
```

Putting all the GitHub code in one folder (`server/lib/github/`) keeps it tidy. If someone wants to understand the integration, they go to one place.

---

## The four tickets in detail

### Ticket A — Seed

**What it does:** Reads a list of `owner/repo` strings (like `"Oscar-Wakefield-Ngahuru-2026/Kiwicom"`), fetches each from GitHub, runs them through the translator, and saves them to our database.

**The flow, step by step:**
1. The script reads a list of repos from a JSON file (or hardcoded — see Open Question 2).
2. For each one, it calls GitHub: "give me this repo's info."
3. GitHub returns about 80 fields. Most are useless to us.
4. The translator picks out the 15 fields we care about and renames them.
5. We save the translated row to the `projects` table.
6. If the row already exists (we're re-running the seed), we update it instead. That way the seed is safe to run more than once.

**Important:** README files are not fetched in this step. They take a separate GitHub call, they're often huge, and the card grid doesn't show them. So we skip them in the seed and let the refresh job pull them in later.

---

### Ticket B — Refresh

**What it does:** Updates one existing project's data — stars, open issue count, description, README, all of it. Triggered by a route.

**The flow:**
1. Someone calls `POST /api/v1/projects/:id/refresh`.
2. We look up the project's `fullName` from our database.
3. We make two GitHub calls in parallel — metadata and README.
4. Translator runs on the metadata.
5. README is decoded from base64 (GitHub gives readmes in base64 because some files are binary).
6. We save the README as plain text, capped at 50KB so monster READMEs don't blow up the AI summary step later.
7. We update `lastSyncedAt` to mark when we last pulled fresh data.
8. We return the updated project.

For now this only refreshes when someone clicks a button. A background scheduler (cron) is a later sprint.

---

### Ticket C — Live search

**What it does:** A search box. User types something, we ask GitHub's search engine, we send back the results. We don't save them.

**The flow:**
1. User hits `GET /api/v1/github/search?q=<query>`.
2. We pass the query to GitHub's search endpoint.
3. GitHub returns up to 20 results per page (we set this).
4. Each result goes through the same translator from Ticket A.
5. We return a clean response with the results plus a `totalCount` (how many GitHub knows about) and an `incompleteResults` flag (GitHub's search times out sometimes, this signals when results are partial).

**About authentication for this ticket:** For now, all search queries use the server's GitHub token. That's fine for showcase. The "proper" version would use each user's own GitHub login (so the rate limit is per-user). That depends on Oscar finishing the Supabase Auth wiring. If that's not ready by Saturday, we ship with the server token now and swap later. No blocker.

---

### Ticket D — Issues

**What it does:** Pulls each project's open issues that are tagged "good first issue" or "help wanted" into our database.

**Why we want this:** A beginner visiting the site can filter projects by difficulty. "Show me projects with beginner-friendly issues right now." That's the value proposition for the site's audience.

**The flow:**
1. When a project is refreshed, we also call GitHub's issues endpoint for that repo.
2. We filter to only issues that are open and tagged with the right labels.
3. The translator runs on each issue (separate translator from the projects one, but same pattern).
4. We save them to the `issues` table.
5. Issues link back to their project via a foreign key.

If a project has no matching issues, that's fine — we just save zero rows for it.

---

## How GitHub fields map to our fields

This is the heart of the translator. One row per field:

| GitHub gives us | We store it as | What we do with it |
|---|---|---|
| `id` | `id` | Use GitHub's id directly. No auto-increment. |
| `full_name` | `fullName` | Copy directly. It's the "owner/repo" string. |
| `description` | `description` | Copy directly. Often null. |
| `html_url` | `htmlUrl` | Copy directly. The github.com link. |
| `homepage` | `homepage` | Copy directly. Often null. |
| `language` | `primaryLanguage` | Copy directly. |
| `topics` | `topics` | Copy directly. Empty array stays as empty array. |
| `stargazers_count` | `stars` | Copy directly. |
| `open_issues_count` | `openIssuesCount` | Copy directly. (This count includes pull requests, not just issues. Quirky but it's what GitHub does.) |
| `private` + `license` | `isOpenSource` | Derived. See Open Question 1 below. |
| `license.spdx_id` | `license` | Plucked from the nested license object. |
| (separate API call) | `readme` | Fetched only on refresh, decoded from base64. |
| (not from GitHub) | `aiSummary` | Stays null. Anthropic generates this in a later sprint. |
| (not from GitHub) | `aiSummaryAt` | Stays null. Same reason. |
| Current time when fetched | `lastSyncedAt` | We set this ourselves when we pull data. |

---

## Authentication

GitHub treats authenticated requests very differently from anonymous ones. Anonymous gets 60 requests per hour. Authenticated gets 5000.

For this PR we use a single server-side token (called a PAT — Personal Access Token). It lives in `.env` as `GITHUB_TOKEN`. Everyone running the seed locally needs one of their own.

**How to get one** (any team member can follow this):
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it "Kiwicom Sprint 2"
4. Tick the boxes for `public_repo` and `read:user`
5. Generate it, copy the value
6. Open your `.env` file and add a line: `GITHUB_TOKEN=ghp_yourtokenhere`

`.env` is gitignored, so this never gets committed. If anyone ever does accidentally commit a token, GitHub itself usually catches it and revokes it within minutes.

---

## Rate limits explained

GitHub's "rate limit" is just a counter. Every request you make ticks it up by one. When the counter hits the limit, GitHub starts saying no until the hour resets.

| What we're doing | Limit |
|---|---|
| Anonymous requests | 60 per hour |
| With our token | 5000 per hour |
| Search endpoint specifically | 30 per minute (stricter) |

Our needs are well below these limits:
- The seed runs around 30 calls (15 repos × 2 calls each). Done in 10 seconds.
- The refresh job is one-at-a-time, manually triggered.
- Live search caches its results in the browser for a minute, so a user typing slowly doesn't hammer GitHub.

Octokit (the library we use) also retries automatically if GitHub does say no due to rate limits. So we're covered even when something unexpected happens.

---

## Open questions for the team

Three things need a decision. I've posted these in Slack with defaults if there's no consensus by Monday morning.

### 1. What counts as "open source"?

Some GitHub repos have a license attached (MIT, Apache, etc.), some don't. Should a repo with no license still count as open source on Kiwicom?

- **Option A:** Yes if it's public AND has any license. (My instinct.)
- **Option B:** Yes only if it has an actual OSI-approved open source license (MIT, Apache, GPL, etc.).
- **Option C:** Yes if it's public, license or not.

Affects what shows up when users filter "Open source only."

**Default if no team consensus by Monday:** Option A.

### 2. Where does the seed list live?

The seed needs a list of `owner/repo` strings to know what to import. Two options:

- **A JSON file** in the repo (`server/scripts/seed-projects.json`). Easy to PR additions.
- **Hardcoded in the script.** Simpler to read, slightly harder to add to.

**Default:** JSON file.

### 3. Live search before Oscar's OAuth is wired?

Ticket C ideally uses each user's own GitHub login. Until Oscar finishes that wiring, we'd use the server's token instead. Do we ship Ticket C with the server token now and swap later?

**Default:** Ship now with the server token. Swap later. Don't block Sprint 2.

---

## What we're NOT building this sprint

- AI summaries (separate Anthropic integration, future sprint)
- Background scheduled refresh (cron jobs)
- GitHub webhooks for real-time updates
- Pagination for search results past page 1
- A "save this search result to my projects" button
- A caching layer in front of GitHub (we don't have enough traffic for it to matter)

These are all sensible features. They're just outside what fits in Sprint 2.

---

## How we're testing

| Layer | How |
|---|---|
| The translator function | Unit tests against a saved GitHub response (a fixture file). No network calls needed. |
| The routes (B, C, D) | Tests that fake the GitHub library and check our route returns the right shape. |
| The seed script | Run against SQLite in-memory, fake GitHub responses. |
| The whole thing end-to-end | Run the seed against real GitHub + real Supabase before opening the PR. Then check the browser. |

Test fixtures (those saved JSON responses) live in `server/lib/github/__fixtures__/`. Anyone can re-record them by running curl against the live API and pasting the result.

---

## How to review the PR

I've structured the commits so each one is a self-contained piece:

1. **Octokit client + translator** (Ticket A foundation) — read this first, it sets up patterns the others build on
2. **Seed/import** (Ticket A) — uses the translator
3. **Refresh** (Ticket B) — builds on A
4. **Live search** (Ticket C) — independent, but uses same translator
5. **Issues fetch** (Ticket D) — uses the issues table
6. **Tests** — either bundled with each feature or as a final commit (will decide as I go)

If you want to scope your review to one ticket at a time, click the "Commits" tab on the PR and you can review each commit individually.

---

## Risks I'm watching

| If this goes wrong... | What I'll do |
|---|---|
| Oscar's OAuth wiring isn't done by Saturday | Ship Ticket C with the server token. Swap to per-user later. |
| GitHub returns an unexpected response shape | Default to null for missing fields. Log the issue. Don't crash the batch. |
| README is enormous (some monorepos are 200KB+) | Truncate at 50KB. We don't need the whole thing for an AI summary. |
| One bad seed entry crashes the whole seed | Each repo is wrapped in try/catch. One failure logs the error and the seed keeps going. |
| Search times out on GitHub's side | Pass `incompleteResults: true` to the frontend. UI shows "some results may be missing." |

---

## What's already decided (not pending)

These aren't open for debate — I want to flag them so nobody re-raises them in review:

- **We use Octokit, not raw fetch.** Octokit ships with types and handles auth/retries.
- **REST not GraphQL.** Simpler for our scope. GraphQL is overkill.
- **Empty topics arrays stay empty arrays, not null.** GitHub tells us "we know it's empty" — we preserve that signal.
- **README is fetched on refresh, not in the seed.** The card grid doesn't need it.
- **All GitHub calls are server-side.** Never browser-to-GitHub directly. (CORS would block it anyway, and our token would leak.)
- **Snake_case lives only in the translator function.** Everywhere else is camelCase per the team rule.
