import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessRisk, severityWeight, recencyWeight, riskToMarkdown, checklistAdf } from '../src/core/risk.js';

const NOW = new Date('2026-11-01').getTime();
const priya = { accountId: 'a1', displayName: 'Priya' };
const pm = { title: 'PM: webhook outage', url: '/pm', lessons: ['Replay the DLQ after schema changes'], actionItems: ['Add contract test'], rootCause: ['Dropped field'] };

const match = (key, score, extra = {}) => ({
  score,
  why: { sharedTerms: ['webhook'], sharedComponents: ['payments-webhook'], sharedLabels: [] },
  scar: { key, summary: `Incident ${key}`, priority: 'Highest', created: '2026-09-01', resolver: priya, postmortems: [pm], ...extra },
});

test('severity and recency weights', () => {
  assert.equal(severityWeight('Highest'), 1);
  assert.equal(severityWeight('P2'), 0.8);
  assert.equal(severityWeight(undefined), 0.5);
  assert.equal(recencyWeight(new Date(NOW).toISOString(), NOW), 1);
  assert.ok(Math.abs(recencyWeight('2026-05-05', NOW) - 0.5) < 0.02);
});

test('no matches means no risk', () => {
  const r = assessRisk([], { now: NOW });
  assert.equal(r.level, 'none');
});

test('repeated severe incidents in one component are high risk', () => {
  const r = assessRisk([match('INC-1', 0.6), match('INC-2', 0.4, { created: '2026-03-01' }), match('INC-3', 0.3)], { now: NOW });
  assert.equal(r.level, 'high');
  assert.match(r.headline, /Changes to payments-webhook caused 3 incidents in the last 8 months/);
  assert.deepEqual(r.experts.map((e) => [e.displayName, e.count]), [['Priya', 3]]);
});

test('lessons are deduplicated and lessons come before root causes', () => {
  const r = assessRisk([match('INC-1', 0.6), match('INC-2', 0.5)], { now: NOW });
  assert.deepEqual(r.lessons.map((l) => l.kind), ['lesson', 'action', 'cause']);
});

test('a single weak old low-priority match is low risk', () => {
  const r = assessRisk([match('INC-9', 0.15, { priority: 'Low', created: '2024-01-01' })], { now: NOW });
  assert.equal(r.level, 'low');
  assert.match(r.headline, /This looks like INC-9/);
});

test('markdown and ADF renderers include the important bits', () => {
  const r = assessRisk([match('INC-1', 0.6)], { now: NOW });
  const md = riskToMarkdown(r);
  assert.match(md, /INC-1/);
  assert.match(md, /Replay the DLQ/);
  const adf = checklistAdf(r);
  const tasks = adf.content.find((n) => n.type === 'taskList');
  assert.equal(tasks.content.length, 2); // lesson + action item, not root cause
  assert.ok(JSON.stringify(adf).includes('"type":"mention"'));
});
