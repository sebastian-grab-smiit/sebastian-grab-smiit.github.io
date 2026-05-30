import { PDFDocument, StandardFonts, type PDFImage, type PDFPage } from "pdf-lib"
import type {
  Personal,
  ResumeEntry,
  Academic,
  Skill,
  LanguageSkill,
  Certificate,
} from "@/lib/sheet"
import type { Locale } from "@/lib/dictionary"
import { formatMonth, formatRange, splitTags } from "@/lib/format"
import { COLORS } from "./colors"
import {
  addLinkAnnotation,
  drawContainedImage,
  type Fonts,
} from "./primitives"
import { drawWrappedText, sanitize, wrapText } from "./text"
import { loadAndEmbedImages } from "./images"

export interface CvPdfInput {
  locale: Locale
  person: Personal
  resume: ResumeEntry[]
  academics: Academic[]
  skills: Skill[]
  languages: LanguageSkill[]
  certificates: Certificate[]
  onProgress?: (pct: number) => void
}

interface CvStrings {
  eyebrow: string
  experience: string
  education: string
  skills: string
  languages: string
  certificates: string
  contact: string
  present: string
  grade: string
  footer: string
}

const STRINGS: Record<Locale, CvStrings> = {
  de: {
    eyebrow: "Lebenslauf",
    experience: "Berufliche Erfahrung",
    education: "Ausbildung",
    skills: "Kenntnisse",
    languages: "Sprachen",
    certificates: "Zertifikate",
    contact: "Kontakt",
    present: "heute",
    grade: "Note",
    footer: "Erstellt am",
  },
  en: {
    eyebrow: "Curriculum Vitae",
    experience: "Professional Experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    certificates: "Certificates",
    contact: "Contact",
    present: "Present",
    grade: "Grade",
    footer: "Generated on",
  },
}

const PAGE_W = 595.28
const PAGE_H = 841.89
const SIDEBAR_W = 198
const SIDEBAR_PAD = 22
const SIDEBAR_INNER_W = SIDEBAR_W - SIDEBAR_PAD * 2
const PHOTO_H = 200
const MAIN_X = SIDEBAR_W + 30
const MAIN_TOP = 50
const MAIN_RIGHT = 40
const MAIN_W = PAGE_W - MAIN_X - MAIN_RIGHT
const LOGO_SIZE = 18
const LOGO_GUTTER = 10
const PHOTO_URL = "/assets/sebastian.webp"

export async function buildCvPdf(input: CvPdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(`${input.person.name} - CV`)
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

  const urls = [
    PHOTO_URL,
    ...input.resume.map((r) => r.logoUrl),
    ...input.academics.map((a) => a.logoUrl),
  ]
  input.onProgress?.(0.05)
  const uniqueCount = new Set(urls.filter(Boolean)).size
  let loaded = 0
  const images = await loadAndEmbedImages(doc, urls, () => {
    loaded++
    if (uniqueCount > 0) {
      input.onProgress?.(0.05 + (loaded / uniqueCount) * 0.85)
    }
  })
  const photo = images.get(PHOTO_URL)
  input.onProgress?.(0.92)

  const page = doc.addPage([PAGE_W, PAGE_H])
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COLORS.white })

  drawSidebar({
    page,
    fonts,
    locale: input.locale,
    strings: s,
    person: input.person,
    photo,
    skills: input.skills,
    languages: input.languages,
    certificates: input.certificates,
  })

  drawMain({
    page,
    fonts,
    locale: input.locale,
    strings: s,
    person: input.person,
    resume: input.resume,
    academics: input.academics,
    images,
  })

  drawFooter(page, fonts, input.locale, s)

  const bytes = await doc.save()
  input.onProgress?.(1)
  return bytes
}

