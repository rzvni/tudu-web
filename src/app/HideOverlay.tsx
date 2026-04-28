"use client";

import { useEffect, useRef, useState } from "react";

const EYE_CX_LEFT = 95;
const EYE_CX_RIGHT = 205;
const EYE_CY = 130;
const EYE_RX = 36;
const EYE_RY = 42;
const PUPIL_R = 12;
const MAX_OFFSET_X = 18;
const MAX_OFFSET_Y = 22;

export function HideOverlay({ onExit }: { onExit: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mouse, setMouse] = useState({ x: -1, y: -1 });

  useEffect(() => {
    let frame: number | null = null;
    let pending: { x: number; y: number } | null = null;
    function onMove(e: MouseEvent) {
      pending = { x: e.clientX, y: e.clientY };
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        if (pending) setMouse(pending);
        frame = null;
      });
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      }
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("keydown", onKey);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [onExit]);

  function pupilOffset(eyeCx: number, eyeCy: number) {
    const svg = svgRef.current;
    if (!svg || mouse.x < 0) return { dx: 0, dy: 0 };
    const r = svg.getBoundingClientRect();
    const scaleX = r.width / 300;
    const scaleY = r.height / 300;
    const screenCx = r.left + eyeCx * scaleX;
    const screenCy = r.top + eyeCy * scaleY;
    const dx = mouse.x - screenCx;
    const dy = mouse.y - screenCy;
    const angle = Math.atan2(dy, dx);
    const dist = Math.hypot(dx, dy);
    const easing = 1 - Math.exp(-dist / 220);
    return {
      dx: Math.cos(angle) * MAX_OFFSET_X * easing,
      dy: Math.sin(angle) * MAX_OFFSET_Y * easing,
    };
  }

  const left = pupilOffset(EYE_CX_LEFT, EYE_CY);
  const right = pupilOffset(EYE_CX_RIGHT, EYE_CY);

  return (
    <div className="hide-overlay" role="presentation">
      <svg
        ref={svgRef}
        width="280"
        height="280"
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* eyebrows */}
        <path
          d="M 60 75 Q 95 50 130 75"
          stroke="#111"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 170 75 Q 205 50 240 75"
          stroke="#111"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        {/* eyes */}
        <ellipse
          cx={EYE_CX_LEFT}
          cy={EYE_CY}
          rx={EYE_RX}
          ry={EYE_RY}
          fill="white"
          stroke="#111"
          strokeWidth="5"
        />
        <ellipse
          cx={EYE_CX_RIGHT}
          cy={EYE_CY}
          rx={EYE_RX}
          ry={EYE_RY}
          fill="white"
          stroke="#111"
          strokeWidth="5"
        />
        {/* pupils */}
        <circle
          cx={EYE_CX_LEFT + left.dx}
          cy={EYE_CY + left.dy}
          r={PUPIL_R}
          fill="#111"
        />
        <circle
          cx={EYE_CX_RIGHT + right.dx}
          cy={EYE_CY + right.dy}
          r={PUPIL_R}
          fill="#111"
        />
        {/* tiny highlight on pupils */}
        <circle
          cx={EYE_CX_LEFT + left.dx + 4}
          cy={EYE_CY + left.dy - 4}
          r={2.5}
          fill="white"
        />
        <circle
          cx={EYE_CX_RIGHT + right.dx + 4}
          cy={EYE_CY + right.dy - 4}
          r={2.5}
          fill="white"
        />
        {/* cheek dots (the small whiskers/blush from the reference) */}
        <line x1="48" y1="220" x2="62" y2="222" stroke="#111" strokeWidth="3" strokeLinecap="round" />
        <line x1="48" y1="232" x2="62" y2="232" stroke="#111" strokeWidth="3" strokeLinecap="round" />
        <line x1="48" y1="244" x2="62" y2="240" stroke="#111" strokeWidth="3" strokeLinecap="round" />
        <line x1="252" y1="222" x2="238" y2="222" stroke="#111" strokeWidth="3" strokeLinecap="round" />
        <line x1="252" y1="232" x2="238" y2="232" stroke="#111" strokeWidth="3" strokeLinecap="round" />
        <line x1="252" y1="244" x2="238" y2="240" stroke="#111" strokeWidth="3" strokeLinecap="round" />
        {/* smile */}
        <path
          d="M 120 230 Q 150 252 180 230"
          stroke="#111"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <p className="hide-hint">Esc</p>
    </div>
  );
}
