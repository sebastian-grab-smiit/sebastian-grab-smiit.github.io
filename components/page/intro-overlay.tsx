"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"

type Phase = "initial" | "zoom" | "text" | "exit"

const EXIT_MS = 650
const ENTER_AT_MS = 100
const TEXT_AT_MS = 1100
const EXIT_AT_MS = 3200

export function IntroOverlay({
  onDone,
  onExitStart,
}: {
  onDone: () => void
  onExitStart?: () => void
}) {
  const [phase, setPhase] = useState<Phase>("initial")
  const pathname = usePathname() || "/"
  const lang = pathname.startsWith("/en") ? "en" : "de"
  const prefersReducedMotion = useReducedMotion()
  const exitStartedRef = useRef(false)
  const onDoneRef = useRef(onDone)
  const onExitStartRef = useRef(onExitStart)

  const L =
    lang === "de"
      ? { loading: "Daten laden..." }
      : { loading: "Loading data..." }

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    onExitStartRef.current = onExitStart
  }, [onExitStart])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const startExit = () => {
      setPhase("exit")
      if (!exitStartedRef.current) {
        exitStartedRef.current = true
        onExitStartRef.current?.()
      }
    }

    if (prefersReducedMotion) {
      startExit()
      const timerDone = window.setTimeout(() => onDoneRef.current(), 50)
      return () => {
        document.body.style.overflow = prevOverflow
        clearTimeout(timerDone)
      }
    }

    const timer1 = window.setTimeout(() => setPhase("zoom"), ENTER_AT_MS)
    const timer2 = window.setTimeout(() => setPhase("text"), TEXT_AT_MS)
    const timer3 = window.setTimeout(() => startExit(), EXIT_AT_MS)
    const timer4 = window.setTimeout(() => onDoneRef.current(), EXIT_AT_MS + EXIT_MS)

    return () => {
      document.body.style.overflow = prevOverflow
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [prefersReducedMotion])

  return (
    <motion.div
      className={[
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center",
        "px-6 sm:px-8",
        "text-center",
        "bg-gradient-to-b from-[#B9CAF4] via-[#C7D4F6] to-[#D9E1FA]",
        "will-change-[opacity]",
      ].join(" ")}
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{ duration: EXIT_MS / 1000, ease: "easeOut" }}
    >
      <motion.div
        className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={
          phase === "initial"
            ? { scale: 0.5, opacity: 0 }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image src="/icon.png" alt="smiit" fill className="object-contain" priority />
      </motion.div>

      <div className="mt-6 sm:mt-8 flex flex-col items-center">
        <div className="h-8 overflow-hidden flex items-center justify-center">
          <motion.p
            className={[
              "font-serif md:font-sans text-black font-light sm:text-balance uppercase",
              "tracking-[0.22em]",
              "text-[12px] sm:text-xs md:text-[16px]",
              "will-change-[transform,opacity]",
            ].join(" ")}
            initial={{ y: 24, opacity: 0 }}
            animate={
              phase === "text" || phase === "exit"
                ? { y: 0, opacity: 1 }
                : { y: 24, opacity: 0 }
            }
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          >
            {L.loading}
          </motion.p>
        </div>

        <motion.div
          className="mt-6 sm:mt-8 w-24 sm:w-28 md:w-32 h-[1px] bg-black/10 overflow-hidden rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "text" || phase === "exit" ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            className="h-full bg-black/40"
            initial={{ width: "0%" }}
            animate={{ width: phase === "text" || phase === "exit" ? "100%" : "0%" }}
            transition={{ duration: 2.0, ease: "easeOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
