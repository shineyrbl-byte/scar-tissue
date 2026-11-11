# 🩹 Scar Tissue

**Your team's incident memory, at the moment you're about to repeat one.**

![tests](https://github.com/shineyrbl-byte/scar-tissue/actions/workflows/test.yml/badge.svg)

Scar Tissue is an Atlassian Forge app and Rovo agent. When someone opens a Jira issue or gets ready to ship one, it checks your team's past incidents and the postmortems written about them. Then it tells you, right in the issue, what hurt last time, why, what you agreed to do differently, and who knows the fix.

> "Heads up: changes to **payments-webhook** caused **3 incidents** in the last 9 months. The postmortem for INC-42 says: *always replay the dead-letter queue after a schema change.* Ask **Priya**, she fixed the last two."

▶️ **[Watch the demo video](https://youtu.be/YXnuIGSu_dk)** · 🔌 **[Install the app](https://tinyurl.com/scar-tissue-install)**

Built for **Codegeist 2026** · Category: **Apps for Software Teams** · Bonus: **Best Agents (Rovo)**

---

## The problem

Teams write postmortems. Nobody reads them again.

The lessons sit in Confluence while the next engineer, months later, touches the same service and causes the same outage. The knowledge was there. It just wasn't in front of the right person at the right moment.

## What Scar Tissue does

| Where | What you get |
|---|---|
| **Jira issue panel** | A risk card on every issue: related past incidents, how strongly they match and why, lessons pulled from their postmortems, and the people who fixed them. |
| **Pre-ship checklist** | One click turns those lessons into a checklist comment on the issue, so the review has to look at them. |
| **Rovo agent** | Ask "Has anything like PAY-311 broken before?" or "What did we learn about the auth service?" The agent calls Scar Tissue's actions and answers with sources. |
| **Reusable Rovo actions** | `find-scars`, `get-lessons`, `add-preship-checklist`. Other Rovo agents can call them as tools. |
| **Auto-warning** | When a new issue strongly matches a past incident, Scar Tissue comments on it straight away, before work starts. |

## How it works

```
 New / open Jira issue
          │
          ▼
 ┌──────────────────┐   JQL: past incidents & sev bugs   ┌─────────┐
 │  Scar Tissue     │ ─────────────────────────────────▶ │  Jira   │
 │  (Forge function)│   CQL: postmortem pages            ├─────────┤
 │                  │ ─────────────────────────────────▶ │Confluence│
 └──────────────────┘                                    └─────────┘
          │  1. match: TF-IDF text similarity + shared components/labels
          │  2. link: postmortems that mention the incident key
          │  3. extract: "Lessons learned", "Action items", "Root cause"
          │  4. score: similarity × severity × recency × repeat count
          ▼
 Issue panel  ·  Rovo agent  ·  checklist comment  ·  auto-warning
```

Matching is deterministic and explainable: every match shows the shared words and components behind it. Rovo adds conversation on top; it doesn't have to guess.

## Project layout

```
manifest.yml            Forge modules: issue panel, Rovo agent, actions, trigger
src/core/               Pure logic, no Forge imports, unit tested
  text.js               tokenising, stop words, light stemming
  similarity.js         TF-IDF index + explainable match scoring
  lessons.js            pulls lessons/action items out of postmortem pages
  risk.js               combines matches into a risk level + checklist
src/data/               Jira + Confluence fetchers (Forge API)
src/resolvers/          issue panel backend
src/actions/            Rovo action handlers
src/triggers/           auto-warning on issue created
src/frontend/           UI Kit issue panel
scripts/seed-demo.mjs   fills a test site with realistic demo incidents
test/                   node:test unit tests
```

## Run it

```bash
npm install -g @forge/cli
forge login
npm install
forge register          # gives the app your own app id
forge deploy
forge install           # pick your Jira + Confluence site
npm test                # core logic tests, no Atlassian account needed
```

Demo data: see [`docs/DEMO.md`](docs/DEMO.md). Video script: [`docs/VIDEO_SCRIPT.md`](docs/VIDEO_SCRIPT.md).

## License

MIT
