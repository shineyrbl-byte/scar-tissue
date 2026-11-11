#!/usr/bin/env node
// Fills a TEST Jira project + Confluence space with realistic past incidents and
// postmortems so Scar Tissue has something to remember.
//
//   cp .env.example .env   # fill it in
//   node --env-file=.env scripts/seed-demo.mjs

const { ATLASSIAN_SITE, ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN, JIRA_PROJECT, CONFLUENCE_SPACE } = process.env;
if (!ATLASSIAN_SITE || !ATLASSIAN_EMAIL || !ATLASSIAN_API_TOKEN || !JIRA_PROJECT) {
  console.error('Set ATLASSIAN_SITE, ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN and JIRA_PROJECT (see .env.example).');
  process.exit(1);
}

const base = `https://${ATLASSIAN_SITE}`;
const auth = 'Basic ' + Buffer.from(`${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}`).toString('base64');

async function call(method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: { Authorization: auth, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

const adf = (...paras) => ({ type: 'doc', version: 1, content: paras.map((t) => ({ type: 'paragraph', content: [{ type: 'text', text: t }] })) });

const COMPONENTS = ['payments-webhook', 'auth', 'search'];

const INCIDENTS = [
  {
    id: 'webhook-1', component: 'payments-webhook', priority: 'Highest',
    summary: 'Payments webhook timeouts after v2 schema change',
    description: 'Merchants stopped receiving payment.succeeded webhooks for 47 minutes after the v2 payload schema rolled out. Dead-letter queue filled up and was never replayed.',
  },
  {
    id: 'webhook-2', component: 'payments-webhook', priority: 'Highest',
    summary: 'Duplicate payment webhooks sent after retry storm',
    description: 'A deploy of the webhook dispatcher removed the idempotency key, so retries sent duplicate payment events. Some merchants shipped orders twice.',
  },
  {
    id: 'webhook-3', component: 'payments-webhook', priority: 'High',
    summary: 'Webhook consumer crashed on new optional field in payload',
    description: 'Added an optional refund_reason field to the webhook payload. A large merchant consumer used strict schema validation and crashed. No contract test caught it.',
  },
  {
    id: 'auth-1', component: 'auth', priority: 'High',
    summary: 'Login failures for EU users after token signing key rotation',
    description: 'Rotated the JWT signing key without publishing the new key to the JWKS endpoint first. EU edge cached the old JWKS for 1 hour.',
  },
  {
    id: 'search-1', component: 'search', priority: 'High',
    summary: 'Search unavailable during full reindex at peak traffic',
    description: 'Full Elasticsearch reindex ran at 10am and saturated the cluster. Search returned errors for 25 minutes.',
  },
];

const POSTMORTEMS = [
  {
    title: 'Postmortem: payments webhook outage (v2 schema)',
    for: ['webhook-1', 'webhook-3'],
    body: (k) => `
<p>Incidents: ${k['webhook-1']}, ${k['webhook-3']}</p>
<h2>Summary</h2><p>Webhook deliveries failed or crashed consumers after payload schema changes.</p>
<h2>Root cause</h2><p>Schema changes shipped without checking how merchant consumers parse the payload.</p>
<h2>Lessons learned</h2>
<ul>
<li>Every webhook schema change needs a consumer contract test against the top 10 merchant parsers.</li>
<li>Always replay the dead-letter queue after a schema change and confirm it is empty.</li>
<li>Ship new payload fields behind a per-merchant version flag first.</li>
</ul>
<h2>Action items</h2>
<ul><li>Add webhook contract tests to CI</li><li>Add a DLQ depth alert above 500 messages</li></ul>`,
  },
  {
    title: 'Postmortem: duplicate payment webhooks',
    for: ['webhook-2'],
    body: (k) => `
<p>Incident: ${k['webhook-2']}</p>
<h2>What went wrong</h2><p>The idempotency key header was removed during a dispatcher refactor.</p>
<h2>What we learned</h2>
<ul><li>Never remove the Idempotency-Key header from webhook dispatch; it is part of the public contract.</li>
<li>Retry changes need a load test with 10x retry volume before release.</li></ul>
<h2>Follow-ups</h2><ul><li>Add a test that fails if Idempotency-Key is missing</li></ul>`,
  },
  {
    title: 'Incident review: EU login failures after key rotation',
    for: ['auth-1'],
    body: (k) => `
<p>Incident: ${k['auth-1']}</p>
<h2>Root cause</h2><p>New signing key was used before it was published to JWKS; edge cache kept the old set.</p>
<h2>Lessons learned</h2>
<ul><li>Publish the new key to JWKS at least 2 hours before signing with it.</li>
<li>Purge the JWKS edge cache as part of the rotation runbook.</li></ul>`,
  },
];

async function main() {
  const me = await call('GET', '/rest/api/3/myself');
  console.log(`Seeding as ${me.displayName} into ${JIRA_PROJECT}`);

  const existing = new Set((await call('GET', `/rest/api/3/project/${JIRA_PROJECT}/components`)).map((c) => c.name));
  for (const name of COMPONENTS) {
    if (existing.has(name)) continue;
    await call('POST', '/rest/api/3/component', { name, project: JIRA_PROJECT });
    console.log(`  component ${name}`);
  }

  const keys = {};
  for (const inc of INCIDENTS) {
    const fields = {
      project: { key: JIRA_PROJECT },
      issuetype: { name: 'Bug' },
      summary: inc.summary,
      description: adf(inc.description),
      // Pre-labelled so the auto-warning trigger skips seeded history.
      labels: ['incident', 'scar-tissue-warned'],
      components: [{ name: inc.component }],
      assignee: { accountId: me.accountId },
      priority: { name: inc.priority },
    };
    let created;
    try {
      created = await call('POST', '/rest/api/3/issue', { fields });
    } catch (err) {
      // Some project screens don't allow priority/assignee; retry without them.
      console.warn(`  retrying ${inc.id} without priority/assignee (${err.message.slice(0, 80)})`);
      delete fields.priority;
      delete fields.assignee;
      created = await call('POST', '/rest/api/3/issue', { fields });
    }
    keys[inc.id] = created.key;
    console.log(`  incident ${created.key}: ${inc.summary}`);
  }

  if (CONFLUENCE_SPACE) {
    const space = (await call('GET', `/wiki/api/v2/spaces?keys=${CONFLUENCE_SPACE}`)).results?.[0];
    if (!space) throw new Error(`Confluence space ${CONFLUENCE_SPACE} not found`);
    for (const pm of POSTMORTEMS) {
      const page = await call('POST', '/wiki/api/v2/pages', {
        spaceId: space.id,
        status: 'current',
        title: `${pm.title} (${pm.for.map((id) => keys[id]).join(', ')})`,
        body: { representation: 'storage', value: pm.body(keys) },
      });
      await call('POST', `/wiki/rest/api/content/${page.id}/label`, [{ prefix: 'global', name: 'postmortem' }]);
      console.log(`  postmortem page ${page.id}: ${pm.title}`);
    }
  }

  console.log('\nDone. Now create the demo issue from docs/DEMO.md and open it.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