function drawSidebar(args: {
  page: PDFPage
  fonts: Fonts
  locale: Locale
  strings: CvStrings
  person: Personal
  photo: PDFImage | undefined
  skills: Skill[]
  languages: LanguageSkill[]
  certificates: Certificate[]
}) {
  const { page, fonts, locale, strings, person, photo } = args

  page.drawRectangle({
    x: 0,
    y: 0,
    width: SIDEBAR_W,
    height: PAGE_H,
    color: COLORS.dark,
  })

  let cursor = SIDEBAR_PAD

  if (photo) {
    drawContainedImage(page, photo, {
      x: SIDEBAR_PAD,
      topY: cursor,
      w: SIDEBAR_INNER_W,
      h: PHOTO_H,
      pageH: PAGE_H,
    })
    cursor += PHOTO_H + 28
  } else {
    cursor += 12
  }

  cursor = drawSidebarHeading(page, strings.contact, { topY: cursor, fonts })
  cursor = drawSidebarContact(page, person, locale, { topY: cursor, fonts })
  cursor += 20

  if (args.skills.length > 0) {
    cursor = drawSidebarHeading(page, strings.skills, { topY: cursor, fonts })
    cursor = drawSidebarSkills(page, args.skills, { topY: cursor, fonts })
    cursor += 18
  }

  if (args.languages.length > 0) {
    cursor = drawSidebarHeading(page, strings.languages, { topY: cursor, fonts })
    cursor = drawSidebarLanguages(page, args.languages, { topY: cursor, fonts })
    cursor += 18
  }

  if (args.certificates.length > 0) {
    cursor = drawSidebarHeading(page, strings.certificates, { topY: cursor, fonts })
    cursor = drawSidebarCertificates(page, args.certificates, locale, {
      topY: cursor,
      fonts,
    })
  }
}

function drawSidebarHeading(
  page: PDFPage,
  text: string,
  opts: { topY: number; fonts: Fonts },
): number {
  const size = 8
  const letters = sanitize(text).toUpperCase().split("").join(" ")
  page.drawText(letters, {
    x: SIDEBAR_PAD,
    y: PAGE_H - opts.topY - size,
    font: opts.fonts.sansBold,
    size,
    color: COLORS.white,
  })
  page.drawLine({
    start: { x: SIDEBAR_PAD, y: PAGE_H - opts.topY - size - 7 },
    end: { x: SIDEBAR_PAD + 22, y: PAGE_H - opts.topY - size - 7 },
    thickness: 0.8,
    color: COLORS.primaryLight,
  })
  return opts.topY + size + 16
}

function drawSidebarContact(
  page: PDFPage,
  person: Personal,
  locale: Locale,
  opts: { topY: number; fonts: Fonts },
): number {
  void locale
  let cursor = opts.topY
  const size = 8
  const lineH = size * 1.55

  const lines: Array<{ text: string; url?: string; muted?: boolean }> = []
  if (person.email) {
    lines.push({ text: person.email, url: `mailto:${person.email}` })
  }
  if (person.phone) lines.push({ text: person.phone })
  if (person.address) lines.push({ text: person.address, muted: true })
  if (person.linkedInUrl) {
    lines.push({ text: "LinkedIn", url: person.linkedInUrl })
  }

  for (const item of lines) {
    const text = sanitize(item.text)
    const wrapped = wrapText(text, opts.fonts.sans, size, SIDEBAR_INNER_W)
    for (let i = 0; i < wrapped.length; i++) {
      const line = wrapped[i]
      const color = item.url
        ? COLORS.primaryLight
        : item.muted
          ? COLORS.darkMuted
          : COLORS.gray300
      const baseline = PAGE_H - cursor - size
      page.drawText(line, {
        x: SIDEBAR_PAD,
        y: baseline,
        font: item.url ? opts.fonts.sansBold : opts.fonts.sans,
        size,
        color,
      })
      if (item.url && i === 0) {
        const w = opts.fonts.sansBold.widthOfTextAtSize(line, size)
        addLinkAnnotation(page, item.url, {
          x: SIDEBAR_PAD,
          y: baseline - 2,
          width: w,
          height: size + 4,
        })
      }
      cursor += lineH
    }
  }
  return cursor
}

function drawSidebarSkills(
  page: PDFPage,
  skills: Skill[],
  opts: { topY: number; fonts: Fonts },
): number {
  const groups: Record<string, Skill[]> = {}
  for (const sk of skills) {
    if (!groups[sk.category]) groups[sk.category] = []
    groups[sk.category].push(sk)
  }
  let cursor = opts.topY
  const catSize = 6.5
  const nameSize = 8
  for (const [cat, items] of Object.entries(groups)) {
    page.drawText(sanitize(cat).toUpperCase().split("").join(" "), {
      x: SIDEBAR_PAD,
      y: PAGE_H - cursor - catSize,
      font: opts.fonts.sansBold,
      size: catSize,
      color: COLORS.primaryLight,
    })
    cursor += catSize + 5

    const sorted = [...items].sort((a, b) => b.level - a.level)
    const namesText = sorted.map((sk) => sk.name).join(", ")
    const lines = wrapText(namesText, opts.fonts.sans, nameSize, SIDEBAR_INNER_W)
    for (const line of lines) {
      page.drawText(line, {
        x: SIDEBAR_PAD,
        y: PAGE_H - cursor - nameSize,
        font: opts.fonts.sans,
        size: nameSize,
        color: COLORS.gray300,
      })
      cursor += nameSize * 1.45
    }
    cursor += 7
  }
  return cursor
}

