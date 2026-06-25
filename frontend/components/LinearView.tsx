"use client";
import type { CommuneData } from "@/lib/types";
import IndicatorCard from "./IndicatorCard";

type Props = { data?: CommuneData };

export default function LinearView({ data }: Props) {
  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-12 text-center" style={{ color: "var(--paper-muted)" }}>
        <p>Entrez votre code postal pour voir les données climatiques.</p>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-2xl px-5 py-12" aria-label="Vue linéaire sans animation">
      <h1
        className="font-display font-bold mb-2"
        style={{ fontSize: "clamp(24px, 4vw, 40px)", color: "var(--paper-text)", letterSpacing: "-0.01em" }}
      >
        {data.commune.nom}, projections 2050
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--paper-muted)" }}>
        Scénario {data.scenario}, source DRIAS
      </p>

      <div className="flex flex-col gap-6">
        {data.indicateurs.map((ind) => (
          <IndicatorCard key={ind.code} indicateur={ind} animate={false} />
        ))}
      </div>
    </article>
  );
}
