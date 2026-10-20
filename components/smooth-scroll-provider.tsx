"use client"

import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react"
import Lenis from "lenis"

const LenisContext = createContext<RefObject<Lenis | null>>({ current: null })

/**
 * Ref to the Lenis instance; `current` is null before mount and when the user
 * prefers reduced motion. Read it inside effects or event handlers, not during render.
 */
export function useLenis() {
  return useContext(LenisContext)
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const instance = new Lenis({
      // Keep smooth scrolling, but reduce long interpolation tails that amplify dropped frames.
      duration: 0.8,
      // Ease-out quart for a natural deceleration feel.
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      // Use Lenis' internal RAF to avoid a second custom animation loop.
      autoRaf: true,
      // Slightly reduce wheel speed for a calmer feel without feeling sticky.
      wheelMultiplier: 0.9,
      touchMultiplier: 0.8,
      infinite: false,
    })
    lenisRef.current = instance

    return () => {
      instance.destroy()
      lenisRef.current = null
    }
  }, [])

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
}
