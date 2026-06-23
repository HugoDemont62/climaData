# ClimaData — Front & Moteur de Scrollytelling

Moteur de scrollytelling et de data-visualisation de ClimaData.
Responsable : Hugo Demont.

Couche d'expérience de ClimaData : l'utilisateur saisit un code postal, puis découvre au défilement le climat futur de sa commune (2030, 2040, 2050), teste un simulateur, et génère une carte d'identité climatique partageable. Le récit suit cinq actes, du constat mondial jusqu'à l'action locale.

---

## 1. Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **GSAP** + **ScrollTrigger** (narration liée au défilement)
- **D3.js** (visualisations de données sur mesure)
- **MapLibre GL** (cartographie vectorielle, France métropole et outre-mer)
- **Tailwind CSS** (charte et mise en page)
- Hébergement cible : **Vercel** (front + CDN)

---

## 2. Prérequis

- Node.js 20 et **pnpm** (ou npm)
- L'API ClimaData lancée en local (voir le repo back, port 8000 par défaut)

---

## 3. Arborescence du projet

```
climadata-front/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # parcours scrollytelling (5 actes)
│   └── commune/[insee]/page.tsx # rendu serveur pour le SEO et le partage
├── components/
│   ├── ScrollStage.tsx          # orchestration GSAP ScrollTrigger
│   ├── CodePostalInput.tsx      # saisie + appel API (acte II)
│   ├── MapZoom.tsx              # transition planète vers commune (MapLibre)
│   ├── IndicatorChart.tsx       # data-viz D3 (acte III)
│   ├── Simulator.tsx           # curseurs + courbes (acte IV)
│   ├── ShareCard.tsx           # carte d'identité climatique (acte V)
│   └── LinearView.tsx          # parcours alternatif sans animation
├── lib/
│   ├── api.ts                  # client de l'API ClimaData
│   └── types.ts                # types partagés (contrat d'API)
├── hooks/
│   └── useReducedMotion.ts
├── styles/
├── public/
├── .env.local.example
├── package.json
└── README.md
```

---

## 4. Installation et lancement

```bash
# 1. Dépendances
pnpm install

# 2. Variables d'environnement
cp .env.local.example .env.local   # puis ajuster

# 3. Serveur de développement
pnpm dev
```

Front disponible sur `http://localhost:3000`.
L'API back doit tourner en parallèle sur `http://localhost:8000`.

---

## 5. Variables d'environnement (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_MAP_STYLE=https://demotiles.maplibre.org/style.json
```

`NEXT_PUBLIC_API_URL` pointe vers l'API back (en prod, l'URL Scaleway).
Le style de carte peut être un style MapLibre léger ou un style auto-hébergé pour la sobriété.

---

## 6. Contrat d'API consommé

Le front s'appuie sur le schéma de réponse fourni par le back. Types attendus :

```ts
// lib/types.ts
export type Commune = { insee: string; nom: string; littoral: boolean };

export type Indicateur = {
  code: "canicule" | "nuits_chaudes" | "stress_hydrique" | "biodiversite";
  libelle: string;
  unite: string;
  horizons: { "2030": number; "2040": number; "2050": number };
  source: string;
};

export type CommuneData = {
  commune: Commune;
  scenario: string;
  indicateurs: Indicateur[];
};

export type Simulation = {
  commune: string;
  scenario: string;
  vegetalisation: number;
  reference: Record<string, number>;
  simule: Record<string, number>;
  delta: Record<string, number>;
};
```

Endpoints appelés :

- `GET /communes/recherche?code_postal=` lors de la saisie (acte II)
- `GET /commune/{insee}?scenario=` pour la révélation (acte III)
- `GET /commune/{insee}/simulation?vegetalisation=&scenario=` pour le simulateur (acte IV)

Toute évolution de ce contrat doit être validée avec le back avant intégration.

---

## 7. Structure narrative (les 5 actes)

Le parcours se modélise comme une suite d'étapes pilotées par le défilement. Chaque section déclenche, via ScrollTrigger, son animation et le chargement paresseux de ses données.

1. **Acte I, l'abstrait** : le constat mondial (+1,5 °C), volontairement distant.
2. **Acte II, la bascule** : saisie du code postal, zoom de la planète vers la commune.
3. **Acte III, la révélation** : les indicateurs se dévoilent un à un, traduits en quotidien.
4. **Acte IV, le pouvoir d'agir** : le simulateur (levier de végétalisation, sélecteur de scénario).
5. **Acte V, le partage** : génération de la carte d'identité climatique exportable.

L'état courant (acte actif, commune sélectionnée, paramètres du simulateur) est centralisé pour rester cohérent entre la narration, la carte et les graphiques.

---

## 8. Accessibilité (RGAA)

Le scrollytelling est un défi d'accessibilité. À respecter dès le départ :

- `prefers-reduced-motion` détecté (hook `useReducedMotion`) : animations désactivées et défilement non contraint.
- Parcours alternatif en lecture linéaire (`LinearView`) accessible sans interaction au scroll.
- Aucune information portée par la seule couleur : le gradient froid vers chaud est doublé d'étiquettes et de valeurs.
- Chaque graphique D3 dispose d'un tableau de données équivalent et d'un résumé textuel.
- Navigation complète au clavier, contrastes conformes AA, titres sémantiques.

---

## 9. Performance et éco-conception

- Budget de page strict, lazy-loading des actes et des tuiles cartographiques.
- Tuiles vectorielles (pas de raster lourd), images optimisées, pas de vidéo lourde.
- Rendu serveur (SSR/SSG) de la page commune pour le premier affichage et le SEO.
- Mesure avec Lighthouse et EcoIndex avant la démo.

---

## 10. Qualité

```bash
pnpm lint        # ESLint
pnpm typecheck   # TypeScript
pnpm test        # tests composants (le cas échéant)
```

---

## 11. Déploiement (Vercel)

```bash
# connexion du repo à Vercel, déploiement automatique sur push main
```

Renseigner `NEXT_PUBLIC_API_URL` (URL de l'API back) dans les variables d'environnement Vercel.
Vérifier que le `CORS_ORIGINS` du back autorise bien l'URL Vercel.

---

## 12. Checklist POC, jeudi soir

Périmètre minimal à démontrer côté front :

- [ ] Saisie d'un code postal et appel API fonctionnels (acte II)
- [ ] Transition cartographique planète vers commune (MapLibre)
- [ ] Révélation au défilement des 3 indicateurs avec data-viz D3 (acte III)
- [ ] Traduction en langage concret des chiffres (nuits chaudes, jours de canicule)
- [ ] Simulateur opérationnel : curseur de végétalisation et sélecteur de scénario qui modifient la courbe (acte IV)
- [ ] Génération de la carte d'identité climatique (acte V)
- [ ] Mode mouvement réduit et parcours linéaire alternatif
- [ ] Parcours fluide testé sur mobile
- [ ] Front connecté à l'API déployée (pas seulement en local)
- [ ] README à jour et dépôt Git propre (commits lisibles)

Pour la démo, prévoir 2 ou 3 codes postaux qui marchent à coup sûr (communes du jeu de démo back), dont une commune côtière pour montrer la montée des eaux.