"use client"

import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"
import { useLenis } from "@/components/smooth-scroll-provider"

export function ScrollToTop() {
  const pathname = usePathname()
  const lenisRef = useLenis()

  useLayoutEffect(() => {
    const hash = window.location.hash

    if (hash) {
      // Wait briefly so client components below the fold have rendered their anchors.
      const timeoutId = setTimeout(() => {
        const element = document.querySelector<HTMLElement>(hash)
        if (!element) return
        if (lenisRef.current) {
          lenisRef.current.scrollTo(element, { immediate: true })
        } else {
          element.scrollIntoView({ behavior: "instant" })
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    }
  }, [pathname, lenisRef])

  return null
}
