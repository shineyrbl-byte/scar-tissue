# Demo guide

## 1. Set up a test site (10 min)

1. Get a free Atlassian Cloud developer site: <https://go.atlassian.com/cloud-dev>. Add Jira and Confluence, and make sure Rovo is turned on.
2. Create a Jira project with the key `PAY` and a Confluence space with the key `ENG`.
3. Deploy and install the app:
   ```bash
   npm install -g @forge/cli && forge login
   npm install
   forge register
   forge deploy
   forge install --product jira       # choose your site
   forge install --product confluence # same site
   ```
4. Seed demo incidents and postmortems:
   ```bash
   cp .env.example .env   # fill in site, email, API token
   node --env-file=.env scripts/seed-demo.mjs
   ```

## 2. The demo issue

Create this issue in `PAY` (component `payments-webhook`):

> **Summary:** Add `dispute_status` field to payments webhook payload
> **Description:** Merchants want dispute updates. Add a new field to the payment webhook schema and roll it out to all merchants on Friday.

Scar Tissue's trigger comments on it within seconds, and the issue panel shows **High risk**.

## 3. Video script (under 4:30)

| Time | Show | Say |
|---|---|---|
| 0:00 | Confluence page list full of postmortems | "Every team writes postmortems. Almost nobody reads them again. So the same outages come back." |
| 0:20 | Title card: Scar Tissue | "Scar Tissue is a Forge app and Rovo agent that brings the lessons back at the moment you're about to repeat a mistake." |
| 0:35 | Create the demo issue | "A developer wants to add a field to the payments webhook. Looks harmless." |
| 0:55 | Auto-comment appears | "Before anyone starts work, Scar Tissue has already commented: this area caused three incidents. Here's the checklist from our own postmortems." |
| 1:20 | Open issue panel | "The panel shows the risk, the lessons with links to the postmortems, and who fixed this last time." |
| 1:50 | Hover the 'why it matched' tags | "No black box. Every match shows the shared component and words behind it." |
| 2:10 | Click *Add pre-ship checklist* | "One click puts the lessons into the review, with the right people mentioned." |
| 2:30 | Open Rovo, chat with Scar Tissue: "We're rotating the auth signing key next week. Anything I should know?" | "No ticket yet? Just ask the agent." |
| 3:00 | Agent answers with the JWKS lesson + link | "It found the EU login incident and the exact runbook step we forgot last time." |
| 3:20 | Show another agent calling `find-scars` | "The actions are reusable, so any Rovo agent, like a release agent, can check for scars before shipping." |
| 3:40 | Architecture slide (README diagram) | "Forge functions, Jira and Confluence APIs, a deterministic matcher, and Rovo on top." |
| 4:00 | Closing | "Your team already paid for these lessons. Scar Tissue makes sure you only pay once." |

## 4. Things to check before recording

- [ ] `forge logs` shows no errors after creating the demo issue
- [ ] Rovo agent appears in the Rovo chat agent list
- [ ] Postmortem links in the panel open the right Confluence pages
