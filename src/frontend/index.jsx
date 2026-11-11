import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Box, Button, DynamicTable, EmptyState, Heading, Inline, Link, LoadingButton, Lozenge,
  ProgressBar, SectionMessage, Spinner, Stack, Strong, Tag, TagGroup, Text, User, xcss,
} from '@forge/react';
import { invoke } from '@forge/bridge';

const LEVEL = {
  high: { appearance: 'removed', label: 'High risk', msg: 'error' },
  medium: { appearance: 'moved', label: 'Medium risk', msg: 'warning' },
  low: { appearance: 'inprogress', label: 'Low risk', msg: 'information' },
  none: { appearance: 'success', label: 'No scars', msg: 'success' },
};

const KIND = { lesson: 'Lesson', action: 'Action item', cause: 'Root cause' };

const card = xcss({ padding: 'space.150', borderRadius: 'border.radius', backgroundColor: 'elevation.surface.sunken' });

function IncidentsTable({ matches }) {
  const head = {
    cells: [
      { key: 'key', content: 'Incident' },
      { key: 'summary', content: 'What happened' },
      { key: 'match', content: 'Match' },
      { key: 'why', content: 'Why it matched' },
    ],
  };
  const rows = matches.map((m) => ({
    key: m.scar.key,
    cells: [
      { key: 'key', content: <Link href={`/browse/${m.scar.key}`}>{m.scar.key}</Link> },
      {
        key: 'summary',
        content: (
          <Stack space="space.050">
            <Text>{m.scar.summary}</Text>
            <Text size="small" color="color.text.subtlest">
              {[m.scar.priority, m.scar.created?.slice(0, 10), m.scar.postmortems?.length ? '📄 postmortem' : null].filter(Boolean).join(' · ')}
            </Text>
          </Stack>
        ),
      },
      { key: 'match', content: <Text>{Math.round(m.score * 100)}%</Text> },
      {
        key: 'why',
        content: (
          <TagGroup>
            {m.why.sharedComponents.map((c) => <Tag key={`c-${c}`} text={c} color="purpleLight" />)}
            {m.why.sharedTerms.slice(0, 3).map((t) => <Tag key={`t-${t}`} text={t} />)}
          </TagGroup>
        ),
      },
    ],
  }));
  return <DynamicTable head={head} rows={rows} />;
}

function Lessons({ lessons }) {
  if (!lessons.length) {
    return <Text color="color.text.subtle">No postmortem found for these incidents. Worth writing one?</Text>;
  }
  return (
    <Stack space="space.100">
      {lessons.map((l, i) => (
        <Box key={i} xcss={card}>
          <Stack space="space.050">
            {/* Label on its own line so a long postmortem title can't squeeze it into "Less…". */}
            <Inline>
              <Lozenge appearance={l.kind === 'cause' ? 'default' : 'new'}>{KIND[l.kind]}</Lozenge>
            </Inline>
            <Text size="small" color="color.text.subtlest">
              from {l.from} · <Link href={l.postmortem.url} openNewTab>{l.postmortem.title}</Link>
            </Text>
            <Text>{l.text}</Text>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function App() {
  const [risk, setRisk] = useState(null);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(null);

  const load = () => {
    setRisk(null);
    setError(null);
    invoke('analyze').then(setRisk).catch((e) => setError(e.message || String(e)));
  };
  useEffect(load, []);

  const addChecklist = async () => {
    setPosting(true);
    try {
      setPosted(await invoke('addChecklist'));
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setPosting(false);
    }
  };

  if (error) return <SectionMessage appearance="error" title="Scar Tissue couldn't check this issue"><Text>{error}</Text></SectionMessage>;
  if (!risk) {
    return (
      <Inline space="space.100" alignBlock="center">
        <Spinner size="small" />
        <Text>Checking past incidents and postmortems…</Text>
      </Inline>
    );
  }

  const lvl = LEVEL[risk.level];
  const searched = `Checked ${risk.searched.incidents} past incidents and ${risk.searched.postmortems} postmortems.`;

  if (risk.level === 'none') {
    return <EmptyState header="No scars here" description={`${searched} Nothing similar has broken before.`} />;
  }

  return (
    <Stack space="space.250">
      <SectionMessage appearance={lvl.msg} title={risk.headline}>
        <Stack space="space.100">
          <Inline space="space.100" alignBlock="center">
            <Lozenge appearance={lvl.appearance} isBold>{lvl.label}</Lozenge>
            <Box xcss={xcss({ width: '160px' })}>
              <ProgressBar value={risk.score} ariaLabel="Risk score" />
            </Box>
          </Inline>
          <Text size="small">{searched}</Text>
        </Stack>
      </SectionMessage>

      <Stack space="space.100">
        <Heading size="small">What we learned last time</Heading>
        <Lessons lessons={risk.lessons} />
      </Stack>

      {risk.experts.length > 0 && (
        <Stack space="space.100">
          <Heading size="small">Who knows this area</Heading>
          {risk.experts.map((e) => (
            <Inline key={e.accountId} space="space.100" alignBlock="center">
              <User accountId={e.accountId} />
              <Text size="small" color="color.text.subtle">fixed {e.keys.join(', ')}</Text>
            </Inline>
          ))}
        </Stack>
      )}

      <Stack space="space.100">
        <Heading size="small">Similar past incidents</Heading>
        <IncidentsTable matches={risk.matches} />
      </Stack>

      {posted ? (
        <SectionMessage appearance="success" title="Checklist added">
          <Text>Added a pre-ship checklist with {posted.items} item(s) as a comment on this issue.</Text>
        </SectionMessage>
      ) : (
        <Inline space="space.100">
          <LoadingButton appearance="primary" isLoading={posting} onClick={addChecklist}>Add pre-ship checklist</LoadingButton>
          <Button onClick={load}>Re-check</Button>
        </Inline>
      )}
      <Text size="small" color="color.text.subtlest">
        <Strong>Why trust this?</Strong> Every match shows the shared components and words behind it. Nothing is made up.
      </Text>
    </Stack>
  );
}

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
