import { localImage } from "./images"
import { parseSheet, SheetValidationError } from "./parse"
import { sheets, type RowOf, type SheetName } from "./schema"

export { SheetValidationError }

export type SheetLang = "DE" | "EN"
export type Personal = RowOf<typeof sheets.personal>
export type Certificate = RowOf<typeof sheets.certificates>
export type LanguageSkill = RowOf<typeof sheets.languages>
export type Academic = RowOf<typeof sheets.academics>
export type Skill = RowOf<typeof sheets.skills>
export type ResumeEntry = RowOf<typeof sheets.resume>
export type Project = RowOf<typeof sheets.projects>

export type CvData = {
  personal: Personal[]
  certificates: Certificate[]
  languages: LanguageSkill[]
  academics: Academic[]
  skills: Skill[]
  resume: ResumeEntry[]
  projects: Project[]
}

const GID_ENV: Record<SheetName, string> = {
  personal: "NEXT_PUBLIC_GOOGLE_SHEET_PERSONAL_GID",
  certificates: "NEXT_PUBLIC_GOOGLE_SHEET_CERTIFICATES_GID",
  languages: "NEXT_PUBLIC_GOOGLE_SHEET_LANGUAGES_GID",
  academics: "NEXT_PUBLIC_GOOGLE_SHEET_ACADEMICS_GID",
  skills: "NEXT_PUBLIC_GOOGLE_SHEET_SKILLS_GID",
  resume: "NEXT_PUBLIC_GOOGLE_SHEET_RESUME_GID",
  projects: "NEXT_PUBLIC_GOOGLE_SHEET_PROJECTS_GID",
}

const MAX_ATTEMPTS = 3

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing environment variable ${name} (see .env.example)`)
  return value
}

async function fetchCsv(sheet: SheetName): Promise<string> {
  const sheetId = requireEnv("NEXT_PUBLIC_GOOGLE_SHEET_ID")
  const gid = requireEnv(GID_ENV[sheet])
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`

  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url)
      if (res.ok) return await res.text()
      lastError = new Error(`HTTP ${res.status}`)
      // 4xx means wrong id/gid or missing sharing permission; retrying will not help.
      if (res.status < 500) break
    } catch (err) {
      lastError = err
    }
    if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 500 * 2 ** attempt))
  }
  throw new Error(`Could not fetch sheet "${sheet}" (gid ${gid}): ${String(lastError)}`, {
    cause: lastError,
  })
}

async function loadSheet<N extends SheetName>(name: N): Promise<RowOf<(typeof sheets)[N]>[]> {
  return parseSheet(name, sheets[name], await fetchCsv(name))
}

/**
 * Loads and validates all CV data from the Google Sheet.
 *
 * Runs at build time only (static export). Any validation error aborts the build,
 * so the previously deployed version stays online until the sheet is fixed.
 * With `localImages`, logo URLs point to the optimized local copies.
 */
export async function fetchCv({ localImages = true } = {}): Promise<CvData> {
  const results = await Promise.allSettled([
    loadSheet("personal"),
    loadSheet("certificates"),
    loadSheet("languages"),
    loadSheet("academics"),
    loadSheet("skills"),
    loadSheet("resume"),
    loadSheet("projects"),
  ])

  const failures = results.filter((r) => r.status === "rejected")
  if (failures.length > 0) {
    const messages = failures.map((f) =>
      f.reason instanceof Error ? f.reason.message : String(f.reason),
    )
    throw new Error(`Loading CV data failed:\n\n${messages.join("\n\n")}`)
  }

  const [personal, certificates, languages, academics, skills, resume, projects] = results.map(
    (r) => (r as PromiseFulfilledResult<unknown>).value,
  ) as [Personal[], Certificate[], LanguageSkill[], Academic[], Skill[], ResumeEntry[], Project[]]

  const data = { personal, certificates, languages, academics, skills, resume, projects }
  return localImages ? withLocalLogos(data) : data
}

/** Points logo URLs to the copies downloaded by scripts/fetch-images.ts, where available. */
function withLocalLogos(data: CvData): CvData {
  const local = <T extends { logoUrl: string }>(rows: T[]) =>
    rows.map((row) => ({ ...row, logoUrl: localImage(row.logoUrl) }))
  return {
    ...data,
    certificates: local(data.certificates),
    academics: local(data.academics),
    resume: local(data.resume),
    projects: local(data.projects),
  }
}

export function localeToSheetLang(locale: "de" | "en"): SheetLang {
  return locale === "en" ? "EN" : "DE"
}

/** Restricts every list to the rows of one language. */
export function selectLanguage(data: CvData, lang: SheetLang) {
  const pick = <T extends { language: SheetLang }>(rows: T[]) =>
    rows.filter((r) => r.language === lang)
  return {
    person: data.personal.find((p) => p.language === lang),
    certificates: pick(data.certificates),
    languages: pick(data.languages),
    academics: pick(data.academics),
    skills: pick(data.skills),
    resume: pick(data.resume),
    projects: pick(data.projects),
  }
}
