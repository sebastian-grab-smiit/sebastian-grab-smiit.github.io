"use client"

import { useId } from "react"
import { motion } from "framer-motion"
import { Search, TrendingUp } from "lucide-react"
import type { Dictionary } from "@/lib/dictionary"
import { PreviewHeader, PreviewShell, useRevealOrProp, type PreviewProps } from "./shell"

export function AnalyticsPreview({
  accent,
  t,
  isRevealed: isRevealedProp,
  compact = false,
}: PreviewProps & { t: Dictionary["focus"]["previews"]["analytics"] }) {
  const { ref, isRevealed } = useRevealOrProp(isRevealedProp)
  // Unique per instance: desktop and mobile variants are both in the DOM.
  const fillId = `analytics-fill-${useId()}`
  const stats = [
    { label: t.revenue, value: t.revenueValue },
    { label: t.growth, value: t.growthValue },
    { label: t.projects, value: t.projectsValue },
  ]

  return (
    <PreviewShell compact={compact} innerRef={ref}>
      <PreviewHeader icon={<Search className="h-2 w-2" />} title={t.appName} accent={accent} />
      <div className="px-2.5 pt-2 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-[0.55rem] text-ink/65 font-medium">{t.revenueHeader}</span>
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
            <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
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
            fill={`url(#${fillId})`}
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
              animate={isRevealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.3, delay: 0.95 + i * 0.08 }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            >
              <circle cx={x} cy={y} r="2.6" fill="#fff" />
              <circle cx={x} cy={y} r="1.6" fill={accent} />
            </motion.g>
          ))}
        </svg>
        <div className="mt-1 flex items-center justify-between text-[0.45rem] font-mono uppercase text-ink/35">
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
            <div className="text-[0.42rem] uppercase tracking-wider text-ink/45">{k.label}</div>
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
          <div className="text-[0.46rem] font-semibold uppercase tracking-wider text-ink/55 mb-1.5">
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
                <div className="text-[0.42rem] uppercase tracking-wider text-ink/40">{s.label}</div>
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
