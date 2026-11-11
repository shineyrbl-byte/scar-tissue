import { tokenize } from './text.js';

// Builds a TF-IDF index over past incidents ("scars") so a new issue can be
// compared against all of them. Every match carries the reasons behind it.

function termFreq(tokens) {
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  return tf;
}

function docText(doc) {
  // Summary counts double: it's the most deliberate description of the problem.
  return [doc.summary, doc.summary, doc.description].filter(Boolean).join(' ');
}

export function buildIndex(scars) {
  const docs = scars.map((scar) => ({ scar, tf: termFreq(tokenize(docText(scar))) }));
  const df = new Map();
  for (const { tf } of docs) for (const t of tf.keys()) df.set(t, (df.get(t) || 0) + 1);
  const n = docs.length;
  const idf = (t) => Math.log(1 + n / (1 + (df.get(t) || 0)));

  const vectors = docs.map(({ scar, tf }) => {
    const vec = new Map();
    for (const [t, c] of tf) vec.set(t, (1 + Math.log(c)) * idf(t));
    return { scar, vec, norm: norm(vec) };
  });
  return { vectors, idf };
}

function norm(vec) {
  let s = 0;
  for (const v of vec.values()) s += v * v;
  return Math.sqrt(s) || 1;
}

function lowerSet(list) {
  return new Set((list || []).map((x) => String(x).toLowerCase()));
}

function overlap(a, b) {
  const sa = lowerSet(a);
  return [...lowerSet(b)].filter((x) => sa.has(x));
}

/**
 * Scores every scar against `issue` and returns the best matches.
 * Score = 0.7 * text cosine + 0.2 * component overlap + 0.1 * label overlap.
 */
export function findMatches(index, issue, { limit = 5, minScore = 0.12 } = {}) {
  const qtf = termFreq(tokenize(docText(issue)));
  const qvec = new Map();
  for (const [t, c] of qtf) qvec.set(t, (1 + Math.log(c)) * index.idf(t));
  const qnorm = norm(qvec);

  const results = [];
  for (const { scar, vec, norm: dnorm } of index.vectors) {
    if (scar.key && scar.key === issue.key) continue;

    let dot = 0;
    const shared = [];
    for (const [t, w] of qvec) {
      const dw = vec.get(t);
      if (dw) {
        dot += w * dw;
        shared.push({ term: t, weight: w * dw });
      }
    }
    const text = dot / (qnorm * dnorm);
    const sharedComponents = overlap(issue.components, scar.components);
    const sharedLabels = overlap(issue.labels, scar.labels).filter(
      (l) => !['incident', 'postmortem', 'post-mortem'].includes(l)
    );
    const compScore = sharedComponents.length ? Math.min(1, sharedComponents.length / 2 + 0.5) : 0;
    const labelScore = sharedLabels.length ? Math.min(1, sharedLabels.length / 2) : 0;
    const score = 0.7 * text + 0.2 * compScore + 0.1 * labelScore;

    if (score >= minScore) {
      results.push({
        scar,
        score: round(score),
        why: {
          sharedTerms: shared.sort((a, b) => b.weight - a.weight).slice(0, 5).map((s) => s.term),
          sharedComponents,
          sharedLabels,
        },
      });
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

function round(x) {
  return Math.round(x * 100) / 100;
}
