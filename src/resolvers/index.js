import ResolverModule from '@forge/resolver';

// @forge/resolver is CommonJS; when bundled as ESM the class sits under .default.
const Resolver = ResolverModule.default ?? ResolverModule;
import api from '@forge/api';
import { analyzeIssue } from '../service/scars.js';
import { addComment } from '../data/jira.js';
import { checklistAdf } from '../core/risk.js';

const resolver = new Resolver();

function issueKeyFrom(context) {
  const key = context?.extension?.issue?.key;
  if (!key) throw new Error('Open Scar Tissue from a Jira issue.');
  return key;
}

resolver.define('analyze', async ({ context }) => {
  return analyzeIssue(issueKeyFrom(context));
});

resolver.define('addChecklist', async ({ context }) => {
  const key = issueKeyFrom(context);
  const risk = await analyzeIssue(key);
  await addComment(api.asUser(), key, checklistAdf(risk));
  return { ok: true, items: risk.lessons.filter((l) => l.kind !== 'cause').length };
});

export const handler = resolver.getDefinitions();
