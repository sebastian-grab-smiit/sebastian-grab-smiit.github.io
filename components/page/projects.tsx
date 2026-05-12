"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import type { Project } from "@/lib/sheet"
import type { Dictionary, Locale } from "@/lib/dictionary"
import { bulletize, formatRange, splitTags } from "@/lib/format"

function hideClassForIndex(idx: number): string {
  if (idx >= 6) return "hidden"
  if (idx >= 4) return "hidden xl:block"
  if (idx >= 2) return "hidden md:block"
  return ""
}

interface ProjectsProps {
  projects: Project[]
  locale: Locale
  dict: Dictionary
}

function uniqueTechs(items: Project[]): string[] {
  const set = new Set<string>()
  for (const p of items) {
    for (const t of splitTags(p.technologies)) set.add(t)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export default function Projects({ projects, locale, dict }: ProjectsProps) {
  const [selectedTechs, setSelectedTechs] = useState<string[]>([])
  const [showAll, setShowAll] = useState(false)

  const sortedProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) => (b.start?.getTime() ?? 0) - (a.start?.getTime() ?? 0),
      ),
    [projects],
  )
  const allTechs = useMemo(() => uniqueTechs(sortedProjects), [sortedProjects])

  const filtered = useMemo(() => {
    if (selectedTechs.length === 0) return sortedProjects
    return sortedProjects.filter((p) => {
      const techs = splitTags(p.technologies)
      return selectedTechs.some((t) => techs.includes(t))
    })
  }, [sortedProjects, selectedTechs])

  if (projects.length === 0) return null

  const toggle = (value: string) => {
    setSelectedTechs((cur) =>
      cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
    )
  }

  const hasFilters = selectedTechs.length > 0

  return (
    <section id="projects" className="pt-10 md:pt-14 pb-16 md:pb-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8 sm:text-center 3xl:text-left"
        >
          <span className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.22em] uppercase text-[#21569c] mb-5">
            <span
              aria-hidden="true"
              className="inline-block h-px w-7 bg-gradient-to-r from-transparent to-[#21569c]"
            />
            {dict.projects.eyebrow}
          </span>
          <h2 className="font-serif text-[2.2rem] sm:text-[2.6rem] md:text-[3rem] leading-tight text-[#0B162D] tracking-tight">
            {dict.sections.projects}
          </h2>
        </motion.div>

        {allTechs.length > 0 && (
          <div className="mb-10 space-y-5 sm:text-center 3xl:text-left">
            <FilterRow
              label={dict.labels.filterByTech}
              values={allTechs}
              selected={selectedTechs}
              onToggle={toggle}
            />
            {hasFilters && (
              <button
                onClick={() => setSelectedTechs([])}
                className="text-xs text-black/60 hover:text-black underline underline-offset-4 cursor-pointer"
              >
                {dict.labels.clearFilters}
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((p, idx) => (
            <div
              key={`${p.role}-${p.customer}-${idx}`}
              className={showAll ? "" : hideClassForIndex(idx)}
            >
              <ProjectCard
                project={p}
                locale={locale}
                presentLabel={dict.labels.present}
              />
            </div>
          ))}
        </div>

        {!showAll && (
          <>
            {filtered.length > 2 && (
              <ShowMoreButton
                label={dict.labels.showMore}
                onClick={() => setShowAll(true)}
                wrapClass="flex md:hidden"
              />
            )}
            {filtered.length > 4 && (
              <ShowMoreButton
                label={dict.labels.showMore}
                onClick={() => setShowAll(true)}
                wrapClass="hidden md:flex xl:hidden"
              />
            )}
            {filtered.length > 6 && (
              <ShowMoreButton
                label={dict.labels.showMore}
                onClick={() => setShowAll(true)}
                wrapClass="hidden xl:flex"
              />
            )}
          </>
        )}
      </div>
    </section>
  )
}

function ShowMoreButton({
  label,
  onClick,
  wrapClass,
}: {
  label: string
  onClick: () => void
  wrapClass: string
}) {
  return (
    <div className={`mt-10 md:mt-12 justify-center ${wrapClass}`}>
      <button
        type="button"
        onClick={onClick}
        className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-black/15 hover:border-black/40 text-sm font-medium text-[#0B162D] hover:bg-black/[0.02] transition-colors cursor-pointer"
      >
        {label}
        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
      </button>
    </div>
  )
}

function FilterRow({
  label,
  values,
  selected,
  onToggle,
}: {
  label: string
  values: string[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.18em] font-semibold text-[#0B162D] mb-3">
        {label}
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-center 3xl:justify-start">
        {values.map((v) => {
          const active = selected.includes(v)
          return (
            <button
              key={v}
              onClick={() => onToggle(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                active
                  ? "bg-black text-white border-black"
                  : "bg-white text-black/75 border-black/15 hover:border-black/40"
              }`}
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ProjectCard({
  project,
  locale,
  presentLabel,
}: {
  project: Project
  locale: Locale
  presentLabel: string
}) {
  const techs = splitTags(project.technologies)
  const secs = splitTags(project.sections)
  const points = bulletize(project.description)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-[1.5rem] p-6 shadow-sm hover:shadow-xl transition-shadow flex flex-col h-full border border-transparent hover:border-black/5"
    >
      <div className="flex items-start gap-3 mb-4">
        {project.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.logoUrl}
            alt={project.customer}
            className="h-10 w-10 object-contain rounded bg-white flex-shrink-0"
          />
        )}
        <div className="min-w-0">
          <div className="text-xs font-mono text-black/55">
            {formatRange(locale, project.start, project.end, presentLabel)}
          </div>
          <h3 className="font-medium text-base text-black mt-0.5 truncate">
            {project.role}
          </h3>
          <p className="text-sm text-[#21569c] font-medium truncate">
            {project.customer}
          </p>
        </div>
      </div>

      {points.length > 0 && (
        <ul className="space-y-1.5 text-sm text-black/75 mb-4">
          {points.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[#F703EB] mt-1.5 leading-none">·</span>
              <span className="leading-relaxed">{t}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto space-y-2">
        {techs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {techs.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-[11px] rounded-full bg-[#F703EB]/10 text-[#F703EB] font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {secs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {secs.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 text-[11px] rounded-full bg-black/5 text-black/65 font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  )
}
