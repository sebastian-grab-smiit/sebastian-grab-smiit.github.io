import type { Metadata } from "next"
import { getDictionary, type Locale } from "@/lib/dictionary"
import { fetchCv, localeToSheetLang, selectLanguage } from "@/lib/sheet"
import { buildPageMetadata, buildPersonJsonLd, DEFAULT_COPY, SITE_NAME } from "@/lib/seo"
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
      de: `${SITE_NAME} – Lebenslauf und Projekte`,
      en: `${SITE_NAME} – CV and Projects`,
    },
    description: DEFAULT_COPY.description,
  })
}

export default async function Page({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const dict = getDictionary(lang)
  const { person, languages, academics, resume, skills, projects, certificates } = selectLanguage(
    await fetchCv(),
    localeToSheetLang(lang),
  )

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
