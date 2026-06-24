"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { CommuneData } from "@/lib/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import ActI   from "@/components/ActI";
import ActII  from "@/components/ActII";
import LinearView from "@/components/LinearView";

// Lazy-load les actes lourds (GSAP + D3) — green coding : ne télécharger que si besoin
const ActIII    = dynamic(() => import("@/components/ActIII"));
const Simulator = dynamic(() => import("@/components/Simulator"));
const ShareCard = dynamic(() => import("@/components/ShareCard"));

export default function Home() {
  const [communeData, setCommuneData] = useState<CommuneData | null>(null);
  const reduced = useReducedMotion();

  const handleCommuneLoaded = (data: CommuneData) => {
    setCommuneData(data);
    setTimeout(() => {
      document.getElementById("acte-3")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }, 350);
  };

  /* ── Mode accessibilité (prefers-reduced-motion) ── */
  if (reduced) {
    return (
      <main style={{ background: "var(--earth-night)", minHeight: "100vh" }}>
        <div className="px-5 py-4" style={{ background: "var(--earth-night)" }}>
          <span style={{ fontFamily: "var(--font-sen)", fontWeight: 700, color: "#fff", fontSize: 18 }}>
            Clima<span className="gradient-text">Data</span>
          </span>
        </div>
        <div className="px-5 py-12" style={{ background: "var(--earth-night)" }}>
          <h1 style={{
            fontFamily: "var(--font-sen)", fontWeight: 700,
            fontSize: "clamp(26px,5vw,48px)", color: "var(--paper-text)", marginBottom: 24,
          }}>
            Quel climat fera-t-il<br />chez vous en 2050 ?
          </h1>
          <ActII onCommuneLoaded={handleCommuneLoaded} />
        </div>
        {communeData
          ? <LinearView data={communeData} />
          : (
            <div className="px-5 py-16 text-center" style={{ color: "var(--paper-muted)" }}>
              <p style={{ fontFamily: "var(--font-sen)", fontSize: 18 }}>
                Entrez votre code postal pour voir les projections.
              </p>
            </div>
          )
        }
      </main>
    );
  }

  /* ── Parcours scrollytelling ── */
  return (
    <main>
      <ActI />
      <ActII onCommuneLoaded={handleCommuneLoaded} />

      {communeData ? (
        <>
          <ActIII    key={communeData.commune.insee} data={communeData} />
          <Simulator key={communeData.commune.insee + "-sim"} data={communeData} />
          <ShareCard key={communeData.commune.insee + "-share"} data={communeData} />
        </>
      ) : (
        <div
          id="acte-3"
          className="flex flex-col items-center justify-center px-6 py-32 text-center"
          style={{ background: "var(--earth-night)", minHeight: "50vh" }}
        >
          <div className="mb-5 h-px w-16" style={{ background: "var(--terracotta)" }} />
          <p style={{
            fontFamily: "var(--font-sen), sans-serif",
            fontSize: "clamp(17px,2.2vw,21px)",
            color: "var(--paper-muted)",
            maxWidth: 380,
            lineHeight: 1.65,
          }}>
            Tapez votre code postal là-haut pour voir ce qui attend votre commune.
          </p>
        </div>
      )}
    </main>
  );
}
