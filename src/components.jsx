import { useState, useEffect } from 'react';
import { parse } from './lib/util.js';

export const Badge = ({ source }) => (
  <span className={'badge ' + source}>{source === 'ai' ? '✨ Généré par IA' : source === 'safety' ? '💗 Message de soutien' : 'Suggestion prédéfinie (non IA)'}</span>
);

export function Slider({ label, value, onChange }) {
  return <label className="slider">{label} <b>{value}/5</b><input type="range" min="1" max="5" value={value} onChange={e => onChange(+e.target.value)} /></label>;
}

export function Breathing() {
  const [inh, setInh] = useState(true);
  useEffect(() => { const t = setInterval(() => setInh(v => !v), 4000); return () => clearInterval(t); }, []);
  return <div className="breath"><div className={'orb ' + (inh ? 'in' : 'out')}>{inh ? 'Inspire…' : 'Expire…'}</div><small>Suis le rythme, 4 secondes chacun. Arrête-toi quand tu veux.</small></div>;
}

// marks(dateStr) -> { cell: 'period' | 'pred' | '', dots: ['academic', ...] }
export function MonthGrid({ value, onSelect, marks }) {
  const [m, setM] = useState(() => { const d = parse(value); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const y = m.getFullYear(), mo = m.getMonth();
  const lead = (new Date(y, mo, 1).getDay() + 6) % 7, n = new Date(y, mo + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: n }, (_, i) => i + 1)];
  const ds = d => `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return (
    <div className="card">
      <div className="mhead">
        <button className="btn ghost" onClick={() => setM(new Date(y, mo - 1, 1))} aria-label="Mois précédent">‹</button>
        <h3>{m.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
        <button className="btn ghost" onClick={() => setM(new Date(y, mo + 1, 1))} aria-label="Mois suivant">›</button>
      </div>
      <div className="mg">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <small key={i} className="dow">{d}</small>)}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const k = ds(d), mk = marks ? marks(k) : { dots: [] };
          return (
            <button key={i} className={`cell ${mk.cell || ''} ${value === k ? 'sel' : ''}`} onClick={() => onSelect && onSelect(k)}>
              {d}<span className="dots">{(mk.dots || []).slice(0, 3).map((c, j) => <i key={j} className={'d-' + c} />)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
