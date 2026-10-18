import { useState, useRef, useEffect } from 'react';

export default function Chat() {
  const [msgs, setMsgs] = useState([{ role: 'assistant', content: 'Coucou 🌷 Je suis Bestie. Comment ça va aujourd’hui ?' }]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const end = useRef(null);

  useEffect(() => {
    if (end.current) end.current.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  async function send(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    const next = [...msgs, { role: 'user', content: t }];
    setMsgs(next); setText(''); setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(1) })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      setMsgs(m => [...m, { role: 'assistant', content: String(j.reply ?? '…') }]);
    } catch (error) {
      console.error('Chat:', error);
      setErr('Bestie ne répond pas. Vérifie que le serveur et Ollama sont lancés.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1>Parler à Bestie 💬</h1>
      <p className="muted small"> Bestie n’est pas une psychologue ni un médecin.</p>
      <div className="card chat">
        {msgs.map((m, i) => <div key={i} className={'bubble ' + m.role}>{m.content}</div>)}
        {busy && <div className="bubble assistant">…</div>}
        <div ref={end} />
      </div>
      {err && <p className="note">{err}</p>}
      <form className="row" onSubmit={send}>
        <input maxLength={500} placeholder="Écris ce que tu ressens…" value={text} onChange={e => setText(e.target.value)} />
        <button className="btn" disabled={busy || !text.trim()}>Envoyer</button>
        <button type="button" className="btn ghost" onClick={() => setMsgs(msgs.slice(0, 1))}>Effacer</button>
      </form>
    </>
  );
}