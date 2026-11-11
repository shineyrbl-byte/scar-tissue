import api from '@forge/api';
import { analyzeIssue } from '../service/scars.js';
import { addComment, addLabel } from '../data/jira.js';
import { checklistAdf } from '../core/risk.js';
import { AUTO_WARN_LEVELS, AUTO_WARN_LABEL } from '../config.js';

// Runs when a Jira issue is created. If it strongly matches past incidents,
// Scar Tissue comments before anyone starts work, then labels the issue so it
// never comments twice.
export async function onIssueCreated(event) {
  const key = event?.issue?.key;
  if (!key) return;
  if ((event.issue.fields?.labels || []).includes(AUTO_WARN_LABEL)) return;

  try {
    const risk = await analyzeIssue(key, { as: 'app' });
    if (!AUTO_WARN_LEVELS.includes(risk.level)) {
      console.log(`${key}: ${risk.level} risk, no warning posted`);
      return;
    }
    await addComment(api.asApp(), key, checklistAdf(risk));
    await addLabel(api.asApp(), key, AUTO_WARN_LABEL);
    console.log(`${key}: warned (${risk.headline})`);
  } catch (err) {
    // Never block issue creation over a warning.
    console.error(`${key}: auto-warning failed`, err.message);
  }
}