function drawSidebarLanguages(
  page: PDFPage,
  languages: LanguageSkill[],
  opts: { topY: number; fonts: Fonts },
): number {
  let cursor = opts.topY
  const size = 8.5
  const lineH = size + 7
  for (const lang of languages) {
    const baseline = PAGE_H - cursor - size
    page.drawText(sanitize(lang.languageName), {
      x: SIDEBAR_PAD,
      y: baseline,
      font: opts.fonts.sansBold,
      size,
      color: COLORS.white,
    })
    if (lang.level) {
      const levelText = sanitize(lang.level)
      const w = opts.fonts.sans.widthOfTextAtSize(levelText, size - 0.5)
      page.drawText(levelText, {
        x: SIDEBAR_PAD + SIDEBAR_INNER_W - w,
        y: baseline,
        font: opts.fonts.sans,
        size: size - 0.5,
        color: COLORS.primaryLight,
      })
    }
    cursor += lineH
  }
  return cursor
}

function drawSidebarCertificates(
  page: PDFPage,
  certificates: Certificate[],
  locale: Locale,
  opts: { topY: number; fonts: Fonts },
): number {
  let cursor = opts.topY
  const sorted = [...certificates].sort(
    (a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0),
  )
  const nameSize = 7.5
  for (const cert of sorted) {
    const lines = wrapText(cert.certificateName, opts.fonts.sans, nameSize, SIDEBAR_INNER_W)
    for (const line of lines) {
      page.drawText(line, {
        x: SIDEBAR_PAD,
        y: PAGE_H - cursor - nameSize,
        font: opts.fonts.sans,
        size: nameSize,
        color: COLORS.gray300,
      })
      cursor += nameSize * 1.4
    }
    if (cert.date) {
      const dateSize = 6.5
      const dateText = formatMonth(locale, cert.date, "")
      page.drawText(sanitize(dateText), {
        x: SIDEBAR_PAD,
        y: PAGE_H - cursor - dateSize,
        font: opts.fonts.mono,
        size: dateSize,
        color: COLORS.darkMuted,
      })
      cursor += dateSize + 8
    } else {
      cursor += 4
    }
  }
  return cursor
}

