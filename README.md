# Bestie 🌷 — Ton petit espace pour aller mieux

App de bien-être pour jeunes Tunisiennes (étudiantes, jeunes diplômées, premier emploi). React + Vite (front) · Express (API IA) · pas de chatbot : tout passe par des cartes, un calendrier et des recommandations.

## Lancer
```bash
npm install
cp .env.example .env     # puis mets ta clé Google AI Studio dans LLM_API_KEY (facultatif)
npm run dev              # front: http://localhost:5173  (API: :3001)
```
Production : `npm start` (build + serveur unique sur http://localhost:3001).
Variables : `LLM_API_KEY` (clé Google AI Studio, facultative), `LLM_PROVIDER=openai` (API OpenAI-compatible), `LLM_BASE_URL` (endpoint OpenAI-compatible de Gemini), `LLM_MODEL` (défaut `gemini-2.5-flash`), `PORT`.

## Structure
- `server/index.js` : API (`/api/support`, `/api/study-tips`, `/api/health`), validation des entrées/sorties, garde-fou sécurité, clé jamais exposée au front.
- `src/lib/planner.js` : planning de révision **déterministe** (jamais plus d'heures que dispo, pauses, veille d'examen allégée).
- `src/lib/cycle.js` : estimation simple du cycle (moyenne, refusée si cycles trop irréguliers).
- `src/lib/fallback.js` : contenu **prédéfini** (étiqueté « non IA » dans l'interface).
- `src/pages/` : Home, CalendarPage (agenda + plan de révision), MeTime, Wellness (habitudes, parcours, cycle).







