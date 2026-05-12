import { PDFArray, PDFName, PDFString, type PDFFont, type PDFImage, type PDFPage, type RGB } from "pdf-lib"
import { COLORS } from "./colors"
import { drawWrappedText, sanitize } from "./text"

export interface ContactItem {
  text: string
  url?: string
}

export function addLinkAnnotation(
  page: PDFPage,
  url: string,
  rect: { x: number; y: number; width: number; height: number },
) {
  const context = page.doc.context
  const linkDict = context.obj({
    Type: "Annot",
    Subtype: "Link",
    Rect: [rect.x, rect.y, rect.x + rect.width, rect.y + rect.height],
    Border: [0, 0, 0],
    A: {
      Type: "Action",
      S: "URI",
      URI: PDFString.of(url),
    },
  })
  const ref = context.register(linkDict)
  const annotsKey = PDFName.of("Annots")
  const existing = page.node.lookup(annotsKey)
  let annots: PDFArray
  if (existing instanceof PDFArray) {
    annots = existing
  } else {
    annots = context.obj([]) as PDFArray
    page.node.set(annotsKey, annots)
  }
  annots.push(ref)
}

export interface Fonts {
  sans: PDFFont
  sansBold: PDFFont
  sansOblique: PDFFont
  serif: PDFFont
  serifBold: PDFFont
  mono: PDFFont
}

export function toPdfY(topY: number, pageH: number): number {
  return pageH - topY
}

export function drawRule(
  page: PDFPage,
  opts: { x: number; topY: number; width: number; pageH: number; color?: RGB; thickness?: number },
) {
  page.drawLine({
    start: { x: opts.x, y: opts.pageH - opts.topY },
    end: { x: opts.x + opts.width, y: opts.pageH - opts.topY },
    thickness: opts.thickness ?? 0.5,
    color: opts.color ?? COLORS.rule,
  })
}

export function drawEyebrow(
  page: PDFPage,
  text: string,
  opts: {
    x: number
    topY: number
    pageH: number
    font: PDFFont
    color?: RGB
    size?: number
    showRule?: boolean
  },
): number {
  const size = opts.size ?? 7.5
  const color = opts.color ?? COLORS.primary
  const sanitized = sanitize(text).toUpperCase()
  const letters = sanitized.split("").join(" ")
  const baseline = opts.pageH - opts.topY - size
  let x = opts.x
  if (opts.showRule !== false) {
    const ruleW = 18
    page.drawLine({
      start: { x: opts.x, y: baseline + size * 0.4 },
      end: { x: opts.x + ruleW, y: baseline + size * 0.4 },
      thickness: 0.7,
      color,
    })
    x = opts.x + ruleW + 6
  }
  page.drawText(letters, {
    x,
    y: baseline,
    size,
    font: opts.font,
    color,
  })
  return opts.topY + size + 4
}

export function drawSectionHeading(
  page: PDFPage,
  text: string,
  opts: {
    x: number
    topY: number
    pageH: number
    width: number
    font: PDFFont
    size?: number
    color?: RGB
    underlineColor?: RGB
  },
): number {
  const size = opts.size ?? 11
  const color = opts.color ?? COLORS.dark
  const baseline = opts.pageH - opts.topY - size
  page.drawText(sanitize(text), {
    x: opts.x,
    y: baseline,
    size,
    font: opts.font,
    color,
  })
  const ruleY = opts.topY + size + 3
  drawRule(page, {
    x: opts.x,
    topY: ruleY,
    width: opts.width,
    pageH: opts.pageH,
    color: opts.underlineColor ?? COLORS.rule,
    thickness: 0.5,
  })
  return ruleY + 6
}

export interface PillOptions {
  x: number
  topY: number
  pageH: number
  font: PDFFont
  size?: number
  paddingX?: number
  paddingY?: number
  background: RGB
  textColor: RGB
  borderColor?: RGB
}

export function drawPill(page: PDFPage, text: string, opts: PillOptions): { width: number; height: number } {
  const size = opts.size ?? 7.5
  const px = opts.paddingX ?? 6
  const py = opts.paddingY ?? 3
  const clean = sanitize(text)
  const textW = opts.font.widthOfTextAtSize(clean, size)
  const width = textW + px * 2
  const height = size + py * 2
  const y = opts.pageH - opts.topY - height
  page.drawRectangle({
    x: opts.x,
    y,
    width,
    height,
    color: opts.background,
    borderColor: opts.borderColor,
    borderWidth: opts.borderColor ? 0.4 : 0,
  })
  page.drawText(clean, {
    x: opts.x + px,
    y: y + py + size * 0.18,
    font: opts.font,
    size,
    color: opts.textColor,
  })
  return { width, height }
}

