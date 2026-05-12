import type { Locale } from "@/lib/dictionary"

export function formatMonth(locale: Locale, d: Date | null, presentLabel: string): string {
  if (!d) return presentLabel
  return d.toLocaleDateString(locale === "en" ? "en-US" : "de-DE", {
    month: "short",
    year: "numeric",
  })
}

export function formatRange(
  locale: Locale,
  start: Date | null,
  end: Date | null,
  presentLabel: string,
): string {
  const startStr = formatMonth(locale, start, presentLabel)
  const endStr = formatMonth(locale, end, presentLabel)
  if (!end) return `${startStr} – ${presentLabel}`
  if (
    start &&
    end &&
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    return startStr
  }
  return `${startStr} – ${endStr}`
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
