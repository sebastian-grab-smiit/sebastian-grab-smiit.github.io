/**
 * Brand palette for places where Tailwind classes cannot be used
 * (inline styles, SVG attributes, color arithmetic like `${hex}1A`).
 * Keep in sync with the `--color-*` tokens in app/globals.css.
 */
export const BRAND = {
  ink: "#0B162D",
  blue: "#21569C",
  blueLight: "#7DBBFF",
  magenta: "#F703EB",
  magentaLight: "#FB81F5",
  slate: "#64748B",
  slateLight: "#94A3B8",
} as const

/** `#21569C` → `"33, 86, 156"`, for use in `rgba(...)`. */
export function hexToRgb(hex: string): string {
  const n = Number.parseInt(hex.replace("#", ""), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(", ")
}
