import { useState } from 'react';
import { HABITS, MOODS, SYMPTOMS } from '../lib/constants.js';
import { today, addDays, fmt, uid } from '../lib/util.js';
import { predict } from '../lib/cycle.js';
import { MonthGrid } from '../components.jsx';

export default function Wellness({ S, go }) {
  const t = today(), h = S.habits[t] || {};
  const days = Array.from({ length: 7 }, (_, i) => addDays(t, i - 6));
  const week = S.moods.filter(m => m.date >= days[0]);
  const heavy = week.filter(m => ['tired', 'stressed', 'discouraged'].includes(m.mood)).length;
  const toggle = id => S.setHabits(a => ({ ...a, [t]: { ...(a[t] || {}), [id]: !h[id] } }));
  const done = k => S.events.filter(e => e.kind === k && e.done).length;
  const wipe = () => { if (confirm('Effacer toutes tes données Bestie sur cet appareil ?')) { Object.keys(localStorage).filter(k => k.startsWith('bestie:')).forEach(k => localStorage.removeItem(k)); location.reload(); } };
  return (
    <>
      <h1>Mon bien-être 💗</h1>
      <section className="card"><h3>Mes petites habitudes du jour</h3>
        <div className="grid">{HABITS.map(([id, e, l]) => <button key={id} className={'habit ' + (h[id] ? 'on' : '')} onClick={() => toggle(id)}>{e} {l}</button>)}</div>
        <p className="muted">{Object.values(h).filter(Boolean).length ? 'Bravo, chaque petit geste compte 🌸' : 'Aucune obligation : choisis ce qui te parle aujourd’hui.'}</p>
      </section>
      <section className="card"><h3>Mon parcours (7 derniers jours)</h3>
        <div className="week">{days.map(d => { const m = week.find(x => x.date === d); return <div key={d}><span className="big">{m ? MOODS.find(x => x[0] === m.mood)[1] : '·'}</span><small>{fmt(d).slice(0, 3)}</small></div>; })}</div>
        <p>📚 {done('study')} séance(s) d’étude terminée(s) · 🌷 {done('metime')} moment(s) Me Time · 💧 {days.reduce((n, d) => n + Object.values(S.habits[d] || {}).filter(Boolean).length, 0)} habitude(s) cochée(s)</p>
        {heavy >= 3 && <div className="note">Tu as indiqué te sentir fatiguée, stressée ou découragée {heavy} fois cette semaine. Ce n’est qu’une observation, pas un diagnostic. Veux-tu planifier une journée plus légère ? <button className="btn ghost" onClick={() => go('metime')}>Planifier du Me Time</button></div>}
      </section>
      <Cycle S={S} />
      <section className="card"><h3>🔒 Confidentialité</h3><p className="muted small">Tout est stocké uniquement dans ton navigateur. Le texte libre n’est envoyé à l’IA que si tu coches l’option, et n’est jamais sauvegardé. Les données de cycle ne sont jamais envoyées à l’IA.</p><button className="btn ghost" onClick={wipe}>Effacer toutes mes données</button></section>
    </>
  );
}

function Cycle({ S }) {
  const c = S.cycle, set = p => S.setCycle(a => ({ ...a, ...p }));
  const [start, setStart] = useState(today()), [end, setEnd] = useState(''), [ld, setLd] = useState(today()), [sym, setSym] = useState([]), [en, setEn] = useState(3), [sel, setSel] = useState(today());
  if (!c.on) return <section className="card"><h3>🩸 Suivi du cycle (facultatif)</h3><p className="muted">Tu peux l’activer quand tu veux, et tout effacer à tout moment.</p><button className="btn ghost" onClick={() => set({ on: true })}>Activer le suivi</button></section>;
  const pred = predict(c.periods);
  const marks = k => ({ cell: c.periods.some(p => p.start === k || (p.end && k >= p.start && k <= p.end)) ? 'period' : pred && pred.next.some(n => k >= n && k <= addDays(n, 4)) ? 'pred' : '', dots: [] });
  const addP = () => { set({ periods: [...c.periods, { id: uid(), start, end: end || '' }] }); setEnd(''); };
  const addL = () => set({ logs: [...c.logs, { id: uid(), date: ld, symptoms: sym, energy: en }] });
  return (
    <section className="card"><h3>🩸 Suivi du cycle</h3>
      <MonthGrid value={sel} onSelect={setSel} marks={marks} />
      <p className="legend"><span><i className="period" />Enregistré</span><span><i className="pred" />Estimé</span></p>
      <p className="muted small">{pred ? `Estimation basée sur ${c.periods.length} cycles (moyenne ${pred.avg} jours). Prochaines règles vers le ${fmt(pred.next[0])}. C’est approximatif, pas un avis médical.` : 'Pas assez de données régulières pour estimer. Les cycles varient, c’est normal.'}</p>
      <div className="row"><label>Premier jour<input type="date" value={start} onChange={e => setStart(e.target.value)} /></label><label>Dernier jour (facultatif)<input type="date" value={end} onChange={e => setEnd(e.target.value)} /></label><button className="btn" onClick={addP}>Enregistrer</button></div>
      <h3>Symptômes & énergie</h3>
      <div className="tabs">{SYMPTOMS.map(s => <button key={s} className={'chip ' + (sym.includes(s) ? 'on' : '')} onClick={() => setSym(a => (a.includes(s) ? a.filter(x => x !== s) : [...a, s]))}>{s}</button>)}</div>
      <div className="row"><input type="date" value={ld} onChange={e => setLd(e.target.value)} /><label className="slider">Énergie <b>{en}/5</b><input type="range" min="1" max="5" value={en} onChange={e => setEn(+e.target.value)} /></label><button className="btn ghost" onClick={addL}>Ajouter</button></div>
      <h3>Historique</h3>
      {[...c.periods.map(p => ({ ...p, k: 'p', d: p.start })), ...c.logs.map(l => ({ ...l, k: 'l', d: l.date }))].sort((a, b) => b.d.localeCompare(a.d)).slice(0, 8).map(x => (
        <div className="ev" key={x.id} style={{ borderLeftColor: 'var(--pink)' }}><div><b>{x.k === 'p' ? 'Règles' : 'Symptômes'}</b><small>{fmt(x.d)}{x.end ? ' → ' + fmt(x.end) : ''}{x.k === 'l' ? ` · ${x.symptoms.join(', ') || 'aucun'} · énergie ${x.energy}/5` : ''}</small></div>
          <button className="link" onClick={() => set(x.k === 'p' ? { periods: c.periods.filter(p => p.id !== x.id) } : { logs: c.logs.filter(l => l.id !== x.id) })}>Supprimer</button></div>))}
      <button className="btn ghost" onClick={() => confirm('Supprimer toutes les données du cycle ?') && set({ on: false, periods: [], logs: [] })}>Désactiver et tout effacer</button>
    </section>
  );
}
