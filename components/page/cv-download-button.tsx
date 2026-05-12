"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import type {
  Personal,
  ResumeEntry,
  Academic,
  Skill,
  LanguageSkill,
  Certificate,
  Project,
} from "@/lib/sheet"
import type { Locale } from "@/lib/dictionary"

interface CvDownloadButtonProps {
  label: React.ReactNode
  locale: Locale
  person: Personal
  resume: ResumeEntry[]
  academics: Academic[]
  skills: Skill[]
  languages: LanguageSkill[]
  certificates: Certificate[]
  projects: Project[]
}

export function CvDownloadButton({
  label,
  locale,
  person,
  resume,
  academics,
  skills,
  languages,
  certificates,
  projects,
}: CvDownloadButtonProps) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)

  const onClick = async () => {
    if (busy) return
    setBusy(true)
    setProgress(0)
    try {
      const { generateAndDownloadCvBundle } = await import("@/lib/pdf/download")
      await generateAndDownloadCvBundle(
        {
          locale,
          person,
          resume,
          academics,
          skills,
          languages,
          certificates,
          projects,
        },
        (pct) => setProgress(pct),
      )
    } catch (err) {
      console.error("CV download failed:", err)
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  const pctRounded = Math.min(100, Math.round(progress))

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-busy={busy}
      className="group relative overflow-hidden flex items-center gap-2 sm:gap-2.5 bg-white hover:bg-white/85 border border-black/10 text-[#0B162D] px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl font-medium text-xs sm:text-sm transition-colors duration-300 cursor-pointer disabled:cursor-progress disabled:opacity-90"
    >
      <span>{label}</span>
      {busy ? (
        <>
          <span
            aria-live="polite"
            className="text-xs tabular-nums text-[#21569c] min-w-[2.5ch] text-right"
          >
            {pctRounded}%
          </span>
          <Loader2 className="w-4 h-4 animate-spin text-[#21569c]" />
        </>
      ) : (
        <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
      )}
      {busy && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[2px] bg-[#21569c] transition-[width] duration-200 ease-out"
          style={{ width: `${pctRounded}%` }}
        />
      )}
    </button>
  )
}
