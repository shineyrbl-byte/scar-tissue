# Privacy Policy: Scar Tissue

_Last updated: 11 November 2026_

Scar Tissue is an Atlassian Forge app that helps teams avoid repeat incidents by showing lessons from past incidents and postmortems on Jira issues and in Rovo chat.

## What data the app accesses

When it runs, Scar Tissue reads, on the Atlassian site where it is installed:

- **Jira issues** that look like incidents (summary, description, components, labels, priority, dates, status and assignee), plus the issue being viewed or created.
- **Confluence pages** that look like postmortems (title and page content).

Access always follows Atlassian permissions. In the issue panel and Rovo chat, the app acts as the signed-in user, so it can only see what that user can see.

## What the app does with it

- Compares the current issue or question with past incidents to find similar ones.
- Shows matching incidents, lessons and the people who resolved them, to users of that same site.
- When a user asks (or when a new issue strongly matches a past incident), adds a comment and a label to the Jira issue.

## What the app does NOT do

- **It does not store personal data.** Scar Tissue has no database. Data is processed in memory while a request runs and then discarded. It does not use Forge storage, and it does not cache data.
- **It does not send data outside Atlassian.** The app runs entirely on Atlassian's Forge platform and makes no calls to external servers.
- It does not sell, share or use your data for advertising or for training models.

## Rovo

When you chat with the Scar Tissue agent, the conversation is handled by Atlassian Rovo under Atlassian's own terms and privacy policy. Scar Tissue only provides the incident results the agent asks for.

## Removing data

Uninstalling the app stops all access. Comments and labels the app added to Jira issues stay on those issues like any other comment, and can be deleted in Jira.

## Contact

Questions or requests: open an issue at https://github.com/shineyrbl-byte/scar-tissue/issues or use the support contact on the app's installation page.
