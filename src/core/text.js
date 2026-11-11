// Turns free text (issue summaries, descriptions, postmortems) into comparable tokens.

const STOP_WORDS = new Set(`
a an and are as at be been but by can could did do does for from had has have he her his
how i if in into is it its just me my no not of on or our out over she so some than that the
their them then there these they this to too up us was we were what when where which while
who why will with would you your yes also after before again all any because being both each
few more most other same should only own very s t don now get got go going went make made
issue bug ticket task story please need needs needed using use used via per etc eg ie
next week weeks today tomorrow soon later anything something everything know tell think
want wanted planning plan plans going about there here thing things anyone someone ask asking
`.split(/\s+/).filter(Boolean));

// Very light stemming: good enough to match "timeouts"/"timeout", "rotating"/"rotation".
export function stem(word) {
  if (word.length <= 4) return word;
  for (const suffix of ['ation', 'ion', 'ing', 'ed', 'es', 's']) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 4) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

export function tokenize(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    // keep things like "payments-webhook" and "v2" together, split on everything else
    .replace(/[^a-z0-9\-_ ]+/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^[-_]+|[-_]+$/g, ''))
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t) && !/^\d+$/.test(t))
    .map(stem);
}

// Flattens Atlassian Document Format (Jira descriptions/comments) into plain text.
export function adfToText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(adfToText).join(' ');
  let out = node.text || '';
  if (node.content) out += ' ' + adfToText(node.content);
  return out.trim();
}

// Strips Confluence storage-format HTML down to text, keeping headings on their own lines.
export function storageToText(html) {
  if (!html) return '';
  return String(html)
    .replace(/<(h[1-6]|p|li|tr|br)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n\s*/g, '\n')
    .trim();
}
