"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useCallback, useState } from "react"
import { IntroOverlay } from "@/components/page/intro-overlay"
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
  const [introVisible, setIntroVisible] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)

  const handleIntroExitStart = useCallback(() => setContentVisible(true), [])
  const handleIntroDone = useCallback(() => setIntroVisible(false), [])

  if (!person) return null

  const eyebrow = `${dict.hero.eyebrowPrefix} ${person.name}`.toUpperCase()

  return (
    <>
      <motion.div
        initial={false}
        animate={contentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: contentVisible ? "auto" : "none" }}
        aria-hidden={!contentVisible}
      >
        <section id="hero" className="relative isolate overflow-hidden bg-background pt-16 sm:pt-24 md:pt-28 pb-10 md:pb-14">
          {/* Desktop hero image (≥1300px only): positioned absolute on right (right 50% of file has content) */}
          <div className="hidden 3xl:block pointer-events-none absolute top-0 inset-x-0 mx-auto max-w-[calc(1400px+16rem)] h-[52rem] z-0">
            <Image
              src="/assets/hero.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="object-contain object-right-top"
            />
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="grid 3xl:grid-cols-2 gap-6 3xl:gap-16 items-start 3xl:min-h-[52rem] pt-6"
            >
              <div className="max-w-[640px] md:mx-auto md:text-center 3xl:mx-0 3xl:text-left">
                <span className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.22em] uppercase text-[#21569c] mb-5 sm:mb-8 md:mb-10">
                  <span
                    aria-hidden="true"
                    className="inline-block h-px w-7 bg-gradient-to-r from-transparent to-[#21569c]"
                  />
                  {eyebrow}
                  <span
                    aria-hidden="true"
                    className="hidden md:inline-block 3xl:hidden h-px w-7 bg-gradient-to-l from-transparent to-[#21569c]"
                  />
                </span>

                <h1 className="font-serif text-[2.2rem] sm:text-[2.6rem] md:text-[3rem] leading-[1.15] text-[#0B162D] tracking-tight">
                  <span className="block">{dict.hero.titleLine1}</span>
                  <span className="block">
                    {dict.hero.titleLine2Pre}
                    <span className="text-[#21569c] inline-block relative isolate z-0 mx-1.5 sm:mx-2">
                      {dict.hero.titleHighlight}
                      {dict.hero.titleLine2Post}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 100 10"
                        preserveAspectRatio="none"
                        className="pointer-events-none absolute w-full h-2 sm:h-3 -bottom-0.5 sm:-bottom-1 left-0 text-[#21569c]/45 z-[-1]"
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
                  <p className="mt-5 sm:mt-6 md:mt-7 text-sm sm:text-base md:text-[1.05rem] text-[#0B162D]/70 leading-relaxed max-w-[52ch] md:mx-auto 3xl:mx-0 whitespace-pre-line">
                    {person.description}
                  </p>
                )}

                <div className="mt-6 sm:mt-8 md:mt-10 flex flex-wrap md:justify-center 3xl:justify-start gap-2 sm:gap-3">
                  <a href={person.email ? `mailto:${person.email}` : "#"}>
                    <button className="group flex items-center gap-2 sm:gap-2.5 bg-[#21569c] hover:bg-[#1a4580] text-white px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl font-medium text-xs sm:text-sm transition-colors duration-300 cursor-pointer shadow-[0_14px_28px_rgba(33,86,156,0.18)]">
                      <span className="sm:hidden">{dict.hero.ctaEmailShort}</span>
                      <span className="hidden sm:inline">{dict.hero.ctaEmail}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
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

                <div className="mt-6 sm:mt-8 md:mt-12 flex flex-wrap md:justify-center 3xl:justify-start gap-x-5 sm:gap-x-6 gap-y-2 text-[0.72rem] sm:text-sm text-[#0B162D]/60">
                  <Stat label={dict.hero.statYears} />
                  <Stat label={dict.hero.statProjects} />
                  <Stat label={dict.hero.statRegion} />
                </div>
              </div>

              <div aria-hidden="true" className="hidden 3xl:block" />
            </motion.div>

            {/* Hero image in flow below text — used at < 1300px. CSS-cropped to show only the content portion (bottom 40% of file) */}
            <div className="3xl:hidden relative w-full max-w-[640px] md:mx-auto mt-8 aspect-[1200/854] overflow-hidden">
              <Image
                src="/assets/hero_mobile.webp"
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-cover object-bottom"
              />
            </div>
          </div>
        </section>
      </motion.div>

      {introVisible && (
        <IntroOverlay
          onExitStart={handleIntroExitStart}
          onDone={handleIntroDone}
        />
      )}
    </>
  )
}

function Stat({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <CheckCircle2 className="w-4 h-4 text-[#21569c]" />
      {label}
    </span>
  )
}
