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
    color: "#E8743B",
    colorLight: "rgba(232,116,59,.12)",
    colorBorder: "rgba(232,116,59,.28)",
    barColors: ["#5A3422", "#A85A33", "#D9682F", "#F2843E"],
    phrase: (v) => `${v} jours par an à plus de 35 °C. Ici, la clim arrête d'être un confort : ça devient une question de santé.`,
  },
  nuits_chaudes: {
    index: "02",
    label: "Nuits tropicales",
    color: "#C77BA6",
    colorLight: "rgba(199,123,166,.12)",
    colorBorder: "rgba(199,123,166,.28)",
    barColors: ["#43293A", "#7A4E6A", "#A66B92", "#C77BA6"],
    phrase: (v) => `${v} nuits où il fait encore 20 °C dehors. On dort mal, on récupère mal, et les plus fragiles trinquent.`,
  },
  stress_hydrique: {
    index: "03",
    label: "Déficit hydrique",
    color: "#5AA0BC",
    colorLight: "rgba(90,160,188,.12)",
    colorBorder: "rgba(90,160,188,.28)",
    barColors: ["#1E3A45", "#356575", "#4886A0", "#5AA0BC"],
    phrase: (v) => `Un manque d'eau noté ${v}/100. Arrosage coupé, rivières à sec dès juillet, nappes qui n'arrivent plus à suivre.`,
  },
  biodiversite: {
    index: "04",
    label: "Pression biodiversité",
    color: "#84B65A",
    colorLight: "rgba(132,182,90,.12)",
    colorBorder: "rgba(132,182,90,.28)",
    barColors: ["#2C401D", "#4E6E33", "#6A9748", "#84B65A"],
    phrase: (v) => `Une pression de ${v}/100 sur le vivant d'ici. Des espèces que vos enfants ne verront peut-être qu'en photo.`,
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
      background: "var(--earth-panel)",
      borderRadius: 24,
      overflow: "hidden",
      boxShadow: "0 32px 80px rgba(0,0,0,.45), 0 4px 16px rgba(0,0,0,.3)",
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
            fontFamily: "var(--font-sen)",
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
            color: "var(--paper-muted)",
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
                fontFamily: "var(--font-sen), sans-serif",
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
                color: "var(--paper-muted)",
                marginBottom: 14,
                maxWidth: 80,
                lineHeight: 1.3,
              }}>
                {indicateur.unite}
              </span>
            </div>
            <p style={{
              fontSize: 13,
              color: "#8A7A66",
              fontWeight: 500,
              letterSpacing: ".02em",
            }}>
              estimés en 2050
            </p>
          </div>

          {/* Bar chart */}
          <div style={{ flexShrink: 0, width: "clamp(130px, 24vw, 180px)" }}>
            <p style={{
              fontSize: 9, fontWeight: 700, color: "#8A7A66",
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
                      color: i === 3 ? meta.color : "#8A7A66",
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
                    <span style={{ fontSize: 9, color: "#8A7A66", lineHeight: 1 }}>{label}</span>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 10, color: "#6E5F4D", marginTop: 10 }}>
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
            fontFamily: "var(--font-sen), sans-serif",
            fontSize: "clamp(14px, 1.8vw, 17px)",
            color: "#EDE3D4",
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
