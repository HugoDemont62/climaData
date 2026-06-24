"use client";
import { useEffect, useRef, useState } from "react";
import type { CommuneData } from "@/lib/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = { data: CommuneData };

const IND_META: Record<string, { color: string; label: string }> = {
  canicule:        { color: "#C94535", label: "Jours de canicule" },
  nuits_chaudes:   { color: "#7B3FA0", label: "Nuits tropicales" },
  stress_hydrique: { color: "#1A6EA8", label: "Déficit hydrique" },
  biodiversite:    { color: "#1A7A42", label: "Pression biodiversité" },
};

export default function ShareCard({ data }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const reduced    = useReducedMotion();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (reduced || typeof window === "undefined") return;
    import("gsap").then((g) => {
      import("gsap/ScrollTrigger").then((st) => {
        const gsap = g.gsap;
        gsap.registerPlugin(st.ScrollTrigger);
        if (!cardRef.current) return;
        const els = cardRef.current.querySelectorAll("[data-reveal]");
        gsap.fromTo(els,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.13, ease: "power2.out",
            scrollTrigger: { trigger: cardRef.current, start: "top 70%" } }
        );
      });
    });
  }, [reduced]);

  const topInd = data.indicateurs.find((i) => i.code === "canicule") ?? data.indicateurs[0];
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/commune/${data.commune.insee}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* silently ignore */ }
  };

  return (
    <section
      ref={sectionRef}
      id="acte-5"
      style={{ background: "#080F1C" }}
      aria-label="Acte V — Carte d'identité climatique"
    >
      <div style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "clamp(48px, 8vh, 88px) clamp(20px, 4vw, 48px)",
      }}>

        {/* En-tête section */}
        <p data-reveal style={{
          fontSize: 11, fontWeight: 700, letterSpacing: ".18em",
          textTransform: "uppercase", color: "#F2762B", marginBottom: 16,
        }}>
          Votre profil climatique
        </p>
        <h2 data-reveal style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontWeight: 700,
          fontSize: "clamp(28px, 4.5vw, 54px)",
          letterSpacing: "-0.02em",
          lineHeight: 1.08,
          color: "#fff",
          marginBottom: "clamp(28px, 5vh, 48px)",
        }}>
          Carte d'identité<br />climatique de {data.commune.nom}
        </h2>

        {/* La carte */}
        <div
          ref={cardRef}
          style={{
            background: "#07111D",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,.7)",
          }}
        >
          {/* Barre arc-en-ciel */}
          <div data-reveal style={{
            height: 5,
            background: "linear-gradient(90deg, #C94535 0%, #7B3FA0 30%, #1A6EA8 55%, #1A7A42 78%, #2E9E6B 100%)",
          }} />

          <div style={{ padding: "clamp(24px, 4vw, 44px)" }}>

            {/* Commune */}
            <div data-reveal style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
              <span style={{
                display: "inline-flex", height: 10, width: 10,
                borderRadius: "50%", flexShrink: 0,
                background: "#F2762B",
                boxShadow: "0 0 0 4px rgba(242,118,43,.2)",
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(22px, 4vw, 32px)",
                  color: "#fff",
                  lineHeight: 1.1,
                  marginBottom: 5,
                }}>
                  {data.commune.nom}
                </p>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {data.commune.littoral && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: "3px 10px", borderRadius: 20,
                      background: "rgba(30,111,224,.2)",
                      color: "#7EB8F7",
                      border: "1px solid rgba(30,111,224,.3)",
                      letterSpacing: ".04em",
                      textTransform: "uppercase",
                    }}>
                      Littoral
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: "#3D5A78" }}>
                    Scénario {data.scenario} · DRIAS 2025
                  </span>
                </div>
              </div>
            </div>

            {/* Grille indicateurs 2×2 */}
            <div data-reveal style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 28,
            }}>
              {data.indicateurs.map((ind) => {
                const meta = IND_META[ind.code] ?? { color: "#1E6FE0", label: ind.libelle };
                return (
                  <div key={ind.code} style={{
                    background: "#0A1828",
                    border: `1px solid ${meta.color}30`,
                    borderLeft: `4px solid ${meta.color}`,
                    borderRadius: 16,
                    padding: "clamp(16px, 2.5vw, 24px)",
                  }}>
                    <p style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: meta.color,
                      marginBottom: 10,
                      opacity: 0.85,
                    }}>
                      {meta.label}
                    </p>
                    <p style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontWeight: 800,
                      fontSize: "clamp(44px, 8vw, 64px)",
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      color: "#fff",
                      marginBottom: 8,
                    }}>
                      {ind.horizons["2050"]}
                    </p>
                    <p style={{ fontSize: 11, color: "#3D5A78", lineHeight: 1.35 }}>
                      {ind.unite} en 2050
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Citation */}
            <div data-reveal style={{
              borderRadius: 16,
              padding: "clamp(18px, 3vw, 28px)",
              background: "rgba(255,255,255,.04)",
              borderLeft: "3px solid rgba(242,118,43,.5)",
              marginBottom: 28,
            }}>
              <p style={{
                fontFamily: "var(--font-spectral), serif",
                fontStyle: "italic",
                fontSize: "clamp(14px, 2vw, 17px)",
                color: "rgba(255,255,255,.72)",
                lineHeight: 1.75,
                marginBottom: 14,
              }}>
                « En 2050, {data.commune.nom} pourrait connaître {topInd?.horizons["2050"]} jours
                de canicule par an. Le climat change — localement, concrètement. »
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#3D5A78" }}>climadata.fr</span>
                <span style={{ height: 3, width: 3, borderRadius: "50%", background: "#3D5A78", display: "inline-block" }} />
                <span style={{ fontSize: 11, color: "#3D5A78" }}>Données DRIAS · 2025</span>
              </div>
            </div>

            {/* Boutons partage */}
            <div data-reveal style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={handleCopy}
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: "16px 28px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  background: copied
                    ? "linear-gradient(135deg, #1A7A42 0%, #0E5430 100%)"
                    : "linear-gradient(135deg, #2E88F0 0%, #1558C8 100%)",
                  border: "none",
                  cursor: "pointer",
                  transition: "background .3s",
                  boxShadow: "0 6px 24px rgba(30,111,224,.35)",
                  letterSpacing: ".01em",
                }}
              >
                {copied ? "Lien copié ✓" : "Copier le lien"}
              </button>
              <button
                onClick={() => {
                  const text = `Le climat de ${data.commune.nom} en 2050 : ${topInd?.horizons["2050"]} jours de canicule. Découvrez votre commune : ${shareUrl}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
                }}
                style={{
                  padding: "16px 28px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#7EB8F7",
                  background: "#0D1E35",
                  border: "1px solid #1A3A5C",
                  cursor: "pointer",
                  letterSpacing: ".01em",
                  whiteSpace: "nowrap",
                }}
              >
                X / Twitter
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#1E3050", lineHeight: 1.6 }}>
            Données : DRIAS · DRIAS-Eau · API Géo · BAN — Licence ouverte
          </p>
        </div>
      </div>
    </section>
  );
}
