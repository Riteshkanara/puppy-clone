import PupMascot from "./PupMascot";
import "./BasketPup.css";

/**
 * Footer mascot: Teddy peeking out of a woven basket, using the original rig artwork (same as the hero peek).
 */
export default function BasketPup() {
  return (
    <div className="basket-pup" aria-hidden="true">
      <svg viewBox="0 0 300 276" role="presentation">
        {/* basket interior + back rim */}
        <ellipse cx="150" cy="140" rx="144" ry="16" fill="#4a2a18" />
        <path className="basket-pup__rim-line" d="M6 140 A144 16 0 0 1 294 140" />
        <path className="basket-pup__rim" d="M6 140 A144 16 0 0 1 294 140" />

        {/* Teddy: the original rig's peek pose (fluffy head, top-knot, blush, collar, paws on the rim) */}
        <g className="basket-pup__pup">
          <PupMascot pose="peek" x={-125} y={-52} width={390} height={312} hoverIn=".basket-pup" />
        </g>

        {/* basket body (front) */}
        <path
          className="basket-pup__body"
          d="M6 140 C12 190 24 236 40 262 Q150 278 260 262 C276 236 288 190 294 140 A144 16 0 0 1 6 140Z"
        />
        <path
          className="basket-pup__weave"
          d="M12 176 Q150 204 288 176 M22 212 Q150 240 278 212 M70 160 L58 266 M112 168 L104 272 M150 170 L150 274 M190 168 L198 272 M230 160 L242 266"
        />
        <path className="basket-pup__rim-line" d="M294 140 A144 16 0 0 1 6 140" />
        <path className="basket-pup__rim" d="M294 140 A144 16 0 0 1 6 140" />

        {/* paws resting on the rim */}
        <g className="basket-pup__paws">
          <path className="pup__paw" d="M114 150 q14 -9 30 0 q4 9 -6 10 h-18 q-10 -1 -6 -10Z" />
          <path className="pup__paw" d="M156 150 q14 -9 30 0 q4 9 -6 10 h-18 q-10 -1 -6 -10Z" />
          <path className="pup__stem" d="M129 152 v5 M171 152 v5" style={{ strokeWidth: 2 }} />
        </g>
      </svg>
    </div>
  );
}
