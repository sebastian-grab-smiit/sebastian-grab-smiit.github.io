"use client"

import { useEffect, useRef, useState } from "react"

export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>(
  options?: { margin?: string; threshold?: number }
) {
  const ref = useRef<T>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true)
          observer.disconnect() // once: true
        }
      },
      {
        rootMargin: options?.margin ?? "-80px",
        threshold: options?.threshold ?? 0,
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [options?.margin, options?.threshold])

  return { ref, isRevealed }
}
