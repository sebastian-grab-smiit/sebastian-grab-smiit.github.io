import type {
  Academic,
  Certificate,
  LanguageSkill,
  Personal,
  Project,
  ResumeEntry,
  Skill,
} from "@/lib/sheet"

const date = (iso: string) => new Date(`${iso}T00:00:00Z`)

export const person: Personal = {
  language: "DE",
  name: "Erika Mustermann",
  job: "Software Engineer",
  description: "Baut Datenprodukte.",
  address: "Musterstraße 1, 12345 Musterstadt",
  nationality: "Deutsch",
  email: "erika@example.com",
  phone: "+49 123 456789",
  linkedInUrl: "https://www.linkedin.com/in/erika",
  imageUrl: "/assets/erika.webp",
}

export const resume: ResumeEntry[] = [
  {
    language: "DE",
    start: date("2021-05-01"),
    end: null,
    company: "Beispiel GmbH",
    address: "Musterstadt",
    logoUrl: "",
    role: "Gründerin",
    description: "Leitung der Softwareentwicklung.",
    tasks: "• Architektur • Teamaufbau",
    technologies: "TypeScript;Next.js",
  },
]

export const academics: Academic[] = [
  {
    language: "DE",
    start: date("2018-10-01"),
    end: date("2021-09-30"),
    university: "Hochschule Musterstadt",
    logoUrl: "",
    degree: "B.Sc. Informatik",
    description: "Thesis über Datenqualität.",
    grade: 1.3,
  },
]

export const skills: Skill[] = [
  { language: "DE", category: "Coding", name: "TypeScript", level: 90 },
  { language: "DE", category: "Coding", name: "SQL", level: 80 },
]

export const languages: LanguageSkill[] = [
  { language: "DE", languageName: "Deutsch", level: "C2", iconUrl: "" },
]

export const certificates: Certificate[] = [
  {
    language: "DE",
    certificateName: "Professional Scrum Master I",
    date: date("2022-04-01"),
    logoUrl: "",
  },
]

export const projects: Project[] = Array.from({ length: 12 }, (_, i) => ({
  language: "DE" as const,
  role: `Entwicklerin ${i + 1}`,
  description: "• Konzeption einer Datenplattform • Umsetzung von Dashboards → schneller",
  customer: `Kunde ${i + 1}`,
  address: "Musterstadt",
  logoUrl: "",
  start: date("2022-01-01"),
  end: i % 2 === 0 ? date("2022-07-01") : null,
  technologies: "Power BI;Azure;Python",
  sections: "Gesundheitswesen",
}))
