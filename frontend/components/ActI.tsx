"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import FranceSvg from "./FranceSvg";

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
  const franceRef  = useRef<HTMLDivElement>(null);
  const txt0       = useRef<HTMLDivElement>(null);
  const txt1       = useRef<HTMLDivElement>(null);
  const txt2       = useRef<HTMLDivElement>(null);
  const finalRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([txt0.current, txt1.current, txt2.current, finalRef.current], { opacity: 1, y: 0 });
        gsap.set(franceRef.current, { opacity: 1, scale: 1 });
        gsap.set(globeRef.current, { opacity: 0 });
        return;
      }

      // États initiaux
      gsap.set(franceRef.current, { opacity: 0, scale: 0.42 });
      gsap.set([txt0.current, txt1.current, txt2.current, finalRef.current], { opacity: 0, y: 40 });

      // Préparer le tracé de la France pour le dessiner au scroll
      const path = franceRef.current?.querySelector<SVGPathElement>("#france-metro");
      let len = 0;
      if (path) {
        len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      }

      // Animation d'entrée (au chargement)
      const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
      entrance
        .from(globeRef.current,   { scale: 0.25, opacity: 0, duration: 2.0 })
        .from(ringsRef.current,   { scale: 0.4,  opacity: 0, duration: 2.4 }, "<.3")
        .from(numRef.current,     { opacity: 0, y: 24, duration: 1.3 }, "<.6")
        .from(captionRef.current, { opacity: 0, duration: 1 }, "<.4")
        .from(hintRef.current,    { opacity: 0, y: 10, duration: 1 }, "<.3");

      // Timeline scrubbée : récit → zoom de la Terre vers la France
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          pin: pinnedRef.current,
          pinSpacing: false,
          invalidateOnRefresh: true,
        },
      });

      // 1. Le chiffre + légende + indice s'effacent immédiatement
      tl.to(hintRef.current,    { opacity: 0, duration: 0.06 }, 0)
        .to([numRef.current, captionRef.current], { opacity: 0, y: -20, duration: 0.10 }, 0.03);

      // 2. Récit : les 3 phrases apparaissent une à une (le globe reste en fond)
      tl.fromTo(txt0.current, { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.12 }, 0.14)
        .to(txt0.current,     { opacity: 0, y: -30, duration: 0.10 }, 0.30)
        .fromTo(txt1.current, { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.12 }, 0.34)
        .to(txt1.current,     { opacity: 0, y: -30, duration: 0.10 }, 0.50)
        .fromTo(txt2.current, { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.12 }, 0.54)
        .to(txt2.current,     { opacity: 0, scale: 0.9, duration: 0.12 }, 0.70);

      // 3. Zoom : la Terre fonce vers nous et s'efface, la France émerge et se dessine.
      //    On utilise fromTo (états de départ explicites) + immediateRender:false : ainsi,
      //    quand on remonte le scroll, GSAP restaure toujours le globe à pleine taille
      //    (un simple .to() laisserait le globe figé en tout petit au retour en haut).
      tl.fromTo(globeRef.current,
          { scale: 1, opacity: 1 },
          { scale: 3.4, opacity: 0, duration: 0.22, ease: "power2.in", immediateRender: false }, 0.66)
        .fromTo(ringsRef.current,
          { scale: 1, opacity: 1 },
          { scale: 2.8, opacity: 0, duration: 0.22, ease: "power2.in", immediateRender: false }, 0.66)
        .fromTo(franceRef.current,
          { opacity: 0, scale: 0.42 },
          { opacity: 1, scale: 1, duration: 0.26, ease: "power2.out" }, 0.72);
      if (path) {
        tl.to(path, { strokeDashoffset: 0, duration: 0.24, ease: "power1.inOut" }, 0.74);
      }

      // 4. Phrase finale + relance
      tl.fromTo(finalRef.current,
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, duration: 0.16, ease: "power2.out" }, 0.88)
        .to({}, { duration: 0.10 });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]); // eslint-disable-line

  return (
    <section ref={sectionRef} id="acte-1" style={{ minHeight: "340vh" }} aria-label="Acte I — Du monde à votre commune">
      <div
        ref={pinnedRef}
        className="grain relative flex h-screen w-full items-center justify-center overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 50% 45%, #241A12 0%, #1A1410 70%)" }}
      >
        {/* Braises */}
        <div className="pointer-events-none absolute inset-0" aria-hidden style={{
          backgroundImage:
            "radial-gradient(1.2px 1.2px at 14% 18%, rgba(232,116,59,.5) 0%,transparent 100%)," +
            "radial-gradient(1px 1px at 71% 12%, rgba(217,164,65,.4) 0%,transparent 100%)," +
            "radial-gradient(1.5px 1.5px at 42% 64%, rgba(232,116,59,.3) 0%,transparent 100%)," +
            "radial-gradient(1px 1px at 86% 52%, rgba(217,164,65,.42) 0%,transparent 100%)," +
            "radial-gradient(1px 1px at 27% 79%, rgba(232,116,59,.26) 0%,transparent 100%)",
        }} />

        {/* Anneaux */}
        <div ref={ringsRef} className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          {[
            { d: "min(360px, 88vw)", op: .08 },
            { d: "min(500px, 122vw)", op: .06 },
            { d: "min(660px, 160vw)", op: .04 },
            { d: "min(840px, 204vw)", op: .025 },
          ].map(({ d, op }, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: d, height: d,
              border: `1px solid rgba(217,164,65,${op})`,
            }} />
          ))}
        </div>

        {/* Globe — Terre qui chauffe */}
        <div ref={globeRef} className="relative flex items-center justify-center" style={{ willChange: "transform, opacity" }}>
          <div className="absolute rounded-full" aria-hidden style={{
            width: "min(340px, 84vw)", height: "min(340px, 84vw)",
            background: "radial-gradient(circle at 50%, rgba(232,116,59,.12) 0%, transparent 70%)",
            animation: "breathe 4s ease-in-out infinite",
          }} />
          <div className="absolute rounded-full" aria-hidden style={{
            width: "min(236px, 58vw)", height: "min(236px, 58vw)",
            background: "radial-gradient(circle at 36% 32%, #F0A65A 0%, #E8743B 34%, #C2521F 64%, #5C2410 100%)",
            boxShadow: "0 0 0 1px rgba(217,164,65,.15), 0 0 50px 6px rgba(232,116,59,.18), inset -20px -16px 48px rgba(0,0,0,.6)",
          }} />
          <div className="absolute rounded-full pointer-events-none" aria-hidden style={{
            width: "min(236px, 58vw)", height: "min(236px, 58vw)",
            background: "radial-gradient(circle at 30% 24%, rgba(255,255,255,.10) 0%, transparent 48%)",
          }} />
          <div className="relative text-center" style={{ zIndex: 2 }}>
            <div ref={numRef} style={{
              fontFamily: "var(--font-sen), sans-serif",
              fontSize: "clamp(52px, 10vw, 120px)",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              textShadow: "0 4px 40px rgba(0,0,0,.85)",
            }}>+1,5 °C</div>
            <div ref={captionRef} style={{
              fontFamily: "var(--font-sen), sans-serif",
              fontSize: 11,
              fontWeight: 500,
              color: "rgba(251,246,236,.55)",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              marginTop: 12,
            }}>de réchauffement depuis 1850</div>
          </div>
        </div>

        {/* France — révélée par le zoom */}
        <div
          ref={franceRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
          style={{ willChange: "transform, opacity" }}
        >
          <FranceSvg
            className="w-64 sm:w-80"
            style={{ color: "rgba(217,164,65,.8)", filter: "drop-shadow(0 0 26px rgba(232,116,59,.6))" }}
          />
        </div>

        {/* Indice scroll */}
        <div ref={hintRef} className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2" aria-hidden>
          <div style={{ width: 1, height: 40, background: "linear-gradient(180deg,transparent,rgba(251,246,236,.25))" }} />
          <span style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(251,246,236,.28)" }}>
            Défiler
          </span>
        </div>

        {/* Textes du récit */}
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6"
          style={{ zIndex: 3 }}
          aria-live="polite"
        >
          <div ref={txt0} className="absolute" style={{ textAlign: "center", maxWidth: 520 }}>
            <p style={{
              fontFamily: "var(--font-sen), sans-serif",
              fontSize: "clamp(18px, 2.8vw, 26px)",
              fontWeight: 500,
              color: "rgba(251,246,236,.9)",
              lineHeight: 1.6,
              textShadow: "0 2px 20px rgba(0,0,0,.8)",
            }}>
              +1,5 °C, c&apos;est la moyenne du globe. Sur le papier, ça paraît minuscule.
            </p>
          </div>

          <div ref={txt1} className="absolute" style={{ textAlign: "center", maxWidth: 520 }}>
            <p style={{
              fontFamily: "var(--font-sen), sans-serif",
              fontSize: "clamp(18px, 2.8vw, 26px)",
              fontWeight: 500,
              color: "rgba(251,246,236,.9)",
              lineHeight: 1.6,
              textShadow: "0 2px 20px rgba(0,0,0,.8)",
            }}>
              En vrai, ça veut dire des étés qui cognent, des nuits sans sommeil
              et des récoltes qui flanchent.
            </p>
          </div>

          <div ref={txt2} className="absolute" style={{ textAlign: "center", maxWidth: 560 }}>
            <p style={{
              fontFamily: "var(--font-sen), sans-serif",
              fontSize: "clamp(24px, 4.2vw, 42px)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.5,
              letterSpacing: "-.01em",
            }}>
              Et chez vous, ça donne quoi&nbsp;?
            </p>
          </div>

          {/* Phrase finale, après le zoom sur la France */}
          <div ref={finalRef} className="absolute" style={{ textAlign: "center", maxWidth: 560, marginTop: "min(220px, 42vw)" }}>
            <p style={{
              fontFamily: "var(--font-sen), sans-serif",
              fontSize: "clamp(18px, 2.6vw, 26px)",
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1.5,
              textShadow: "0 2px 20px rgba(0,0,0,.8)",
            }}>
              On a creusé commune par commune.
            </p>
            <div
              className="mx-auto mt-6 flex items-center justify-center gap-3"
              style={{ color: "rgba(251,246,236,.32)", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" }}
            >
              <span style={{ display: "block", width: 28, height: 1, background: "rgba(251,246,236,.22)" }} />
              Trouvez la vôtre
              <span style={{ display: "block", width: 28, height: 1, background: "rgba(251,246,236,.22)" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
