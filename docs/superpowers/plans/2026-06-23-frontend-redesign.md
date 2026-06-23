# Frontend Redesign & Scrollytelling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Réduire la palette de 8 → 3 couleurs, refondre le scrollytelling d'ActIII en mode pinné one-by-one, et épurer visuellement tous les composants.

**Architecture:** CSS vars centralisés dans globals.css comme source de vérité de la palette. ActIII abandonne le `ScrollTrigger.batch` pour un sticky container CSS + timeline scrubée GSAP, un seul panneau à la fois. IndicatorCard devient monochrome (accent bleu unique).

**Tech Stack:** Next.js 14 App Router, GSAP 3 + ScrollTrigger, Tailwind CSS v4, TypeScript

## Global Constraints

- Palette finale: `#080F1C` (dark), `#FFFFFF` (paper), `#1E6FE0` (accent), `#0E1A2B` (texte), `#6B7A8D` (muted), `#E8EDF4` (border)
- Aucune nouvelle dépendance npm autorisée
- `useReducedMotion` doit rester fonctionnel dans chaque composant modifié
- Pas de modification de `frontend/lib/api.ts`, `Simulator.tsx`, `ShareCard.tsx`, `LinearView.tsx`
- Tester visuellement avec `npm run dev` dans `frontend/`

---

## File Map

| Fichier | Rôle dans ce plan |
|---------|-------------------|
| `frontend/app/globals.css` | Palette réduite, suppression vars inutilisées |
| `frontend/components/ActI.tsx` | Réduction opacités glows/halos |
| `frontend/components/ActII.tsx` | Simplification background, suppression gradient |
| `frontend/components/IndicatorCard.tsx` | Monochrome, accent bleu unique |
| `frontend/components/ActIII.tsx` | Refonte complète scrollytelling pinné |

---

### Task 1: Palette — globals.css

**Files:**
- Modify: `frontend/app/globals.css`

**Interfaces:**
- Produces: CSS vars `--color-ink`, `--color-paper`, `--color-accent`, `--color-text`, `--color-muted`, `--color-border` utilisés par tous les composants suivants

- [ ] **Step 1: Remplacer le contenu de globals.css**

```css
@import "tailwindcss";

@theme inline {
  --color-ink:     #080F1C;
  --color-paper:   #FFFFFF;
  --color-accent:  #1E6FE0;
  --color-text:    #0E1A2B;
  --color-muted:   #6B7A8D;
  --color-border:  #E8EDF4;
  --font-sans:     var(--font-inter);
  --font-display:  var(--font-space-grotesk);
  --font-serif:    var(--font-spectral);
}

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: auto; }

body {
  background: #080F1C;
  color: #fff;
  font-family: var(--font-inter), -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* Ambient glow — opacity only, compositor thread */
@keyframes breathe {
  0%,100% { opacity: .10; }
  50%      { opacity: .22; }
}

/* Gradient text — bleu uniquement */
.gradient-text {
  background: linear-gradient(90deg, #0B3D91, #1E6FE0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Slider */
input[type=range] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: rgba(255,255,255,.1);
  outline: none;
  cursor: pointer;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px; height: 24px;
  border-radius: 50%;
  background: #1E6FE0;
  box-shadow: 0 2px 12px rgba(30,111,224,.45);
  transition: transform .15s ease;
}
input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.18); }

/* Scrollbar minimal */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #050d18; }
::-webkit-scrollbar-thumb { background: #1E3A6E; border-radius: 2px; }
```

- [ ] **Step 2: Lancer le dev server et vérifier visuellement**

```bash
cd frontend && npm run dev
```

