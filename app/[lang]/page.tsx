import type { Metadata } from "next"
import { getDictionary, type Locale } from "@/lib/dictionary"
import { fetchCv, localeToSheetLang } from "@/lib/sheet"
import { buildPageMetadata, buildPersonJsonLd } from "@/lib/seo"
import Hero from "@/components/page/hero"
import Focus from "@/components/page/focus"
import Experience from "@/components/page/experience"
import Skills from "@/components/page/skills"
import Projects from "@/components/page/projects"
import Certificates from "@/components/page/certificates"

export async function generateStaticParams() {
  return [{ lang: "de" }, { lang: "en" }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>
}): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata({
    lang,
    title: {
      de: "Sebastian Grab – Lebenslauf und Projekte",
      en: "Sebastian Grab – CV and Projects",
    },
    description: {
      de: "Lebenslauf von Sebastian Grab: Werdegang, Projekte, Kenntnisse und Zertifikate.",
      en: "Sebastian Grab's CV: experience, projects, skills, and certificates.",
    },
  })
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = getDictionary(lang)
  const sheetLang = localeToSheetLang(lang)
  const data = await fetchCv()

  const person = data.personal.find((p) => p.language === sheetLang)
  const languages = data.languages.filter((l) => l.language === sheetLang)
  const academics = data.academics.filter((a) => a.language === sheetLang)
  const resume = data.resume.filter((r) => r.language === sheetLang)
  const skills = data.skills.filter((s) => s.language === sheetLang)
  const projects = data.projects.filter((p) => p.language === sheetLang)
  const certificates = data.certificates.filter((c) => c.language === sheetLang)

  const personJsonLd = buildPersonJsonLd({
    lang,
    person,
    academics,
    certificates,
    skills,
    resume,
    languages,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <main>
        <Hero
          person={person}
          languages={languages}
          resume={resume}
          academics={academics}
          skills={skills}
          certificates={certificates}
          projects={projects}
          dict={dict}
          locale={lang}
        />
        <Focus dict={dict} locale={lang} />
        <Skills skills={skills} dict={dict} />
        <Experience resume={resume} academics={academics} locale={lang} dict={dict} />
        <Certificates certificates={certificates} locale={lang} dict={dict} />
        <Projects projects={projects} locale={lang} dict={dict} />
      </main>
    </>
  )
}
