# Devpost form answers

## Testing instructions

**Scar Tissue works with Jira and Confluence. Rovo is needed only for the chat agent.**

### 1. Install
1. Open the installation link and install Scar Tissue on your site in **Jira**.
2. Open the same link again and install it in **Confluence** on the same site. It reads postmortem pages from Confluence. Without Confluence it still works, but shows incidents without lessons.

### 2. Add demo data (5 minutes)
Scar Tissue learns from past incidents and postmortems, so a fresh site needs some history. Pick **one** option.

**Option A: seed script (recommended).**
Create a Jira software project with key `PAY` (company-managed) and a Confluence space with key `ENG`. Then run:
```bash
git clone https://github.com/shineyrbl-byte/scar-tissue && cd scar-tissue
cp .env.example .env   # add your site, email and API token (id.atlassian.com → Security → API tokens)
node --env-file=.env scripts/seed-demo.mjs   # Node 22+
```
This creates 5 past incidents (PAY-1 to PAY-5), components, and 3 postmortem pages labelled `postmortem`.

**Option B: by hand.**
1. Create two or three Jira bugs labelled `incident`, all with the same component (e.g. `payments-webhook`).
2. Create a Confluence page labelled `postmortem` that mentions their issue keys. Give it headings such as **Root cause**, **Lessons learned** and **Action items**, with bullet points under each.

### 3. Try it
1. **Automatic warning:** in `PAY`, create a Task:
   - Summary: `Add dispute_status field to payments webhook payload`
   - Component: `payments-webhook`
   - Description: `Add a new field to the payment webhook schema and roll it out to all merchants on Friday.`

   Within about 20 seconds Scar Tissue comments with a HIGH risk warning, a checklist built from the postmortems, and a mention of who fixed it before.
2. **Issue panel:** on that issue, click the **Scar Tissue** button under the title. You'll see the risk level, lessons with postmortem links, experts, and matched incidents with "why it matched" tags. Click **Add pre-ship checklist** to post the lessons as Jira tasks.
3. **Rovo agent:** open **Rovo chat** → choose **Scar Tissue** →
   - On the issue, ask: *"Has anything like this issue broken before?"*
   - Anywhere, ask: *"We're rotating the auth signing key next week. Anything I should know?"*

   It should find PAY-4 and its JWKS lessons.

What counts as an incident: issues of type **Incident**, issues labelled `incident`/`outage`/`postmortem`, or **Highest/High** priority bugs. Postmortems are Confluence pages labelled `postmortem`/`incident-review`, or with "postmortem" or "incident review" in the title.

## How it meets the technology requirement

Scar Tissue is built entirely on **Atlassian Forge** (Node.js 22 runtime, UI Kit, resolvers, product triggers) and integrates three Atlassian products:

- **Jira:** a `jira:issuePanel` module (UI Kit) shows a risk card on every issue. JQL search finds past incidents. An `avi:jira:created:issue` trigger checks every new issue and posts a warning comment with a checklist and @mentions when it strongly matches a past incident. The Jira REST API adds the pre-ship checklist and labels.
- **Confluence:** CQL search finds postmortem pages. Scar Tissue parses their storage format to pull out root causes, lessons learned and action items, and links each postmortem to the Jira incidents it mentions.
- **Rovo:** a `rovo:agent` ("Scar Tissue") answers questions like "has this broken before?" with cited lessons. It uses three reusable `action` modules: `find-scars` (by issue key, or the issue being viewed), `search-scars` (free-text description of a change) and `add-preship-checklist` (writes back to Jira). Other Rovo agents can call these actions as tools.

Matching is deterministic and explainable (TF-IDF text similarity plus shared components and labels, weighted by severity, recency and repetition), so every warning shows why it fired and links to its source.

## Category: Apps for Software Teams

### Why this track
The category asks for apps that give dev teams "the context to ship with confidence… deployment awareness, issue triage that actually understands what matters." Repeat incidents are one of the most expensive and avoidable problems software teams face. The lessons already exist in postmortems; they just never reach the engineer at the right moment. Scar Tissue works where developers already are (the Jira issue and Rovo chat), at the two points that matter: when work is created and before it ships. Its users are engineers, on-call responders and release owners.

## Bonus prize: Best Agents (Rovo/Assignable agents)

Scar Tissue includes a `rovo:agent` module plus three reusable `action` modules that any other agent can call as tools.

## Experience building with Forge

**What worked well:** Building UI Kit for the Jira issue panel felt like writing React, and the panel looks native without any styling work. Declaring everything in one `manifest.yml` (panel, trigger, Rovo agent, actions) made the architecture easy to follow. `forge lint` caught problems before deploying, and `forge logs` made debugging the trigger quick. Rovo actions were the highlight: one Forge function became a tool the agent could call, and it automatically received the issue the user was viewing.

**What I struggled with:** `forge login` and `forge register` need an interactive terminal, so they failed inside scripted and AI-assisted environments. I had to switch to a separate terminal. A newer CLI version refused my Node version outright, and setting up a Developer Space was an extra step I didn't expect. Rovo credits on my developer site ran low during testing, which made iterating on the agent harder.

**What I'd improve:** Fully non-interactive flags for login, register and Developer Space creation (useful for CI and AI coding tools). A local emulator or test harness for Rovo agents that doesn't use credits. Clearer docs on installing one app across multiple products (Jira + Confluence) from a single share link.

## AI tools used

- **Claude Code (Anthropic):** pair programming. I used it to brainstorm the idea from my past projects, scaffold the Forge app, write the matching engine and unit tests, debug the free-text scoring issue, and draft documentation and the video script.
- **Atlassian Rovo:** the app's own agent runs on Rovo, and I used Rovo chat to test the agent end to end.

## Hackathon helped me develop new skills
*(Suggested selection: "A lot" or the highest option.)* It was my first Forge app and my first Rovo agent.

## Likely to use Forge/Atlassian again
*(Pick whatever is true for you.)*
