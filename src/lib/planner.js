import { addDays, diffDays, uid } from './util.js';
// PLANNING 100 % DÉTERMINISTE : dates, heures dispo et pauses sont garanties par des règles, jamais par l'IA.
// (L'IA ne fournit que les conseils d'étude par matière.)
const ACTIVITIES = ['Relire le cours', 'Faire des exercices', 'Fiche de révision', 'QCM / annales'];
const score = (e, day, given) => e.difficulty / Math.max(1, diffDays(day, e.date)) - (given[e.subject] || 0) * 0.01;
export function buildPlan({ exams, hours, energy, stress, start }) {
  const low = energy <= 2 || stress >= 4;
  const cap = Math.round(hours * 60 * (low ? 0.7 : 1));
  const last = exams.reduce((m, e) => (e.date > m ? e.date : m), start);
  const out = []; let n = 0;
  for (let i = 0; i <= Math.min(diffDays(start, last), 21); i++) {
    const day = addDays(start, i), live = exams.filter(e => e.date > day);
    if (!live.length) continue;
    const eve = live.some(e => diffDays(day, e.date) === 1);
    let left = eve ? Math.round(cap / 2) : cap; const given = {}; let any = false;
    while (left >= 25) {
      const e = live.reduce((b, x) => (score(x, day, given) > score(b, day, given) ? x : b));
      const s = Math.min(45, left), dl = diffDays(day, e.date);
      given[e.subject] = (given[e.subject] || 0) + s; left -= s + 10; any = true;
      out.push({ id: uid(), kind: 'study', category: 'academic', date: day, time: '', title: `${e.subject} — ${ACTIVITIES[n++ % 4]}`, minutes: s,
        priority: dl <= 2 || e.difficulty === 3 ? 'haute' : dl <= 5 ? 'moyenne' : 'douce', notes: `${s} min`, done: false });
    }
    if (any) out.push({ id: uid(), kind: 'rest', category: 'rest', date: day, time: '', title: 'Pause protégée 🌷', minutes: 30, notes: '30 min pour toi', done: false });
  }
  return out;
}
