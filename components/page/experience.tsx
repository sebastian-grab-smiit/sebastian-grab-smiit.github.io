"use client"

import Image from "next/image"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import type { ResumeEntry, Academic } from "@/lib/sheet"
import type { Dictionary, Locale } from "@/lib/dictionary"
import { formatRange, splitTags } from "@/lib/format"

interface ExperienceProps {
  resume: ResumeEntry[]
  academics: Academic[]
  locale: Locale
  dict: Dictionary
}

export default function Experience({
  resume,
  academics,
  locale,
  dict,
}: ExperienceProps) {
  const resumeSorted = [...resume].sort(
    (a, b) => (b.start?.getTime() ?? 0) - (a.start?.getTime() ?? 0),
  )
  const academicsSorted = [...academics].sort(
    (a, b) => (b.start?.getTime() ?? 0) - (a.start?.getTime() ?? 0),
  )

  if (resumeSorted.length === 0 && academicsSorted.length === 0) return null

  return (
    <section id="experience" className="relative bg-background pt-0 pb-16 md:pb-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {resumeSorted.length > 0 && (
            <ProfessionalColumn
              entries={resumeSorted}
              locale={locale}
              dict={dict}
            />
          )}
          {academicsSorted.length > 0 && (
            <AcademicColumn
              entries={academicsSorted}
              locale={locale}
              dict={dict}
            />
          )}
        </div>
      </div>
    </section>
  )
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="font-serif text-[1.7rem] sm:text-[2rem] md:text-[2.2rem] leading-tight text-[#0B162D] tracking-tight mb-8 md:mb-10"
    >
      {children}
    </motion.h2>
  )
}

function ProfessionalColumn({
  entries,
  locale,
  dict,
}: {
  entries: ResumeEntry[]
  locale: Locale
  dict: Dictionary
}) {
  return (
    <div>
      <ColumnHeading>{dict.sections.experienceProfessional}</ColumnHeading>

      <ol className="relative space-y-8 md:space-y-10">
        <div
          aria-hidden="true"
          className="absolute left-[5px] top-3 bottom-3 w-px bg-black/10"
        />

        {entries.map((entry, idx) => (
          <ProfessionalItem
            key={`${entry.company}-${idx}`}
            entry={entry}
            idx={idx}
            locale={locale}
            presentLabel={dict.labels.present}
          />
        ))}
      </ol>
    </div>
  )
}

function ProfessionalItem({
  entry,
  idx,
  locale,
  presentLabel,
}: {
  entry: ResumeEntry
  idx: number
  locale: Locale
  presentLabel: string
}) {
  const dateRange = formatRange(locale, entry.start, entry.end, presentLabel)
  const techs = splitTags(entry.technologies)

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.25) }}
      className="relative grid grid-cols-1 sm:grid-cols-[8.5rem_1fr] sm:gap-x-6 pl-5"
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-[7px] h-2.5 w-2.5 rounded-full bg-[#F703EB] ring-4 ring-background"
      />

      <div className="hidden sm:block text-xs text-[#0B162D]/55 font-mono leading-snug pt-1">
        {dateRange}
      </div>

      <div className="min-w-0">
        <div className="flex items-start gap-2.5">
          {entry.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.logoUrl}
              alt={entry.company}
              className="h-8 w-8 object-contain rounded-md bg-white border border-black/5 shrink-0"
            />
          )}
          <h3 className="text-[0.95rem] sm:text-base leading-snug text-[#0B162D] pt-0.5">
            <span className="font-semibold">{entry.role}</span>
            {entry.company && (
              <span className="text-[#0B162D]/55 font-normal"> – {entry.company}</span>
            )}
          </h3>
        </div>

        <div className="sm:hidden mt-1.5 text-xs text-[#0B162D]/55 font-mono leading-snug">
          {dateRange}
        </div>

        {entry.description && (
          <p className="mt-1.5 text-sm text-[#0B162D]/70 leading-relaxed whitespace-pre-line">
            {entry.description}
          </p>
        )}

        {techs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {techs.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-[11px] rounded-md bg-black/[0.04] text-[#0B162D]/70 font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.li>
  )
}

function AcademicColumn({
  entries,
  locale,
  dict,
}: {
  entries: Academic[]
  locale: Locale
  dict: Dictionary
}) {
  const [openIdx, setOpenIdx] = useState(0)

  if (entries.length === 0) return null

  return (
    <div>
      <ColumnHeading>{dict.sections.experienceAcademic}</ColumnHeading>

      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <AcademicAccordionItem
            key={`${entry.university}-${idx}`}
            entry={entry}
            idx={idx}
            isOpen={openIdx === idx}
            onToggle={() => setOpenIdx((cur) => (cur === idx ? -1 : idx))}
            locale={locale}
            dict={dict}
          />
        ))}
      </div>
    </div>
  )
}

function AcademicAccordionItem({
  entry,
  idx,
  isOpen,
  onToggle,
  locale,
  dict,
}: {
  entry: Academic
  idx: number
  isOpen: boolean
  onToggle: () => void
  locale: Locale
  dict: Dictionary
}) {
  const dateRange = formatRange(
    locale,
    entry.start,
    entry.end,
    dict.labels.present,
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.25) }}
      className="bg-white rounded-[1.25rem] border border-black/5 shadow-sm overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 hover:bg-black/[0.015] transition-colors cursor-pointer"
      >
        <ChevronDown
          className={`h-5 w-5 text-[#0B162D]/40 shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-0" : "-rotate-90"
          }`}
        />
        {entry.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.logoUrl}
            alt={entry.university}
            className="hidden md:block h-9 w-9 object-contain rounded-md bg-white border border-black/5 shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline flex-wrap gap-x-3 gap-y-0.5">
            <h3 className="text-[0.95rem] md:text-[1.05rem] font-semibold text-[#0B162D] leading-tight">
              {entry.degree}
            </h3>
            <span className="text-xs font-mono text-[#0B162D]/55">{dateRange}</span>
          </div>
          {entry.university && (
            <p className="text-sm text-[#0B162D]/65 mt-1">{entry.university}</p>
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-[38%_62%] gap-5 sm:gap-4 items-center px-6 md:px-8 pb-5 md:pb-6 pt-1">
              <div className="relative aspect-square w-full max-w-[170px] mx-auto sm:max-w-[180px] sm:mx-0">
                <Image
                  src="/assets/academics.webp"
                  alt=""
                  fill
                  sizes="(max-width: 640px) 220px, 260px"
                  className="object-contain"
                />
              </div>

              <div className="min-w-0">
                {entry.description && (
                  <p className="text-sm text-[#0B162D]/70 leading-relaxed whitespace-pre-line">
                    {entry.description}
                  </p>
                )}
                {entry.grade !== null && (
                  <p className="mt-6 text-sm font-mono text-[#0B162D]/65">
                    {dict.labels.grade}: {entry.grade.toFixed(1)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
