import { PDFDocument, StandardFonts, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib"
import type { Personal, Project } from "@/lib/sheet"
import type { Locale } from "@/lib/dictionary"
import { bulletize, formatRange, splitTags } from "@/lib/format"
import { COLORS } from "./colors"
import {
  drawBullet,
  drawContainedImage,
  drawDocumentHeader,
  drawPillsRow,
  type ContactItem,
  type Fonts,
} from "./primitives"
import { drawWrappedText, sanitize, wrapJoinedTokens, wrapText } from "./text"
import { loadAndEmbedImages } from "./images"

export interface ProjectsPdfInput {
  locale: Locale
  person: Personal
  projects: Project[]
  onProgress?: (pct: number) => void
}

interface ProjectsStrings {
  eyebrow: string
  title: string
  present: string
  footer: string
  page: string
  of: string
}

const STRINGS: Record<Locale, ProjectsStrings> = {
  de: {
    eyebrow: "Projektliste",
    title: "Projekte",
    present: "heute",
    footer: "Erstellt am",
    page: "Seite",
    of: "von",
  },
  en: {
    eyebrow: "Project Portfolio",
    title: "Projects",
    present: "Present",
    footer: "Generated on",
    page: "Page",
    of: "of",
  },
}

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN_X = 56
const MARGIN_TOP = 56
const MARGIN_BOTTOM = 60
const GAP_ABOVE_DIVIDER = 16
const GAP_BELOW_DIVIDER = 18
const LOGO_SIZE = 30
const LOGO_GUTTER = 14
const SECTIONS_SEPARATOR = "   ·   "
const SECTIONS_SIZE = 7
const SECTIONS_LINE_H = SECTIONS_SIZE * 1.7

export async function buildProjectsPdf(input: ProjectsPdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(`${input.person.name} - Projects`)
  doc.setAuthor(input.person.name)
  doc.setCreator("cv.smiit.de")
  doc.setProducer("cv.smiit.de")

  const fonts: Fonts = {
    sans: await doc.embedFont(StandardFonts.Helvetica),
    sansBold: await doc.embedFont(StandardFonts.HelveticaBold),
    sansOblique: await doc.embedFont(StandardFonts.HelveticaOblique),
    serif: await doc.embedFont(StandardFonts.TimesRoman),
    serifBold: await doc.embedFont(StandardFonts.TimesRomanBold),
    mono: await doc.embedFont(StandardFonts.Courier),
  }
  const s = STRINGS[input.locale]

  const projects = [...input.projects].sort(
    (a, b) => (b.start?.getTime() ?? 0) - (a.start?.getTime() ?? 0),
  )

  input.onProgress?.(0.05)
  const logoUrls = projects.map((p) => p.logoUrl)
  const uniqueCount = new Set(logoUrls.filter(Boolean)).size
  let loaded = 0
  const logos = await loadAndEmbedImages(doc, logoUrls, () => {
    loaded++
    if (uniqueCount > 0) {
      input.onProgress?.(0.05 + (loaded / uniqueCount) * 0.85)
    }
  })
  input.onProgress?.(0.92)

  const innerW = PAGE_W - MARGIN_X * 2
  let page = startPage(doc)
  let cursor = drawDocumentHeader(page, {
    pageW: PAGE_W,
    pageH: PAGE_H,
    margin: MARGIN_X,
    eyebrow: s.eyebrow,
    title: s.title,
    contactItems: buildContactItems(input.person),
    fonts,
  })
  cursor += 12

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i]
    const logo = project.logoUrl ? logos.get(project.logoUrl) : undefined
    const height = measureEntry(project, fonts, innerW, !!logo, input.locale, s)
    const leadingGap = i > 0 ? GAP_ABOVE_DIVIDER + GAP_BELOW_DIVIDER : 0

    if (cursor + leadingGap + height > PAGE_H - MARGIN_BOTTOM) {
      page = startPage(doc)
      cursor = MARGIN_TOP
    } else if (i > 0) {
      cursor += GAP_ABOVE_DIVIDER
      page.drawLine({
        start: { x: MARGIN_X, y: PAGE_H - cursor },
        end: { x: PAGE_W - MARGIN_X, y: PAGE_H - cursor },
        thickness: 0.4,
        color: COLORS.rule,
      })
      cursor += GAP_BELOW_DIVIDER
    }

    drawEntry({
      page,
      topY: cursor,
      width: innerW,
      project,
      logo,
      fonts,
      locale: input.locale,
      strings: s,
    })
    cursor += height
  }

  paintFooters(doc, fonts, input.locale, s)
  const bytes = await doc.save()
  input.onProgress?.(1)
  return bytes
}

