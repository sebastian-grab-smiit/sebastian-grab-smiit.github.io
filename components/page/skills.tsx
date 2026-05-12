"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  Brain,
  Cloud,
  Code2,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import type { Skill } from "@/lib/sheet"
import type { Dictionary } from "@/lib/dictionary"

interface SkillsProps {
  skills: Skill[]
  dict: Dictionary
}

const CATEGORY_META: Record<string, { color: string; Icon: LucideIcon }> = {
  Coding: { color: "#F703EB", Icon: Code2 },
  "Cloud / DevOps": { color: "#21569c", Icon: Cloud },
  Analytics: { color: "#16AEA3", Icon: BarChart3 },
  "AI / Data": { color: "#D97706", Icon: Brain },
  Automation: { color: "#14a800", Icon: Workflow },
}

const DEFAULT_META: { color: string; Icon: LucideIcon } = {
  color: "#21569c",
  Icon: Wrench,
}

function groupByCategory(skills: Skill[]): Record<string, Skill[]> {
  const groups: Record<string, Skill[]> = {}
  for (const s of skills) {
    if (!groups[s.category]) groups[s.category] = []
    groups[s.category].push(s)
  }
  for (const k of Object.keys(groups)) {
    groups[k].sort((a, b) => b.level - a.level)
  }
  return groups
}

export default function Skills({ skills, dict }: SkillsProps) {
  if (skills.length === 0) return null

  const grouped = groupByCategory(skills)
  const categories = Object.keys(grouped)

  return (
    <section
      id="skills"
      className="relative bg-background pt-8 md:pt-12 pb-10 md:pb-12"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="sm:text-center 3xl:text-left"
        >
          <span className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.22em] uppercase text-[#21569c] mb-5">
            <span
              aria-hidden="true"
              className="inline-block h-px w-7 bg-gradient-to-r from-transparent to-[#21569c]"
            />
            {dict.skills.eyebrow}
          </span>
          <h2 className="font-serif text-[2.2rem] sm:text-[2.6rem] md:text-[3rem] leading-tight text-[#0B162D] tracking-tight">
            {dict.sections.skills}
          </h2>
        </motion.div>

        {/* Mobile: full-bleed swipe story */}
        <SkillsSwipeStory categories={categories} grouped={grouped} />

        {/* Tablet + Desktop: grid */}
        <div className="hidden sm:grid mt-8 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
          {categories.map((cat, idx) => (
            <SkillCategoryCard
              key={cat}
              cat={cat}
              list={grouped[cat]}
              idx={idx}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function SkillsSwipeStory({
  categories,
  grouped,
}: {
  categories: string[]
  grouped: Record<string, Skill[]>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const total = categories.length

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth)
      setActiveIdx(Math.max(0, Math.min(total - 1, idx)))
    }
    el.addEventListener("scroll", handler, { passive: true })
    return () => el.removeEventListener("scroll", handler)
  }, [total])

  const goTo = (i: number) => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" })
  }

  return (
    <div className="sm:hidden mt-8">
      <div
        ref={containerRef}
        className="-mx-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
      >
        <div className="flex">
          {categories.map((cat, idx) => (
            <div
              key={cat}
              className="snap-center shrink-0 w-screen px-6"
              aria-roledescription="slide"
              aria-label={`${idx + 1} / ${total}: ${cat}`}
            >
              <div className="min-h-[300px] flex flex-col items-center text-center pt-2">
                <div className="text-[0.7rem] font-mono uppercase tracking-[0.22em] text-[#0B162D]/45 mb-3 tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                  <span className="mx-1.5 text-[#0B162D]/25">/</span>
                  {String(total).padStart(2, "0")}
                </div>
                <h3 className="font-serif text-[2rem] leading-[1.05] text-[#0B162D] tracking-tight mb-5">
                  {cat}
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {grouped[cat].map((s) => (
                    <span
                      key={s.name}
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#0B162D]/[0.05] text-[#0B162D]/80"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5">
        {categories.map((cat, i) => (
          <button
            key={cat}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}: ${cat}`}
            aria-current={i === activeIdx ? "true" : undefined}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIdx
                ? "w-6 bg-[#0B162D]/60"
                : "w-1.5 bg-[#0B162D]/20"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function SkillCategoryCard({
  cat,
  list,
  idx,
  className = "",
}: {
  cat: string
  list: Skill[]
  idx: number
  className?: string
}) {
  const meta = CATEGORY_META[cat] ?? DEFAULT_META
  const { color, Icon } = meta
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: Math.min(idx * 0.06, 0.3) }}
      whileHover={{ y: -3 }}
      style={{
        background: `${color}0A`,
        borderColor: `${color}1F`,
      }}
      className={`rounded-[1.25rem] border p-5 md:p-6 transition-shadow hover:shadow-md ${className}`}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `${color}1A` }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color }} />
        </div>
        <h3
          className="text-base md:text-[1.05rem] font-semibold tracking-tight truncate"
          style={{ color }}
        >
          {cat}
        </h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {list.map((s) => (
          <span
            key={s.name}
            className="px-2.5 py-1 rounded-md text-xs font-medium"
            style={{
              background: `${color}14`,
              color,
            }}
          >
            {s.name}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
