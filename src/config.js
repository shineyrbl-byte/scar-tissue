// What counts as a "scar". The first JQL needs the JSM "Incident" issue type;
// if the site doesn't have it, we fall back to the second one.
export const INCIDENT_JQL = [
  'issuetype = Incident OR labels in (incident, outage, postmortem) OR (issuetype = Bug AND priority in (Highest, High)) ORDER BY created DESC',
  'labels in (incident, outage, postmortem) OR (issuetype = Bug AND priority in (Highest, High)) ORDER BY created DESC',
];

export const POSTMORTEM_CQL =
  'type = page AND (label in ("postmortem", "post-mortem", "incident-review") OR title ~ "postmortem" OR title ~ "post-mortem" OR title ~ "incident review")';

export const MAX_INCIDENTS = 100;
export const MAX_POSTMORTEMS = 25;

// Comment automatically on new issues only when the match is this strong.
export const AUTO_WARN_LEVELS = ['high'];
export const AUTO_WARN_LABEL = 'scar-tissue-warned';