function startPage(doc: PDFDocument): PDFPage {
  const page = doc.addPage([PAGE_W, PAGE_H])
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_W,
    height: PAGE_H,
    color: COLORS.white,
  })
  return page
}

function buildContactItems(person: Personal): ContactItem[] {
  const items: ContactItem[] = [{ text: person.name }]
  if (person.email) items.push({ text: person.email, url: `mailto:${person.email}` })
  if (person.linkedInUrl) items.push({ text: "LinkedIn", url: person.linkedInUrl })
  return items
}

interface EntryArgs {
  page: PDFPage
  topY: number
  width: number
  project: Project
  logo: PDFImage | undefined
  fonts: Fonts
  locale: Locale
  strings: ProjectsStrings
}

function measureEntry(
  project: Project,
  fonts: Fonts,
  width: number,
  hasLogo: boolean,
  locale: Locale,
  strings: ProjectsStrings,
): number {
  const textOffset = hasLogo ? LOGO_SIZE + LOGO_GUTTER : 0
  const dateSize = 8
  const dateW = fonts.mono.widthOfTextAtSize(
    sanitize(formatRange(locale, project.start, project.end, strings.present)),
    dateSize,
  )
  const headerTextW = width - textOffset - dateW - 12

  const roleSize = 13
  const roleLines = wrapText(project.role, fonts.serifBold, roleSize, headerTextW)
  const roleH = Math.max(1, roleLines.length) * roleSize * 1.22

  const customerSize = 9.5
  let customerH = 0
  if (project.customer) {
    const lines = wrapText(project.customer, fonts.sans, customerSize, headerTextW)
    customerH = lines.length * customerSize * 1.3 + 2
  }

  const headerBlockH = roleH + customerH
  const headerH = Math.max(headerBlockH, hasLogo ? LOGO_SIZE : 0) + 6

  const sections = splitTags(project.sections)
  let sectionsH = 0
  if (sections.length > 0) {
    const sectionLines = wrapJoinedTokens(
      sections.map((sec) => sec.toUpperCase()),
      SECTIONS_SEPARATOR,
      fonts.sansBold,
      SECTIONS_SIZE,
      width,
    )
    sectionsH = sectionLines.length * SECTIONS_LINE_H + 8
  }

  const bodySize = 9
  const bodyLH = bodySize * 1.5
  const bullets = bulletize(project.description)
  let bodyH = 0
  if (bullets.length > 0) {
    bodyH += 4
    for (const b of bullets) {
      const lines = wrapText(b, fonts.sans, bodySize, width - 11)
      bodyH += Math.max(1, lines.length) * bodyLH + 3
    }
  } else if (project.description) {
    const lines = wrapText(project.description, fonts.sans, bodySize, width)
    bodyH += 4 + lines.length * bodyLH
  }

  const techs = splitTags(project.technologies)
  let techH = 0
  if (techs.length > 0) {
    techH = 8 + estimatePillRowHeight(techs, fonts.sansBold, width)
  }

  return headerH + sectionsH + bodyH + techH
}

function estimatePillRowHeight(items: string[], font: PDFFont, maxWidth: number): number {
  const size = 7.5
  const px = 7
  const py = 3.5
  const gap = 5
  const lineH = size + py * 2
  let cx = 0
  let lines = 1
  for (const it of items) {
    const tw = font.widthOfTextAtSize(sanitize(it), size) + px * 2
    if (cx + tw > maxWidth && cx > 0) {
      lines++
      cx = 0
    }
    cx += tw + gap
  }
  return lines * lineH + (lines - 1) * gap
}

