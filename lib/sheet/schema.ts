import { z } from "zod"

/**
 * Column layout of every tab in the Google Sheet.
 *
 * The order of the entries is the order of the columns in the sheet, and `header`
 * is the exact header text in row 1. The parser verifies the header row against
 * this list, so a moved, renamed or inserted column fails the build with a precise
 * message instead of silently shifting data into the wrong fields.
 */

const lang = z.enum(["DE", "EN"], { error: 'expected "DE" or "EN"' })

const text = z.string()

const requiredText = z.string().min(1, { error: "must not be empty" })

/** `YYYY-MM-DD` → Date at UTC midnight; empty cell → null. */
const isoDate = z
  .string()
  .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), {
    error: "expected a date in the format YYYY-MM-DD",
  })
  .transform((v) => (v === "" ? null : new Date(`${v}T00:00:00Z`)))
  .refine((d) => d === null || !Number.isNaN(d.getTime()), { error: "invalid date" })

/** Accepts `1.5` and `1,5`; empty cell → null. */
const optionalNumber = z
  .string()
  .transform((v) => (v === "" ? null : Number(v.replace(",", "."))))
  .refine((n) => n === null || Number.isFinite(n), { error: "expected a number" })

const level = z
  .string()
  .transform((v) => Number(v.replace(",", ".")))
  .pipe(
    z
      .number({ error: "expected a number" })
      .min(0, { error: "must be between 0 and 100" })
      .max(100, { error: "must be between 0 and 100" }),
  )

/** Absolute http(s) URL, site-relative path (`/assets/…`) or empty. */
const imageUrl = z.string().refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), {
  error: "expected an http(s) URL or a path starting with /",
})

const optionalUrl = z
  .string()
  .refine((v) => v === "" || /^https?:\/\//.test(v), { error: "expected an http(s) URL" })

export type Column = {
  header: string
  schema: z.ZodType
  /** Optional columns may be missing entirely, but only at the end of the sheet. */
  optional?: boolean
}

export type SheetSpec = Record<string, Column>

export const sheets = {
  personal: {
    language: { header: "Sprache", schema: lang },
    name: { header: "Name", schema: requiredText },
    job: { header: "Berufsbeschreibung", schema: text },
    description: { header: "Beschreibung", schema: text },
    address: { header: "Adresse", schema: text },
    nationality: { header: "Nationalität", schema: text },
    email: { header: "Mail", schema: text },
    phone: { header: "Telefon", schema: text },
    linkedInUrl: { header: "LinkedId", schema: optionalUrl },
    imageUrl: { header: "Image URL", schema: imageUrl },
  },
  certificates: {
    language: { header: "Sprache", schema: lang },
    certificateName: { header: "Name", schema: requiredText },
    date: { header: "Datum", schema: isoDate },
    logoUrl: { header: "Logo URL", schema: imageUrl },
  },
  languages: {
    language: { header: "Sprache", schema: lang },
    languageName: { header: "Sprache", schema: requiredText },
    level: { header: "Level", schema: text },
    iconUrl: { header: "IconUrl", schema: imageUrl },
  },
  academics: {
    language: { header: "Sprache", schema: lang },
    start: { header: "Startdatum", schema: isoDate },
    end: { header: "Enddatum", schema: isoDate },
    university: { header: "Hochschule", schema: text },
    logoUrl: { header: "Logo Url", schema: imageUrl },
    degree: { header: "Abschluss", schema: text },
    description: { header: "Beschreibung", schema: text },
    grade: { header: "Note", schema: optionalNumber },
  },
  skills: {
    language: { header: "Sprache", schema: lang },
    category: { header: "Group", schema: requiredText },
    name: { header: "Skill", schema: requiredText },
    level: { header: "Level (0-100)", schema: level },
  },
  resume: {
    language: { header: "Sprache", schema: lang },
    start: { header: "Startdatum", schema: isoDate },
    end: { header: "Enddatum", schema: isoDate },
    company: { header: "Unternehmen", schema: text },
    address: { header: "Adresse", schema: text },
    logoUrl: { header: "Logo Url", schema: imageUrl },
    role: { header: "Rolle", schema: text },
    description: { header: "Beschreibung", schema: text },
    tasks: { header: "Aufgaben", schema: text },
    technologies: { header: "Technologien", schema: text, optional: true },
  },
  projects: {
    language: { header: "Sprache", schema: lang },
    role: { header: "Rolle", schema: text },
    description: { header: "Beschreibung", schema: text },
    customer: { header: "Kunde", schema: text },
    address: { header: "Adresse", schema: text },
    logoUrl: { header: "Logo Url", schema: imageUrl },
    start: { header: "Start", schema: isoDate },
    end: { header: "Ende", schema: isoDate },
    technologies: { header: "Technologien", schema: text },
    sections: { header: "Bereiche", schema: text },
  },
} as const satisfies Record<string, SheetSpec>

export type SheetName = keyof typeof sheets

/** The parsed row type of a sheet, derived from its column schemas. */
export type RowOf<S extends SheetSpec> = {
  [K in keyof S]: z.output<S[K]["schema"]>
}
