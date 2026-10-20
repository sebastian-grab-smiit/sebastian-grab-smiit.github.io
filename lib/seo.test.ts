import { describe, expect, it } from "vitest"
import { academics, certificates, languages, person, resume, skills } from "@/test/fixtures"
import { buildPageMetadata, buildPersonJsonLd, SITE_URL } from "./seo"

describe("buildPersonJsonLd", () => {
  const jsonLd = buildPersonJsonLd({
    lang: "de",
    person,
    academics,
    certificates,
    skills,
    resume,
    languages,
  })

  it("describes the person with absolute URLs", () => {
    expect(jsonLd).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Erika Mustermann",
      jobTitle: "Software Engineer",
      url: `${SITE_URL}/de/`,
      image: `${SITE_URL}/assets/erika.webp`,
    })
  })

  it("lists degrees and certificates as credentials", () => {
    expect(jsonLd.hasCredential).toEqual([
      expect.objectContaining({
        credentialCategory: "degree",
        name: "B.Sc. Informatik",
        dateCreated: "2021-09-30",
      }),
      expect.objectContaining({
        credentialCategory: "certificate",
        name: "Professional Scrum Master I",
      }),
    ])
  })

  it("deduplicates skills and marks ongoing occupations", () => {
    expect(jsonLd.knowsAbout).toEqual(["TypeScript", "SQL"])
    expect(jsonLd.hasOccupation).toEqual([
      {
        "@type": "Occupation",
        name: "Gründerin",
        description: "Beispiel GmbH (2021-05-01 – heute)",
      },
    ])
  })

  it("still produces a valid person without sheet data", () => {
    const empty = buildPersonJsonLd({
      lang: "en",
      person: undefined,
      academics: [],
      certificates: [],
      skills: [],
      resume: [],
      languages: [],
    })
    expect(empty.name).toBeTruthy()
    expect(empty).not.toHaveProperty("hasCredential")
  })
})

describe("buildPageMetadata", () => {
  it("sets canonical and hreflang alternates", () => {
    const meta = buildPageMetadata({
      lang: "en",
      title: { de: "Titel", en: "Title" },
      description: { de: "Beschreibung", en: "Description" },
    })
    expect(meta.title).toBe("Title")
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/en`)
    expect(meta.alternates?.languages).toMatchObject({ "x-default": `${SITE_URL}/de/` })
  })
})
