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
        panelRefs.current.forEach((p) => { if (p) gsap.set(p, { autoAlpha: 1, y: 0 }); });
        setActiveIdx(N - 1);
        return;
      }

      // Initialiser : panel 0 visible, les autres cachés
      panelRefs.current.forEach((panel, i) => {
        if (panel) gsap.set(panel, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 40 });
      });

      const OVERLAP = 0.3;

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
        if (!panel) return;
        // Sortie (sauf dernier)
        if (i < N - 1) {
          tl.fromTo(
            panel,
            { autoAlpha: 1, y: 0 },
            { autoAlpha: 0, y: -40, duration: OVERLAP, ease: "power1.in" },
            i + (1 - OVERLAP)
          );
        }
        // Entrée (sauf premier)
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
      {/* Sticky container — reste visible pendant tout le scroll de la section */}
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: "radial-gradient(ellipse at 50% 30%, #241A12 0%, #1A1410 70%)" }}>

        {/* Barre de progression fine */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(251,246,236,.1)", zIndex: 30 }}>
          <div
            ref={progressRef}
            style={{
              height: "100%",
              width: "100%",
              transformOrigin: "left center",
              transform: "scaleX(0)",
              background: "var(--terracotta)",
            }}
          />
        </div>

        {/* Barre localisation */}
        <div style={{
          position: "absolute", top: 2, left: 0, right: 0, zIndex: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px clamp(16px, 4vw, 48px)",
          background: "rgba(26,20,16,.97)",
          borderBottom: "1px solid rgba(251,246,236,.07)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span style={{
              display: "inline-flex", height: 7, width: 7, borderRadius: "50%", flexShrink: 0,
              background: "var(--terracotta)",
              boxShadow: "0 0 0 3px rgba(232,116,59,.2)",
            }} />
            <span style={{
              fontFamily: "var(--font-sen)", fontWeight: 700,
              color: "var(--paper-text)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {data.commune.nom}
            </span>
            {data.commune.littoral && (
              <span style={{
                borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 600,
                background: "rgba(45,90,107,.18)", color: "#8FC3D6", flexShrink: 0,
              }}>
                Littoral
              </span>
            )}
            <span style={{ fontSize: 12, color: "#6B7A8D", flexShrink: 0 }}>· {data.scenario}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Compteur */}
            <span style={{
              fontFamily: "var(--font-sen)", fontWeight: 700,
              fontSize: 11, letterSpacing: ".1em", color: "var(--terracotta)",
            }}>
              {String(activeIdx + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
            </span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
              style={{
                borderRadius: 20, padding: "6px 16px", fontSize: 11, fontWeight: 700,
                color: "#0E1A2B",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,.3)",
                cursor: "pointer",
                letterSpacing: ".02em",
              }}
            >
              Changer de ville
            </button>
          </div>
        </div>

        {/* Panneaux empilés */}
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
              padding: "clamp(72px, 10vh, 100px) clamp(16px, 4vw, 48px) clamp(24px, 4vh, 48px)",
              overflowY: "auto",
            }}
          >
            <div style={{ width: "100%", maxWidth: 760 }}>
              <IndicatorCard indicateur={ind} animate={activeIdx === i && !reduced} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
