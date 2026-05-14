import type { Metadata } from "next"
import type { Locale } from "./dictionary"
import type {
  Academic,
  Certificate,
  LanguageSkill,
  Personal,
  ResumeEntry,
  Skill,
} from "./sheet"

export const SITE_NAME = "Sebastian Grab"
export const SITE_URL = "https://grab.smiit.de"

type LocalizedString = { de: string; en: string }

export function buildPageMetadata({
  lang,
  title,
  description,
  path = "/",
}: {
  lang: Locale
  title: LocalizedString
  description: LocalizedString
  path?: string
}): Metadata {
  const t = title[lang]
  const d = description[lang]
  const url = `${SITE_URL}/${lang}${path === "/" ? "" : path}`

  return {
    metadataBase: new URL(SITE_URL),
    title: t,
    description: d,
    alternates: {
      canonical: url,
      languages: {
        de: `${SITE_URL}/de/`,
        en: `${SITE_URL}/en/`,
        "x-default": `${SITE_URL}/de/`,
      },
    },
    openGraph: {
      title: t,
      description: d,
      url,
      siteName: SITE_NAME,
      locale: lang === "de" ? "de_DE" : "en_US",
      type: "profile",
      images: [
        {
          url: "/og-image.webp",
          width: 1920,
          height: 999,
          alt: SITE_NAME,
        },
        {
          url: "/og-image.png",
          width: 1920,
          height: 999,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t,
      description: d,
      images: ["/og-image.webp", "/og-image.png"],
    },
  }
}

function toAbsoluteUrl(url: string): string {
  if (!url) return ""
  if (url.startsWith("http")) return url
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`
}

function isoDate(date: Date | null): string | undefined {
  return date ? date.toISOString().slice(0, 10) : undefined
}

export function buildPersonJsonLd({
  lang,
  person,
  academics,
  certificates,
  skills,
  resume,
  languages,
}: {
  lang: Locale
  person: Personal | undefined
  academics: Academic[]
  certificates: Certificate[]
  skills: Skill[]
  resume: ResumeEntry[]
  languages: LanguageSkill[]
}): Record<string, unknown> {
  const pageUrl = `${SITE_URL}/${lang}/`

  const alumniOf = academics
    .filter((a) => a.university)
    .map((a) => ({
      "@type": "EducationalOrganization",
      name: a.university,
    }))

  const degreeCredentials = academics
    .filter((a) => a.degree)
    .map((a) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "degree",
      name: a.degree,
      ...(a.university
        ? {
            recognizedBy: {
              "@type": "EducationalOrganization",
              name: a.university,
            },
          }
        : {}),
      ...(isoDate(a.end) ? { dateCreated: isoDate(a.end) } : {}),
    }))

  const certCredentials = certificates
    .filter((c) => c.certificateName)
    .map((c) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certificate",
      name: c.certificateName,
      ...(isoDate(c.date) ? { dateCreated: isoDate(c.date) } : {}),
    }))

  const hasCredential = [...degreeCredentials, ...certCredentials]

  const knowsAbout = Array.from(
    new Set(skills.map((s) => s.name).filter(Boolean)),
  )

  const knowsLanguage = languages
    .filter((l) => l.languageName)
    .map((l) => ({ "@type": "Language", name: l.languageName }))

  const presentLabel = lang === "de" ? "heute" : "present"
  const hasOccupation = resume
    .filter((r) => r.role)
    .map((r) => {
      const period = [isoDate(r.start), isoDate(r.end) ?? presentLabel]
        .filter(Boolean)
        .join(" – ")
      return {
        "@type": "Occupation",
        name: r.role,
        ...(r.company
          ? {
              description: period
                ? `${r.company} (${period})`
                : r.company,
            }
          : {}),
      }
    })

  const sameAs = [person?.linkedInUrl, "https://www.smiit.de"].filter(Boolean)

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: person?.name || SITE_NAME,
    jobTitle: person?.job || "Co-Founder & Software Engineer",
    ...(person?.description ? { description: person.description } : {}),
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    ...(person?.imageUrl ? { image: toAbsoluteUrl(person.imageUrl) } : {}),
    ...(person?.email ? { email: person.email } : {}),
    ...(person?.phone ? { telephone: person.phone } : {}),
    ...(person?.address ? { address: person.address } : {}),
    ...(person?.nationality ? { nationality: person.nationality } : {}),
    worksFor: {
      "@type": "Organization",
      name: "smiit GmbH",
      url: "https://www.smiit.de",
    },
    ...(alumniOf.length ? { alumniOf } : {}),
    ...(hasCredential.length ? { hasCredential } : {}),
    ...(knowsAbout.length ? { knowsAbout } : {}),
    ...(knowsLanguage.length ? { knowsLanguage } : {}),
    ...(hasOccupation.length ? { hasOccupation } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }
}
