# ClimaData Frontend — Redesign & Scrollytelling

**Date:** 2026-06-23  
**Scope:** Refonte visuelle + scrollytelling ActIII + correction routes API backend

---

## 1. Contexte

Le frontend Next.js (App Router, GSAP, Tailwind) présente :
- Une palette à 8 couleurs (navy, deep-blue, blue, green, orange, red + gris) trop chargée
- Un scrollytelling ActIII qui affiche les 4 cartes indicateurs en liste avec fade-in groupé — pas de révélation progressive
- Des routes API qui ne correspondent pas au backend (branche `develop` de Hugo)

---

## 2. Palette réduite (8 → 3)

| Token       | Valeur      | Usage                          |
|-------------|-------------|--------------------------------|
| `--ink`     | `#080F1C`   | Fond dark (ActI, ActII)        |
| `--paper`   | `#FFFFFF`   | Fond clair (ActIII, données)   |
| `--accent`  | `#1E6FE0`   | Accent unique (CTA, progress)  |
| `--text`    | `#0E1A2B`   | Texte sur fond clair           |
| `--muted`   | `#6B7A8D`   | Labels secondaires             |

Les couleurs par indicateur (rouge, orange, vert, bleu) **disparaissent**. Toutes les cartes deviennent monochromes sur blanc avec accent bleu.

---

## 3. Scrollytelling ActIII — Pinned one-by-one

### Comportement
- La section se **pinne** sur `minHeight: 100vh * nbIndicateurs`
- Un seul indicateur visible à la fois, centré pleine page
- Scroll progress `0→1` divisé en N segments égaux (N = nombre d'indicateurs)
- Transition : fade + translate Y `-30px → 0` à l'entrée, `0 → +30px` + fade out à la sortie
- Indicateur de progression discret en haut à droite : `01 / 04`

### Structure par panneau
```
[Numéro progression]          01 / 04
[Label indicateur]            JOURS DE CANICULE
[Chiffre clé]                 47          (typo massive, ~30vw)
[Unité + horizon]             jours · 2050
[Phrase humaine]              (Spectral italic, apparaît après le chiffre)
[Graphe barres simplifié]     Auj. → 2030 → 2040 → 2050
```

### Implémentation GSAP
- ScrollTrigger pinné sur `<section id="acte-3">`
- Timeline scrubée : `scrub: 1`
- Chaque panneau animé via `gsap.timeline` sur sa tranche de `progress`
- Pas de `ScrollTrigger.batch` — remplacé par logique d'index actif

---

## 4. Raffinements visuels globaux

- **Shadows** : remplacer les `box-shadow` multicouches par une ombre unique douce (`0 4px 24px rgba(0,0,0,0.08)`)
- **Barre de progression** : couleur unie `#1E6FE0` (supprimer le gradient arc-en-ciel)
- **Cards** : fond `#FFFFFF`, border `1px solid #E8EDF4`, aucun gradient de fond
- **ActII background** : simplifier de 3 couleurs → dark uni avec légère texture
- **Glows/halos** : supprimer ou réduire l'opacité à max 10%

---

## 6. Fichiers impactés

| Fichier                              | Changement                              |
|--------------------------------------|-----------------------------------------|
| `frontend/app/globals.css`           | Palette CSS vars, nettoyage             |
| `frontend/components/ActIII.tsx`     | Refonte complète scrollytelling pinné   |
| `frontend/components/IndicatorCard.tsx` | Monochrome, suppression couleurs par indicateur |
| `frontend/components/ActI.tsx`       | Réduction glows/halos                   |
| `frontend/components/ActII.tsx`      | Simplification background               |

---

## 6. Hors scope

- Backend / corrections routes API : non concerné (mock data conservé)
- Simulator, ShareCard, LinearView : non modifiés
- Tests, CI/CD : non concernés
- Mobile : les animations existantes restent, le scrollytelling pinné fonctionne sur mobile