function drawEntry(args: EntryArgs) {
  const { page, topY, width, project, logo, fonts, locale, strings } = args
  const x = MARGIN_X
  const textOffset = logo ? LOGO_SIZE + LOGO_GUTTER : 0
  const textX = x + textOffset
  const textW = width - textOffset

  if (logo) {
    drawContainedImage(page, logo, {
      x,
      topY,
      w: LOGO_SIZE,
      h: LOGO_SIZE,
      pageH: PAGE_H,
    })
  }

  let cursor = topY

  const dateSize = 8
  const dateText = sanitize(
    formatRange(locale, project.start, project.end, strings.present),
  )
  const dateW = fonts.mono.widthOfTextAtSize(dateText, dateSize)
  page.drawText(dateText, {
    x: x + width - dateW,
    y: PAGE_H - cursor - dateSize,
    font: fonts.mono,
    size: dateSize,
    color: COLORS.darkMuted,
  })

  const headerTextW = textW - dateW - 12
  const roleSize = 13
  const roleLines = wrapText(project.role, fonts.serifBold, roleSize, headerTextW)
  for (const line of roleLines) {
    page.drawText(line, {
      x: textX,
      y: PAGE_H - cursor - roleSize,
      font: fonts.serifBold,
      size: roleSize,
      color: COLORS.dark,
    })
    cursor += roleSize * 1.22
  }

  if (project.customer) {
    const customerSize = 9.5
    const res = drawWrappedText(page, project.customer, {
      x: textX,
      topY: cursor + 2,
      pageH: PAGE_H,
      font: fonts.sans,
      size: customerSize,
      color: COLORS.primary,
      maxWidth: headerTextW,
      lineHeight: customerSize * 1.3,
    })
    cursor = res.bottomY
  }

  const headerBlockBottom = cursor
  const logoBottom = logo ? topY + LOGO_SIZE : topY
  cursor = Math.max(headerBlockBottom, logoBottom) + 6

  const sections = splitTags(project.sections)
  if (sections.length > 0) {
    const sectionLines = wrapJoinedTokens(
      sections.map((sec) => sec.toUpperCase()),
      SECTIONS_SEPARATOR,
      fonts.sansBold,
      SECTIONS_SIZE,
      width,
    )
    for (const line of sectionLines) {
      page.drawText(line, {
        x,
        y: PAGE_H - cursor - SECTIONS_SIZE,
        font: fonts.sansBold,
        size: SECTIONS_SIZE,
        color: COLORS.primary,
      })
      cursor += SECTIONS_LINE_H
    }
    cursor += 8
  }

  const bodySize = 9
  const bodyLH = bodySize * 1.5
  const bullets = bulletize(project.description)
  if (bullets.length > 0) {
    cursor += 4
    for (const b of bullets) {
      cursor = drawBullet(page, b, {
        x,
        topY: cursor,
        pageH: PAGE_H,
        width,
        font: fonts.sans,
        size: bodySize,
        color: COLORS.darkSoft,
        bulletColor: COLORS.primary,
        lineHeight: bodyLH,
        indent: 11,
      })
      cursor += 3
    }
  } else if (project.description) {
    cursor += 4
    const res = drawWrappedText(page, project.description, {
      x,
      topY: cursor,
      pageH: PAGE_H,
      font: fonts.sans,
      size: bodySize,
      color: COLORS.darkSoft,
      maxWidth: width,
      lineHeight: bodyLH,
    })
    cursor = res.bottomY
  }

  const techs = splitTags(project.technologies)
  if (techs.length > 0) {
    cursor += 8
    drawPillsRow(page, techs, {
      x,
      topY: cursor,
      pageH: PAGE_H,
      maxWidth: width,
      font: fonts.sansBold,
      size: 7.5,
      paddingX: 7,
      paddingY: 3.5,
      gap: 5,
      background: COLORS.primaryTint,
      textColor: COLORS.primary,
    })
  }
}

function paintFooters(
  doc: PDFDocument,
  fonts: Fonts,
  locale: Locale,
  strings: ProjectsStrings,
) {
  const pages = doc.getPages()
  const total = pages.length
  const dateText = new Date().toLocaleDateString(
    locale === "en" ? "en-US" : "de-DE",
    { day: "2-digit", month: "long", year: "numeric" },
  )
  for (let i = 0; i < total; i++) {
    const p = pages[i]
    const size = 7
    const left = sanitize(`${strings.footer} ${dateText}`)
    p.drawText(left, {
      x: MARGIN_X,
      y: 28,
      font: fonts.mono,
      size,
      color: COLORS.darkMuted,
    })
    const right = sanitize(`${strings.page} ${i + 1} ${strings.of} ${total}`)
    const tw = fonts.mono.widthOfTextAtSize(right, size)
    p.drawText(right, {
      x: PAGE_W - MARGIN_X - tw,
      y: 28,
      font: fonts.mono,
      size,
      color: COLORS.darkMuted,
    })
  }
}
