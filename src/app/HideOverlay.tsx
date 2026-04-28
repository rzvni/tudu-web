"use client";

export function HideOverlay() {
  return (
    <div className="hide-overlay" role="presentation" aria-hidden="true">
      <div className="thinking">
        <span className="thinking-word">thinking</span>
        <span className="thinking-dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    </div>
  );
}