Ouvrir http://localhost:3000. Vérifier : fond dark, texte visible, pas d'erreur console TypeScript.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/globals.css
git commit -m "style: reduce palette to 3 core tokens"
```

---

### Task 2: ActI — Réduction des glows

**Files:**
- Modify: `frontend/components/ActI.tsx`

**Interfaces:**
- Consumes: CSS vars de Task 1 (--color-accent)
- Produces: Composant ActI avec halos/glows réduits

- [ ] **Step 1: Remplacer ActI.tsx**

```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function ActI() {
  const reduced     = useReducedMotion();
  const sectionRef  = useRef<HTMLElement>(null);
  const pinnedRef   = useRef<HTMLDivElement>(null);
  const globeRef    = useRef<HTMLDivElement>(null);
  const ringsRef    = useRef<HTMLDivElement>(null);
  const numRef      = useRef<HTMLDivElement>(null);
  const captionRef  = useRef<HTMLDivElement>(null);
  const hintRef     = useRef<HTMLDivElement>(null);
  const txtRefs     = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
      entrance
        .from(globeRef.current,   { scale: 0.25, opacity: 0, duration: 2.2 })
        .from(ringsRef.current,   { scale: 0.4,  opacity: 0, duration: 2.6 }, "<.3")
        .from(numRef.current,     { opacity: 0, y: 24, duration: 1.4 }, "<.6")
        .from(captionRef.current, { opacity: 0, duration: 1 }, "<.4")
        .from(hintRef.current,    { opacity: 0, y: 10, duration: 1 }, "<.3");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.4,
          pin: pinnedRef.current,
          pinSpacing: false,
        },
      });
      tl.to(globeRef.current,   { scale: 0.38, opacity: 0, y: -50, ease: "power1.inOut" }, 0)
        .to(ringsRef.current,   { scale: 2.2,  opacity: 0,          ease: "power1.in"   }, 0)
        .to(numRef.current,     { opacity: 0,  y: -40,               ease: "power2.in"   }, 0)
        .to(captionRef.current, { opacity: 0,                        ease: "power1.in"   }, 0)
        .to(hintRef.current,    { opacity: 0,                        ease: "power1.in"   }, 0);

      txtRefs.forEach((ref, i) => {
        gsap.fromTo(ref.current,
          { opacity: 0, y: 56 },
          {
            opacity: 1, y: 0, duration: 1, ease: "power2.out",
            scrollTrigger: { trigger: ref.current, start: "top 82%", toggleActions: "play none none reverse" },
            delay: i * 0.08,
          });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]); // eslint-disable-line

  return (
    <section ref={sectionRef} id="acte-1" style={{ minHeight: "290vh" }} aria-label="Acte I — Le constat mondial">
      <div
        ref={pinnedRef}
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        style={{ background: "#080F1C" }}
      >
        {/* Étoiles CSS only */}
        <div className="pointer-events-none absolute inset-0" aria-hidden style={{
          backgroundImage:
            "radial-gradient(1.2px 1.2px at 14% 18%, rgba(255,255,255,.4) 0%,transparent 100%)," +
            "radial-gradient(1px   1px   at 71% 12%, rgba(255,255,255,.28)0%,transparent 100%)," +
            "radial-gradient(1.5px 1.5px at 42% 64%, rgba(255,255,255,.22)0%,transparent 100%)," +
            "radial-gradient(1px   1px   at 86% 52%, rgba(255,255,255,.3) 0%,transparent 100%)," +
            "radial-gradient(1px   1px   at 27% 79%, rgba(255,255,255,.18)0%,transparent 100%)",
        }} />

        {/* Anneaux atmosphériques — opacités réduites */}
        <div ref={ringsRef} className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          {[
            { d: "min(360px, 88vw)", op: .08 },
            { d: "min(500px, 122vw)", op: .06 },
            { d: "min(660px, 160vw)", op: .04 },
            { d: "min(840px, 204vw)", op: .025 },
          ].map(({ d, op }, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: d, height: d,
              border: `1px solid rgba(30,111,224,${op})`,
            }} />
          ))}
        </div>

        {/* Globe */}
        <div ref={globeRef} className="relative flex items-center justify-center">
          {/* Halo réduit */}
          <div className="absolute rounded-full" aria-hidden style={{
            width: "min(340px, 84vw)", height: "min(340px, 84vw)",
            background: "radial-gradient(circle at 50%, rgba(30,111,224,.08) 0%, transparent 70%)",
            animation: "breathe 4s ease-in-out infinite",
          }} />
          {/* Corps planétaire */}
          <div className="absolute rounded-full" aria-hidden style={{
            width: "min(236px, 58vw)", height: "min(236px, 58vw)",
            background: "radial-gradient(circle at 36% 32%, #3aa978 0%, #1E6FE0 36%, #0B3D91 68%, #07204f 100%)",
            boxShadow: "0 0 0 1px rgba(30,111,224,.12), 0 0 40px 4px rgba(30,111,224,.12), inset -20px -16px 48px rgba(0,0,0,.65)",
          }} />
          {/* Reflet */}
          <div className="absolute rounded-full pointer-events-none" aria-hidden style={{
            width: "min(236px, 58vw)", height: "min(236px, 58vw)",
            background: "radial-gradient(circle at 30% 24%, rgba(255,255,255,.10) 0%, transparent 48%)",
          }} />

          <div className="relative text-center" style={{ zIndex: 2 }}>
            <div ref={numRef} style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "clamp(52px, 10vw, 120px)",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              textShadow: "0 4px 40px rgba(0,0,0,.85)",
            }}>+1,5°C</div>
            <div ref={captionRef} style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 11,
              fontWeight: 500,
              color: "rgba(255,255,255,.32)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              marginTop: 12,
            }}>Réchauffement planétaire · 2024</div>
          </div>
        </div>

        <div ref={hintRef} className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2" aria-hidden>
          <div style={{ width: 1, height: 40, background: "linear-gradient(180deg,transparent,rgba(255,255,255,.2))" }} />
          <span style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.22)" }}>
            Défiler
          </span>
        </div>
      </div>

      <div
        className="relative z-10 flex flex-col items-center gap-16 pb-16 pt-16 sm:gap-36 sm:pb-44 sm:pt-32"
        style={{ marginTop: "-100vh" }}
      >
        {[
          "La planète a déjà gagné +1,5 °C par rapport à l'ère préindustrielle. Un chiffre mondial qui cache une réalité intime, locale, personnelle.",
          "Derrière ce degré et demi : des étés qui brûlent, des nuits sans sommeil, des rivières à sec, des espèces qui disparaissent.",
          "Et chez vous, à quoi ressemblera 2050 ?",
        ].map((text, i) => (
          <div key={i} ref={txtRefs[i]} className="max-w-lg px-5 sm:px-6 text-center" style={{ opacity: 0 }}>
            <p style={{
              fontFamily: "var(--font-spectral), serif",
              fontStyle: "italic",
              fontSize: i === 2 ? "clamp(20px, 3.5vw, 34px)" : "clamp(15px, 2.4vw, 22px)",
              fontWeight: i === 2 ? 500 : 400,
              color: i === 2 ? "#fff" : "rgba(255,255,255,.65)",
              lineHeight: 1.68,
              letterSpacing: i === 2 ? "-.01em" : "normal",
            }}>{text}</p>
            {i === 2 && (
              <div className="mx-auto mt-5 flex items-center justify-center gap-3"
                style={{ color: "rgba(255,255,255,.22)", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" }}>
                <span style={{ display: "block", width: 28, height: 1, background: "rgba(255,255,255,.18)" }} />
                Continuez à défiler
                <span style={{ display: "block", width: 28, height: 1, background: "rgba(255,255,255,.18)" }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Vérifier visuellement**

Ouvrir http://localhost:3000. Vérifier : le globe est visible, les halos sont discrets (non envahissants), le texte narratif s'anime au scroll.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/ActI.tsx
git commit -m "style(ActI): reduce glow and ring opacity"
```

---

### Task 3: ActII — Simplification du background

**Files:**
- Modify: `frontend/components/ActII.tsx`

**Interfaces:**
- Consumes: CSS vars Task 1
- Produces: Section ActII avec fond flat dark, sans gradient 3 tons

- [ ] **Step 1: Modifier uniquement la section background et la dot grid dans ActII.tsx**

Remplacer les attributs `style` de la `<section>` et de la dot grid :

Trouver (ligne ~94-104 dans ActII.tsx) :
```tsx
      style={{ background: "linear-gradient(162deg, #0a1a30 0%, #0B3D91 52%, #1456c0 100%)" }}
```
Remplacer par :
```tsx
      style={{ background: "#080F1C" }}
```

Trouver la dot grid overlay (aria-hidden div avec backgroundImage radial-gradient dots) :
```tsx
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,.055) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(ellipse 60% 70% at 50% 50%, black 20%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 60% 70% at 50% 50%, black 20%, transparent 80%)",
```
Remplacer par :
```tsx
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,.035) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(ellipse 55% 65% at 50% 50%, black 10%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 55% 65% at 50% 50%, black 10%, transparent 80%)",
```

Remplacer le style du bouton OK (ligne ~169) :
```tsx
                style={{ background: "linear-gradient(135deg,#0B3D91,#1E6FE0)", boxShadow: "0 4px 16px rgba(30,111,224,.4)" }}
```
Par :
```tsx
                style={{ background: "#1E6FE0", boxShadow: "0 4px 16px rgba(30,111,224,.35)" }}
```

- [ ] **Step 2: Vérifier visuellement**

Ouvrir http://localhost:3000 et scroller jusqu'à ActII. Vérifier : fond dark uni, France SVG visible, input et suggestions fonctionnels, bouton OK bleu.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/ActII.tsx
git commit -m "style(ActII): flatten background, reduce dot grid opacity"
```

---

### Task 4: IndicatorCard — Monochrome

**Files:**
- Modify: `frontend/components/IndicatorCard.tsx`

**Interfaces:**
- Consumes: Prop `indicateur: Indicateur`, prop `animate?: boolean` (identiques à avant)
- Produces: Card monochrome blanc + accent bleu, sans couleurs per-indicator

- [ ] **Step 1: Remplacer IndicatorCard.tsx entièrement**

```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Indicateur } from "@/lib/types";

const META: Record<string, { index: string; label: string; phrase: (v: number, u: string) => string }> = {
  canicule: {
    index: "01",
    label: "Jours de canicule",
    phrase: (v) => `En 2050, ${v} journées où la température flirte avec 40 °C — deux semaines entières de fournaise.`,
  },
  nuits_chaudes: {
    index: "02",
    label: "Nuits tropicales",
    phrase: (v) => `${v} nuits à plus de 20 °C par an. Dormir sans climatisation deviendra presque impossible.`,
  },
  stress_hydrique: {
    index: "03",
    label: "Déficit hydrique",
    phrase: (v) => `−${v} mm d'eau par an : rivières à l'étiage, nappes sous pression, jardins asséchés dès juillet.`,
  },
  biodiversite: {
    index: "04",
    label: "Biodiversité",
    phrase: (v) => `${v} % des espèces locales menacées de disparition avant 2050.`,
  },
};

const BAR_COLORS = ["#E2E8F0", "#93B8F7", "#4B8EF5", "#1E6FE0"] as const;
const HORIZONS   = ["Auj.", "2030", "2040", "2050"] as const;

type Props = { indicateur: Indicateur; animate?: boolean };

export default function IndicatorCard({ indicateur, animate = false }: Props) {
  const meta   = META[indicateur.code] ?? META.canicule;
  const values = [0, indicateur.horizons["2030"], indicateur.horizons["2040"], indicateur.horizons["2050"]];
  const max    = Math.max(...values) || 1;

  const numRef  = useRef<HTMLSpanElement>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!animate) return;
    const counter = { val: 0 };
    const tween = gsap.to(counter, {
      val: indicateur.horizons["2050"],
      duration: 1.2,
      ease: "power2.out",
      onUpdate() {
        if (numRef.current) numRef.current.textContent = String(Math.round(counter.val));
      },
    });
    barRefs.current.forEach((bar, i) => {
      if (!bar) return;
      bar.style.height = `${Math.max((values[i] / max) * 100, 3)}%`;
      gsap.fromTo(bar,
        { scaleY: 0, transformOrigin: "bottom center" },
        { scaleY: 1, duration: 0.65, ease: "power2.out", delay: i * 0.09 });
    });
    return () => { tween.kill(); };
  }, [animate]); // eslint-disable-line

  return (
    <article
      className="overflow-hidden rounded-2xl"
      style={{
        background: "#ffffff",
        border: "1px solid #E8EDF4",
        boxShadow: "0 4px 24px rgba(14,26,43,.06)",
      }}
    >
      {/* Bande accent */}
      <div style={{ height: 3, background: "#1E6FE0" }} />

      <div className="p-5 sm:p-7">
        {/* Étiquette */}
        <div className="mb-5 flex items-center gap-2.5">
          <span style={{
            fontFamily: "var(--font-space-grotesk)",
            fontWeight: 800,
            fontSize: 11,
            color: "#1E6FE0",
            letterSpacing: ".08em",
            background: "rgba(30,111,224,.08)",
            padding: "2px 7px",
            borderRadius: 4,
          }}>
            {meta.index}
          </span>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#6B7A8D",
            textTransform: "uppercase",
            letterSpacing: ".1em",
          }}>
            {meta.label}
          </span>
        </div>

        {/* Chiffre + graphique */}
        <div className="flex items-start gap-4 sm:gap-8 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-end gap-2 mb-1">
              <span ref={numRef} style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontWeight: 800,
                fontSize: "clamp(46px, 9vw, 80px)",
                letterSpacing: "-.04em",
                lineHeight: 1,
                color: "#0E1A2B",
              }}>
                {animate ? "0" : indicateur.horizons["2050"]}
              </span>
              <span className="mb-1" style={{ fontSize: "clamp(11px,1.6vw,13px)", fontWeight: 500, color: "#6B7A8D" }}>
                {indicateur.unite}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#A8BAD0", fontWeight: 500 }}>en 2050</p>
          </div>

          {/* Graphique barres */}
          <div style={{ flexShrink: 0, width: "clamp(116px, 26vw, 156px)" }}>
            <p style={{
              fontSize: 9, fontWeight: 700, color: "#A8BAD0",
              textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8,
            }}>Évolution</p>
            <div className="flex items-end gap-1.5" style={{ height: "clamp(72px, 11vw, 108px)" }}>
              {HORIZONS.map((label, i) => {
                const hPct = (values[i] / max) * 100;
                return (
                  <div key={label} className="flex flex-1 flex-col items-center gap-1">
                    <span style={{
                      fontSize: 8, fontWeight: 700,
                      color: i === 3 ? "#1E6FE0" : "#A8BAD0",
                      lineHeight: 1,
                    }}>
                      {i === 0 ? "—" : values[i]}
                    </span>
                    <div className="relative flex-1 w-full">
                      <div
                        ref={(el) => { barRefs.current[i] = el; }}
                        className="absolute bottom-0 w-full"
                        style={{
                          height: animate ? "3%" : `${Math.max(hPct, 3)}%`,
                          background: BAR_COLORS[i],
                          borderRadius: "3px 3px 0 0",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 8, color: "#A8BAD0", lineHeight: 1 }}>{label}</span>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 9, color: "#D0DCEA", marginTop: 6 }}>
              Source : {indicateur.source}
            </p>
          </div>
        </div>

        {/* Phrase humaine */}
        <div className="rounded-xl p-3.5 sm:p-4" style={{
          background: "rgba(30,111,224,.05)",
          borderLeft: "3px solid #1E6FE0",
        }}>
          <p style={{
            fontFamily: "var(--font-spectral), serif",
            fontStyle: "italic",
            fontSize: "clamp(12px, 1.8vw, 14px)",
            color: "#2D3E52",
            lineHeight: 1.65,
          }}>
            {meta.phrase(indicateur.horizons["2050"], indicateur.unite)}
          </p>
        </div>
      </div>

      <table className="sr-only">
        <caption>{indicateur.libelle} — projections</caption>
        <thead><tr><th>Horizon</th><th>Valeur ({indicateur.unite})</th></tr></thead>
        <tbody>
          {Object.entries(indicateur.horizons).map(([h, v]) => (
            <tr key={h}><td>{h}</td><td>{v}</td></tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
```

- [ ] **Step 2: Vérifier visuellement**

Sélectionner une commune demo (ex: "Paris"). Vérifier : 4 cards blanches, bande bleue en haut, badge bleu, barres bleues progressives, phrase en encart bleu pâle.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/IndicatorCard.tsx
git commit -m "style(IndicatorCard): monochrome with single blue accent"
```

---

### Task 5: ActIII — Scrollytelling pinné one-by-one

**Files:**
- Modify: `frontend/components/ActIII.tsx`

**Interfaces:**
- Consumes: `data: CommuneData`, `IndicatorCard` de Task 4
- Produces: Section sticky-pinned, un indicateur par écran, transitions GSAP scrubées

**Principe CSS sticky + GSAP scrub:**
- `<section>` a `minHeight: ${N * 100}vh` → le scroll couvre `(N-1) * 100vh`
- Un `<div style={{ position: 'sticky', top: 0, height: '100vh' }}>` reste visible pendant tout ce scroll
- GSAP `ScrollTrigger` sur la section (`start: "top top"`, `end: "bottom bottom"`, `scrub: 1`) pilote les transitions
- N panneaux en `position: absolute; inset: 0` à l'intérieur du sticky div
- Timeline : panneau i sort à `i + 0.7`, panneau i+1 entre à `i + 0.7`

- [ ] **Step 1: Remplacer ActIII.tsx entièrement**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CommuneData } from "@/lib/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import IndicatorCard from "./IndicatorCard";

gsap.registerPlugin(ScrollTrigger);

type Props = { data: CommuneData };

export default function ActIII({ data }: Props) {
  const reduced     = useReducedMotion();
  const sectionRef  = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const panelRefs   = useRef<HTMLDivElement[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const N = data.indicateurs.length;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Barre de progression fine
      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      if (reduced) {
        panelRefs.current.forEach((p) => gsap.set(p, { autoAlpha: 1, y: 0 }));
        setActiveIdx(N - 1);
        return;
      }

      // Initialiser : panel 0 visible, les autres cachés
      panelRefs.current.forEach((panel, i) => {
        gsap.set(panel, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 40 });
      });

      const OVERLAP = 0.3; // fraction du segment de transition

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate(self) {
            setActiveIdx(Math.min(Math.floor(self.progress * N), N - 1));
          },
        },
      });

      panelRefs.current.forEach((panel, i) => {
        // Sortie du panneau i (sauf le dernier)
        if (i < N - 1) {
          tl.fromTo(
            panel,
            { autoAlpha: 1, y: 0 },
            { autoAlpha: 0, y: -40, duration: OVERLAP, ease: "power1.in" },
            i + (1 - OVERLAP)
          );
        }
        // Entrée du panneau i (sauf le premier)
        if (i > 0) {
          tl.fromTo(
            panel,
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: OVERLAP, ease: "power1.out" },
            i - OVERLAP
          );
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [data, reduced, N]); // eslint-disable-line

  return (
    <section
      ref={sectionRef}
      id="acte-3"
      style={{ minHeight: `${N * 100}vh`, position: "relative" }}
      aria-label="Acte III — La révélation"
    >
      {/* Sticky container — reste à l'écran pendant tout le scroll de la section */}
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: "#F7F9FC" }}>

        {/* Barre de progression fine en haut */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(14,26,43,.08)", zIndex: 30 }}>
          <div
            ref={progressRef}
            style={{
              height: "100%",
              width: "100%",
              transformOrigin: "left center",
              transform: "scaleX(0)",
              background: "#1E6FE0",
            }}
          />
        </div>

        {/* Barre localisation */}
        <div style={{
          position: "absolute", top: 2, left: 0, right: 0, zIndex: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px",
          background: "rgba(8,15,28,.96)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span style={{
              display: "inline-flex", height: 7, width: 7, borderRadius: "50%", flexShrink: 0,
              background: "#1E6FE0",
              boxShadow: "0 0 0 3px rgba(30,111,224,.2)",
            }} />
            <span style={{
              fontFamily: "var(--font-space-grotesk)", fontWeight: 700,
              color: "#fff", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {data.commune.nom}
            </span>
            <span style={{ fontSize: 12, color: "#6B7A8D", flexShrink: 0 }}>· {data.scenario}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Compteur de progression */}
            <span style={{
              fontFamily: "var(--font-space-grotesk)", fontWeight: 700,
              fontSize: 11, letterSpacing: ".1em",
              color: "#1E6FE0",
            }}>
              {String(activeIdx + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
            </span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
              style={{
                borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 600,
                color: "#9fb0c4", background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.08)", cursor: "pointer",
              }}
            >
              Changer
            </button>
          </div>
        </div>

        {/* Panneaux — empilés en position absolute */}
        {data.indicateurs.map((ind, i) => (
          <div
            key={ind.code}
            ref={(el) => { if (el) panelRefs.current[i] = el; }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 20px 40px",
            }}
          >
            <div style={{ width: "100%", maxWidth: 640 }}>
              {/* Label indicateur */}
              <div style={{
                fontFamily: "var(--font-space-grotesk)",
                fontSize: 10, fontWeight: 700,
                color: "#1E6FE0",
                letterSpacing: ".18em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>
                {String(i + 1).padStart(2, "0")} — {ind.libelle}
              </div>

              {/* Carte */}
              <IndicatorCard indicateur={ind} animate={activeIdx === i && !reduced} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Vérifier que le sticky container ne crée pas de double scroll**

Ouvrir http://localhost:3000, sélectionner "Paris" (ou toute commune demo). Scroller jusqu'à ActIII. Vérifier :
- La barre localisation (fond dark) est collée en haut de l'écran
- Seul 1 indicateur est visible à la fois
- En scrollant doucement, le premier indicateur part vers le haut et le second arrive par le bas
- Le compteur "01 / 04" → "02 / 04" → … se met à jour
- La barre de progression bleue avance

- [ ] **Step 3: Vérifier le retour arrière (scroll up)**

Scroller jusqu'au dernier indicateur (04/04) puis remonter. Vérifier que les panneaux reviennent dans l'ordre inverse correctement.

- [ ] **Step 4: Vérifier le mode reduced-motion**

Désactiver temporairement les animations (DevTools → Rendering → Emulate CSS `prefers-reduced-motion: reduce`). Vérifier que toutes les cartes sont visibles sans animation.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/ActIII.tsx
git commit -m "feat(ActIII): pinned one-by-one scrollytelling with GSAP scrub"
```

---

## Self-Review

**Spec coverage:**
- ✅ Palette 8→3 : Task 1 (`globals.css`)
- ✅ Glows réduits : Task 2 (`ActI`)
- ✅ Background simplifié : Task 3 (`ActII`)
- ✅ Cards monochrome : Task 4 (`IndicatorCard`)
- ✅ Scrollytelling pinné one-by-one : Task 5 (`ActIII`)
- ✅ Barre de progression bleu uni (plus de gradient arc-en-ciel) : dans Task 5
- ✅ `useReducedMotion` préservé partout : Tasks 2, 5
- ✅ Backend / API non modifiés (hors scope)

**Placeholder scan:** Aucun TBD, toutes les étapes ont du code complet.

**Type consistency:**
- `IndicatorCard` : props `indicateur: Indicateur` et `animate?: boolean` inchangées ✅
- `ActIII` : prop `data: CommuneData` inchangée ✅
- `panelRefs.current[i]` correctement typé `HTMLDivElement[]` ✅
