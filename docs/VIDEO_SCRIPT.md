# Scar Tissue: demo video script (max 3:00)

Target **2:50**. Upload to YouTube as **Public**. About 130 spoken words per minute, so every line below is kept short.

---

## Before you record

**Slides** (1920×1080, drag into iMovie): `docs/video/title.png` · `how-it-works.png` · `closing.png`

**Browser**
- [ ] Clean Chrome window, logged in to avisha-dev.atlassian.net
- [ ] Bookmarks bar hidden (Cmd+Shift+B), other tabs closed, zoom **110–125%**
- [ ] Do Not Disturb on

**Tabs, in order:** Confluence ENG page list · Jira PAY board · README "How it works" diagram

**Recording:** Cmd+Shift+5 → *Record Selected Portion* → browser only → mic on. One clip per scene; join them in iMovie.

> ⚠️ **Rovo credits are limited.** Record **Scene 4 (Rovo) first**, in a single take, and don't test the question beforehand. Every other scene is free to re-record as often as you like.

---

## Scene 1: Problem (0:00 – 0:20)

**Screen:** Confluence ENG space, scroll slowly past the postmortem pages, then cut to the Jira board showing PAY-1, PAY-2, PAY-3.

**Say:**
> "Every team writes postmortems after an outage, and then nobody reads them again. Our payments webhook broke three times. The lessons were written down. They just weren't in front of the next engineer."

---

## Scene 2: Live issue and the automatic warning (0:20 – 1:00)

**Screen:** PAY board → **+ Create**
- Work type: **Task**
- Summary: `Add dispute_status field to payments webhook payload`
- Component: `payments-webhook`
- Description: `Add a new field to the payment webhook schema and roll it out to all merchants on Friday.`

Click **Create** and open the issue.

**Say:**
> "This is Scar Tissue, a Forge app and Rovo agent that's your team's incident memory. A developer adds one field to the payments webhook. Looks harmless."

> ✂️ *Stop recording. Wait ~20 s. Refresh the issue, then start the next clip.*

**Screen:** Scroll to the Scar Tissue comment. Point at the red line, then tick one checklist box.

**Say:**
> "Before any code is written, Scar Tissue has already warned us: this area caused three incidents. Here's a checklist from our own postmortems, and who fixed it last time."

---

## Scene 3: Issue panel (1:00 – 1:40)

**Screen:** Click the **Scar Tissue** button (plaster icon) under the issue title. Move your cursor over: the High risk banner → one lesson and its postmortem link → *Who knows this area* → the purple `payments-webhook` tag in the incidents table.

**Say:**
> "The panel shows the full picture: risk level, lessons linked to the postmortem they came from, the people to ask, and every matching incident. And it's not a black box. Each match shows why: the shared component and words. Nothing is made up."

---

## Scene 4: Rovo agent (1:40 – 2:20) · *record this first, one take*

**Screen:** Click **Rovo** → choose **Scar Tissue** → paste:

> `We're rotating the auth signing key next week. Anything I should know?`

Send it and scroll the answer slowly.

**Say:**
> "No ticket yet? Just ask. I'm about to rotate our auth signing key… It found the outage from the last rotation, and the two steps we missed: publish the new key first, and purge the edge cache. Exactly the mistake we'd have repeated."

---

## Scene 5: How it works and close (2:20 – 2:50)

**Screen:** `docs/video/how-it-works.png`, then `docs/video/closing.png`.

**Say:**
> "It's all Forge: an issue panel, a trigger on new issues, and a Rovo agent whose actions any other agent can reuse. It reads Jira incidents and Confluence postmortems, and matches them by component, wording, severity and recency.
> Your team already paid for these lessons once. Scar Tissue makes sure you only pay once."

---

## After recording

1. Join the clips in **iMovie** or CapCut. Cut the wait in Scene 2. **Check the total is under 3:00.**
2. Optional: a 2-second title card at the start (counts toward the 3:00) and soft music at about 10% volume.
3. Export **1080p**. Upload to YouTube as **Public**.
   - Title: `Scar Tissue – Forge app + Rovo agent that stops repeat incidents | Codegeist 2026`
   - Description: the tagline plus https://github.com/shineyrbl-byte/scar-tissue
4. Paste the link into Devpost.

**Running long?** Cut in this order: the "It's all Forge…" sentence in Scene 5 → the Confluence scroll in Scene 1 → the checkbox tick in Scene 2.

## If something goes wrong

| Problem | Fix |
|---|---|
| No comment after 30 s | Refresh. Still nothing? Run `forge logs -e development`. |
| Panel shows "No scars" | Check the issue has component `payments-webhook`. |
| Rovo credits run out | Use your earlier screenshot of the PAY-6 answer for Scene 4, with the same voiceover adapted to the payments issue. |
| You stumble on words | Pause, repeat the sentence, and cut it later. |
