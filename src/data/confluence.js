import { route } from '@forge/api';
import { POSTMORTEM_CQL, MAX_POSTMORTEMS } from '../config.js';

// Returns postmortem pages with their storage-format body. If Confluence isn't
// installed or the user can't see it, Scar Tissue still works from Jira alone.
export async function searchPostmortems(api) {
  try {
    const res = await api.requestConfluence(
      route`/wiki/rest/api/content/search?cql=${POSTMORTEM_CQL}&expand=body.storage&limit=${MAX_POSTMORTEMS}`
    );
    if (!res.ok) {
      console.warn('Postmortem search failed', res.status);
      return [];
    }
    const data = await res.json();
    const base = data._links?.base || '';
    return (data.results || []).map((p) => ({
      id: p.id,
      title: p.title,
      url: base + (p._links?.webui || ''),
      body: p.body?.storage?.value || '',
    }));
  } catch (err) {
    console.warn('Confluence unavailable', err.message);
    return [];
  }
}
