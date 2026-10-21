"use client"

import { useRef, useState } from "react"
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { ArrowUpRight } from "lucide-react"

export type CinemaItem = {
  title: string
  description: string
  href: string
  accent: { hex: string; lightHex: string; rgb: string }
  renderPreview: (isRevealed: boolean) => React.ReactNode
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
      <motion.span style={{ opacity, y, display: "inline-block" }}>{word}</motion.span>
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
    idx === 0 ? [0, 0, 0, -22] : idx === total - 1 ? [22, 0, 0, 0] : [22, 0, 0, -22]
  const layerY = useTransform(scrollYProgress, fadeStops, slideValues)
  const layerPointerEvents = useTransform(layerOpacity, (v) => (v >= 0.5 ? "auto" : "none"))

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
  const ctaOpacity = useTransform(scrollYProgress, r(0.8, 0.94), [0, 1])
  const ctaY = useTransform(scrollYProgress, r(0.8, 0.94), [12, 0])

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
          className="text-caption font-medium uppercase tracking-[0.22em] tabular-nums"
          style={{ opacity: eyebrowOpacity }}
        >
          <span style={{ color: item.accent.hex }}>{String(idx + 1).padStart(2, "0")}</span>
          <span className="mx-2 text-black/30">/</span>
          <span className="text-black/55">{String(total).padStart(2, "0")}</span>
        </motion.div>

        <motion.h3
          className="mt-2 font-serif text-h3 tracking-tight text-ink"
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

        <p className="mt-4 text-body text-black/85 max-w-[42ch]">
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
        <div className="absolute top-16 inset-x-0 z-30 px-4 sm:px-6 py-3">{header}</div>
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
        <li key={item.title} className="border-b border-black/10 py-10">
          <div className="text-caption font-medium uppercase tracking-[0.22em] tabular-nums">
            <span style={{ color: item.accent.hex }}>{String(idx + 1).padStart(2, "0")}</span>
            <span className="mx-2 text-black/30">/</span>
            <span className="text-black/55">{String(items.length).padStart(2, "0")}</span>
          </div>
          <h3 className="mt-3 font-serif text-h3 tracking-tight text-ink">{item.title}</h3>
          <p className="mt-4 text-body text-black/85">{item.description}</p>
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

export function MobileFocusCinema({
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