export function drawPillsRow(
  page: PDFPage,
  items: string[],
  opts: {
    x: number
    topY: number
    pageH: number
    maxWidth: number
    font: PDFFont
    size?: number
    paddingX?: number
    paddingY?: number
    gap?: number
    background: RGB
    textColor: RGB
    borderColor?: RGB
  },
): number {
  if (items.length === 0) return opts.topY
  const size = opts.size ?? 7.5
  const px = opts.paddingX ?? 6
  const py = opts.paddingY ?? 3
  const gap = opts.gap ?? 4
  const lineH = size + py * 2
  let cx = opts.x
  let cy = opts.topY
  for (const item of items) {
    const clean = sanitize(item)
    const textW = opts.font.widthOfTextAtSize(clean, size)
    const pillW = textW + px * 2
    if (cx + pillW > opts.x + opts.maxWidth && cx > opts.x) {
      cx = opts.x
      cy += lineH + gap
    }
    drawPill(page, item, {
      x: cx,
      topY: cy,
      pageH: opts.pageH,
      font: opts.font,
      size,
      paddingX: px,
      paddingY: py,
      background: opts.background,
      textColor: opts.textColor,
      borderColor: opts.borderColor,
    })
    cx += pillW + gap
  }
  return cy + lineH
}

export function drawDocumentHeader(
  page: PDFPage,
  opts: {
    pageW: number
    pageH: number
    margin: number
    eyebrow: string
    title: string
    subtitle?: string
    contactItems?: ContactItem[]
    fonts: Fonts
  },
): number {
  const { pageW, pageH, margin, fonts } = opts
  const innerW = pageW - margin * 2

  drawEyebrow(page, opts.eyebrow, {
    x: margin,
    topY: margin,
    pageH,
    font: fonts.sansBold,
    color: COLORS.primary,
    size: 8,
  })

  const titleSize = 26
  const titleY = margin + 16
  page.drawText(sanitize(opts.title), {
    x: margin,
    y: pageH - titleY - titleSize,
    font: fonts.serifBold,
    size: titleSize,
    color: COLORS.dark,
  })

  let cursor = titleY + titleSize + 4

  if (opts.subtitle) {
    const subSize = 11
    page.drawText(sanitize(opts.subtitle), {
      x: margin,
      y: pageH - cursor - subSize,
      font: fonts.sans,
      size: subSize,
      color: COLORS.primary,
    })
    cursor += subSize + 6
  }

  if (opts.contactItems && opts.contactItems.length > 0) {
    const contactSize = 8.5
    const lineH = contactSize * 1.5
    const startY = cursor + 4
    const separator = "   ·   "
    const sepW = fonts.mono.widthOfTextAtSize(separator, contactSize)
    let xPos = margin
    let yLine = startY
    let firstOnLine = true
    for (const item of opts.contactItems) {
      const text = sanitize(item.text)
      if (!text) continue
      const w = fonts.mono.widthOfTextAtSize(text, contactSize)
      if (!firstOnLine && xPos + sepW + w > margin + innerW) {
        yLine += lineH
        xPos = margin
        firstOnLine = true
      }
      if (!firstOnLine) {
        page.drawText(separator, {
          x: xPos,
          y: pageH - yLine - contactSize,
          font: fonts.mono,
          size: contactSize,
          color: COLORS.darkSoft,
        })
        xPos += sepW
      }
      const tokenColor = item.url ? COLORS.primary : COLORS.darkSoft
      const baseline = pageH - yLine - contactSize
      page.drawText(text, {
        x: xPos,
        y: baseline,
        font: fonts.mono,
        size: contactSize,
        color: tokenColor,
      })
      if (item.url) {
        addLinkAnnotation(page, item.url, {
          x: xPos,
          y: baseline - 2,
          width: w,
          height: contactSize + 4,
        })
      }
      xPos += w
      firstOnLine = false
    }
    cursor = yLine + lineH
  }

  cursor += 4
  page.drawRectangle({
    x: margin,
    y: pageH - cursor - 2,
    width: 44,
    height: 2.5,
    color: COLORS.primary,
  })
  return cursor + 8
}

export function drawContainedImage(
  page: PDFPage,
  img: PDFImage,
  opts: { x: number; topY: number; w: number; h: number; pageH: number },
) {
  const iw = img.width
  const ih = img.height
  const ratio = Math.min(opts.w / iw, opts.h / ih)
  const w = iw * ratio
  const h = ih * ratio
  const offsetX = opts.x + (opts.w - w) / 2
  const offsetTop = opts.topY + (opts.h - h) / 2
  page.drawImage(img, {
    x: offsetX,
    y: opts.pageH - offsetTop - h,
    width: w,
    height: h,
  })
}

export function drawBullet(
  page: PDFPage,
  text: string,
  opts: {
    x: number
    topY: number
    pageH: number
    width: number
    font: PDFFont
    size: number
    color: RGB
    bulletColor?: RGB
    lineHeight?: number
    indent?: number
    maxLines?: number
  },
): number {
  const indent = opts.indent ?? 9
  const bulletColor = opts.bulletColor ?? COLORS.accent
  const baselineFirst = opts.pageH - opts.topY - opts.size
  page.drawText("•", {
    x: opts.x,
    y: baselineFirst,
    font: opts.font,
    size: opts.size,
    color: bulletColor,
  })
  const res = drawWrappedText(page, text, {
    x: opts.x + indent,
    topY: opts.topY,
    pageH: opts.pageH,
    font: opts.font,
    size: opts.size,
    color: opts.color,
    maxWidth: opts.width - indent,
    lineHeight: opts.lineHeight,
    maxLines: opts.maxLines,
  })
  return res.bottomY
}
