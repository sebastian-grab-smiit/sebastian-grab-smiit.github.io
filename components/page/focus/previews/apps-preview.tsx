"use client"

import { motion } from "framer-motion"
import { BarChart3, FileText, LayoutDashboard, Users } from "lucide-react"
import type { Dictionary } from "@/lib/dictionary"
import { PreviewHeader, PreviewShell, useRevealOrProp, type PreviewProps } from "./shell"

export function AppsPreview({
  accent,
  t,
  isRevealed: isRevealedProp,
  compact = false,
}: PreviewProps & { t: Dictionary["focus"]["previews"]["apps"] }) {
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
                active ? "" : "text-ink/60"
              }`}
              style={active ? { background: `${accent}14`, color: accent } : undefined}
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
                isRevealed ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 4, scale: 0.96 }
              }
              transition={{ duration: 0.4, delay: 0.25 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between rounded-md bg-[#FEF8FE] px-1.5 py-2"
            >
              <span className="text-[0.42rem] uppercase tracking-wider text-ink/45 truncate">
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
          <span className="text-[0.5rem] font-semibold uppercase tracking-wider text-ink/55">
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
          <div className="text-[0.46rem] font-semibold uppercase tracking-wider text-ink/55 mb-1.5">
            {t.recentActivity}
          </div>
          <ul className="space-y-1.5">
            {activity.map((row, i) => (
              <motion.li
                key={row.label}
                initial={{ opacity: 0, x: -4 }}
                animate={isRevealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
                transition={{ duration: 0.35, delay: 0.85 + i * 0.1 }}
                className="flex items-center justify-between text-[0.55rem] text-ink/75"
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
                <span className="font-mono text-[0.5rem] text-ink/40 shrink-0 ml-1">
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
