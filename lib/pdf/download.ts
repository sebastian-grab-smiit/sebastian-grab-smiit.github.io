import type {
  Personal,
  ResumeEntry,
  Academic,
  Skill,
  LanguageSkill,
  Certificate,
  Project,
} from "@/lib/sheet"
import type { Locale } from "@/lib/dictionary"

export interface DownloadBundleInput {
  locale: Locale
  person: Personal
  resume: ResumeEntry[]
  academics: Academic[]
  skills: Skill[]
  languages: LanguageSkill[]
  certificates: Certificate[]
  projects: Project[]
}

function slugifyName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

function fileNames(locale: Locale, person: Personal) {
  const slug = slugifyName(person.name) || "cv"
  if (locale === "en") {
    return {
      zip: `${slug}-CV.zip`,
      cv: `${slug}-CV.pdf`,
      projects: `${slug}-Projects.pdf`,
    }
  }
  return {
    zip: `${slug}-Lebenslauf.zip`,
    cv: `${slug}-Lebenslauf.pdf`,
    projects: `${slug}-Projektliste.pdf`,
  }
}

export async function generateAndDownloadCvBundle(
  input: DownloadBundleInput,
  onProgress?: (pct: number) => void,
): Promise<void> {
  onProgress?.(2)
  const [{ buildCvPdf }, { buildProjectsPdf }, JSZipModule] = await Promise.all([
    import("./cv-pdf"),
    import("./projects-pdf"),
    import("jszip"),
  ])
  const JSZip = JSZipModule.default
  onProgress?.(5)

  const names = fileNames(input.locale, input.person)

  let cvP = 0
  let prP = 0
  const reportBuild = () => {
    // CV is ~25% of PDF work, projects ~75% (more logos)
    const weighted = cvP * 0.25 + prP * 0.75
    onProgress?.(5 + weighted * 88)
  }

  const [cvBytes, projectsBytes] = await Promise.all([
    buildCvPdf({
      locale: input.locale,
      person: input.person,
      resume: input.resume,
      academics: input.academics,
      skills: input.skills,
      languages: input.languages,
      certificates: input.certificates,
      onProgress: (p) => {
        cvP = p
        reportBuild()
      },
    }),
    buildProjectsPdf({
      locale: input.locale,
      person: input.person,
      projects: input.projects,
      onProgress: (p) => {
        prP = p
        reportBuild()
      },
    }),
  ])

  onProgress?.(94)
  const zip = new JSZip()
  zip.file(names.cv, cvBytes)
  zip.file(names.projects, projectsBytes)
  const blob = await zip.generateAsync({ type: "blob" })
  onProgress?.(99)
  triggerBrowserDownload(blob, names.zip)
  onProgress?.(100)
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
