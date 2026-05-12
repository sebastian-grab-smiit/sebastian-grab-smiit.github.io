import Papa from "papaparse"

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID
const GID = {
  personal: process.env.NEXT_PUBLIC_GOOGLE_SHEET_PERSONAL_GID,
  certificates: process.env.NEXT_PUBLIC_GOOGLE_SHEET_CERTIFICATES_GID,
  languages: process.env.NEXT_PUBLIC_GOOGLE_SHEET_LANGUAGES_GID,
  academics: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ACADEMICS_GID,
  skills: process.env.NEXT_PUBLIC_GOOGLE_SHEET_SKILLS_GID,
  resume: process.env.NEXT_PUBLIC_GOOGLE_SHEET_RESUME_GID,
  projects: process.env.NEXT_PUBLIC_GOOGLE_SHEET_PROJECTS_GID,
} as const

export type SheetLang = "DE" | "EN"

export type Personal = {
  language: SheetLang
  name: string
  job: string
  description: string
  address: string
  nationality: string
  email: string
  phone: string
  linkedInUrl: string
  imageUrl: string
}

export type Certificate = {
  language: SheetLang
  certificateName: string
  date: Date | null
  logoUrl: string
}

export type LanguageSkill = {
  language: SheetLang
  languageName: string
  level: string
  iconUrl: string
}

export type Academic = {
  language: SheetLang
  start: Date | null
  end: Date | null
  university: string
  logoUrl: string
  degree: string
  description: string
  grade: number | null
}

export type Skill = {
  language: SheetLang
  category: string
  name: string
  level: number
}

export type ResumeEntry = {
  language: SheetLang
  start: Date | null
  end: Date | null
  company: string
  address: string
  logoUrl: string
  role: string
  description: string
  tasks: string
  technologies: string
}

export type Project = {
  language: SheetLang
  role: string
  description: string
  customer: string
  address: string
  logoUrl: string
  start: Date | null
  end: Date | null
  technologies: string
  sections: string
}

export type CvData = {
  personal: Personal[]
  certificates: Certificate[]
  languages: LanguageSkill[]
  academics: Academic[]
  skills: Skill[]
  resume: ResumeEntry[]
  projects: Project[]
}

function clean(cell: unknown): string {
  if (typeof cell !== "string") return ""
  return cell.replace(/^"+|"+$/g, "").replace(/\r/g, "").trim()
}

function parseDate(value: string): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function parseFloatOrNull(value: string): number | null {
  if (!value) return null
  const n = Number.parseFloat(value.replace(",", "."))
  return Number.isNaN(n) ? null : n
}

async function fetchCsv(gid: string | undefined): Promise<string[][]> {
  if (!SHEET_ID) throw new Error("Missing env NEXT_PUBLIC_GOOGLE_SHEET_ID")
  if (!gid) throw new Error("Missing GID for sheet")

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`
  const res = await fetch(url, { next: { revalidate: 600 } })
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`)
  const text = await res.text()
  const { data } = Papa.parse<string[]>(text, { skipEmptyLines: true })
  return data.map((row) => row.map(clean))
}

async function fetchPersonal(): Promise<Personal[]> {
  const rows = await fetchCsv(GID.personal)
  return rows.slice(1).map((r) => ({
    language: r[0] as SheetLang,
    name: r[1],
    job: r[2],
    description: r[3],
    address: r[4],
    nationality: r[5],
    email: r[6],
    phone: r[7],
    linkedInUrl: r[8],
    imageUrl: r[9],
  }))
}

async function fetchCertificates(): Promise<Certificate[]> {
  const rows = await fetchCsv(GID.certificates)
  return rows.slice(1).map((r) => ({
    language: r[0] as SheetLang,
    certificateName: r[1],
    date: parseDate(r[2]),
    logoUrl: r[3],
  }))
}

async function fetchLanguages(): Promise<LanguageSkill[]> {
  const rows = await fetchCsv(GID.languages)
  return rows.slice(1).map((r) => ({
    language: r[0] as SheetLang,
    languageName: r[1],
    level: r[2],
    iconUrl: r[3],
  }))
}

async function fetchAcademics(): Promise<Academic[]> {
  const rows = await fetchCsv(GID.academics)
  return rows.slice(1).map((r) => ({
    language: r[0] as SheetLang,
    start: parseDate(r[1]),
    end: parseDate(r[2]),
    university: r[3],
    logoUrl: r[4],
    degree: r[5],
    description: r[6],
    grade: parseFloatOrNull(r[7]),
  }))
}

async function fetchSkills(): Promise<Skill[]> {
  const rows = await fetchCsv(GID.skills)
  return rows.slice(1).map((r) => ({
    language: r[0] as SheetLang,
    category: r[1],
    name: r[2],
    level: parseFloatOrNull(r[3]) ?? 0,
  }))
}

async function fetchResume(): Promise<ResumeEntry[]> {
  const rows = await fetchCsv(GID.resume)
  return rows.slice(1).map((r) => ({
    language: r[0] as SheetLang,
    start: parseDate(r[1]),
    end: parseDate(r[2]),
    company: r[3],
    address: r[4],
    logoUrl: r[5],
    role: r[6],
    description: r[7],
    tasks: r[8],
    technologies: r[9] ?? "",
  }))
}

async function fetchProjects(): Promise<Project[]> {
  const rows = await fetchCsv(GID.projects)
  return rows.slice(1).map((r) => ({
    language: r[0] as SheetLang,
    role: r[1],
    description: r[2],
    customer: r[3],
    address: r[4],
    logoUrl: r[5],
    start: parseDate(r[6]),
    end: parseDate(r[7]),
    technologies: r[8],
    sections: r[9],
  }))
}

export async function fetchCv(): Promise<CvData> {
  const [personal, certificates, languages, academics, skills, resume, projects] =
    await Promise.all([
      fetchPersonal(),
      fetchCertificates(),
      fetchLanguages(),
      fetchAcademics(),
      fetchSkills(),
      fetchResume(),
      fetchProjects(),
    ])
  return { personal, certificates, languages, academics, skills, resume, projects }
}

export function localeToSheetLang(locale: "de" | "en"): SheetLang {
  return locale === "en" ? "EN" : "DE"
}
