"use client"

import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"
import { useLenis } from "@/components/smooth-scroll-provider"

export function ScrollToTop() {
  const pathname = usePathname()
  const lenis = useLenis()

  useLayoutEffect(() => {
    const hash = window.location.hash

    if (hash) {
      // Hash-Fragment vorhanden: zum entsprechenden Element scrollen
      // Kurzes Timeout, damit das DOM (inkl. Client-Komponenten) vollständig gerendert ist
      const timeoutId = setTimeout(() => {
        const element = document.querySelector(hash) as HTMLElement | null
        if (element) {
          if (lenis) {
            lenis.scrollTo(element, { immediate: true })
          } else {
            element.scrollIntoView({ behavior: "instant" })
          }
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    } else {
      // Kein Hash: Normal zum Seitenanfang scrollen
      if (lenis) {
        lenis.scrollTo(0, { immediate: true })
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" })
      }
    }
  }, [pathname, lenis])

  return null
}
