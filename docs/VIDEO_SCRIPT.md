# Scar Tissue: demo video script

Target length **about 4:20** (the limit is 5:00). Upload to YouTube as **Public**.

---

## Before you record (10 min)

**Browser**
- [ ] Use Chrome. Open a clean window (Cmd+Shift+N for incognito, or a new profile) and log in to avisha-dev.atlassian.net.
- [ ] Hide the bookmarks bar (Cmd+Shift+B) and close other tabs.
- [ ] Zoom to **110–125%** (Cmd and +) so text is readable on YouTube.
- [ ] Turn on Do Not Disturb so no notifications pop up.

**Tabs, open in this order**
1. Confluence → **ENG** space → page list showing the 3 postmortems
2. Jira → **PAY** board
3. PAY-1 (a past incident, used for one shot)
4. A slide or the GitHub README showing the "How it works" diagram

**Data check**
- [ ] Ask the Rovo agent the auth question once beforehand, so you know the answer looks right.
- [ ] Have the demo issue text ready to paste (Scene 3).

**Recording**
- macOS: press **Cmd+Shift+5** → *Record Selected Portion* → select only the browser window → Options → Microphone: your mic.
- Record **each scene as a separate clip**. It's much easier than one perfect take. Join them in iMovie or CapCut.
- Talk slowly. Pause 1 second before and after each click.

---

## Scene 1: The hook (0:00 – 0:20)

**Screen:** Confluence ENG space, list of postmortem pages. Slowly scroll past them.

**Say:**
> "Every engineering team writes postmortems after an outage. They're full of hard-won lessons. And then… nobody reads them again."

---

## Scene 2: The problem (0:20 – 0:40)

**Screen:** Open **PAY-1** ("Payments webhook timeouts after v2 schema change"), then the Jira board showing PAY-1, PAY-2, PAY-3.

**Say:**
> "So the same areas break again. Here, our payments webhook broke three times, and every time someone wrote down what to do differently. The knowledge existed. It just wasn't in front of the next engineer at the moment it mattered."

---

## Scene 3: Meet Scar Tissue + create an issue live (0:40 – 1:15)

**Screen:** Jira PAY board → click **+ Create**.

Fill in:
- **Work type:** Task
- **Summary:** `Add dispute_status field to payments webhook payload`
- **Component:** `payments-webhook`
- **Description:** `Merchants want dispute updates. Add a new field to the payment webhook schema and roll it out to all merchants on Friday.`

Click **Create**, then open the new issue.

**Say:**
> "This is Scar Tissue: a Forge app and Rovo agent that's your team's incident memory.
> Watch. A developer creates a ticket to add one field to the payments webhook. Looks harmless. Ship it Friday."

> ✂️ *Stop recording here. Wait ~20 seconds for the comment to arrive, then start the next clip.*

---

## Scene 4: The automatic warning (1:15 – 1:45)

**Screen:** Refresh the issue. Scroll to **Activity → Comments** and show the Scar Tissue comment. Point your cursor at the red line and the checklist.

**Say:**
> "Before anyone has written a line of code, Scar Tissue has already commented. Changes to payments-webhook caused three incidents. And here's the checklist, taken straight from our own postmortems: contract tests, replaying the dead-letter queue, a version flag. It even mentions who fixed this last time."

**Action:** tick one checklist box.

> "Now the review has to look at them."

---

## Scene 5: The issue panel (1:45 – 2:35)

**Screen:** Scroll up and click the **Scar Tissue** button (plaster icon) under the issue title. The panel opens.

Move your cursor slowly over:
1. The red **High risk** banner and headline
2. **What we learned last time**: point at one lesson, then hover the postmortem link
3. **Who knows this area**
4. **Similar past incidents** table: point at the purple `payments-webhook` tag and the word tags

**Say:**
> "Open the panel and you get the full picture. The risk level. The lessons, each linked to the postmortem it came from. The people who fixed it before. And every past incident that matched.
> This part matters: it's not a black box. Every match shows why: the shared component and the shared words. Scar Tissue never invents a lesson. Everything links back to something your team actually wrote."

**Optional (5 sec):** click a postmortem link to show the Confluence page opening, then come back.

---

## Scene 6: Ask the Rovo agent (2:35 – 3:25)

**Screen:** Click **Rovo** in the top bar → pick the **Scar Tissue** agent → type:

> `We're rotating the auth signing key next week. Anything I should know?`

Let the answer appear and scroll through it slowly.

**Say (while typing):**
> "But what if there's no ticket yet? You just ask. I'm planning to rotate our auth signing key."

**Say (when the answer shows):**
> "It found the EU login outage from the last rotation, and the two steps we missed: publish the new key to JWKS first, and purge the edge cache. That's the exact mistake we'd have made again."

**Optional (10 sec):** go back to the PAY issue, ask *"Has anything like this issue broken before?"*, then say **"yes"** when it offers the checklist.

---

## Scene 7: How it works (3:25 – 4:00)

**Screen:** The "How it works" diagram (README or a slide). Optionally flash `manifest.yml` for 3 seconds.

**Say:**
> "Under the hood, it's all Forge. A Jira issue panel, a trigger on new issues, and a Rovo agent. Scar Tissue reads past incidents from Jira and postmortems from Confluence, pulls out the root causes, lessons and action items, and matches them to new work by component and wording, weighted by severity, how recent it was, and how often it's happened.
> The agent's three actions (find scars, search scars, and add a pre-ship checklist) are reusable, so any other Rovo agent, like a release agent, can check for scars before it ships."

---

## Scene 8: Close (4:00 – 4:20)

**Screen:** Back to the issue with the panel open, or a title card: **🩹 Scar Tissue: your team's incident memory.**

**Say:**
> "Your team already paid for these lessons once, with outages, late nights and angry customers. Scar Tissue makes sure you only pay once. Thanks for watching."

---

## After recording

1. Join the clips in **iMovie** (or CapCut). Cut the waiting time in Scene 3.
2. Add a title card at the start (2 sec): **Scar Tissue · Codegeist 2026 · Apps for Software Teams**.
3. Optional: soft background music at about 10% volume.
4. Export as **1080p**.
5. Upload to YouTube:
   - Title: `Scar Tissue – Forge app + Rovo agent that stops repeat incidents | Codegeist 2026`
   - Visibility: **Public**
   - Description: the tagline, plus the GitHub link https://github.com/shineyrbl-byte/scar-tissue
6. Paste the YouTube link into the Devpost submission.

## If something goes wrong while recording

| Problem | Fix |
|---|---|
| No comment after 30 s | Refresh. Still nothing? Run `forge logs -e development` in Terminal. |
| Panel shows "No scars" | Check the issue has component `payments-webhook`. |
| Rovo picks the wrong agent | Click the agent name at the top of the chat and choose Scar Tissue again. |
| You stumble on words | Keep going, pause, and repeat the sentence. Cut it later. |
