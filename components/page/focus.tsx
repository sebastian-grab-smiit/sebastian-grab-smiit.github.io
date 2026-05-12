"use client"

import { useRef, useState } from "react"
import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  FileText,
  LayoutDashboard,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Users,
} from "lucide-react"
import type { Dictionary, Locale } from "@/lib/dictionary"

interface FocusProps {
  dict: Dictionary
  locale: Locale
}

const SMIIT_BASE = "https://www.smiit.de"

type CinemaItem = {
  title: string
  description: string
  href: string
  accent: { hex: string; lightHex: string; rgb: string }
  renderPreview: (isRevealed: boolean) => React.ReactNode
}

export default function Focus({ dict, locale }: FocusProps) {
  const previews = dict.focus.previews
  const cards = [
    {
      key: "apps" as const,
      accent: "#F703EB",
      accentLight: "#FB81F5",
      accentRgb: "247, 3, 235",
      href: `${SMIIT_BASE}/${locale}/services/apps`,
      data: dict.focus.cards.apps,
      preview: <AppsPreview accent="#F703EB" t={previews.apps} />,
    },
    {
      key: "analytics" as const,
      accent: "#21569c",
      accentLight: "#7DBBFF",
      accentRgb: "33, 86, 156",
      href: `${SMIIT_BASE}/${locale}/services/analytics`,
      data: dict.focus.cards.analytics,
      preview: <AnalyticsPreview accent="#21569c" t={previews.analytics} />,
    },
    {
      key: "strategy" as const,
      accent: "#64748B",
      accentLight: "#94A3B8",
      accentRgb: "100, 116, 139",
      href: `${SMIIT_BASE}/${locale}/services/strategy`,
      data: dict.focus.cards.strategy,
      preview: <StrategyPreview accent="#64748B" t={previews.strategy} />,
    },
  ]

  const cinemaItems: CinemaItem[] = cards.map((c) => ({
    title: c.data.title,
    description: c.data.description,
    href: c.href,
    accent: { hex: c.accent, lightHex: c.accentLight, rgb: c.accentRgb },
    renderPreview: (isRevealed: boolean) => {
      if (c.key === "apps")
        return <AppsPreview accent={c.accent} t={previews.apps} isRevealed={isRevealed} compact />
      if (c.key === "analytics")
        return <AnalyticsPreview accent={c.accent} t={previews.analytics} isRevealed={isRevealed} compact />
      return <StrategyPreview accent={c.accent} t={previews.strategy} isRevealed={isRevealed} compact />
    },
  }))

  const headerInner = (
    <>
      <span className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.22em] uppercase text-[#21569c] mb-5">
        <span
          aria-hidden="true"
          className="inline-block h-px w-7 bg-gradient-to-r from-transparent to-[#21569c]"
        />
        {dict.focus.eyebrow}
      </span>
      <h2 className="font-serif text-[2.2rem] sm:text-[2.6rem] md:text-[3rem] leading-tight text-[#0B162D] tracking-tight">
        {dict.sections.focus}
      </h2>
    </>
  )

  return (
    <section id="focus" className="relative bg-background -mt-8 3xl:-mt-48 pb-4 md:pb-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: cinema scroll */}
        <MobileFocusCinema items={cinemaItems} header={headerInner} />

        {/* Tablet + Desktop */}
        <div className="hidden md:block">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            {headerInner}
          </motion.div>

          <div className="mt-6 md:mt-8 grid grid-cols-4 min-[1270px]:grid-cols-3 gap-5 md:gap-6">
            {cards.map((card, idx) => (
              <motion.a
                key={card.key}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className={`group relative bg-white rounded-[1rem] border border-black/5 p-5 md:p-6 shadow-sm hover:shadow-xl transition-shadow flex flex-col overflow-hidden col-span-2 min-[1270px]:col-span-1 ${
                  idx === 2 ? "col-start-2 min-[1270px]:col-start-auto" : ""
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 md:gap-5 items-stretch">
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-serif text-[1.25rem] md:text-[1.4rem] leading-tight text-[#0B162D] tracking-tight">
                      {card.data.title}
                    </h3>
                    <p className="mt-3 text-sm text-[#0B162D]/70 leading-relaxed">
                      {card.data.description}
                    </p>
                  </div>

                  <div className="w-full sm:w-[185px] md:w-[200px] shrink-0 flex">
                    {card.preview}
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-medium transition-transform group-hover:translate-x-0.5"
                    style={{ color: card.accent }}
                  >
                    {dict.focus.learnMore}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CinemaWord({
  word,
  scrollYProgress,
  start,
  end,
  isLast,
}: {
  word: string
  scrollYProgress: MotionValue<number>
  start: number
  end: number
  isLast: boolean
}) {
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1])
  const y = useTransform(scrollYProgress, [start, end], [8, 0])
  return (
    <>
      <motion.span style={{ opacity, y, display: "inline-block" }}>
        {word}
      </motion.span>
      {!isLast ? " " : ""}
    </>
  )
}

function FocusCinemaLayer({
  item,
  idx,
  total,
  scrollYProgress,
}: {
  item: CinemaItem
  idx: number
  total: number
  scrollYProgress: MotionValue<number>
}) {
  const words = item.description.split(/\s+/).filter((w) => w.length > 0)
  const wordCount = words.length

  const sliceStart = idx / total
  const sliceEnd = (idx + 1) / total
  const sliceLen = sliceEnd - sliceStart
  const fadeWidth = 0.04

  const fadeStops: [number, number, number, number] =
    idx === 0
      ? [-1, 0, sliceEnd - fadeWidth, sliceEnd]
      : idx === total - 1
        ? [sliceStart - fadeWidth, sliceStart, 1, 2]
        : [sliceStart - fadeWidth, sliceStart, sliceEnd - fadeWidth, sliceEnd]
  const fadeValues: [number, number, number, number] =
    idx === 0 ? [1, 1, 1, 0] : idx === total - 1 ? [0, 1, 1, 1] : [0, 1, 1, 0]
  const layerOpacity = useTransform(scrollYProgress, fadeStops, fadeValues)
  const slideValues: [number, number, number, number] =
    idx === 0
      ? [0, 0, 0, -22]
      : idx === total - 1
        ? [22, 0, 0, 0]
        : [22, 0, 0, -22]
  const layerY = useTransform(scrollYProgress, fadeStops, slideValues)
  const layerPointerEvents = useTransform(layerOpacity, (v) =>
    v >= 0.5 ? "auto" : "none",
  )

  const r = (s: number, e: number): [number, number] => [
    sliceStart + sliceLen * s,
    sliceStart + sliceLen * e,
  ]

  const eyebrowOpacity = useTransform(scrollYProgress, r(0, 0.02), [0, 1])
  const titleScale = useTransform(scrollYProgress, r(0, 0.06), [1.08, 1])
  const titleY = useTransform(scrollYProgress, r(0, 0.06), [16, 0])
  const titleOpacity = useTransform(scrollYProgress, r(0, 0.02), [0, 1])
  const haloOpacity = useTransform(scrollYProgress, r(0, 0.04), [0, 1])
  const ghostOpacity = useTransform(scrollYProgress, r(0, 0.05), [0, 1])
  const ghostScale = useTransform(scrollYProgress, r(0, 1), [1.05, 0.95])
  const underlinePathLength = useTransform(scrollYProgress, r(0.06, 0.16), [0, 1])
  const previewOpacity = useTransform(scrollYProgress, r(0.1, 0.22), [0, 1])
  const previewY = useTransform(scrollYProgress, r(0.1, 0.22), [12, 0])
  const ctaOpacity = useTransform(scrollYProgress, r(0.80, 0.94), [0, 1])
  const ctaY = useTransform(scrollYProgress, r(0.80, 0.94), [12, 0])

  const [isLayerRevealed, setIsLayerRevealed] = useState(false)
  useMotionValueEvent(previewOpacity, "change", (v) => {
    if (v >= 0.5) setIsLayerRevealed(true)
  })

  const gradId = `focus-underline-${idx}`

  const wordRangeStart = 0.22
  const wordRangeEnd = 0.78
  const span = (wordRangeEnd - wordRangeStart) / Math.max(1, wordCount)

  return (
    <motion.div
      style={{ opacity: layerOpacity, y: layerY, pointerEvents: layerPointerEvents }}
      className="absolute inset-x-0 top-[18vh] bottom-0 flex items-center"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: haloOpacity,
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(${item.accent.rgb}, 0.18) 0%, rgba(${item.accent.rgb}, 0.05) 50%, transparent 80%)`,
        }}
      />

      <motion.span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none font-serif leading-none text-black/[0.05]"
        style={{
          fontSize: "min(80vw, 65vh)",
          scale: ghostScale,
          opacity: ghostOpacity,
        }}
      >
        {idx + 1}
      </motion.span>

      <div className="relative w-full px-6">
        <motion.div
          className="text-[0.68rem] font-medium uppercase tracking-[0.22em] tabular-nums"
          style={{ opacity: eyebrowOpacity }}
        >
          <span style={{ color: item.accent.hex }}>
            {String(idx + 1).padStart(2, "0")}
          </span>
          <span className="mx-2 text-black/30">/</span>
          <span className="text-black/55">
            {String(total).padStart(2, "0")}
          </span>
        </motion.div>

        <motion.h3
          className="mt-2 font-serif text-[1.95rem] sm:text-[2.4rem] leading-[1.05] tracking-tight text-[#0B162D]"
          style={{
            scale: titleScale,
            y: titleY,
            opacity: titleOpacity,
            transformOrigin: "left center",
          }}
        >
          {item.title}
        </motion.h3>

        <svg
          className="block w-[60%] h-[3px] mt-3 overflow-visible"
          viewBox="0 0 100 3"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient
              id={gradId}
              x1="0"
              y1="0"
              x2="100"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={item.accent.hex} />
              <stop offset="100%" stopColor={item.accent.lightHex} />
            </linearGradient>
          </defs>
          <motion.path
            d="M0 1.5 H 100"
            stroke={`url(#${gradId})`}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
            style={{ pathLength: underlinePathLength }}
          />
        </svg>

        <motion.div
          className="mt-4 mb-1 max-w-[360px]"
          style={{ opacity: previewOpacity, y: previewY }}
        >
          {item.renderPreview(isLayerRevealed)}
        </motion.div>

        <p className="mt-4 text-[0.95rem] leading-relaxed text-black/85 max-w-[42ch]">
          {words.map((word, i) => {
            const wStart = wordRangeStart + i * span
            const wEnd = wStart + Math.max(span * 1.6, 0.025)
            return (
              <CinemaWord
                key={`${idx}-${i}`}
                word={word}
                scrollYProgress={scrollYProgress}
                start={sliceStart + sliceLen * wStart}
                end={sliceStart + sliceLen * wEnd}
                isLast={i === words.length - 1}
              />
            )
          })}
        </p>

        <motion.div className="mt-5" style={{ opacity: ctaOpacity, y: ctaY }}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.title}
            className="inline-flex items-center justify-center w-14 h-14 rounded-full text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:scale-105 hover:translate-x-1"
            style={{ backgroundColor: item.accent.hex }}
          >
            <ArrowUpRight className="h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </motion.div>
  )
}

function MobileFocusCinemaPinned({
  items,
  header,
}: {
  items: CinemaItem[]
  header: React.ReactNode
}) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  })

  const revealVh = 85 * items.length
  return (
    <div
      ref={trackRef}
      className="relative -mx-4 sm:-mx-6"
      style={{ minHeight: `${100 + revealVh}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute top-16 inset-x-0 z-30 px-4 sm:px-6 py-3">
          {header}
        </div>
        {items.map((item, idx) => (
          <FocusCinemaLayer
            key={item.title}
            item={item}
            idx={idx}
            total={items.length}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  )
}

function MobileFocusCinemaStatic({ items }: { items: CinemaItem[] }) {
  return (
    <ul className="border-t border-black/10">
      {items.map((item, idx) => (
        <li
          key={item.title}
          className="border-b border-black/10 py-10"
        >
          <div className="text-[0.68rem] font-medium uppercase tracking-[0.22em] tabular-nums">
            <span style={{ color: item.accent.hex }}>
              {String(idx + 1).padStart(2, "0")}
            </span>
            <span className="mx-2 text-black/30">/</span>
            <span className="text-black/55">
              {String(items.length).padStart(2, "0")}
            </span>
          </div>
          <h3 className="mt-3 font-serif text-[1.95rem] leading-[1.05] tracking-tight text-[#0B162D]">
            {item.title}
          </h3>
          <p className="mt-4 text-[0.96rem] leading-relaxed text-black/85">
            {item.description}
          </p>
          <div className="mt-5">
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.title}
              className="inline-flex items-center justify-center w-12 h-12 rounded-full text-white"
              style={{ backgroundColor: item.accent.hex }}
            >
              <ArrowUpRight className="h-[18px] w-[18px]" />
            </a>
          </div>
        </li>
      ))}
    </ul>
  )
}

function MobileFocusCinema({
  items,
  header,
}: {
  items: CinemaItem[]
  header: React.ReactNode
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="md:hidden">
      {prefersReducedMotion ? (
        <>
          <div className="mb-6">{header}</div>
          <MobileFocusCinemaStatic items={items} />
        </>
      ) : (
        <MobileFocusCinemaPinned items={items} header={header} />
      )}
    </div>
  )
}

function PreviewShell({
  children,
  className = "",
  compact = false,
  innerRef,
}: {
  children: React.ReactNode
  className?: string
  compact?: boolean
  innerRef?: React.Ref<HTMLDivElement>
}) {
  const minH = compact ? "" : "min-h-[260px] md:min-h-[280px]"
  return (
    <div
      ref={innerRef}
      className={`flex flex-1 flex-col w-full ${minH} rounded-[14px] border border-slate-200/80 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.05)] overflow-hidden text-[#0B162D] ${className}`}
    >
      {children}
    </div>
  )
}

