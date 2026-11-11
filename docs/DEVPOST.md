## Inspiration

Every postmortem I've seen ends with a confident list of "lessons learned". Then the page gets filed in Confluence and nobody opens it again. Months later someone touches the same service, makes the same mistake, and the team writes the same postmortem.

The knowledge isn't missing. It's in the wrong place at the wrong time. Codegeist's theme, *"AI can think, but knowing what to do takes context"*, described exactly this. My team's most expensive context is the scar tissue from past outages. I wanted to put it in front of the engineer at the moment they're about to reopen the wound.

## What it does

**Scar Tissue** is a Forge app and Rovo agent that works as my team's incident memory.

- **Warns on new issues automatically.** When a Jira issue is created, Scar Tissue compares it to past incidents. If the match is strong, it comments before anyone writes code. For example: *"🔴 Changes to payments-webhook caused 3 incidents."* The comment includes a checklist built from our own postmortems and @mentions the people who fixed it last time.
- **Issue panel.** Every issue gets a risk card with:
  - the risk level
  - lessons, action items and root causes, each linked to the postmortem it came from
  - who knows the area
  - a table of matching incidents that shows **why** each one matched (shared components and words)
- **One-click pre-ship checklist.** Turns those lessons into Jira tasks on the issue, so they become part of the review.
- **Rovo agent.** I can ask *"We're rotating the auth signing key next week. Anything I should know?"* even before a ticket exists. It finds the EU login outage from the last rotation and the two steps we forgot.
- **Reusable Rovo actions.** `find-scars`, `search-scars` and `add-preship-checklist` are general-purpose actions, so any other Rovo agent can check for scars before it ships something.

## How we built it

I built it on **Forge** (Node.js 22 runtime) with **UI Kit** for the native Jira issue panel, plus:

- **Jira:** the `jira:issuePanel` module, JQL search for past incidents, the REST API for comments and labels, and an `avi:jira:created:issue` trigger for the automatic warnings.
- **Confluence:** CQL search for postmortem pages, and a parser that reads storage-format HTML and pulls out *Root cause*, *Lessons learned* and *Action items* sections. It also picks up the alternative headings people actually use, like "What we learned" and "Follow-ups". It links each postmortem to the incidents it mentions by finding issue keys in the page.
- **Rovo:** a `rovo:agent` with a prompt that tells it to cite every lesson and never invent incidents, plus three `action` modules.

I kept the matching engine **deterministic and explainable**, so the agent never has to guess. Each past incident is scored against the new issue:

$$\text{match} = 0.7\,\cos(\vec{q}, \vec{d}) + 0.2\,C + 0.1\,L$$

where $\cos(\vec{q}, \vec{d})$ is TF-IDF cosine similarity between the texts, and $C$ and $L$ measure shared components and labels. Each match is then weighted by severity $\sigma$, recency (half-life of 180 days) and repetition:

$$w = \text{match} \cdot (0.5 + 0.5\,\sigma) \cdot \left(0.6 + 0.4 \cdot 2^{-t/180}\right)$$

The core logic (tokenising, matching, postmortem parsing, risk scoring, checklist building) is pure JavaScript with no Forge imports. That let me cover it with **22 unit tests** that run in GitHub Actions. I also wrote a seed script that fills a test site with realistic incidents and postmortems, so anyone can reproduce the demo.

## Challenges we ran into

- **Free-text questions always scored "low risk".** My first live test with Rovo found the right incident for the auth question but called it LOW risk. Typed questions have no Jira components or labels, and my formula counted those as zero, which capped the score at 70%. I changed it to score text-only queries on their wording, with a small boost when the question names a component ("rotating the **auth** key"). I also dropped chatty filler words and taught the stemmer that "rotating" and "rotation" are the same word. The same question now correctly comes back HIGH.
- **The app warned about itself.** When I seeded demo incidents, each new one matched the previous one, so the trigger commented on my own history. I now label seeded issues so the trigger skips them, and the matcher ignores its own label.
- **Not every site has an "Incident" issue type.** Jira Service Management sites do, plain Jira sites don't, and a JQL query naming a missing type fails outright. Scar Tissue tries the richer query first and falls back to labels plus high-priority bugs.
- **Making AI trustworthy for incidents.** On-call engineers won't act on a warning they can't verify. Rather than letting an LLM decide what's similar, I made matching transparent: every match shows its shared terms and components, and every lesson links to its source. Rovo explains the results; it doesn't make them up.
- **Rovo credits.** My developer site's Rovo allowance ran low while testing, so I tested the matching logic locally and saved the live Rovo calls for checks that needed the real agent.

## Accomplishments that we're proud of

- It works end to end on a real Atlassian site. I created an issue, and **about 15 seconds later** Scar Tissue posted a warning with the right lessons from the right postmortems.
- The Rovo agent answers with real citations, both for an issue and for a question with no ticket at all.
- It connects three silos (Jira incidents, Confluence postmortems and the people who fixed things) into one answer, at the moment it's useful.
- The core is fully unit-tested and explainable, not a black box.

## What we learned

- Context beats intelligence. Simple matching over the right data, shown at the right moment, beats a clever model shown at the wrong one.
- How Forge fits together: UI Kit panels, resolvers, product triggers, and how Rovo agents call Forge actions with the user's context (such as the issue they're viewing).
- Writing a good agent prompt is mostly about limits: what the agent must cite, what it must never invent, and when to offer an action.
- Test with real questions early. My scoring bug only showed up when I asked the agent something a person would actually ask.

## What's next for Scar Tissue: Incident Memory for Jira, Confluence & Rovo

- **Teamwork Graph:** use goals, people and service ownership from the graph for better matches and expert suggestions.
- **Bitbucket:** check pull requests too. If a diff touches files changed by past incident fixes, warn on the PR.
- **Jira Service Management:** read incident timelines and alerts directly, not only labelled issues.
- **Postmortem nudges:** when an incident closes without a postmortem, prompt the team to write one, because a lesson nobody writes down can't be remembered.
- **Marketplace:** publish it so any team can install it in a few clicks.
