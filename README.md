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

## Qui fait quoi (explication jury)
- **Règles** : planning, horaires, estimation du cycle, statistiques de la semaine.
- **IA** : suggestion personnalisée (accueil, Me Time) et conseils d'étude par matière. Sortie JSON validée côté serveur ; si l'IA échoue → contenu prédéfini, affiché comme tel.
- **Vie privée** : données en localStorage uniquement ; texte libre envoyé à l'IA seulement si case cochée, jamais sauvegardé ; cycle jamais envoyé à l'IA ; bouton « Effacer mes données ». Limite honnête : pas de comptes ni de base de données (démo mono-appareil).
- **Sécurité** : mots de détresse détectés → message de soutien sans appel à l'IA, sans numéro inventé.

## Démo de 3 minutes
1. Accueil : choisir 😵‍💫 Stressée → la carte « petit pas » change. Cliquer 🌿 → respiration guidée.
2. Cliquer 📚 → « Créer mon plan » : saisir 3 examens, 3 h/jour, énergie basse → plan avec pauses ; retirer une séance ; « Ajouter au calendrier ».
3. Me Time : 15 min + énergie basse → recommandation ; planifier ☕ ; cocher fait.
4. Bien-être : activer le cycle, enregistrer 3 débuts de règles → dates estimées en pointillé sur le calendrier.
5. Retour Accueil : priorités du jour mises à jour.

## Pitch de 5 minutes (trame)
Problème (stress d'examens, refus d'emploi, charge mentale, tabou du cycle) → Public (jeunes Tunisiennes, FR/Derja) → Solution (cartes, pas de chatbot, repos sans culpabilité) → Architecture IA (règles + LLM + fallback + vie privée) → Impact (moins de surcharge, habitudes douces, extensible : Derja, rappels, comptes chiffrés).

## Non implémenté (honnêteté)
Sélecteur Derja/arabe, graphiques avancés, rappels, base de données/comptes.
