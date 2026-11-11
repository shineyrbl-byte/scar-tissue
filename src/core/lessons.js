import { storageToText } from './text.js';

// Reads a Confluence postmortem (storage-format HTML) and pulls out the parts
// worth remembering: root cause, lessons learned and action items.

const SECTION_PATTERNS = {
  rootCause: /root\s*cause|what\s+went\s+wrong|why\s+it\s+happened|contributing\s+factors/i,
  lessons: /lessons?\s*(learn|learnt)|what\s+we\s+learn|takeaways?|learnings|prevent(ion)?|do\s+differently/i,
  actionItems: /action\s*items?|follow[\s-]*ups?|next\s+steps|remediation/i,
};

const ISSUE_KEY = /\b[A-Z][A-Z0-9]{1,9}-\d+\b/g;

function sectionKind(heading) {
  for (const [kind, re] of Object.entries(SECTION_PATTERNS)) if (re.test(heading)) return kind;
  return null;
}

// Pulls list items / task items / paragraphs from a chunk of HTML.
function itemsFrom(html) {
  const items = [];
  const listLike = /<(li|ac:task-body)[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = listLike.exec(html))) items.push(storageToText(m[2]));
  if (!items.length) {
    const para = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    while ((m = para.exec(html))) items.push(storageToText(m[1]));
  }
  return items.map((s) => s.replace(/\s+/g, ' ').trim()).filter((s) => s.length > 3);
}

export function extractLessons(html) {
  const result = { rootCause: [], lessons: [], actionItems: [], linkedKeys: [] };
  if (!html) return result;

  result.linkedKeys = [...new Set(storageToText(html).match(ISSUE_KEY) || [])];

  // Split into [heading, body] pairs.
  const parts = String(html).split(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
  for (let i = 1; i < parts.length; i += 2) {
    const kind = sectionKind(storageToText(parts[i]));
    if (kind) result[kind].push(...itemsFrom(parts[i + 1] || ''));
  }
  for (const k of ['rootCause', 'lessons', 'actionItems']) result[k] = [...new Set(result[k])].slice(0, 6);
  return result;
}

// Attaches each postmortem's lessons to the incidents it mentions.
export function linkPostmortems(scars, postmortems) {
  const byKey = new Map(scars.map((s) => [s.key, { ...s, postmortems: [] }]));
  for (const pm of postmortems) {
    const extracted = extractLessons(pm.body);
    for (const key of extracted.linkedKeys) {
      const scar = byKey.get(key);
      if (scar) scar.postmortems.push({ id: pm.id, title: pm.title, url: pm.url, ...extracted });
    }
  }
  return [...byKey.values()];
}
