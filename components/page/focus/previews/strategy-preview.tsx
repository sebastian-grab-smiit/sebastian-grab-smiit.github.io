"use client"

import { motion } from "framer-motion"
import { BarChart3, SlidersHorizontal, TrendingUp } from "lucide-react"
import type { Dictionary } from "@/lib/dictionary"
import { PreviewHeader, PreviewShell, useRevealOrProp, type PreviewProps } from "./shell"

export function StrategyPreview({
  accent,
  t,
  isRevealed: isRevealedProp,
  compact = false,
}: PreviewProps & { t: Dictionary["focus"]["previews"]["strategy"] }) {
  const { ref, isRevealed } = useRevealOrProp(isRevealedProp)
  const initiatives = [
    { count: 2, label: t.phaseExplore },
    { count: 3, label: t.phaseDesign },
    { count: 4, label: t.phaseImplement },
    { count: 1, label: t.phaseEmbed },
  ]

  return (
    <PreviewShell compact={compact} innerRef={ref}>
      <PreviewHeader icon={<BarChart3 className="h-2 w-2" />} title={t.appName} accent={accent} />
      <div className="px-2.5 py-2.5">
        <div className="text-[0.58rem] font-semibold mb-2">{t.maturityIndex}</div>

        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-2 w-2 text-ink/45 shrink-0" />
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
          <span className="text-[0.46rem] font-mono text-ink/40">{t.maturityMax}</span>
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
        <div className="text-[0.5rem] font-semibold uppercase tracking-wider text-ink/55 mb-1.5">
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
              <span className="text-[0.42rem] uppercase tracking-wider text-ink/50">{p.label}</span>
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
            <span className="text-[0.55rem] text-ink/70 w-12 shrink-0">{t.riskLabel}</span>
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
