// Combines matched past incidents into one verdict: how risky this issue is,
// what we learned last time, and who to ask.

const DAY = 24 * 60 * 60 * 1000;

const SEVERITY = {
  highest: 1, blocker: 1, critical: 1, sev1: 1, p1: 1,
  high: 0.8, major: 0.8, sev2: 0.8, p2: 0.8,
  medium: 0.5, sev3: 0.5, p3: 0.5,
  low: 0.3, lowest: 0.2, minor: 0.3, trivial: 0.2,
};

export function severityWeight(priority) {
  return SEVERITY[String(priority || '').toLowerCase().replace(/\s+/g, '')] ?? 0.5;
}

// 1.0 for something that happened today, 0.5 after six months.
export function recencyWeight(date, now = Date.now()) {
  if (!date) return 0.5;
  const ageDays = Math.max(0, (now - new Date(date).getTime()) / DAY);
  return Math.pow(0.5, ageDays / 180);
}

function monthsSpan(dates, now) {
  const oldest = Math.min(...dates.map((d) => new Date(d).getTime()));
  return Math.max(1, Math.round((now - oldest) / (30 * DAY)));
}

export function assessRisk(matches, { now = Date.now() } = {}) {
  if (!matches.length) {
    return { level: 'none', score: 0, headline: 'No similar past incidents found. Clean slate.', matches: [], lessons: [], experts: [] };
  }

  const weighted = matches.map((m) => ({
    ...m,
    weight: m.score * (0.5 + 0.5 * severityWeight(m.scar.priority)) * (0.6 + 0.4 * recencyWeight(m.scar.created, now)),
  }));
  weighted.sort((a, b) => b.weight - a.weight);

  const strong = weighted.filter((m) => m.score >= 0.25);
  const score = Math.min(1, weighted[0].weight + 0.15 * Math.max(0, strong.length - 1));
  const level = score >= 0.45 ? 'high' : score >= 0.28 ? 'medium' : 'low';

  // People who resolved the matched incidents know where the bodies are buried.
  const expertMap = new Map();
  for (const m of weighted) {
    const who = m.scar.resolver || m.scar.assignee;
    if (!who?.accountId) continue;
    const e = expertMap.get(who.accountId) || { ...who, count: 0, keys: [] };
    e.count += 1;
    e.keys.push(m.scar.key);
    expertMap.set(who.accountId, e);
  }
  const experts = [...expertMap.values()].sort((a, b) => b.count - a.count).slice(0, 3);

  const lessons = [];
  const seen = new Set();
  for (const m of weighted) {
    for (const pm of m.scar.postmortems || []) {
      for (const [kind, list] of [['lesson', pm.lessons], ['action', pm.actionItems], ['cause', pm.rootCause]]) {
        for (const text of list || []) {
          const k = text.toLowerCase();
          if (seen.has(k)) continue;
          seen.add(k);
          lessons.push({ text, kind, from: m.scar.key, postmortem: { title: pm.title, url: pm.url } });
        }
      }
    }
  }
  lessons.sort((a, b) => ['lesson', 'action', 'cause'].indexOf(a.kind) - ['lesson', 'action', 'cause'].indexOf(b.kind));

  return {
    level,
    score: Math.round(score * 100) / 100,
    headline: headline(weighted, strong, now),
    matches: weighted,
    lessons: lessons.slice(0, 8),
    experts,
  };
}

function headline(weighted, strong, now) {
  const top = weighted[0];
  const comp = top.why.sharedComponents[0];
  if (strong.length >= 2) {
    const dated = strong.map((m) => m.scar.created).filter(Boolean);
    const span = dated.length ? ` in the last ${monthsSpan(dated, now)} months` : '';
    const area = comp ? `Changes to ${comp}` : 'Work like this';
    return `${area} caused ${strong.length} incidents${span}.`;
  }
  return `This looks like ${top.scar.key}: "${top.scar.summary}".`;
}

const LEVEL_EMOJI = { high: '🔴', medium: '🟠', low: '🟡', none: '🟢' };

// Plain-text version for Rovo answers and logs.
export function riskToMarkdown(risk) {
  const lines = [`${LEVEL_EMOJI[risk.level]} **${risk.level.toUpperCase()} risk** — ${risk.headline}`];
  if (risk.matches.length) {
    lines.push('', '**Past incidents:**');
    for (const m of risk.matches) {
      const why = [...m.why.sharedComponents, ...m.why.sharedTerms].slice(0, 4).join(', ');
      lines.push(`- ${m.scar.key} (${m.scar.priority || 'n/a'}): ${m.scar.summary} — match ${Math.round(m.score * 100)}%${why ? ` (shared: ${why})` : ''}`);
    }
  }
  if (risk.lessons.length) {
    lines.push('', '**What we learned last time:**');
    for (const l of risk.lessons) lines.push(`- ${l.text} _(${l.from}, ${l.postmortem.title})_`);
  }
  if (risk.experts.length) {
    lines.push('', '**Ask:** ' + risk.experts.map((e) => `${e.displayName} (fixed ${e.keys.join(', ')})`).join('; '));
  }
  return lines.join('\n');
}

// Jira comment body (Atlassian Document Format) with a pre-ship checklist.
export function checklistAdf(risk) {
  const text = (t, marks) => ({ type: 'text', text: t, ...(marks ? { marks } : {}) });
  const para = (...content) => ({ type: 'paragraph', content });
  const items = risk.lessons.filter((l) => l.kind !== 'cause');
  const content = [
    para(text('🩹 Scar Tissue pre-ship checklist', [{ type: 'strong' }])),
    para(text(`${LEVEL_EMOJI[risk.level]} ${risk.headline}`)),
  ];
  if (items.length) {
    content.push({
      type: 'taskList',
      attrs: { localId: 'scar-tissue-checklist' },
      content: items.map((l, i) => ({
        type: 'taskItem',
        attrs: { localId: `st-${i}`, state: 'TODO' },
        content: [text(`${l.text} (from ${l.from})`)],
      })),
    });
  } else {
    content.push(para(text('No written lessons found. Check the linked incidents below before shipping.')));
  }
  if (risk.matches.length) {
    content.push(para(text('Related incidents: ' + risk.matches.map((m) => m.scar.key).join(', '))));
  }
  if (risk.experts.length) {
    content.push(para(
      text('Worth a quick review from: '),
      ...risk.experts.flatMap((e, i) => [
        ...(i ? [text(', ')] : []),
        { type: 'mention', attrs: { id: e.accountId, text: `@${e.displayName}` } },
      ])
    ));
  }
  return { type: 'doc', version: 1, content };
}
