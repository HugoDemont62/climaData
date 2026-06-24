"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function ActI() {
  const reduced    = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const pinnedRef  = useRef<HTMLDivElement>(null);
  const globeRef   = useRef<HTMLDivElement>(null);
  const ringsRef   = useRef<HTMLDivElement>(null);
  const numRef     = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const hintRef    = useRef<HTMLDivElement>(null);
  const txt0       = useRef<HTMLDivElement>(null);
  const txt1       = useRef<HTMLDivElement>(null);
  const txt2       = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([txt0.current, txt1.current, txt2.current], { opacity: 1, y: 0 });
        return;
      }

      // Entrance animation (plays once on load)
      const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
      entrance
        .from(globeRef.current,   { scale: 0.25, opacity: 0, duration: 2.2 })
        .from(ringsRef.current,   { scale: 0.4,  opacity: 0, duration: 2.6 }, "<.3")
        .from(numRef.current,     { opacity: 0, y: 24, duration: 1.4 }, "<.6")
        .from(captionRef.current, { opacity: 0, duration: 1 }, "<.4")
        .from(hintRef.current,    { opacity: 0, y: 10, duration: 1 }, "<.3");

      // Scrubbed scroll timeline — globe exits then texts reveal one by one
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

      // Phase 1 — globe/hero : dissolution progressive, sans mouvement parasite
      tl.to(hintRef.current,    { opacity: 0, duration: 0.12 }, 0)
        .to(captionRef.current, { opacity: 0, duration: 0.25, ease: "power1.in" }, 0.04)
        .to(numRef.current,     { opacity: 0, y: -20, duration: 0.3,  ease: "power2.in" }, 0.04)
        .to(ringsRef.current,   { scale: 2.2, opacity: 0, duration: 0.55, ease: "power1.in" }, 0)
        .to(globeRef.current,   { opacity: 0, duration: 0.45, ease: "power1.inOut" }, 0.06);

      // Phase 2 — texts reveal, staggered (0.38 → 1.0)
      tl.fromTo(txt0.current, { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.38)
        .fromTo(txt1.current, { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.58)
        .fromTo(txt2.current, { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.78)
        .to({}, { duration: 0.22 }); // hold at end before transition
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]); // eslint-disable-line

  return (
    <section ref={sectionRef} id="acte-1" style={{ minHeight: "230vh" }} aria-label="Acte I — Le constat mondial">
      <div
        ref={pinnedRef}
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        style={{ background: "#080F1C" }}
      >
        {/* Stars — CSS only */}
        <div className="pointer-events-none absolute inset-0" aria-hidden style={{
          backgroundImage:
            "radial-gradient(1.2px 1.2px at 14% 18%, rgba(255,255,255,.4) 0%,transparent 100%)," +
            "radial-gradient(1px 1px at 71% 12%, rgba(255,255,255,.28) 0%,transparent 100%)," +
            "radial-gradient(1.5px 1.5px at 42% 64%, rgba(255,255,255,.22) 0%,transparent 100%)," +
            "radial-gradient(1px 1px at 86% 52%, rgba(255,255,255,.3) 0%,transparent 100%)," +
            "radial-gradient(1px 1px at 27% 79%, rgba(255,255,255,.18) 0%,transparent 100%)",
        }} />

        {/* Rings */}
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

        {/* Globe — non-absolute so it's centered by the parent flex */}
        <div ref={globeRef} className="relative flex items-center justify-center">
          <div className="absolute rounded-full" aria-hidden style={{
            width: "min(340px, 84vw)", height: "min(340px, 84vw)",
            background: "radial-gradient(circle at 50%, rgba(30,111,224,.08) 0%, transparent 70%)",
            animation: "breathe 4s ease-in-out infinite",
          }} />
          <div className="absolute rounded-full" aria-hidden style={{
            width: "min(236px, 58vw)", height: "min(236px, 58vw)",
            background: "radial-gradient(circle at 36% 32%, #3aa978 0%, #1E6FE0 36%, #0B3D91 68%, #07204f 100%)",
            boxShadow: "0 0 0 1px rgba(30,111,224,.12), 0 0 40px 4px rgba(30,111,224,.12), inset -20px -16px 48px rgba(0,0,0,.65)",
          }} />
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
              color: "rgba(255,255,255,.5)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              marginTop: 12,
            }}>Réchauffement planétaire · 2024</div>
          </div>
        </div>

        {/* Scroll hint */}
        <div ref={hintRef} className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2" aria-hidden>
          <div style={{ width: 1, height: 40, background: "linear-gradient(180deg,transparent,rgba(255,255,255,.2))" }} />
          <span style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.22)" }}>
            Défiler
          </span>
        </div>

        {/* Texts — inside pinned area, above globe (z-index), tied to scroll timeline */}
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-10 sm:gap-14 px-6"
          style={{ zIndex: 3 }}
          aria-live="polite"
        >
          <div ref={txt0} style={{ opacity: 0, textAlign: "center", maxWidth: 480 }}>
            <p style={{
              fontFamily: "var(--font-spectral), serif",
              fontStyle: "italic",
              fontSize: "clamp(16px, 2.4vw, 22px)",
              fontWeight: 400,
              color: "rgba(255,255,255,.82)",
              lineHeight: 1.72,
              textShadow: "0 2px 20px rgba(0,0,0,.8)",
            }}>
              La planète a déjà gagné +1,5 °C par rapport à l'ère préindustrielle.
              Un chiffre mondial qui cache une réalité intime, locale, personnelle.
            </p>
          </div>

          <div ref={txt1} style={{ opacity: 0, textAlign: "center", maxWidth: 480 }}>
            <p style={{
              fontFamily: "var(--font-spectral), serif",
              fontStyle: "italic",
              fontSize: "clamp(16px, 2.4vw, 22px)",
              fontWeight: 400,
              color: "rgba(255,255,255,.82)",
              lineHeight: 1.72,
              textShadow: "0 2px 20px rgba(0,0,0,.8)",
            }}>
              Derrière ce degré et demi : des étés qui brûlent, des nuits sans sommeil,
              des rivières à sec, des espèces qui disparaissent.
            </p>
          </div>

          <div ref={txt2} style={{ opacity: 0, textAlign: "center", maxWidth: 520 }}>
            <p style={{
              fontFamily: "var(--font-spectral), serif",
              fontStyle: "italic",
              fontSize: "clamp(22px, 3.8vw, 38px)",
              fontWeight: 500,
              color: "#fff",
              lineHeight: 1.68,
              letterSpacing: "-.01em",
            }}>
              Et chez vous, à quoi ressemblera 2050 ?
            </p>
            <div
              className="mx-auto mt-6 flex items-center justify-center gap-3"
              style={{ color: "rgba(255,255,255,.22)", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" }}
            >
              <span style={{ display: "block", width: 28, height: 1, background: "rgba(255,255,255,.18)" }} />
              Continuez à défiler
              <span style={{ display: "block", width: 28, height: 1, background: "rgba(255,255,255,.18)" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