function drawMain(args: {
  page: PDFPage
  fonts: Fonts
  locale: Locale
  strings: CvStrings
  person: Personal
  resume: ResumeEntry[]
  academics: Academic[]
  images: Map<string, PDFImage>
}) {
  const { page, fonts, locale, strings, person, resume, academics, images } = args
  let cursor = MAIN_TOP

  const eyebrowSize = 8
  const eyebrowLetters = sanitize(strings.eyebrow).toUpperCase().split("").join(" ")
  page.drawText(eyebrowLetters, {
    x: MAIN_X,
    y: PAGE_H - cursor - eyebrowSize,
    font: fonts.sansBold,
    size: eyebrowSize,
    color: COLORS.primary,
  })
  cursor += eyebrowSize + 12

  const nameSize = 28
  const nameParts = person.name.split(" ")
  const firstName = nameParts[0] ?? person.name
  const lastName = nameParts.slice(1).join(" ")
  page.drawText(sanitize(firstName), {
    x: MAIN_X,
    y: PAGE_H - cursor - nameSize,
    font: fonts.serifBold,
    size: nameSize,
    color: COLORS.dark,
  })
  cursor += nameSize + 2
  if (lastName) {
    page.drawText(sanitize(lastName), {
      x: MAIN_X,
      y: PAGE_H - cursor - nameSize,
      font: fonts.serifBold,
      size: nameSize,
      color: COLORS.dark,
    })
    cursor += nameSize + 8
  } else {
    cursor += 6
  }

  if (person.job) {
    const jobSize = 12
    page.drawText(sanitize(person.job), {
      x: MAIN_X,
      y: PAGE_H - cursor - jobSize,
      font: fonts.sans,
      size: jobSize,
      color: COLORS.primary,
    })
    cursor += jobSize + 10
  }

  page.drawRectangle({
    x: MAIN_X,
    y: PAGE_H - cursor - 2,
    width: 36,
    height: 2,
    color: COLORS.primary,
  })
  cursor += 14

  if (person.description) {
    const descSize = 9
    const res = drawWrappedText(page, person.description, {
      x: MAIN_X,
      topY: cursor,
      pageH: PAGE_H,
      font: fonts.sansOblique,
      size: descSize,
      color: COLORS.darkSoft,
      maxWidth: MAIN_W,
      lineHeight: descSize * 1.5,
      maxLines: 4,
    })
    cursor = res.bottomY + 18
  }

  if (resume.length > 0) {
    cursor = drawMainSectionHeading(page, strings.experience, { topY: cursor, fonts })
    const sorted = [...resume].sort(
      (a, b) => (b.start?.getTime() ?? 0) - (a.start?.getTime() ?? 0),
    )
    const maxEntries = 5
    const entries = sorted.slice(0, maxEntries)
    for (let i = 0; i < entries.length; i++) {
      cursor = drawResumeEntry({
        page,
        fonts,
        locale,
        strings,
        entry: entries[i],
        topY: cursor,
        images,
        isLast: i === entries.length - 1,
      })
    }
    cursor += 22
  }

  if (academics.length > 0) {
    cursor = drawMainSectionHeading(page, strings.education, { topY: cursor, fonts })
    const sorted = [...academics].sort(
      (a, b) => (b.start?.getTime() ?? 0) - (a.start?.getTime() ?? 0),
    )
    for (let i = 0; i < sorted.length; i++) {
      cursor = drawAcademicEntry({
        page,
        fonts,
        locale,
        strings,
        entry: sorted[i],
        topY: cursor,
        images,
        isLast: i === sorted.length - 1,
      })
    }
  }
}

function drawMainSectionHeading(
  page: PDFPage,
  text: string,
  opts: { topY: number; fonts: Fonts },
): number {
  const size = 12
  const baseline = PAGE_H - opts.topY - size
  page.drawText(sanitize(text), {
    x: MAIN_X,
    y: baseline,
    font: opts.fonts.serifBold,
    size,
    color: COLORS.dark,
  })
  page.drawLine({
    start: { x: MAIN_X, y: baseline - 6 },
    end: { x: MAIN_X + MAIN_W, y: baseline - 6 },
    thickness: 0.4,
    color: COLORS.rule,
  })
  return opts.topY + size + 14
}

function drawResumeEntry(args: {
  page: PDFPage
  fonts: Fonts
  locale: Locale
  strings: CvStrings
  entry: ResumeEntry
  topY: number
  images: Map<string, PDFImage>
  isLast: boolean
}): number {
  const { page, fonts, locale, strings, entry, images, isLast } = args
  const logo = entry.logoUrl ? images.get(entry.logoUrl) : undefined
  const textOffset = LOGO_SIZE + LOGO_GUTTER
  const textX = MAIN_X + textOffset
  const textW = MAIN_W - textOffset
  let cursor = args.topY

  if (logo) {
    drawContainedImage(page, logo, {
      x: MAIN_X,
      topY: cursor + 1,
      w: LOGO_SIZE,
      h: LOGO_SIZE,
      pageH: PAGE_H,
    })
  }

  const dateSize = 7.5
  const dateText = sanitize(
    formatRange(locale, entry.start, entry.end, strings.present),
  )
  const dateW = fonts.mono.widthOfTextAtSize(dateText, dateSize)
  page.drawText(dateText, {
    x: MAIN_X + MAIN_W - dateW,
    y: PAGE_H - cursor - dateSize,
    font: fonts.mono,
    size: dateSize,
    color: COLORS.primary,
  })

  const headerW = textW - dateW - 10
  const roleSize = 10
  const roleLines = wrapText(entry.role, fonts.sansBold, roleSize, headerW)
  for (const line of roleLines) {
    page.drawText(line, {
      x: textX,
      y: PAGE_H - cursor - roleSize,
      font: fonts.sansBold,
      size: roleSize,
      color: COLORS.dark,
    })
    cursor += roleSize * 1.25
  }

  if (entry.company) {
    const compSize = 8.5
    page.drawText(sanitize(entry.company), {
      x: textX,
      y: PAGE_H - cursor - compSize,
      font: fonts.sans,
      size: compSize,
      color: COLORS.primary,
    })
    cursor += compSize + 4
  }

  const bodyX = MAIN_X + textOffset
  const bodyW = MAIN_W - textOffset

  if (entry.description) {
    const descSize = 8.5
    const res = drawWrappedText(page, entry.description, {
      x: bodyX,
      topY: cursor,
      pageH: PAGE_H,
      font: fonts.sans,
      size: descSize,
      color: COLORS.darkSoft,
      maxWidth: bodyW,
      lineHeight: descSize * 1.45,
      maxLines: 2,
    })
    cursor = res.bottomY + 2
  }

  const techs = splitTags(entry.technologies)
  if (techs.length > 0) {
    const techText = techs.slice(0, 10).join("  ·  ")
    const techSize = 7.5
    const res = drawWrappedText(page, techText, {
      x: bodyX,
      topY: cursor + 1,
      pageH: PAGE_H,
      font: fonts.sansBold,
      size: techSize,
      color: COLORS.primary,
      maxWidth: bodyW,
      lineHeight: techSize * 1.5,
      maxLines: 1,
    })
    cursor = res.bottomY
  }

  if (!isLast) cursor += 10
  return cursor
}

