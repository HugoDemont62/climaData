"use client";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { searchCommunes, getCommuneData } from "@/lib/api";
import type { CommuneData } from "@/lib/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

type Props = { onCommuneLoaded: (data: CommuneData) => void };

export default function ActII({ onCommuneLoaded }: Props) {
  const reduced = useReducedMotion();
  const [query, setQuery]           = useState("");
  const [suggestions, setSuggestions] = useState<{code_postal:string;nom:string;insee:string}[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const sectionRef  = useRef<HTMLElement>(null);
  const headRef     = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLDivElement>(null);
  const shortcutsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (reduced) {
        // Mode accessibilité : tout visible immédiatement
        gsap.set([headRef.current, inputRef.current, shortcutsRef.current], { opacity: 1, y: 0 });
        return;
      }

      // Scroll trigger commun
      const triggerOpts = { trigger: sectionRef.current, start: "top 72%" };

      // Headline, input, shortcuts en cascade
      gsap.fromTo(headRef.current,
        { opacity: 0, y: 48 },
        { opacity: 1, y: 0, duration: .9, ease: "power3.out", delay: .4, scrollTrigger: triggerOpts });

      gsap.fromTo(inputRef.current,
        { opacity: 0, y: 36, scale: .97 },
        { opacity: 1, y: 0, scale: 1, duration: .8, ease: "power2.out", delay: .7, scrollTrigger: triggerOpts });

      gsap.fromTo(shortcutsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: .7, ease: "power2.out", delay: .95, scrollTrigger: triggerOpts });

    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  const handleSearch = async (v: string) => {
    setQuery(v); setError("");
    if (v.length < 3) { setSuggestions([]); return; }
    try { setSuggestions((await searchCommunes(v)).slice(0, 5)); }
    catch { setSuggestions([]); }
  };

  const handleSelect = async (insee: string, nom: string) => {
    setLoading(true); setError(""); setSuggestions([]); setQuery(nom);
    try { onCommuneLoaded(await getCommuneData(insee)); }
    catch { setError("Impossible de charger les données de cette commune."); }
    finally { setLoading(false); }
  };

  return (
    <section
      ref={sectionRef}
      id="acte-2"
      className="grain relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden px-5 sm:px-6 py-10 sm:py-16"
      style={{ background: "var(--earth-night)" }}
      aria-label="Acte II — Votre commune"
    >
      {/* Grille légère — CSS only, aucun DOM supplémentaire */}
      <div className="pointer-events-none absolute inset-0" aria-hidden style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,.035) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(ellipse 55% 65% at 50% 50%, black 10%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 55% 65% at 50% 50%, black 10%, transparent 80%)",
      }} />

      {/* Aube dorée — bas de l'écran */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden style={{
        height: "45%",
        background: "linear-gradient(0deg, rgba(217,164,65,.22) 0%, rgba(232,116,59,.08) 40%, transparent 100%)",
      }} />

      {/* Headline */}
      <div ref={headRef} className="text-center" style={{ opacity: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(251,246,236,.4)", marginBottom: 12 }}>
          Votre commune
        </div>
        <h2 style={{
          fontFamily: "var(--font-sen), sans-serif",
          fontWeight: 700,
          fontSize: "clamp(36px,6vw,72px)",
          letterSpacing: "-.025em",
          lineHeight: 1.02,
          color: "var(--paper-text)",
          marginBottom: 14,
        }}>On regarde chez vous ?</h2>
        <p style={{
          fontFamily: "var(--font-sen), sans-serif",
          fontSize: "clamp(16px,2.2vw,20px)",
          color: "rgba(251,246,236,.62)",
          lineHeight: 1.65,
          maxWidth: 400,
          margin: "0 auto",
        }}>
          Votre code postal, et on vous montre à quoi ressemblera
          le climat de votre ville en 2030, 2040 et 2050.
        </p>
      </div>

      {/* Input */}
      <div ref={inputRef} className="relative w-full max-w-md" style={{ opacity: 0 }}>
        <div style={{
          background: "#fff",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 24px 72px rgba(0,0,0,.5)",
        }}>
          <div style={{ display: "flex", alignItems: "center", padding: "4px 4px 4px 18px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: "#9fb0c4", flexShrink: 0 }}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" opacity=".4"/>
              <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
            </svg>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Code postal ou commune…"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 15,
                fontWeight: 500,
                color: "#0E1A2B",
                padding: "16px 14px",
              }}
              aria-label="Code postal ou nom de commune"
              disabled={loading}
              autoComplete="postal-code"
            />
            {loading
              ? <div style={{ margin: "0 16px", height: 20, width: 20, borderRadius: "50%", border: "2px solid #EAEFF6", borderTopColor: "#1E6FE0", animation: "spin 0.7s linear infinite" }} />
              : <button
                  onClick={() => query.length >= 3 && handleSearch(query)}
                  style={{
                    margin: 5,
                    background: "var(--terracotta)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    padding: "13px 26px",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Chercher
                </button>
            }
          </div>
        </div>

        {suggestions.length > 0 && (
          <ul style={{
            position: "absolute", left: 0, right: 0, marginTop: 8,
            background: "#fff", borderRadius: 16,
            boxShadow: "0 20px 60px rgba(5,18,45,.45)",
            overflow: "hidden", zIndex: 20,
          }}>
            {suggestions.map((s) => (
              <li key={s.insee} style={{ borderBottom: "1px solid #F0F4FA" }}>
                <button
                  onClick={() => handleSelect(s.insee, s.nom)}
                  style={{
                    display: "flex", width: "100%", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 20px", fontSize: 14,
                    color: "#0E1A2B", background: "transparent",
                    border: "none", cursor: "pointer", textAlign: "left",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#EAF1FD")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontWeight: 600 }}>{s.nom}</span>
                  <span style={{ background: "#EAF1FD", color: "#1E6FE0", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                    {s.code_postal}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <p style={{ marginTop: 12, fontSize: 13, fontWeight: 500, color: "#E03E3E" }}>{error}</p>}
      </div>

      {/* Raccourcis — 6 communes du POC */}
      <div ref={shortcutsRef} className="w-full max-w-lg" style={{ opacity: 0 }}>
        <p style={{
          fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase",
          color: "rgba(255,255,255,.25)", marginBottom: 16, textAlign: "center",
        }}>
          Communes du jeu de données
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {([
            { label: "Lille",          insee: "59350", dept: "Nord",             num: "59", coastal: false, note: "" },
            { label: "Paris",          insee: "75056", dept: "Île-de-France",    num: "75", coastal: false, note: "" },
            { label: "Bordeaux",       insee: "33063", dept: "Gironde",          num: "33", coastal: false, note: "" },
            { label: "La Rochelle",    insee: "17300", dept: "Charente-Mar.",    num: "17", coastal: true,  note: "" },
            { label: "Marseille",      insee: "13055", dept: "Bouches-du-Rhône", num: "13", coastal: true,  note: "" },
            { label: "Fort-de-France", insee: "97209", dept: "Martinique",       num: "972",coastal: true,  note: "Hors EUROCORDEX" },
          ] as const).map((d) => (
            <button
              key={d.insee}
              onClick={() => handleSelect(d.insee, d.label)}
              className="group"
              style={{
                position: "relative",
                background: "rgba(255,255,255,.045)",
                border: "1px solid rgba(255,255,255,.09)",
                borderRadius: 16,
                padding: "16px 18px",
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.background = "rgba(232,116,59,.12)";
                el.style.borderColor = "rgba(232,116,59,.5)";
                el.style.boxShadow = "0 8px 28px rgba(232,116,59,.15)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.background = "rgba(255,255,255,.045)";
                el.style.borderColor = "rgba(255,255,255,.09)";
                el.style.boxShadow = "none";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Dept number chip — top right */}
              <span style={{
                position: "absolute", top: 12, right: 14,
                fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.22)",
                fontFamily: "var(--font-sen)",
              }}>
                {d.num}
              </span>

              {/* City name */}
              <p style={{
                fontFamily: "var(--font-sen), sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--paper-text)",
                marginBottom: 6,
                paddingRight: 24,
                lineHeight: 1.2,
              }}>
                {d.label}
              </p>

              {/* Department */}
              <p style={{
                fontSize: 11,
                color: "rgba(255,255,255,.38)",
                marginBottom: d.coastal || d.note ? 10 : 0,
                lineHeight: 1.3,
              }}>
                {d.dept}
              </p>

              {/* Badges row */}
              {(d.coastal || d.note) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {d.coastal && (
                    <span style={{
                      fontSize: 9, fontWeight: 700,
                      padding: "3px 8px", borderRadius: 20,
                      background: "rgba(45,90,107,.25)",
                      color: "#8FC3D6",
                      letterSpacing: ".04em",
                      textTransform: "uppercase",
                      border: "1px solid rgba(45,90,107,.4)",
                    }}>
                      Littoral
                    </span>
                  )}
                  {d.note && (
                    <span style={{
                      fontSize: 9, fontWeight: 600,
                      padding: "3px 8px", borderRadius: 20,
                      background: "rgba(242,118,43,.18)",
                      color: "#F2A06A",
                      letterSpacing: ".02em",
                      border: "1px solid rgba(242,118,43,.25)",
                    }}>
                      {d.note}
                    </span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