function useRevealOrProp(isRevealedProp?: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-30px" })
  return { ref, isRevealed: isRevealedProp ?? inView }
}

function PreviewHeader({
  icon,
  title,
  accent,
}: {
  icon: React.ReactNode
  title: string
  accent: string
}) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-slate-100">
      <span
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-[3px]"
        style={{ background: `${accent}1A`, color: accent }}
      >
        {icon}
      </span>
      <span className="text-[0.58rem] font-semibold tracking-tight">{title}</span>
    </div>
  )
}

function AppsPreview({
  accent,
  t,
  isRevealed: isRevealedProp,
  compact = false,
}: {
  accent: string
  t: Dictionary["focus"]["previews"]["apps"]
  isRevealed?: boolean
  compact?: boolean
}) {
  const { ref, isRevealed } = useRevealOrProp(isRevealedProp)
  const navItems = [
    { label: t.navDashboard, Icon: LayoutDashboard, active: true },
    { label: t.navOrders, Icon: FileText },
    { label: t.navCustomers, Icon: Users },
    { label: t.navReports, Icon: BarChart3 },
  ]
  const stats = [
    { label: t.statOrders, value: "47" },
    { label: t.statInProgress, value: "12" },
    { label: t.statDone, value: "8" },
  ]
  const activity = [
    { label: t.activity1, time: "10:24" },
    { label: t.activity2, time: "09:01" },
  ]

  return (
    <PreviewShell compact={compact} innerRef={ref}>
      <PreviewHeader
        icon={<LayoutDashboard className="h-2 w-2" />}
        title={t.appName}
        accent={accent}
      />
      <div className="grid grid-cols-[1fr_1.2fr] gap-1.5 p-1.5">
        <ul className="flex flex-col gap-0.5">
          {navItems.map(({ label, Icon, active }, i) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, x: -4 }}
              animate={isRevealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
              transition={{ duration: 0.35, delay: 0.08 + i * 0.05 }}
              className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[0.55rem] font-medium ${
                active ? "" : "text-[#0B162D]/60"
              }`}
              style={
                active ? { background: `${accent}14`, color: accent } : undefined
              }
            >
              <Icon className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{label}</span>
            </motion.li>
          ))}
        </ul>
        <div className="flex flex-col gap-1">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={
                isRevealed
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 4, scale: 0.96 }
              }
              transition={{ duration: 0.4, delay: 0.25 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between rounded-md bg-[#FEF8FE] px-1.5 py-2"
            >
              <span className="text-[0.42rem] uppercase tracking-wider text-[#0B162D]/45 truncate">
                {stat.label}
              </span>
              <span className="text-[0.7rem] font-semibold leading-none tabular-nums">
                {stat.value}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-2.5 py-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[0.5rem] font-semibold uppercase tracking-wider text-[#0B162D]/55">
            {t.teamUtilization}
          </span>
          <span className="text-[0.55rem] font-semibold tabular-nums">78%</span>
        </div>
        <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: accent }}
            initial={{ width: 0 }}
            animate={isRevealed ? { width: "78%" } : { width: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: "easeOut" }}
          />
        </div>
      </div>
      {!compact && (
        <div className="mt-auto border-t border-slate-100 px-2.5 py-2.5">
          <div className="text-[0.46rem] font-semibold uppercase tracking-wider text-[#0B162D]/55 mb-1.5">
            {t.recentActivity}
          </div>
          <ul className="space-y-1.5">
            {activity.map((row, i) => (
              <motion.li
                key={row.label}
                initial={{ opacity: 0, x: -4 }}
                animate={isRevealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
                transition={{ duration: 0.35, delay: 0.85 + i * 0.1 }}
                className="flex items-center justify-between text-[0.55rem] text-[#0B162D]/75"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <motion.span
                    className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: accent }}
                    animate={isRevealed ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="truncate">{row.label}</span>
                </span>
                <span className="font-mono text-[0.5rem] text-[#0B162D]/40 shrink-0 ml-1">
                  {row.time}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </PreviewShell>
  )
}

function AnalyticsPreview({
  accent,
  t,
  isRevealed: isRevealedProp,
  compact = false,
}: {
  accent: string
  t: Dictionary["focus"]["previews"]["analytics"]
  isRevealed?: boolean
  compact?: boolean
}) {
  const { ref, isRevealed } = useRevealOrProp(isRevealedProp)
  const stats = [
    { label: t.revenue, value: t.revenueValue },
    { label: t.growth, value: t.growthValue },
    { label: t.projects, value: t.projectsValue },
  ]

  return (
    <PreviewShell compact={compact} innerRef={ref}>
      <PreviewHeader
        icon={<Search className="h-2 w-2" />}
        title={t.appName}
        accent={accent}
      />
      <div className="px-2.5 pt-2 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-[0.55rem] text-[#0B162D]/65 font-medium">
            {t.revenueHeader}
          </span>
          <motion.span
            className="inline-flex items-center gap-0.5 text-[0.55rem] font-semibold tabular-nums"
            style={{ color: accent }}
            initial={{ opacity: 0 }}
            animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <TrendingUp className="h-2 w-2" />
            {t.revenueDelta}
          </motion.span>
        </div>
        <svg
          viewBox="0 0 200 80"
          preserveAspectRatio="none"
          className="mt-1.5 w-full h-[68px]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="apFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[20, 40, 60].map((y) => (
            <line
              key={y}
              x1="5"
              x2="195"
              y1={y}
              y2={y}
              stroke="#E2E8F0"
              strokeWidth="0.6"
              strokeDasharray="2 3"
            />
          ))}
          <motion.path
            d="M5 60 L30 56 L55 50 L80 44 L105 38 L130 30 L155 24 L185 14 L185 80 L5 80 Z"
            fill="url(#apFill)"
            initial={{ opacity: 0 }}
            animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          />
          <motion.path
            d="M5 60 L30 56 L55 50 L80 44 L105 38 L130 30 L155 24 L185 14"
            fill="none"
            stroke={accent}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={isRevealed ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
          />
          {[
            [5, 60],
            [55, 50],
            [105, 38],
            [155, 24],
            [185, 14],
          ].map(([x, y], i) => (
            <motion.g
              key={`${x}-${y}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={
                isRevealed
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0 }
              }
              transition={{ duration: 0.3, delay: 0.95 + i * 0.08 }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            >
              <circle cx={x} cy={y} r="2.6" fill="#fff" />
              <circle cx={x} cy={y} r="1.6" fill={accent} />
            </motion.g>
          ))}
        </svg>
        <div className="mt-1 flex items-center justify-between text-[0.45rem] font-mono uppercase text-[#0B162D]/35">
          {t.months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>

      <div className="px-2.5 py-2 border-t border-slate-100 grid grid-cols-2 gap-1.5">
        {[
          { label: t.vsLastYear, value: t.vsLastYearValue, accent: true },
          { label: t.forecast, value: t.forecastValue, accent: false },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 4 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
            transition={{ duration: 0.4, delay: 1.35 + i * 0.1 }}
            className="rounded-md bg-[#F4F8FE] px-1.5 py-1"
          >
            <div className="text-[0.42rem] uppercase tracking-wider text-[#0B162D]/45">
              {k.label}
            </div>
            <div
              className="text-[0.62rem] font-semibold leading-tight tabular-nums"
              style={k.accent ? { color: accent } : undefined}
            >
              {k.value}
            </div>
          </motion.div>
        ))}
      </div>

      {!compact && (
        <div className="mt-auto border-t border-slate-100 px-2.5 py-2.5">
          <div className="text-[0.46rem] font-semibold uppercase tracking-wider text-[#0B162D]/55 mb-1.5">
            {t.metrics}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 4 }}
                animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                transition={{ duration: 0.4, delay: 1.6 + i * 0.08 }}
              >
                <div className="text-[0.42rem] uppercase tracking-wider text-[#0B162D]/40">
                  {s.label}
                </div>
                <div className="text-[0.7rem] font-semibold leading-tight tabular-nums">
                  {s.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </PreviewShell>
  )
}