function drawAcademicEntry(args: {
  page: PDFPage
  fonts: Fonts
  locale: Locale
  strings: CvStrings
  entry: Academic
  topY: number
  images: Map<string, PDFImage>
  isLast: boolean
}): number {
  const { page, fonts, locale, strings, entry, images, isLast } = args
  const logo = entry.logoUrl ? images.get(entry.logoUrl) : undefined
  const textOffset = LOGO_SIZE + LOGO_GUTTER
  const textX = MAIN_X + textOffset
  const textW = MAIN_W - textOffset
  let cursor = args.topY

  if (logo) {
    drawContainedImage(page, logo, {
      x: MAIN_X,
      topY: cursor + 1,
      w: LOGO_SIZE,
      h: LOGO_SIZE,
      pageH: PAGE_H,
    })
  }

  const dateSize = 7.5
  const dateText = sanitize(
    formatRange(locale, entry.start, entry.end, strings.present),
  )
  const dateW = fonts.mono.widthOfTextAtSize(dateText, dateSize)
  page.drawText(dateText, {
    x: MAIN_X + MAIN_W - dateW,
    y: PAGE_H - cursor - dateSize,
    font: fonts.mono,
    size: dateSize,
    color: COLORS.primary,
  })

  const headerW = textW - dateW - 10
  const degreeSize = 10
  const degreeLines = wrapText(entry.degree, fonts.sansBold, degreeSize, headerW)
  for (const line of degreeLines) {
    page.drawText(line, {
      x: textX,
      y: PAGE_H - cursor - degreeSize,
      font: fonts.sansBold,
      size: degreeSize,
      color: COLORS.dark,
    })
    cursor += degreeSize * 1.25
  }

  if (entry.university) {
    const uniSize = 8.5
    const text = entry.grade
      ? `${entry.university}  ·  ${strings.grade}: ${entry.grade.toFixed(1)}`
      : entry.university
    page.drawText(sanitize(text), {
      x: textX,
      y: PAGE_H - cursor - uniSize,
      font: fonts.sans,
      size: uniSize,
      color: COLORS.primary,
    })
    cursor += uniSize + 4
  }

  if (entry.description) {
    const descSize = 8.5
    const res = drawWrappedText(page, entry.description, {
      x: textX,
      topY: cursor,
      pageH: PAGE_H,
      font: fonts.sans,
      size: descSize,
      color: COLORS.darkSoft,
      maxWidth: textW,
      lineHeight: descSize * 1.45,
      maxLines: 2,
    })
    cursor = res.bottomY + 2
  }

  if (!isLast) cursor += 12
  return cursor
}

function drawFooter(
  page: PDFPage,
  fonts: Fonts,
  locale: Locale,
  strings: CvStrings,
) {
  const size = 7
  const dateText = new Date().toLocaleDateString(
    locale === "en" ? "en-US" : "de-DE",
    { day: "2-digit", month: "long", year: "numeric" },
  )
  const text = sanitize(`${strings.footer} ${dateText}`)
  const tw = fonts.mono.widthOfTextAtSize(text, size)
  page.drawText(text, {
    x: PAGE_W - MAIN_RIGHT - tw,
    y: 26,
    font: fonts.mono,
    size,
    color: COLORS.darkMuted,
  })
}
