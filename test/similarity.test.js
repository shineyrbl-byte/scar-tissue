import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenize, adfToText, storageToText, stem } from '../src/core/text.js';
import { buildIndex, findMatches } from '../src/core/similarity.js';

test('tokenize drops stop words, numbers and stems plurals', () => {
  assert.deepEqual(tokenize('The webhook timeouts are failing in 2026'), ['webhook', 'timeout', 'fail']);
});

test('tokenize keeps hyphenated service names together', () => {
  assert.ok(tokenize('payments-webhook crashed').includes('payments-webhook'));
});

test('stem leaves short words alone', () => {
  assert.equal(stem('bus'), 'bus');
  assert.equal(stem('caches'), 'cach');
});

test('adfToText flattens nested Atlassian Document Format', () => {
  const adf = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Queue' }, { type: 'text', text: 'backed up' }] }] };
  assert.equal(adfToText(adf).replace(/\s+/g, ' '), 'Queue backed up');
});

test('storageToText strips tags and decodes entities', () => {
  assert.equal(storageToText('<h2>Root&nbsp;cause</h2><p>A &amp; B</p>'), 'Root cause\nA & B');
});

const scars = [
  { key: 'INC-1', summary: 'Payments webhook timeouts after schema change', description: 'Dead-letter queue filled up', components: ['payments-webhook'], labels: ['incident'] },
  { key: 'INC-2', summary: 'Login page slow for EU users', description: 'CDN cache misconfigured', components: ['auth'], labels: ['incident', 'cdn'] },
  { key: 'INC-3', summary: 'Search index rebuild took down search', description: 'Reindex ran at peak', components: ['search'], labels: ['incident'] },
];

test('findMatches ranks the related incident first and explains why', () => {
  const index = buildIndex(scars);
  const issue = { key: 'PAY-9', summary: 'Change webhook payload schema', description: 'Add new field to payments webhook', components: ['payments-webhook'] };
  const [top] = findMatches(index, issue);
  assert.equal(top.scar.key, 'INC-1');
  assert.deepEqual(top.why.sharedComponents, ['payments-webhook']);
  assert.ok(top.why.sharedTerms.includes('webhook'));
});

test('findMatches ignores unrelated issues', () => {
  const index = buildIndex(scars);
  const matches = findMatches(index, { key: 'X-1', summary: 'Update team offsite agenda', description: 'Book venue' });
  assert.equal(matches.length, 0);
});

test('findMatches never matches an issue against itself', () => {
  const index = buildIndex(scars);
  const matches = findMatches(index, scars[0]);
  assert.ok(matches.every((m) => m.scar.key !== 'INC-1'));
});

test('free-text queries are not penalised for having no components', () => {
  const index = buildIndex(scars);
  const [top] = findMatches(index, { summary: 'login slow for EU users, CDN cache' });
  assert.equal(top.scar.key, 'INC-2');
  assert.ok(top.score > 0.5, `expected a strong score, got ${top.score}`);
});

test('free-text component mentions match whole words only', () => {
  const index = buildIndex(scars);
  const hit = findMatches(index, { summary: 'search reindex' }).find((m) => m.scar.key === 'INC-3');
  assert.deepEqual(hit.why.sharedComponents, ['search']);
  const miss = findMatches(index, { summary: 'research reindex' }).find((m) => m.scar.key === 'INC-3');
  assert.deepEqual(miss?.why.sharedComponents ?? [], []);
});
