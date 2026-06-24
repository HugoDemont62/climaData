"use client";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CommuneData, Simulation } from "@/lib/types";
import { getSimulation } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

type Props = { data: CommuneData };
const SCENARIOS = ["RCP4.5", "RCP8.5"] as const;

export default function Simulator({ data }: Props) {
  const [vegetalisation, setVegetalisation] = useState(20);
  const [scenario, setScenario] = useState<"RCP4.5" | "RCP8.5">("RCP4.5");
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef   = useRef<HTMLDivElement>(null);
  const resultRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(innerRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: innerRef.current, start: "top 72%" } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let cancelled = false;
    getSimulation(data.commune.insee, vegetalisation, scenario).then((sim) => {
      if (!cancelled) setSimulation(sim);
    });
    return () => { cancelled = true; };
  }, [data.commune.insee, vegetalisation, scenario]);

  useEffect(() => {
    if (!resultRef.current) return;
    gsap.fromTo(resultRef.current,
      { opacity: 0.5, y: 4 },
      { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
  }, [simulation]);

  const canicule2050 = data.indicateurs.find((i) => i.code === "canicule")?.horizons["2050"] ?? 20;
  const simulated    = simulation?.simule["canicule_2050"] ?? canicule2050;
  const delta        = simulation?.delta["canicule_2050"] ?? 0;
  const pct          = canicule2050 > 0 ? Math.round((Math.abs(delta) / canicule2050) * 100) : 0;

  return (
    <section
      ref={sectionRef}
      id="acte-4"
      style={{ background: "#080F1C" }}
      aria-label="Acte IV — Simulateur"
    >
      <div
        ref={innerRef}
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "clamp(48px, 8vh, 88px) clamp(20px, 4vw, 48px)",
          opacity: 0,
        }}
      >
        {/* En-tête */}
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: ".18em",
          textTransform: "uppercase", color: "#2E9E6B", marginBottom: 16,
        }}>
          Le pouvoir d'agir
        </p>
        <h2 style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontWeight: 700,
          fontSize: "clamp(28px, 4.5vw, 54px)",
          letterSpacing: "-0.02em",
          lineHeight: 1.08,
          color: "#fff",
          marginBottom: 16,
        }}>
          Et si on végétalisait<br />{data.commune.nom}&nbsp;?
        </h2>
        <p style={{
          fontFamily: "var(--font-spectral), serif",
          fontStyle: "italic",
          fontSize: "clamp(15px, 2vw, 19px)",
          color: "rgba(255,255,255,.5)",
          lineHeight: 1.65,
          maxWidth: 480,
          marginBottom: "clamp(32px, 5vh, 52px)",
        }}>
          La végétalisation réduit l'effet d'îlot de chaleur urbain.
          Ajustez le curseur pour voir l'impact estimé sur votre commune.
        </p>

        {/* Carte principale */}
        <div style={{
          background: "#0A1828",
          border: "1px solid #162A45",
          borderRadius: 24,
          padding: "clamp(24px, 4vw, 44px)",
        }}>

          {/* Scénario */}
          <div style={{ marginBottom: 32 }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: ".16em",
              textTransform: "uppercase", color: "#3D5A78", marginBottom: 14,
            }}>
              Scénario climatique
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {SCENARIOS.map((s) => (
                <button
                  key={s}
                  onClick={() => setScenario(s)}
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all .2s",
                    letterSpacing: ".01em",
                    ...(scenario === s
                      ? {
                          background: "linear-gradient(135deg, #2E88F0 0%, #1558C8 100%)",
                          color: "#fff",
                          border: "1px solid transparent",
                          boxShadow: "0 6px 24px rgba(30,111,224,.4)",
                        }
                      : {
                          background: "#0D1E35",
                          color: "#4B6A8A",
                          border: "1px solid #1A3050",
                          boxShadow: "none",
                        }),
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#112235", marginBottom: 32 }} />

          {/* Curseur */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: ".16em",
                textTransform: "uppercase", color: "#3D5A78",
              }}>
                Taux de végétalisation
              </p>
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontWeight: 800,
                fontSize: "clamp(36px, 5vw, 52px)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                color: "#2E9E6B",
              }}>
                {vegetalisation}&nbsp;%
              </span>
            </div>
            <input
              type="range"
              min={0} max={60} step={5}
              value={vegetalisation}
              onChange={(e) => setVegetalisation(Number(e.target.value))}
              style={{ width: "100%" }}
              aria-label="Taux de végétalisation"
            />
            <div style={{
              display: "flex", justifyContent: "space-between",
              marginTop: 10, fontSize: 11, color: "#253A50", fontWeight: 600,
            }}>
              <span>0 %</span><span>30 %</span><span>60 %</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#112235", marginBottom: 32 }} />

          {/* Résultats */}
          <div
            ref={resultRef}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}
          >
            {/* Sans action */}
            <div style={{
              background: "#0D1E35",
              border: "1px solid #1A3050",
              borderRadius: 18,
              padding: "clamp(18px, 3vw, 28px)",
            }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: ".14em",
                textTransform: "uppercase", color: "#3D5A78", marginBottom: 14,
              }}>
                Sans action
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                <span style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(52px, 9vw, 80px)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  color: "#fff",
                }}>
                  {canicule2050}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#3D5A78", marginTop: 8, lineHeight: 1.4 }}>
                jours de canicule / an
              </p>
            </div>

            {/* Avec végétalisation */}
            <div style={{
              background: delta < 0 ? "rgba(46,158,107,.1)" : "#0D1E35",
              border: delta < 0 ? "1px solid rgba(46,158,107,.28)" : "1px solid #1A3050",
              borderRadius: 18,
              padding: "clamp(18px, 3vw, 28px)",
              transition: "background .3s, border-color .3s",
            }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: ".14em",
                textTransform: "uppercase",
                color: delta < 0 ? "#2E9E6B" : "#3D5A78",
                marginBottom: 14,
              }}>
                Avec végétalisation
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                <span style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(52px, 9vw, 80px)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  color: delta < 0 ? "#2E9E6B" : "#3D5A78",
                  transition: "color .3s",
                }}>
                  {simulated}
                </span>
              </div>
              <p style={{
                fontSize: 12,
                color: delta < 0 ? "rgba(46,158,107,.6)" : "#3D5A78",
                marginTop: 8, lineHeight: 1.4,
              }}>
                jours de canicule / an
              </p>
            </div>
          </div>

          {/* Impact */}
          {delta < 0 && (
            <div style={{
              background: "rgba(46,158,107,.1)",
              border: "1px solid rgba(46,158,107,.25)",
              borderRadius: 16,
              padding: "18px 22px",
            }}>
              <p style={{
                fontSize: "clamp(13px, 1.8vw, 15px)",
                fontWeight: 600,
                color: "#2E9E6B",
                lineHeight: 1.55,
              }}>
                <span style={{ fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: 800, display: "block", marginBottom: 4 }}>
                  −{Math.abs(delta)} jours évités · −{pct} %
                </span>
                En végétalisant {vegetalisation} % des surfaces, {data.commune.nom} réduirait ses journées de canicule
                de {pct} % d'ici 2050.
              </p>
            </div>
          )}
        </div>

        <p style={{
          marginTop: 20, fontSize: 11, textAlign: "center", lineHeight: 1.5,
          color: "#1E3050",
        }}>
          Modèle simplifié à visée pédagogique (îlot de chaleur urbain) — ne constitue pas une projection officielle.
        </p>
      </div>
    </section>
  );
}
