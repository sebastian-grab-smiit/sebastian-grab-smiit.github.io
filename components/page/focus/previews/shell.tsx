import { useRef } from "react"
import { useInView } from "framer-motion"

export interface PreviewProps {
  accent: string
  /** Controlled reveal (mobile cinema); falls back to in-view detection. */
  isRevealed?: boolean
  /** Compact variant without the bottom section, used on mobile. */
  compact?: boolean
}

export function PreviewShell({
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
      className={`flex flex-1 flex-col w-full ${minH} rounded-[14px] border border-slate-200/80 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.05)] overflow-hidden text-ink ${className}`}
    >
      {children}
    </div>
  )
}

export function useRevealOrProp(isRevealedProp?: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-30px" })
  return { ref, isRevealed: isRevealedProp ?? inView }
}

export function PreviewHeader({
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