function StrategyPreview({
  accent,
  t,
  isRevealed: isRevealedProp,
  compact = false,
}: {
  accent: string
  t: Dictionary["focus"]["previews"]["strategy"]
  isRevealed?: boolean
  compact?: boolean
}) {
  const { ref, isRevealed } = useRevealOrProp(isRevealedProp)
  const initiatives = [
    { count: 2, label: t.phaseExplore },
    { count: 3, label: t.phaseDesign },
    { count: 4, label: t.phaseImplement },
    { count: 1, label: t.phaseEmbed },
  ]

  return (
    <PreviewShell compact={compact} innerRef={ref}>
      <PreviewHeader
        icon={<BarChart3 className="h-2 w-2" />}
        title={t.appName}
        accent={accent}
      />
      <div className="px-2.5 py-2.5">
        <div className="text-[0.58rem] font-semibold mb-2">{t.maturityIndex}</div>

        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-2 w-2 text-[#0B162D]/45 shrink-0" />
          <div className="relative flex-1 h-1 rounded-full bg-slate-100">
            {[0.2, 0.4, 0.6, 0.8].map((p) => (
              <span
                key={p}
                className="absolute top-1/2 -translate-y-1/2 h-1.5 w-px bg-slate-300"
                style={{ left: `${p * 100}%` }}
              />
            ))}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: `${accent}66` }}
              initial={{ width: 0 }}
              animate={isRevealed ? { width: "60%" } : { width: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            />
            <motion.div
              className="absolute top-1/2 h-2.5 w-2.5 rounded-full ring-2 ring-white"
              style={{
                transform: "translate(-50%, -50%)",
                background: accent,
              }}
              initial={{ left: "0%" }}
              animate={isRevealed ? { left: "60%" } : { left: "0%" }}
              transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            />
          </div>
          <span className="text-[0.58rem] font-semibold tabular-nums">{t.maturityScore}</span>
          <span className="text-[0.46rem] font-mono text-[#0B162D]/40">{t.maturityMax}</span>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <motion.span
            className="text-[0.5rem] font-semibold tabular-nums"
            style={{ color: accent }}
            initial={{ opacity: 0 }}
            animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.85 }}
          >
            +16
          </motion.span>
          <div className="relative flex-1 h-1 rounded-full bg-slate-100">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: `${accent}40` }}
              initial={{ width: 0 }}
              animate={isRevealed ? { width: "75%" } : { width: 0 }}
              transition={{ duration: 0.85, delay: 0.5, ease: "easeOut" }}
            />
            <motion.div
              className="absolute top-1/2 h-2 w-2 rounded-full ring-2 ring-white bg-white border"
              style={{
                transform: "translate(-50%, -50%)",
                borderColor: accent,
              }}
              initial={{ left: "0%" }}
              animate={isRevealed ? { left: "75%" } : { left: "0%" }}
              transition={{ duration: 0.85, delay: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="px-2.5 py-2 border-t border-slate-100">
        <div className="text-[0.5rem] font-semibold uppercase tracking-wider text-[#0B162D]/55 mb-1.5">
          {t.activeInitiatives}
        </div>
        <div className="grid grid-cols-2 gap-1">
          {initiatives.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 4 }}
              animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
              transition={{ duration: 0.4, delay: 1.0 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between rounded bg-slate-50 px-1.5 py-2"
            >
              <span className="text-[0.42rem] uppercase tracking-wider text-[#0B162D]/50">
                {p.label}
              </span>
              <span className="text-[0.65rem] font-semibold leading-none tabular-nums">
                {p.count}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {!compact && (
        <div className="mt-auto border-t border-slate-100 px-2.5 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[0.58rem] font-semibold">{t.strategicRisks}</span>
            <motion.span
              className="inline-flex items-center gap-0.5 text-[0.5rem] font-semibold tabular-nums"
              style={{ color: accent }}
              initial={{ opacity: 0 }}
              animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 1.5 }}
            >
              <TrendingUp className="h-2 w-2" />
              {t.riskTrend}
            </motion.span>
          </div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[0.55rem] text-[#0B162D]/70 w-12 shrink-0">{t.riskLabel}</span>
            <div className="h-1 flex-1 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: accent }}
                initial={{ width: 0 }}
                animate={isRevealed ? { width: "55%" } : { width: 0 }}
                transition={{ duration: 0.8, delay: 1.45, ease: "easeOut" }}
              />
            </div>
            <span className="text-[0.55rem] font-semibold tabular-nums w-10 text-right shrink-0">
              {t.riskLevel}
            </span>
          </div>
        </div>
      )}
    </PreviewShell>
  )
}
