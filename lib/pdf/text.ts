import type { PDFFont, PDFPage, RGB } from "pdf-lib"

const WINANSI_REPLACEMENTS: Record<string, string> = {
  "…": "...",
  "→": "->",
  "←": "<-",
  "↑": "^",
  "↓": "v",
  "≈": "~",
  "≤": "<=",
  "≥": ">=",
  "•": "•",
  "·": "·",
  "—": "—",
  "–": "–",
  "“": '"',
  "”": '"',
  "‘": "'",
  "’": "'",
  "„": '"',
  "‚": "'",
}

const WINANSI_UNMAPPED = new Set([0x81, 0x8d, 0x8f, 0x90, 0x9d])

export function sanitize(text: string | null | undefined): string {
  if (!text) return ""
  let out = ""
  for (const ch of text) {
    const sub = WINANSI_REPLACEMENTS[ch]
    if (sub !== undefined) {
      out += sub
      continue
    }
    const code = ch.charCodeAt(0)
    if (code > 0xff || WINANSI_UNMAPPED.has(code)) {
      out += "?"
    } else {
      out += ch
    }
  }
  return out
}

export function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const clean = sanitize(text)
  if (!clean) return []
  const paragraphs = clean.split("\n")
  const lines: string[] = []
  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push("")
      continue
    }
    const words = para.split(/\s+/)
    let current = ""
    for (const word of words) {
      const test = current ? `${current} ${word}` : word
      if (font.widthOfTextAtSize(test, size) <= maxWidth) {
        current = test
        continue
      }
      if (current) lines.push(current)
      if (font.widthOfTextAtSize(word, size) > maxWidth) {
        let chunk = ""
        for (const ch of word) {
          const t = chunk + ch
          if (font.widthOfTextAtSize(t, size) <= maxWidth) {
            chunk = t
          } else {
            if (chunk) lines.push(chunk)
            chunk = ch
          }
        }
        current = chunk
      } else {
        current = word
      }
    }
    if (current) lines.push(current)
  }
  return lines
}

export interface DrawTextOptions {
  x: number
  topY: number
  pageH: number
  font: PDFFont
  size: number
  color: RGB
  maxWidth?: number
  lineHeight?: number
  maxLines?: number
}

export interface DrawTextResult {
  bottomY: number
  lines: number
}

export function drawWrappedText(
  page: PDFPage,
  text: string,
  opts: DrawTextOptions,
): DrawTextResult {
  const lineHeight = opts.lineHeight ?? opts.size * 1.32
  const lines = opts.maxWidth
    ? wrapText(text, opts.font, opts.size, opts.maxWidth)
    : [sanitize(text)]
  const limited = opts.maxLines ? truncateLines(lines, opts.maxLines, opts.font, opts.size, opts.maxWidth) : lines
  let y = opts.topY
  for (const line of limited) {
    const baseline = opts.pageH - y - opts.size
    page.drawText(line, {
      x: opts.x,
      y: baseline,
      font: opts.font,
      size: opts.size,
      color: opts.color,
    })
    y += lineHeight
  }
  return { bottomY: y, lines: limited.length }
}

function truncateLines(
  lines: string[],
  max: number,
  font: PDFFont,
  size: number,
  maxWidth: number | undefined,
): string[] {
  if (lines.length <= max) return lines
  const kept = lines.slice(0, max)
  const last = kept[max - 1]
  const ellipsis = "..."
  if (!maxWidth) {
    kept[max - 1] = `${last.trimEnd()}${ellipsis}`
    return kept
  }
  let candidate = last
  while (
    candidate.length > 0 &&
    font.widthOfTextAtSize(`${candidate}${ellipsis}`, size) > maxWidth
  ) {
    candidate = candidate.slice(0, -1)
  }
  kept[max - 1] = `${candidate.trimEnd()}${ellipsis}`
  return kept
}

export function wrapJoinedTokens(
  items: string[],
  separator: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  if (items.length === 0) return []
  const sepW = font.widthOfTextAtSize(separator, size)
  const lines: string[] = []
  let curLine = ""
  let curW = 0
  for (const raw of items) {
    const it = sanitize(raw)
    if (!it) continue
    const w = font.widthOfTextAtSize(it, size)
    if (curW === 0) {
      curLine = it
      curW = w
      continue
    }
    if (curW + sepW + w <= maxWidth) {
      curLine = curLine + separator + it
      curW += sepW + w
    } else {
      lines.push(curLine)
      curLine = it
      curW = w
    }
  }
  if (curLine) lines.push(curLine)
  return lines
}

export function measureWrappedHeight(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
  lineHeight?: number,
  maxLines?: number,
): { lines: number; height: number } {
  const all = wrapText(text, font, size, maxWidth)
  const count = maxLines ? Math.min(all.length, maxLines) : all.length
  const lh = lineHeight ?? size * 1.32
  return { lines: count, height: count * lh }
}
