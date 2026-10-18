import { addDays, diffDays } from './util.js';
// Estimation simple et transparente : moyenne des durées entre débuts de règles enregistrés. Pas de prédiction si les cycles sont trop irréguliers.
export function predict(periods) {
  const s = [...periods].sort((a, b) => a.start.localeCompare(b.start));
  if (s.length < 2) return null;
  const d = s.slice(1).map((p, i) => diffDays(s[i].start, p.start));
  const avg = Math.round(d.reduce((a, b) => a + b, 0) / d.length);
  if (avg < 21 || avg > 45 || Math.max(...d) - Math.min(...d) > 10) return null;
  const last = s[s.length - 1].start;
  return { avg, next: [1, 2].map(k => addDays(last, avg * k)) };
}
