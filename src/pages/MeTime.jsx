import { useState } from 'react';
import { ACTS, ACT_CATS } from '../lib/constants.js';
import { getSupport } from '../lib/api.js';
import { today, fmt, uid } from '../lib/util.js';
import { Badge, Slider } from '../components.jsx';

export default function MeTime({ S }) {
  const [cat, setCat] = useState('Tous'), [act, setAct] = useState(null), [custom, setCustom] = useState('');
  const [dur, setDur] = useState(20), [date, setDate] = useState(today()), [time, setTime] = useState(''), [energy, setEnergy] = useState(3), [mins, setMins] = useState(15);
  const [reco, setReco] = useState(null), [busy, setBusy] = useState(false), [ok, setOk] = useState('');
  const mood = S.moods.find(m => m.date === today())?.mood || 'tired';
  const mine = S.events.filter(e => e.kind === 'metime').sort((a, b) => a.date.localeCompare(b.date));
  const title = custom.trim() || act?.t;
  const choose = a => { setAct(a); setCustom(''); setDur(a.m); };
  const add = () => {
    if (!title) return;
    S.setEvents(a => [...a, { id: uid(), kind: 'metime', category: 'rest', title: `${act?.e || '🌷'} ${title}`, date, time, minutes: dur, notes: `${dur} min · énergie ${energy}/5`, done: false }]);
    setOk('Ajouté à ton calendrier 🌷'); setAct(null); setCustom('');
  };
  const ask = async () => { setBusy(true); setReco(await getSupport({ mood, stress: 3, energy, minutes: mins, context: 'metime' })); setBusy(false); };
  const shown = ACTS.filter(a => cat === 'Tous' || a.c === cat);
  const fit = ACTS.filter(a => a.m <= mins && (energy > 2 || a.m <= 20)).slice(0, 3);
  return (
    <>
      <h1>Me Time 🌷</h1>
      <p className="lead">Tu n’as pas besoin de mériter ton repos.</p>
      <section className="card">
        <h3>Une idée pour toi</h3>
        <div className="row"><label>Temps dispo : <b>{mins} min</b><input type="range" min="5" max="120" step="5" value={mins} onChange={e => setMins(+e.target.value)} /></label><Slider label="Énergie" value={energy} onChange={setEnergy} /></div>
        <p className="muted">Dans ta bibliothèque : {fit.length ? fit.map(a => a.e + ' ' + a.t).join(' · ') : 'rien de si court, essaie de respirer 2 minutes.'}</p>
        <button className="btn" onClick={ask}>Recommande-moi quelque chose ✨</button>
        {busy && <p>Un instant…</p>}
        {reco && !busy && <div className="step"><h3>{reco.data.title}</h3><p>{reco.data.activity}</p><p><b>{reco.data.action}</b></p><Badge source={reco.source} /></div>}
      </section>
      <div className="tabs">{['Tous', ...ACT_CATS].map(c => <button key={c} className={'chip ' + (cat === c ? 'on' : '')} onClick={() => setCat(c)}>{c}</button>)}</div>
      <div className="grid">{shown.map(a => <button key={a.t} className={'need small ' + (act?.t === a.t ? 'on' : '')} style={{ background: 'var(--cream)' }} onClick={() => choose(a)}><span>{a.e}</span><b>{a.t}</b><small>{a.c} · {a.m} min</small></button>)}</div>
      <section className="card">
        <h3>Planifier</h3>
        <input placeholder="Ou crée ta propre activité…" value={custom} onChange={e => { setCustom(e.target.value); setAct(null); }} />
        <p>{title ? <>Choisi : <b>{title}</b></> : <span className="muted">Choisis ou écris une activité.</span>}</p>
        <div className="row"><label>Durée<select value={dur} onChange={e => setDur(+e.target.value)}>{[10, 15, 20, 30, 45, 60, 90].map(m => <option key={m} value={m}>{m} min</option>)}</select></label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} /><input type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
        <button className="btn" disabled={!title} onClick={add}>Ajouter au calendrier</button> {ok && <small>{ok}</small>}
      </section>
      <h3>Mes moments prévus</h3>
      {mine.length ? mine.map(e => (
        <div className="ev" key={e.id} style={{ borderLeftColor: 'var(--sage)' }}>
          <input type="checkbox" checked={!!e.done} onChange={() => S.setEvents(a => a.map(x => (x.id === e.id ? { ...x, done: !x.done } : x)))} aria-label="Fait" />
          <div><b className={e.done ? 'done' : ''}>{e.title}</b><small>{fmt(e.date)} {e.time} · {e.minutes} min</small></div>
          <input type="date" value={e.date} aria-label="Reprogrammer" onChange={x => S.setEvents(a => a.map(y => (y.id === e.id ? { ...y, date: x.target.value } : y)))} />
          <button className="link" onClick={() => S.setEvents(a => a.filter(x => x.id !== e.id))}>Supprimer</button>
        </div>
      )) : <p className="muted">Aucun moment prévu. Le premier est toujours le plus doux. 🌸</p>}
    </>
  );
}
