import api from '@forge/api';
import { analyzeIssue, analyzeText } from '../service/scars.js';
import { addComment } from '../data/jira.js';
import { checklistAdf, riskToMarkdown } from '../core/risk.js';

// Rovo passes action inputs at the top level of the payload, and the place it
// was opened from (e.g. the current Jira issue) under payload.context.
function issueKeyFrom(payload) {
  const key = payload.issueKey || payload.context?.jira?.issueKey;
  if (!key) throw new Error('No issue key given and not opened from a Jira issue.');
  return String(key).trim().toUpperCase();
}

// Keeps the response small so the agent can reason over it.
function compact(risk) {
  return {
    level: risk.level,
    score: risk.score,
    headline: risk.headline,
    searched: risk.searched,
    summary: riskToMarkdown(risk),
    incidents: risk.matches.map((m) => ({
      key: m.scar.key,
      summary: m.scar.summary,
      priority: m.scar.priority,
      created: m.scar.created,
      match: m.score,
      sharedComponents: m.why.sharedComponents,
      sharedTerms: m.why.sharedTerms,
      postmortems: (m.scar.postmortems || []).map((p) => ({ title: p.title, url: p.url })),
    })),
    lessons: risk.lessons,
    experts: risk.experts.map((e) => ({ name: e.displayName, fixed: e.keys })),
  };
}

function failure(err) {
  console.error(err);
  return { error: err.message || String(err) };
}

export async function findScars(payload) {
  try {
    return compact(await analyzeIssue(issueKeyFrom(payload)));
  } catch (err) {
    return failure(err);
  }
}

export async function searchScars(payload) {
  try {
    const query = String(payload.query || '').trim();
    if (!query) throw new Error('Describe the change or area to search for.');
    return compact(await analyzeText(query));
  } catch (err) {
    return failure(err);
  }
}

export async function addPreshipChecklist(payload) {
  try {
    const key = issueKeyFrom(payload);
    const risk = await analyzeIssue(key);
    if (risk.level === 'none') return { added: false, reason: 'No similar past incidents, so no checklist needed.' };
    await addComment(api.asUser(), key, checklistAdf(risk));
    return { added: true, issueKey: key, items: risk.lessons.filter((l) => l.kind !== 'cause').map((l) => l.text) };
  } catch (err) {
    return failure(err);
  }
}
