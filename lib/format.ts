import type { Locale } from "@/lib/dictionary"

// Sheet dates are calendar dates stored as UTC midnight (see lib/sheet/schema.ts).
// Formatting them in UTC keeps "2022-10-01" as October for visitors in every time zone.

export function formatMonth(locale: Locale, d: Date | null, presentLabel: string): string {
  if (!d) return presentLabel
  return d.toLocaleDateString(locale === "en" ? "en-US" : "de-DE", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function formatRange(
  locale: Locale,
  start: Date | null,
  end: Date | null,
  presentLabel: string,
): string {
  const startStr = formatMonth(locale, start, presentLabel)
  if (!end) return `${startStr} – ${presentLabel}`
  if (
    start &&
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth()
  ) {
    return startStr
  }
  return `${startStr} – ${formatMonth(locale, end, presentLabel)}`
}

export function splitTags(value: string): string[] {
  return (value ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
}

export function bulletize(text: string): string[] {
  if (!text) return []
  return text
    .split("•")
    .map((s) => s.trim())
    .filter(Boolean)
}
