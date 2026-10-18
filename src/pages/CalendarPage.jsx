import { useState } from 'react';
import { CATS } from '../lib/constants.js';
import { today, fmt, uid, addDays } from '../lib/util.js';
import { buildPlan } from '../lib/planner.js';
import { getTips } from '../lib/api.js';
import { predict } from '../lib/cycle.js';
import { MonthGrid, Badge, Slider } from '../components.jsx';

const blank = d => ({ title: '', date: d, time: '', category: 'academic', notes: '' });

export default function CalendarPage({ S }) {
  return (
    <>
      <h1>Mon calendrier 📅</h1>
      <div className="tabs">
        <button className={'chip ' + (S.tab !== 'planner' ? 'on' : '')} onClick={() => S.setTab('agenda')}>Agenda</button>
        <button className={'chip ' + (S.tab === 'planner' ? 'on' : '')} onClick={() => S.setTab('planner')}>Plan de révision 📚</button>
      </div>
      {S.tab === 'planner' ? <Planner S={S} /> : <Agenda S={S} />}
    </>
  );
}

function Agenda({ S }) {
  const [sel, setSel] = useState(today()), [f, setF] = useState(blank(today())), [editId, setEditId] = useState(null);
  const pred = S.cycle.on ? predict(S.cycle.periods) : null;
  const marks = k => {
    const per = S.cycle.on && S.cycle.periods.some(p => p.start === k || (p.end && k >= p.start && k <= p.end));
    const pr = pred && pred.next.some(n => k >= n && k <= addDays(n, 4));
    return { cell: per ? 'period' : pr ? 'pred' : '', dots: S.events.filter(e => e.date === k).map(e => e.category) };
  };
  const list = S.events.filter(e => e.date === sel).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const next = S.events.filter(e => e.date > sel).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const submit = e => {
    e.preventDefault(); if (!f.title.trim()) return;
    S.setEvents(a => editId ? a.map(x => (x.id === editId ? { ...x, ...f } : x)) : [...a, { ...f, id: uid(), done: false }]);
    setF(blank(sel)); setEditId(null);
  };
  const Row = ({ e }) => (
    <div className="ev" style={{ borderLeftColor: CATS[e.category]?.c }}>
      <input type="checkbox" checked={!!e.done} onChange={() => S.setEvents(a => a.map(x => (x.id === e.id ? { ...x, done: !x.done } : x)))} aria-label="Terminé" />
      <div><b className={e.done ? 'done' : ''}>{e.title}</b><small>{fmt(e.date)} {e.time} · {CATS[e.category]?.l} {e.notes && '· ' + e.notes}</small></div>
      <button className="link" onClick={() => { setEditId(e.id); setF({ title: e.title, date: e.date, time: e.time || '', category: e.category, notes: e.notes || '' }); }}>Modifier</button>
      <button className="link" onClick={() => S.setEvents(a => a.filter(x => x.id !== e.id))}>Supprimer</button>
    </div>
  );
  return (
    <div className="two">
      <div>
        <MonthGrid value={sel} onSelect={k => { setSel(k); if (!editId) setF(x => ({ ...x, date: k })); }} marks={marks} />
        <p className="legend">{Object.entries(CATS).map(([k, v]) => <span key={k}><i style={{ background: v.c }} />{v.l}</span>)}{S.cycle.on && <span><i className="period" />Règles</span>}{pred && <span><i className="pred" />Estimées</span>}</p>
      </div>
      <div>
        <form className="card" onSubmit={submit}>
          <h3>{editId ? 'Modifier l’événement' : 'Ajouter un événement'}</h3>
          <input required placeholder="Titre (examen, entretien, rendez-vous…)" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
          <div className="row"><input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /><input type="time" value={f.time} onChange={e => setF({ ...f, time: e.target.value })} /></div>
          <select value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}</select>
          <input placeholder="Notes (facultatif)" value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} />
          <div className="row"><button className="btn">{editId ? 'Enregistrer' : 'Ajouter'}</button>{editId && <button type="button" className="btn ghost" onClick={() => { setEditId(null); setF(blank(sel)); }}>Annuler</button>}</div>
        </form>
        <h3>{fmt(sel)}</h3>
        {list.length ? list.map(e => <Row key={e.id} e={e} />) : <p className="muted">Rien ce jour-là. Un jour léger, ça existe aussi. 🌸</p>}
        {next.length > 0 && <><h3>À venir</h3>{next.map(e => <Row key={e.id} e={e} />)}</>}
      </div>
    </div>
  );
}

