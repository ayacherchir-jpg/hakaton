import { useState } from 'react';
import { MOODS, NEEDS } from '../lib/constants.js';
import { getSupport } from '../lib/api.js';
import { fallbackSupport, AFFIRM } from '../lib/fallback.js';
import { today, fmt } from '../lib/util.js';
import { predict } from '../lib/cycle.js';
import { Badge, Slider, Breathing } from '../components.jsx';

export default function Home({ S, go }) {
  const t = today();
  const saved = S.moods.find(m => m.date === t);
  const [mood, setMood] = useState(saved?.mood || null), [stress, setStress] = useState(saved?.stress || 3), [energy, setEnergy] = useState(saved?.energy || 3);
  const [text, setText] = useState(''), [send, setSend] = useState(false), [need, setNeed] = useState(null), [res, setRes] = useState(null), [busy, setBusy] = useState(false), [ai, setAi] = useState(0);

  async function ask(context, m = mood) {
    setBusy(true);
    setRes(await getSupport({ mood: m || 'calm', stress, energy, minutes: 15, context, text: send ? text : '' }));
    setBusy(false);
  }
  const save = m => S.setMoods(a => [...a.filter(x => x.date !== t), { date: t, mood: m, stress, energy }]);
  const pick = m => { setMood(m); save(m); ask(need || 'calm', m); };
  const choose = id => { setNeed(id); ask(id); };

  const shown = res || { source: 'fallback', data: fallbackSupport({ mood: mood || 'calm', context: need || 'calm' }) };
  const todays = S.events.filter(e => e.date === t), doneN = todays.filter(e => e.done).length;
  const upcoming = S.events.filter(e => e.date >= t && e.category === 'academic' && e.kind !== 'study').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const care = S.events.filter(e => e.date >= t && e.category === 'rest' && !e.done).sort((a, b) => a.date.localeCompare(b.date))[0];
  const pred = S.cycle.on ? predict(S.cycle.periods) : null;

  return (
    <>
      <header className="hero card">
        <span className="deco">🌸 ✨ 🌷</span>
        <h1>Hello, beautiful 🌷</h1>
        <p>Tu n’as pas besoin de tout réussir aujourd’hui. On avance un petit pas à la fois.</p>
        <small>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</small>
      </header>

      <section className="card">
        <h2>Comment te sens-tu aujourd’hui ?</h2>
        <div className="moods">
          {MOODS.map(([id, e, l]) => <button key={id} className={'mood ' + (mood === id ? 'on' : '')} onClick={() => pick(id)}><span>{e}</span>{l}</button>)}
        </div>
        <div className="row">
          <Slider label="Stress" value={stress} onChange={setStress} />
          <Slider label="Énergie" value={energy} onChange={setEnergy} />
        </div>
        <details>
          <summary>Écrire un mot (facultatif)</summary>
          <textarea maxLength={300} placeholder="Ce qui te pèse ou te fait du bien… (non enregistré)" value={text} onChange={e => setText(e.target.value)} />
          <label className="check"><input type="checkbox" checked={send} onChange={e => setSend(e.target.checked)} /> J’accepte d’envoyer ce texte à un service d’IA externe pour personnaliser ma suggestion. Il n’est jamais sauvegardé.</label>
        </details>
        {mood && <button className="btn" onClick={() => { save(mood); ask(need || 'calm'); }}>Enregistrer et actualiser ✨</button>}
      </section>

      <section>
        <h2>De quoi as-tu besoin aujourd’hui ?</h2>
        <div className="grid">
          {NEEDS.map(n => <button key={n.id} className={'need ' + (need === n.id ? 'on' : '')} style={{ background: n.c }} onClick={() => choose(n.id)}><span>{n.e}</span><b>{n.t}</b><small>{n.d}</small></button>)}
        </div>
      </section>

      <section className="card step">
        <h2>Ton petit pas du jour ✨</h2>
        {busy ? <p>Bestie réfléchit doucement…</p> : <>
          <h3>{shown.data.title}</h3>
          <p>{shown.data.empathy}</p>
          <p>🌿 {shown.data.activity}</p>
          <p>👉 <b>{shown.data.action}</b></p>
          <p><em>{shown.data.encouragement}</em></p>
          <Badge source={shown.source} />
        </>}
        {need === 'calm' && <Breathing />}
        {need === 'affirm' && <div className="affirm">« {AFFIRM[ai % AFFIRM.length]} » <button className="btn ghost" onClick={() => setAi(ai + 1)}>Une autre 💗</button></div>}
        {need === 'exam' && <button className="btn" onClick={() => go('calendar', 'planner')}>Créer mon plan de révision 📚</button>}
        {need === 'career' && <ul className="plain"><li>Relis une offre qui t’intéresse vraiment.</li><li>Ajoute un entretien ou une candidature à ton calendrier.</li><li><button className="btn ghost" onClick={() => go('calendar')}>Ouvrir mon calendrier</button></li></ul>}
      </section>

      <section className="card">
        <h2>Mes priorités</h2>
        <div className="grid">
          <div><h3>📅 À venir</h3>{upcoming.length ? upcoming.map(e => <p key={e.id}>{e.title} <small>{fmt(e.date)}</small></p>) : <p className="muted">Rien d’urgent. Respire. 🌿</p>}</div>
          <div><h3>✅ Aujourd’hui</h3>{todays.length ? <><div className="bar"><i style={{ width: (doneN / todays.length) * 100 + '%' }} /></div><p>{doneN}/{todays.length} terminé(s)</p></> : <p className="muted">Journée libre pour l’instant.</p>}</div>
          <div><h3>🌷 Prochain moment pour toi</h3>{care ? <p>{care.title} <small>{fmt(care.date)}</small></p> : <p className="muted">Rien de prévu. <button className="link" onClick={() => go('metime')}>Planifier</button></p>}</div>
          {S.cycle.on && <div><h3>🩸 Règles (estimation)</h3>{pred ? <p>Vers le {fmt(pred.next[0])} <small>approximatif, pas un avis médical</small></p> : <p className="muted">Pas assez de données.</p>}</div>}
        </div>
      </section>
    </>
  );
}
