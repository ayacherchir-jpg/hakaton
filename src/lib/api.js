import { fallbackSupport } from './fallback.js';
const post = async (u, b) => { const r = await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); if (!r.ok) throw 0; return r.json(); };
export async function getSupport(p) { try { return await post('/api/support', p); } catch { return { source: 'fallback', data: fallbackSupport(p) }; } }
export async function getTips(p) {
  try { return await post('/api/study-tips', p); }
  catch { return { source: 'fallback', tips: p.exams.map(e => ({ subject: e.subject, tip: 'Alterne lecture active et exercices, par blocs de 45 minutes.' })) }; }
}
