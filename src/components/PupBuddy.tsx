import { useEffect, useRef } from "react";
import { fluff } from "../lib/fluff";
import "./PupBuddy.css";

/**
 * Animated Teddy for /faq — a CSS/SVG approximation of the original "PupBuddy".
 * Built from the original screenshots only (the rig's JS was not available), so
 * motion timings are my own: breathing, idle tail wag, blink, ear flop, head tilt,
 * eyes + head following the pointer. Swap for the real rig port later (one-file change).
 */

const SHAPES = {
  tail: fluff(0, 0, 15, 14, 8, 0.2),
  haunch: fluff(0, 0, 40, 31, 11, 0.12),
  body: fluff(0, 0, 66, 45, 14, 0.1, 0.2),
  chest: fluff(0, 0, 30, 30, 8, 0.1),
  head: fluff(0, 0, 47, 43, 13, 0.11),
  earL: fluff(0, 0, 19, 31, 8, 0.14),
  earR: fluff(0, 0, 19, 31, 8, 0.14),
  knot: fluff(0, 0, 17, 15, 8, 0.18),
};

export default function PupBuddy({ label = "Teddy, the TeddyPups puppy, wondering" }: { label?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = svg.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width * 0.55);
        const dy = event.clientY - (box.top + box.height * 0.4);
        const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
        svg.style.setProperty("--look-x", `${clamp(dx / 90, 2.6).toFixed(2)}px`);
        svg.style.setProperty("--look-y", `${clamp(dy / 90, 2).toFixed(2)}px`);
        svg.style.setProperty("--look-rot", `${clamp(dx / 60, 7).toFixed(2)}deg`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg ref={ref} className="pup" viewBox="40 8 230 236" role="img" aria-label={label}>
      <ellipse className="pup__shadow" cx="150" cy="236" rx="96" ry="7" />

      <g className="pup__rig">
        {/* tail pom */}
        <g transform="translate(70 168)">
          <g className="pup__tail">
            <path className="pup__stem" d="M20 24 C8 20 2 12 0 4" />
            <g transform="translate(-2 -6)">
              <path className="pup__fur" d={SHAPES.tail} />
            </g>
          </g>
        </g>

        <g className="pup__body">
          <g transform="translate(150 190) rotate(-14)">
            <path className="pup__fur" d={SHAPES.body} />
          </g>
          <g transform="translate(116 206)">
            <path className="pup__fur" d={SHAPES.haunch} />
          </g>
          {/* hind paw */}
          <path className="pup__paw" d="M104 224 q18 -6 40 -1 q8 3 0 8 h-38 q-8 -2 -2 -7Z" />
          {/* chest + front legs */}
          <g transform="translate(178 186)">
            <path className="pup__fur" d={SHAPES.chest} />
          </g>
          <path className="pup__fur" d="M166 188 q7 -4 14 0 v38 q0 6 -7 6 q-8 0 -7 -6Z" />
          <path className="pup__fur" d="M184 188 q8 -4 16 0 v38 q0 7 -8 7 q-8 0 -8 -7Z" />
          <path className="pup__paw" d="M164 224 q8 -4 17 0 q4 9 -3 9 h-11 q-6 -2 -3 -9Z" />
          <path className="pup__paw" d="M182 224 q9 -4 19 0 q4 9 -4 9 h-12 q-6 -2 -3 -9Z" />
        </g>

        {/* head (pivots at the neck) */}
        <g transform="translate(184 118)">
         <g className="pup__head">
          <g transform="translate(-46 12)">
            <g className="pup__ear pup__ear--l">
              <path className="pup__fur pup__fur--deep" d={SHAPES.earL} />
            </g>
          </g>
          <g transform="translate(46 12)">
            <g className="pup__ear pup__ear--r">
              <path className="pup__fur pup__fur--deep" d={SHAPES.earR} />
            </g>
          </g>
          <g transform="translate(0 -4)">
            <path className="pup__fur" d={SHAPES.head} />
          </g>
          <g transform="translate(6 -44)">
            <path className="pup__fur" d={SHAPES.knot} />
          </g>
          <ellipse className="pup__cheek" cx="-30" cy="10" rx="9" ry="6.5" />
          <ellipse className="pup__cheek" cx="30" cy="10" rx="9" ry="6.5" />
          <ellipse className="pup__muzzle" cx="0" cy="12" rx="23" ry="18" />
          <g className="pup__eyes">
            <g transform="translate(-21 -6)">
              <g className="pup__eye">
                <ellipse className="pup__ink" cx="0" cy="0" rx="5.6" ry="7.2" />
                <circle className="pup__glint" cx="1.6" cy="-2.4" r="1.9" />
              </g>
            </g>
            <g transform="translate(21 -6)">
              <g className="pup__eye">
                <ellipse className="pup__ink" cx="0" cy="0" rx="5.6" ry="7.2" />
                <circle className="pup__glint" cx="1.6" cy="-2.4" r="1.9" />
              </g>
            </g>
          </g>
          <ellipse className="pup__ink" cx="0" cy="6" rx="6.5" ry="4.5" />
          <path className="pup__mouth" d="M-8 15 q4 6 8 0 q4 6 8 0" />
          <path className="pup__tongue" d="M-3 18.5 q3 7 6 0Z" />
         </g>
        </g>

        {/* collar + heart tag (follows the neck, not the head tilt) */}
        <g className="pup__collar">
          <path className="pup__strap" d="M154 150 Q184 172 214 148 l4 9 Q184 184 150 160Z" />
          <path className="pup__tag" d="M184 172 c-7 -6 -12 1 -6 6 l6 5 l6 -5 c6 -5 1 -12 -6 -6Z" />
        </g>
      </g>
    </svg>
  );
}
