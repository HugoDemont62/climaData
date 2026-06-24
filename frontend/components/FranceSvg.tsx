import { forwardRef } from "react";

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
        d="M 118,10 L 152,16 L 188,44 L 186,92 L 175,128 L 156,158 L 134,172 L 110,178 L 84,168 L 62,148 L 38,122 L 20,94 L 18,72 L 8,60 L 20,52 L 38,56 L 56,48 L 94,32 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(255,255,255,.04)"
      />
      {/* Corse */}
      <path
        d="M 168,152 L 172,158 L 170,166 L 165,167 L 163,160 Z"
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
