import { forwardRef } from "react";

// Silhouette simplifiée de la France métropolitaine (l'Hexagone) + Corse.
// Points approximatifs : Dunkerque → Alsace → Alpes → Côte d'Azur → Pyrénées
// → côte atlantique → Bretagne → Cotentin → Calais.
const FranceSvg = forwardRef<SVGSVGElement, { className?: string; style?: React.CSSProperties }>(
  ({ className, style }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 200 210"
      className={className}
      style={style}
      aria-hidden
      fill="none"
    >
      {/* Métropole */}
      <path
        id="france-metro"
        d="M112,15 L130,18 L150,30 L168,40 L181,63 L176,83 L160,104 L168,124 L176,150
           L168,162 L151,166 L131,160 L118,180 L96,182 L71,178 L61,164 L66,150
           L64,128 L66,108 L61,90 L44,86 L30,80 L18,74 L24,64 L41,58 L52,52
           L59,41 L70,46 L82,45 L96,40 L105,18 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(255,255,255,.04)"
      />
      {/* Corse */}
      <path
        d="M186,168 L191,176 L189,188 L183,189 L181,178 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="rgba(255,255,255,.04)"
      />
    </svg>
  )
);

FranceSvg.displayName = "FranceSvg";
export default FranceSvg;
