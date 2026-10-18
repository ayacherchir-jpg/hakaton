import { useState } from 'react';
import { useStore } from './lib/hooks.js';
import Home from './pages/Home.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import MeTime from './pages/MeTime.jsx';
import Wellness from './pages/Wellness.jsx';
import Chat from './pages/Chat.jsx';

const NAV = [
  ['home', '🏠', 'Accueil'],
  ['calendar', '📅', 'Calendrier'],
  ['metime', '🌷', 'Me Time'],
  ['wellness', '💗', 'Bien-être'],
  ['chat', '💬', 'Bestie']
];

export default function App() {
  const [page, setPage] = useState('home'), [tab, setTab] = useState('agenda');
  const [events, setEvents] = useStore('events', []);
  const [moods, setMoods] = useStore('moods', []);
  const [habits, setHabits] = useStore('habits', {});
  const [cycle, setCycle] = useStore('cycle', { on: false, periods: [], logs: [] });
  const S = { events, setEvents, moods, setMoods, habits, setHabits, cycle, setCycle, tab, setTab };
  const go = (p, t) => { setPage(p); if (t) setTab(t); window.scrollTo(0, 0); };
  const View = { home: Home, calendar: CalendarPage, metime: MeTime, wellness: Wellness, chat: Chat }[page];
  return (
    <div className="app">
      <nav className="side">
        <div className="logo"><span className="flower">🌷</span><b>Bestie</b></div>
        <p className="tag">Ton petit espace pour aller mieux</p>
        {NAV.map(([id, e, l]) => (
          <button key={id} className={'nav ' + (page === id ? 'on' : '')} onClick={() => go(id)}><span>{e}</span><em>{l}</em></button>
        ))}
        <p className="priv"></p>
      </nav>
      <main className="main"><View S={S} go={go} /></main>
    </div>
  );
}