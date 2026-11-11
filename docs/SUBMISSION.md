# Codegeist 2026 submission notes

**Name:** Scar Tissue
**Tagline:** Your team's incident memory, at the moment you're about to repeat one.
**Category:** Apps for Software Teams
**Bonus prizes:** Best Agents (Rovo/Assignable agents). Also Marketplace, if you submit a listing.

## How it meets the technology requirement

- Built entirely on **Forge** (`nodejs22.x` runtime, UI Kit, resolvers, triggers).
- **Jira**: `jira:issuePanel` module, JQL search of past incidents, comments and labels via the REST API, `avi:jira:created:issue` trigger.
- **Confluence**: CQL search of postmortem pages, storage-format parsing for root cause, lessons and action items.
- **Rovo**: `rovo:agent` module with three `action` modules (`find-scars`, `search-scars`, `add-preship-checklist`). The actions are general-purpose, so other agents can call them as tools.

## Problem

Postmortems are written once and then forgotten. The same areas break again because the lessons aren't in front of the next engineer at the moment they matter.

## Who it's for

Engineering teams running services in production, especially on-call and release owners.

## What's different

- **Just in time:** it fires when an issue is created and while work is in progress, not in a quarterly review.
- **Connects silos:** Jira incidents, Confluence postmortems and the people who fixed them, combined into one answer.
- **Explainable:** matching is deterministic (TF-IDF plus shared components and labels), and every match shows why. Rovo explains it in conversation but never has to make things up.
- **Turns memory into action:** lessons become a checklist on the issue with the right experts mentioned.

## Checklist

- [x] Installation link: https://tinyurl.com/scar-tissue-install
- [x] Demo video: https://youtu.be/YXnuIGSu_dk
- [ ] Test site credentials for judges, or instructions to use the seed script
- [ ] Repo link: https://github.com/shineyrbl-byte/scar-tissue
