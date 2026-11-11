import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractLessons, linkPostmortems } from '../src/core/lessons.js';

const PAGE = `
<p>Incident: INC-42 (payments webhook outage). Related: PAY-100.</p>
<h2>Summary</h2><p>Webhooks failed for 47 minutes.</p>
<h2>Root cause</h2><p>The v3 schema dropped a field the consumer still required.</p>
<h2>Lessons learned</h2>
<ul><li>Always replay the dead-letter queue after a schema change.</li><li>Schema changes need a consumer contract test.</li></ul>
<h2>Action items</h2>
<ac:task-list><ac:task><ac:task-status>incomplete</ac:task-status><ac:task-body>Add contract test to CI</ac:task-body></ac:task></ac:task-list>
`;

test('extractLessons finds root cause, lessons and action items', () => {
  const r = extractLessons(PAGE);
  assert.deepEqual(r.rootCause, ['The v3 schema dropped a field the consumer still required.']);
  assert.equal(r.lessons.length, 2);
  assert.match(r.lessons[0], /dead-letter queue/);
  assert.deepEqual(r.actionItems, ['Add contract test to CI']);
});

test('extractLessons finds linked issue keys', () => {
  assert.deepEqual(extractLessons(PAGE).linkedKeys, ['INC-42', 'PAY-100']);
});

test('extractLessons handles alternative headings', () => {
  const r = extractLessons('<h3>What we learned</h3><p>Feature flags first.</p><h3>Follow-ups</h3><ul><li>Write runbook</li></ul>');
  assert.deepEqual(r.lessons, ['Feature flags first.']);
  assert.deepEqual(r.actionItems, ['Write runbook']);
});

test('extractLessons is safe on empty input', () => {
  assert.deepEqual(extractLessons(''), { rootCause: [], lessons: [], actionItems: [], linkedKeys: [] });
});

test('linkPostmortems attaches lessons to the incident they mention', () => {
  const scars = [{ key: 'INC-42', summary: 'x' }, { key: 'INC-7', summary: 'y' }];
  const linked = linkPostmortems(scars, [{ id: '1', title: 'PM: INC-42', url: '/pm', body: PAGE }]);
  assert.equal(linked[0].postmortems.length, 1);
  assert.equal(linked[0].postmortems[0].title, 'PM: INC-42');
  assert.equal(linked[1].postmortems.length, 0);
});