function Planner({ S }) {
  const [exams, setExams] = useState([{ id: uid(), subject: '', date: addDays(today(), 5), difficulty: 2 }]);
  const [hours, setHours] = useState(3), [stress, setStress] = useState(3), [energy, setEnergy] = useState(3);
  const [plan, setPlan] = useState(null), [tips, setTips] = useState(null), [busy, setBusy] = useState(false), [msg, setMsg] = useState('');
  const upd = (id, k, v) => setExams(a => a.map(x => (x.id === id ? { ...x, [k]: v } : x)));
  const valid = exams.filter(e => e.subject.trim() && e.date > today());
  async function generate() {
    setMsg(''); if (!valid.length) return setMsg('Ajoute au moins une matière avec une date future.');
    const ex = valid.map(e => ({ ...e, subject: e.subject.trim() }));
    setPlan(buildPlan({ exams: ex, hours, energy, stress, start: today() })); setBusy(true);
    setTips(await getTips({ exams: ex, stress, energy })); setBusy(false);
  }
  const addAll = () => {
    const exs = valid.map(e => ({ id: uid(), title: `📝 Examen ${e.subject.trim()}`, date: e.date, time: '', category: 'academic', notes: 'Examen', done: false }));
    S.setEvents(a => [...a, ...exs, ...plan]); setPlan(null); S.setTab('agenda');
  };
  const days = plan ? [...new Set(plan.map(p => p.date))] : [];
  return (
    <div className="two">
      <div className="card">
        <h3>Mes examens</h3>
        {exams.map(e => (
          <div className="row" key={e.id}>
            <input placeholder="Matière" value={e.subject} onChange={x => upd(e.id, 'subject', x.target.value)} />
            <input type="date" value={e.date} onChange={x => upd(e.id, 'date', x.target.value)} />
            <select value={e.difficulty} onChange={x => upd(e.id, 'difficulty', +x.target.value)}><option value={1}>Facile</option><option value={2}>Moyen</option><option value={3}>Difficile</option></select>
            {exams.length > 1 && <button className="link" onClick={() => setExams(a => a.filter(x => x.id !== e.id))}>✕</button>}
          </div>
        ))}
        <button className="btn ghost" onClick={() => setExams(a => [...a, { id: uid(), subject: '', date: addDays(today(), 7), difficulty: 2 }])}>+ Ajouter une matière</button>
        <label>Heures d’étude possibles par jour : <b>{hours} h</b><input type="range" min="1" max="8" value={hours} onChange={e => setHours(+e.target.value)} /></label>
        <Slider label="Stress" value={stress} onChange={setStress} /><Slider label="Énergie" value={energy} onChange={setEnergy} />
        <button className="btn" onClick={generate}>Générer mon plan ✨</button>{msg && <p className="muted">{msg}</p>}
        <p className="muted small"></p>
      </div>
      <div>
        {!plan && <div className="card empty">Ton plan apparaîtra ici, avec des séances courtes et du repos protégé 🌷</div>}
        {plan && <>
          {busy ? <p>Conseils en cours…</p> : tips && <div className="card"><h3>Conseils d’étude</h3>{tips.tips.map(t => <p key={t.subject}><b>{t.subject} :</b> {t.tip}</p>)}<Badge source={tips.source} /></div>}
          {days.map(d => (
            <div className="card" key={d}><h3>{fmt(d)}</h3>
              {plan.filter(p => p.date === d).map(p => (
                <div className="ev" key={p.id} style={{ borderLeftColor: CATS[p.category].c }}>
                  <div><b>{p.title}</b><small>{p.minutes} min{p.kind === 'study' ? ' · priorité ' + p.priority : ''}</small></div>
                  <button className="link" onClick={() => setPlan(a => a.filter(x => x.id !== p.id))}>Retirer</button>
                </div>))}
            </div>))}
          {plan.length ? <button className="btn" onClick={addAll}>Ajouter à mon calendrier</button> : <p className="muted">Aucune séance générée (augmente tes heures ou vérifie les dates).</p>}
        </>}
      </div>
    </div>
  );
}
