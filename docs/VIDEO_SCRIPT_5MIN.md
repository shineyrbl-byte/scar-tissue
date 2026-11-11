# Scar Tissue: demo video script (5-minute version)

Target **4:40** (judges only review the first 5:00, so leave some margin). About 560 spoken words.
The 3-minute version is in [`VIDEO_SCRIPT.md`](VIDEO_SCRIPT.md).

---

## Before you record

**Browser:** clean Chrome window · bookmarks bar hidden (Cmd+Shift+B) · zoom 125% · Do Not Disturb on.

**Tabs, in order**
1. Confluence → ENG space → page list (3 postmortems)
2. Jira → PAY board
3. GitHub repo → `README.md` (scroll to "How it works")
4. GitHub repo → **Actions** tab (green test runs)
5. GitHub repo → `manifest.yml`

**Have ready to paste**
- Demo issue summary: `Add dispute_status field to payments webhook payload`
- Demo issue description: `Add a new field to the payment webhook schema and roll it out to all merchants on Friday.`
- Unrelated issue summary: `Update footer copyright year on marketing site`
- Rovo question: `We're rotating the auth signing key next week. Anything I should know?`

**Recording:** Cmd+Shift+5 → Record Selected Portion → browser only → mic on. One clip per scene.

> ⚠️ **Record Scene 7 (Rovo) first, in one take.** It's the only scene that uses Rovo credits.

---

## Scene 1: Hook (0:00 – 0:25)

**Screen:** title card *"🩹 Scar Tissue"* for 2 seconds → Confluence ENG page list. Scroll slowly past the postmortems.

**Say:**
> "Every engineering team writes postmortems. After an outage, we sit down, work out what went wrong, and write a list of lessons we swear we'll remember.
> Then the page gets filed away… and nobody ever opens it again."

---

## Scene 2: The problem (0:25 – 0:55)

**Screen:** open the postmortem *"Payments webhook outage (v2 schema)"* and point at the **Lessons learned** list. Then switch to the PAY board and point at PAY-1, PAY-2 and PAY-3.

**Say:**
> "Here's ours. Our payments webhook broke three separate times: timeouts after a schema change, duplicate payments after a retry change, and a merchant crash from one new field.
> Every time, the team wrote down exactly what to do differently. The knowledge existed. It just wasn't in front of the next engineer at the moment they needed it. That's a context problem, and it's what I built Scar Tissue to solve."

---

## Scene 3: Live issue and the automatic warning (0:55 – 1:40)

**Screen:** PAY board → **+ Create** → Task → paste the summary → component `payments-webhook` → paste the description → **Create** → open the issue.

**Say:**
> "Scar Tissue is a Forge app and Rovo agent that works as your team's incident memory.
> Here's a normal day. A developer creates a ticket: add one field to the payments webhook and ship it to every merchant on Friday. Looks completely harmless."

> ✂️ *Stop recording. Wait ~20 s. Refresh the issue. Start the next clip.*

**Screen:** scroll to the Scar Tissue comment. Point at the red line, the checklist and the @mention.

**Say:**
> "Seconds later, before anyone has written a line of code, Scar Tissue has commented on the ticket. Changes to payments-webhook caused three incidents. And here's a checklist taken straight from our own postmortems: contract tests against merchant parsers, replay the dead-letter queue, ship behind a version flag. It also tags the person who fixed it last time."

**Action:** tick one checklist item.

---

## Scene 4: The issue panel (1:40 – 2:30)

**Screen:** click the **Scar Tissue** button under the issue title. Move your cursor slowly over:
1. The red **High risk** banner and *"Checked N past incidents and N postmortems"*
2. **What we learned last time**: one lesson, then its postmortem link
3. **Who knows this area**
4. **Similar past incidents**: the match % and the purple `payments-webhook` tag plus the word tags

**Say:**
> "The panel gives the full picture. A risk level, based on how similar, how severe, how recent and how often this has happened. Every lesson, root cause and action item, each linked to the postmortem it came from. The people who know this area. And the matching incidents.
> This part matters for incidents: it's not a black box. Every match shows why: the shared component and the shared words. Scar Tissue never invents a lesson. Everything links back to something your team actually wrote."

**Action:** click one postmortem link → the Confluence page opens → go back.

---

## Scene 5: Pre-ship checklist button (2:30 – 2:50)

**Screen:** in the panel, click **Add pre-ship checklist** → the green *"Checklist added"* message → scroll to the new comment.

**Say:**
> "Working on an older ticket that didn't get a warning? One click adds the checklist to the issue, so the lessons become part of code review instead of a page nobody reads."

---

## Scene 6: No false alarms (2:50 – 3:10)

**Screen:** create another Task with the summary `Update footer copyright year on marketing site` → open it → click **Scar Tissue**. It shows **"No scars here"**.

**Say:**
> "And it stays quiet when it should. A footer text change has no history of breaking anything, so no warning, no noise. Teams only listen to alerts they can trust."

---

## Scene 7: Rovo agent (3:10 – 3:55) · *record this first, one take*

**Screen:** click **Rovo** → choose **Scar Tissue** → paste the auth question → send. Scroll slowly through the answer.

**Say (while typing):**
> "Sometimes there isn't a ticket yet. You're just planning. So you ask the Scar Tissue agent in Rovo: we're rotating the auth signing key next week. Anything I should know?"

**Say (as the answer appears):**
> "It found the EU login outage from the last key rotation and the two steps we missed: publish the new key to JWKS before signing with it, and purge the edge cache. That's exactly the mistake we would have made again. And it tells me who to ask."

---

## Scene 8: How it's built (3:55 – 4:30)

**Screen:** README "How it works" diagram → `manifest.yml` (scroll past `jira:issuePanel`, `rovo:agent`, `action`, `trigger`) → GitHub **Actions** tab with green runs.

**Say:**
> "Under the hood, it's all Forge. A UI Kit issue panel, a trigger on every new Jira issue, and a Rovo agent. Scar Tissue reads incidents from Jira with JQL and postmortems from Confluence with CQL, pulls out root causes, lessons and action items, and matches them to new work by component and wording.
> The agent's three actions (find scars, search scars and add a pre-ship checklist) are reusable, so any other Rovo agent, like a release agent, can check for scars before it ships. The core logic is covered by unit tests that run on every push."

---

## Scene 9: What's next and close (4:30 – 4:45)

**Screen:** back to the demo issue with the panel open, or the title card *"🩹 Scar Tissue: your team's incident memory"*.

**Say:**
> "Next, I want to bring in Teamwork Graph for service ownership and check Bitbucket pull requests too.
> Your team already paid for these lessons once, with outages, late nights and unhappy customers. Scar Tissue makes sure you only pay once. Thank you."

---

## After recording

1. iMovie → New Movie → drag the clips in **scene order (1 → 9)**, even though you recorded Scene 7 first.
2. Cut the wait in Scene 3 and any long pauses. **Make sure the total is under 5:00** (aim for about 4:45).
3. Export 1080p → upload to YouTube (Public or Unlisted) → paste the link into Devpost.

**Running long?** Cut in this order: Scene 5 → the code part of Scene 8 (keep the diagram) → the "What's next" line → the postmortem link click in Scene 4.

## If something goes wrong

| Problem | Fix |
|---|---|
| No comment after 30 s | Refresh. Still nothing? Run `forge logs -e development`. |
| Footer issue shows a match | Use a different unrelated summary, e.g. `Book venue for team offsite`. |
| Rovo credits run out | Use your earlier screenshot of the Rovo answer for Scene 7, with the voiceover. |
| You stumble on words | Pause, repeat the sentence, and cut it later. |
