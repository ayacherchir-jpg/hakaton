import { useState, useEffect } from 'react';
// Données stockées UNIQUEMENT dans le navigateur (localStorage) : démo mono-utilisatrice, rien n'est envoyé à un serveur.
export function useStore(key, init) {
  const [v, setV] = useState(() => { try { const s = localStorage.getItem('bestie:' + key); return s ? JSON.parse(s) : init; } catch { return init; } });
  useEffect(() => { try { localStorage.setItem('bestie:' + key, JSON.stringify(v)); } catch {} }, [v, key]);
  return [v, setV];
}
