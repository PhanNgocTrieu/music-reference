"use client";

import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface HoverPreviewProps {
  trigger: ReactNode;
  children: ReactNode;
}

/**
 * Renders the tooltip into a portal on `document.body`, positioned via the
 * trigger's bounding rect — avoids being clipped by the table's scroll container.
 */
export default function HoverPreview({ trigger, children }: HoverPreviewProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLSpanElement>(null);

  function show() {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      setPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX });
    }
    setOpen(true);
  }

  return (
    <span
      ref={ref}
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={() => setOpen(false)}
      onFocus={show}
      onBlur={() => setOpen(false)}
    >
      {trigger}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            style={{ position: "absolute", top: pos.top, left: pos.left }}
            className="z-50 w-56 rounded-lg border border-cream-300 bg-white p-3 text-xs shadow-lg"
          >
            {children}
          </div>,
          document.body
        )}
    </span>
  );
}
