"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Indicateur } from "@/lib/types";

const META: Record<string, {
  index: string;
  label: string;
  color: string;
  colorLight: string;
  colorBorder: string;
  barColors: readonly string[];
  phrase: (v: number) => string;
}> = {
  canicule: {
    index: "01",
    label: "Jours de canicule",
    color: "#C94535",
    colorLight: "rgba(201,69,53,.07)",
    colorBorder: "rgba(201,69,53,.18)",
    barColors: ["#F5DDD6", "#EDA98C", "#E07050", "#C94535"],
    phrase: (v) => `En 2050, ${v} journées dépasseront 35 °C — soit presque deux semaines de fournaise continue chaque été.`,
  },
  nuits_chaudes: {
    index: "02",
    label: "Nuits tropicales",
    color: "#7B3FA0",
    colorLight: "rgba(123,63,160,.07)",
    colorBorder: "rgba(123,63,160,.18)",
    barColors: ["#EDE0F5", "#C9A0DF", "#9B59B6", "#7B3FA0"],
    phrase: (v) => `${v} nuits par an au-dessus de 20 °C. Dormir fenêtre ouverte deviendra une exception, pas une habitude.`,
  },
  stress_hydrique: {
    index: "03",
    label: "Déficit hydrique",
    color: "#1A6EA8",
    colorLight: "rgba(26,110,168,.07)",
    colorBorder: "rgba(26,110,168,.18)",
    barColors: ["#CCE5F5", "#7DBDE8", "#3498DB", "#1A6EA8"],
    phrase: (v) => `Indice ${v}/100 de déficit en eau : nappes sous pression, rivières à l'étiage dès juillet, jardins asséchés.`,
  },
  biodiversite: {
    index: "04",
    label: "Pression biodiversité",
    color: "#1A7A42",
    colorLight: "rgba(26,122,66,.07)",
    colorBorder: "rgba(26,122,66,.18)",
    barColors: ["#C8EDD6", "#78CC9F", "#27AE60", "#1A7A42"],
    phrase: (v) => `Score de pression ${v}/100 sur les espèces locales — certaines d'entre elles auront disparu avant 2050.`,
  },
};

const HORIZONS = ["Auj.", "2030", "2040", "2050"] as const;

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
      duration: 1.4,
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
        { scaleY: 1, duration: 0.7, ease: "power2.out", delay: i * 0.1 });
    });
    return () => { tween.kill(); };
  }, [animate]); // eslint-disable-line

  return (
    <article style={{
      background: "#fff",
      borderRadius: 24,
      overflow: "hidden",
      boxShadow: "0 32px 80px rgba(14,26,43,.13), 0 4px 16px rgba(14,26,43,.07)",
      border: `1px solid ${meta.colorBorder}`,
    }}>
      {/* Accent top bar */}
      <div style={{
        height: 6,
        background: `linear-gradient(90deg, ${meta.color} 0%, ${meta.color}88 100%)`,
      }} />

      <div style={{ padding: "clamp(24px, 4vw, 44px)" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk)",
            fontWeight: 800,
            fontSize: 12,
            color: meta.color,
            letterSpacing: ".08em",
            background: meta.colorLight,
            padding: "5px 12px",
            borderRadius: 8,
            border: `1px solid ${meta.colorBorder}`,
          }}>
            {meta.index}
          </span>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#8493A5",
            textTransform: "uppercase",
            letterSpacing: ".14em",
          }}>
            {meta.label}
          </span>
        </div>

        {/* Main content: big number + bar chart */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(24px, 4vw, 48px)", marginBottom: 32 }}>

          {/* Big number */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 8 }}>
              <span ref={numRef} style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontWeight: 800,
                fontSize: "clamp(72px, 13vw, 112px)",
                letterSpacing: "-.04em",
                lineHeight: 1,
                color: meta.color,
              }}>
                {animate ? "0" : indicateur.horizons["2050"]}
              </span>
              <span style={{
                fontSize: "clamp(12px, 1.6vw, 15px)",
                fontWeight: 600,
                color: "#9BA8BA",
                marginBottom: 14,
                maxWidth: 80,
                lineHeight: 1.3,
              }}>
                {indicateur.unite}
              </span>
            </div>
            <p style={{
              fontSize: 13,
              color: "#B0BEC8",
              fontWeight: 500,
              letterSpacing: ".02em",
            }}>
              estimés en 2050
            </p>
          </div>

          {/* Bar chart */}
          <div style={{ flexShrink: 0, width: "clamp(130px, 24vw, 180px)" }}>
            <p style={{
              fontSize: 9, fontWeight: 700, color: "#B0C0D4",
              textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 14,
            }}>
              Évolution
            </p>
            <div style={{
              display: "flex", alignItems: "flex-end",
              gap: 6, height: "clamp(90px, 13vw, 140px)",
            }}>
              {HORIZONS.map((label, i) => {
                const hPct = (values[i] / max) * 100;
                return (
                  <div key={label} style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 6, height: "100%",
                  }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700,
                      color: i === 3 ? meta.color : "#B0C0D4",
                      lineHeight: 1,
                    }}>
                      {i === 0 ? "—" : values[i]}
                    </span>
                    <div style={{ flex: 1, width: "100%", position: "relative" }}>
                      <div
                        ref={(el) => { barRefs.current[i] = el; }}
                        style={{
                          position: "absolute", bottom: 0, width: "100%",
                          height: animate ? "3%" : `${Math.max(hPct, 3)}%`,
                          background: meta.barColors[i],
                          borderRadius: "4px 4px 0 0",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 9, color: "#B0C0D4", lineHeight: 1 }}>{label}</span>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 10, color: "#C8D8E8", marginTop: 10 }}>
              Source : {indicateur.source}
            </p>
          </div>
        </div>

        {/* Human phrase */}
        <div style={{
          borderRadius: 16,
          padding: "clamp(16px, 2.5vw, 24px) clamp(18px, 3vw, 28px)",
          background: meta.colorLight,
          borderLeft: `4px solid ${meta.color}`,
        }}>
          <p style={{
            fontFamily: "var(--font-spectral), serif",
            fontStyle: "italic",
            fontSize: "clamp(14px, 1.8vw, 17px)",
            color: "#2D3E52",
            lineHeight: 1.75,
          }}>
            {meta.phrase(indicateur.horizons["2050"])}
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
