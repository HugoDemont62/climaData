import { forwardRef } from "react";

// Silhouette de la France métropolitaine (l'Hexagone) + Corse.
// Tracé orienté nord en haut : Dunkerque, frontière est (Alsace, Jura, Alpes),
// littoral méditerranéen, côte atlantique, pointe de la Bretagne, Cotentin, Calais.
const FranceSvg = forwardRef<SVGSVGElement, { className?: string; style?: React.CSSProperties }>(
  ({ className, style }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      className={className}
      style={style}
      aria-hidden
      fill="none"
    >
      {/* Métropole */}
      <path
        id="france-metro"
        d="M54 6 L70 9 L84 20 L86 30 L80 37 L88 47 L89 60 L80 67 L70 71
           L58 73 L53 77 L40 78 L28 74 L25 64 L19 54 L16 45 L4 42 L9 36
           L23 37 L33 33 L35 24 L41 33 L47 27 L52 14 Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(255,255,255,.04)"
      />
      {/* Corse */}
      <path
        d="M90 80 L94 86 L92 96 L88 95 L87 86 Z"
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
