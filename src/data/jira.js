import { route } from '@forge/api';
import { adfToText } from '../core/text.js';
import { INCIDENT_JQL, MAX_INCIDENTS } from '../config.js';

const FIELDS = ['summary', 'description', 'components', 'labels', 'priority', 'created', 'resolutiondate', 'assignee', 'issuetype', 'status', 'project'];

export function toScar(issue) {
  const f = issue.fields || {};
  return {
    key: issue.key,
    summary: f.summary || '',
    description: adfToText(f.description),
    components: (f.components || []).map((c) => c.name),
    labels: f.labels || [],
    priority: f.priority?.name,
    created: f.created,
    resolved: f.resolutiondate,
    status: f.status?.name,
    type: f.issuetype?.name,
    project: f.project?.key,
    assignee: f.assignee ? { accountId: f.assignee.accountId, displayName: f.assignee.displayName, avatarUrl: f.assignee.avatarUrls?.['48x48'] } : null,
  };
}

async function json(res, what) {
  if (!res.ok) throw new Error(`${what} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function getIssue(api, issueKey) {
  const res = await api.requestJira(route`/rest/api/3/issue/${issueKey}?fields=${FIELDS.join(',')}`);
  return toScar(await json(res, `Fetching ${issueKey}`));
}

export async function searchIncidents(api) {
  let lastError;
  for (const jql of INCIDENT_JQL) {
    const res = await api.requestJira(route`/rest/api/3/search/jql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ jql, fields: FIELDS, maxResults: MAX_INCIDENTS }),
    });
    if (res.status === 400) { lastError = await res.text(); continue; } // e.g. no "Incident" type on this site
    const data = await json(res, 'Incident search');
    return (data.issues || []).map(toScar);
  }
  throw new Error(`Incident search failed: ${lastError}`);
}

export async function addComment(api, issueKey, adfBody) {
  const res = await api.requestJira(route`/rest/api/3/issue/${issueKey}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ body: adfBody }),
  });
  return json(res, `Commenting on ${issueKey}`);
}

export async function addLabel(api, issueKey, label) {
  const res = await api.requestJira(route`/rest/api/3/issue/${issueKey}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ update: { labels: [{ add: label }] } }),
  });
  if (!res.ok) throw new Error(`Labelling ${issueKey} failed: ${res.status}`);
}
