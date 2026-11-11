import api from '@forge/api';
import { getIssue, searchIncidents } from '../data/jira.js';
import { searchPostmortems } from '../data/confluence.js';
import { linkPostmortems } from '../core/lessons.js';
import { buildIndex, findMatches } from '../core/similarity.js';
import { assessRisk } from '../core/risk.js';

// One entry point used by the issue panel, the Rovo actions and the trigger.
// `as` is 'user' (respects the viewer's permissions) or 'app' (background jobs).
export function client(as = 'user') {
  return as === 'app' ? api.asApp() : api.asUser();
}

export async function loadScars(as = 'user') {
  const c = client(as);
  const [incidents, postmortems] = await Promise.all([searchIncidents(c), searchPostmortems(c)]);
  return { scars: linkPostmortems(incidents, postmortems), postmortemCount: postmortems.length };
}

export async function analyzeIssue(issueKey, { as = 'user', limit = 5 } = {}) {
  const c = client(as);
  const [issue, { scars, postmortemCount }] = await Promise.all([getIssue(c, issueKey), loadScars(as)]);
  return analyze(issue, scars, { limit, postmortemCount });
}

// Free-text search, for "has anything like X broken before?" questions.
export async function analyzeText(text, { as = 'user', limit = 5 } = {}) {
  const { scars, postmortemCount } = await loadScars(as);
  return analyze({ key: null, summary: text, description: '' }, scars, { limit, postmortemCount });
}

function analyze(issue, scars, { limit, postmortemCount }) {
  const matches = findMatches(buildIndex(scars), issue, { limit });
  return {
    issue: { key: issue.key, summary: issue.summary },
    searched: { incidents: scars.length, postmortems: postmortemCount },
    ...assessRisk(matches),
  };
}
