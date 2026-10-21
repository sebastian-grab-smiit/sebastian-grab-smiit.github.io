"use client"

import Image from "next/image"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { CvDownloadButton } from "@/components/page/cv-download-button"
import type {
  Personal,
  LanguageSkill,
  ResumeEntry,
  Academic,
  Skill,
  Certificate,
  Project,
} from "@/lib/sheet"
import type { Dictionary, Locale } from "@/lib/dictionary"
import { siteConfig } from "@/site.config"

/** The `3xl` breakpoint (81.25rem) from app/globals.css. */
const HERO_DESKTOP_MIN_PX = 1300

interface HeroProps {
  person: Personal | undefined
  languages: LanguageSkill[]
  resume: ResumeEntry[]
  academics: Academic[]
  skills: Skill[]
  certificates: Certificate[]
  projects: Project[]
  dict: Dictionary
  locale: Locale
}

export default function Hero({
  person,
  languages,
  resume,
  academics,
  skills,
  certificates,
  projects,
  dict,
  locale,
}: HeroProps) {
  if (!person) return null

  const eyebrow = `${dict.hero.eyebrowPrefix} ${person.name}`.toUpperCase()

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden bg-background pt-16 sm:pt-24 md:pt-28 pb-10 md:pb-14"
    >
      {/* Only the hero image for the current breakpoint is fetched: both <Image>s are lazy (hidden
          ones are never loaded) and the visible one is preloaded with high priority. */}
      <link
        rel="preload"
        as="image"
        href="/assets/hero.webp"
        media={`(min-width: ${HERO_DESKTOP_MIN_PX}px)`}
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/assets/hero_mobile.webp"
        media={`(max-width: ${HERO_DESKTOP_MIN_PX - 0.02}px)`}
        fetchPriority="high"
      />

      {/* Desktop hero image (3xl and up): positioned absolute on right (right 50% of file has content) */}
      <div className="hidden 3xl:block pointer-events-none absolute top-0 inset-x-0 mx-auto max-w-[calc(1400px+16rem)] h-[52rem] z-0">
        <Image
          src="/assets/hero.webp"
          alt=""
          fill
          loading="lazy"
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-contain object-right-top"
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid 3xl:grid-cols-2 gap-6 3xl:gap-16 items-start 3xl:min-h-[52rem] pt-6">
          <div className="max-w-[640px] sm:mx-auto sm:text-center 3xl:mx-0 3xl:text-left">
            <span className="inline-flex items-center gap-2 text-caption font-semibold tracking-[0.22em] uppercase text-brand mb-5 sm:mb-8 md:mb-10">
              <span
                aria-hidden="true"
                className="inline-block h-px w-7 bg-gradient-to-r from-transparent to-brand"
              />
              {eyebrow}
              <span
                aria-hidden="true"
                className="hidden sm:inline-block 3xl:hidden h-px w-7 bg-gradient-to-l from-transparent to-brand"
              />
            </span>

            <h1 className="font-serif text-h1 text-ink tracking-tight">
              <span className="block">{dict.hero.titleLine1}</span>
              <span className="block">
                {dict.hero.titleLine2Pre}
                <span className="text-brand inline-block relative isolate z-0 mx-1.5 sm:mx-2">
                  {dict.hero.titleHighlight}
                  {dict.hero.titleLine2Post}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute w-full h-2 sm:h-3 -bottom-0.5 sm:-bottom-1 left-0 text-brand/45 z-[-1]"
                  >
                    <path
                      d="M0 5 Q 50 10 100 5"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>
              </span>
              <span className="block">{dict.hero.titleLine3}</span>
            </h1>

            {person.description && (
              <p className="mt-5 sm:mt-6 md:mt-7 text-small sm:text-lead text-ink/70 max-w-[52ch] sm:mx-auto 3xl:mx-0 whitespace-pre-line">
                {person.description}
              </p>
            )}

            <div className="mt-6 sm:mt-8 md:mt-10 flex flex-wrap sm:justify-center 3xl:justify-start gap-2 sm:gap-3">
              <a
                href={`mailto:${person.email || siteConfig.email}`}
                className="group flex items-center gap-2 sm:gap-2.5 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl font-medium text-caption sm:text-small transition-colors duration-300 cursor-pointer shadow-[0_14px_28px_rgba(33,86,156,0.18)]"
              >
                <span className="sm:hidden">{dict.hero.ctaEmailShort}</span>
                <span className="hidden sm:inline">{dict.hero.ctaEmail}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <CvDownloadButton
                label={
                  <>
                    <span className="sm:hidden">{dict.hero.ctaDownloadShort}</span>
                    <span className="hidden sm:inline">{dict.hero.ctaDownload}</span>
                  </>
                }
                locale={locale}
                person={person}
                resume={resume}
                academics={academics}
                skills={skills}
                languages={languages}
                certificates={certificates}
                projects={projects}
              />
            </div>

            <div className="mt-6 sm:mt-8 md:mt-12 flex flex-wrap sm:justify-center 3xl:justify-start gap-x-5 sm:gap-x-6 gap-y-2 text-caption sm:text-small text-ink/60">
              <Stat label={dict.hero.statYears} />
              <Stat label={dict.hero.statProjects} />
              <Stat label={dict.hero.statRegion} />
            </div>
          </div>

          <div aria-hidden="true" className="hidden 3xl:block" />
        </div>

        {/* Hero image in flow below text, below 3xl. The file is pre-cropped to the container's aspect ratio. */}
        <div className="3xl:hidden relative w-full max-w-[640px] sm:mx-auto mt-8 aspect-[1200/854] overflow-hidden">
          <Image
            src="/assets/hero_mobile.webp"
            alt=""
            fill
            loading="lazy"
            sizes="(max-width: 640px) 100vw, 640px"
            className="object-cover object-bottom"
          />
        </div>
      </div>
    </section>
  )
}

function Stat({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <CheckCircle2 className="w-4 h-4 text-brand" />
      {label}
    </span>
  )
}
