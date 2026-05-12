"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import Lenis from "lenis"

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

interface SmoothScrollProviderProps {
  children: ReactNode
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (reducedMotion) return

    const instance = new Lenis({
      // Keep smooth scrolling, but reduce long interpolation tails that amplify dropped frames.
      duration: 0.8,
      // Easing function – ease-out quart for a natural deceleration feel
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      // Smooth wheel scrolling
      smoothWheel: true,
      // Use Lenis' internal RAF to avoid a second custom animation loop.
      autoRaf: true,
      // Slightly reduce wheel speed for a calmer feel without feeling sticky.
      wheelMultiplier: 0.9,
      // Touch scrolling
      touchMultiplier: 0.8,
      // Infinite scroll disabled
      infinite: false,
    })

    setLenis(instance)

    return () => {
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  )
}
