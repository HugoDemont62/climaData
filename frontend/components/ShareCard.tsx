"use client";
import { useEffect, useRef, useState } from "react";
import type { CommuneData } from "@/lib/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = { data: CommuneData };

const IND_META: Record<string, { color: string; label: string }> = {
  canicule:        { color: "#E8743B", label: "Jours de canicule" },
  nuits_chaudes:   { color: "#C77BA6", label: "Nuits tropicales" },
  stress_hydrique: { color: "#5AA0BC", label: "Déficit hydrique" },
  biodiversite:    { color: "#84B65A", label: "Pression biodiversité" },
};

export default function ShareCard({ data }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const posterRef  = useRef<HTMLDivElement>(null);
  const reduced    = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      // S'assurer que les polices sont chargées avant capture
      if (document.fonts?.ready) await document.fonts.ready;
      const { toPng } = await import("html-to-image");
      // On capture l'affiche dédiée (infos centrales) — pas toute la carte interactive
      const dataUrl = await toPng(posterRef.current, {
        pixelRatio: 2,
        backgroundColor: "#16100B",
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `climadata-${data.commune.insee}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      /* échec silencieux */
    } finally {
      setDownloading(false);
    }
  };

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
      className="grain"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #241A12 0%, #1A1410 75%)", position: "relative" }}
      aria-label="Acte V — Carte d'identité climatique"
    >
      {/* Affiche dédiée au partage — hors écran, capturée en PNG (infos centrales, soignée) */}
      <div
        ref={posterRef}
        aria-hidden
        style={{
          position: "fixed", left: -99999, top: 0,
          width: 620,
          padding: "52px 48px 44px",
          background: "linear-gradient(165deg, #2A1F16 0%, #16100B 100%)",
          fontFamily: "var(--font-sen), sans-serif",
          color: "#fff",
        }}
      >
        <div style={{
          height: 6, borderRadius: 99, marginBottom: 40,
          background: "linear-gradient(90deg, #E8743B 0%, #C77BA6 30%, #5AA0BC 55%, #84B65A 80%, #D9A441 100%)",
        }} />
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".34em", textTransform: "uppercase", color: "#D9A441", marginBottom: 18 }}>
          climadata.fr
        </p>
        <p style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-.02em", marginBottom: 10 }}>
          {data.commune.nom}
        </p>
        <p style={{ fontSize: 15, color: "#B5A48F", marginBottom: 40 }}>
          Le climat en 2050&nbsp;· Scénario {data.scenario}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 36 }}>
          {data.indicateurs.map((ind) => {
            const meta = IND_META[ind.code] ?? { color: "#E8743B", label: ind.libelle };
            return (
              <div key={ind.code} style={{
                background: "rgba(255,255,255,.035)",
                border: `1px solid ${meta.color}33`,
                borderLeft: `5px solid ${meta.color}`,
                borderRadius: 18,
                padding: "26px 24px",
              }}>
                <p style={{ fontSize: 66, fontWeight: 800, lineHeight: 1, letterSpacing: "-.04em", color: meta.color, marginBottom: 12 }}>
                  {ind.horizons["2050"]}
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", lineHeight: 1.25, marginBottom: 5 }}>
                  {meta.label}
                </p>
                <p style={{ fontSize: 12.5, color: "#B5A48F" }}>{ind.unite}</p>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(251,246,236,.82)" }}>
          « Le climat ne change pas qu&apos;aux infos : il change ici. »
        </p>
      </div>

      <div style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "clamp(48px, 8vh, 88px) clamp(20px, 4vw, 48px)",
      }}>

        {/* En-tête section */}
        <p data-reveal style={{
          fontSize: 11, fontWeight: 700, letterSpacing: ".18em",
          textTransform: "uppercase", color: "var(--terracotta)", marginBottom: 16,
        }}>
          Votre profil climatique
        </p>
        <h2 data-reveal style={{
          fontFamily: "var(--font-sen), sans-serif",
          fontWeight: 700,
          fontSize: "clamp(28px, 4.5vw, 54px)",
          letterSpacing: "-0.02em",
          lineHeight: 1.08,
          color: "var(--paper-text)",
          marginBottom: "clamp(28px, 5vh, 48px)",
        }}>
          Carte d'identité<br />climatique de {data.commune.nom}
        </h2>

        {/* La carte */}
        <div
          ref={cardRef}
          style={{
            background: "#2C2219",
            border: "1px solid rgba(217,164,65,.22)",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,.5)",
          }}
        >
          {/* Barre arc-en-ciel */}
          <div data-reveal style={{
            height: 5,
            background: "linear-gradient(90deg, #D9542E 0%, #8A4A6E 30%, #2D5A6B 55%, #5C8A3A 80%, #D9A441 100%)",
          }} />

          <div style={{ padding: "clamp(24px, 4vw, 44px)" }}>

            {/* Commune */}
            <div data-reveal style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
              <span style={{
                display: "inline-flex", height: 10, width: 10,
                borderRadius: "50%", flexShrink: 0,
                background: "var(--terracotta)",
                boxShadow: "0 0 0 4px rgba(232,116,59,.2)",
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: "var(--font-sen), sans-serif",
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
                      background: "rgba(45,90,107,.25)",
                      color: "#8FC3D6",
                      border: "1px solid rgba(45,90,107,.4)",
                      letterSpacing: ".04em",
                      textTransform: "uppercase",
                    }}>
                      Littoral
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: "var(--paper-muted)" }}>
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
                const meta = IND_META[ind.code] ?? { color: "#E8743B", label: ind.libelle };
                return (
                  <div key={ind.code} style={{
                    background: "#221A13",
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
                      fontFamily: "var(--font-sen), sans-serif",
                      fontWeight: 800,
                      fontSize: "clamp(44px, 8vw, 64px)",
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      color: "#fff",
                      marginBottom: 8,
                    }}>
                      {ind.horizons["2050"]}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--paper-muted)", lineHeight: 1.35 }}>
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
              background: "rgba(217,164,65,.06)",
              borderLeft: "3px solid rgba(232,116,59,.5)",
              marginBottom: 28,
            }}>
              <p style={{
                fontFamily: "var(--font-sen), sans-serif",
                fontSize: "clamp(14px, 2vw, 17px)",
                color: "rgba(251,246,236,.82)",
                lineHeight: 1.75,
                marginBottom: 14,
              }}>
                « D'ici 2050, {data.commune.nom} pourrait compter {topInd?.horizons["2050"]} jours
                de canicule par an. Le climat ne change pas qu'aux infos : il change ici. »
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)" }}>climadata.fr</span>
                <span style={{ height: 3, width: 3, borderRadius: "50%", background: "var(--paper-muted)", display: "inline-block" }} />
                <span style={{ fontSize: 11, color: "var(--paper-muted)" }}>Données DRIAS · 2025</span>
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
                    ? "linear-gradient(135deg, #5C8A3A 0%, #3E6325 100%)"
                    : "linear-gradient(135deg, #E8743B 0%, #C2521F 100%)",
                  border: "none",
                  cursor: "pointer",
                  transition: "background .3s",
                  boxShadow: "0 6px 24px rgba(232,116,59,.35)",
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
                  color: "#E9C97A",
                  background: "rgba(217,164,65,.1)",
                  border: "1px solid rgba(217,164,65,.3)",
                  cursor: "pointer",
                  letterSpacing: ".01em",
                  whiteSpace: "nowrap",
                }}
              >
                X / Twitter
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                style={{
                  padding: "16px 28px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  background: "linear-gradient(135deg, #E8743B 0%, #C2521F 100%)",
                  border: "none",
                  cursor: downloading ? "default" : "pointer",
                  opacity: downloading ? 0.7 : 1,
                  letterSpacing: ".01em",
                  whiteSpace: "nowrap",
                  boxShadow: "0 6px 24px rgba(232,116,59,.35)",
                }}
              >
                {downloading ? "Génération…" : "Télécharger l'image"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#9A8C7A", lineHeight: 1.6 }}>
            Données : DRIAS · DRIAS-Eau · API Géo · BAN — Licence ouverte
          </p>
        </div>
      </div>
    </section>
  );
}
