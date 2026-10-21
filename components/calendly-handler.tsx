"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void
    }
  }
}

const WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js"
const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css"
const TRIGGER_SELECTOR = 'a[href*="#book"], [data-open-calendly="true"]'

let widgetPromise: Promise<void> | null = null

/**
 * Loads the Calendly widget on first use instead of on every page view: it is ~100 KB of
 * third-party JS and sets third-party cookies, but only matters once someone wants to book.
 */
function loadWidget(): Promise<void> {
  if (window.Calendly) return Promise.resolve()
  widgetPromise ??= new Promise<void>((resolve, reject) => {
    const css = document.createElement("link")
    css.rel = "stylesheet"
    css.href = WIDGET_CSS
    document.head.appendChild(css)

    const script = document.createElement("script")
    script.src = WIDGET_JS
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      widgetPromise = null
      script.remove()
      reject(new Error("Calendly widget failed to load"))
    }
    document.head.appendChild(script)
  })
  return widgetPromise
}

function currentLang(): "de" | "en" {
  return document.documentElement.lang.toLowerCase().startsWith("en") ||
    window.location.pathname.startsWith("/en")
    ? "en"
    : "de"
}

function bookingUrl(override?: string): string {
  const lang = currentLang()
  const fallback = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() ?? ""
  const perLang =
    lang === "en"
      ? process.env.NEXT_PUBLIC_CALENDLY_URL_EN?.trim()
      : process.env.NEXT_PUBLIC_CALENDLY_URL_DE?.trim()
  const base = (override ?? (perLang || fallback)).trim()
  if (!base) return ""

  try {
    const url = new URL(base)
    url.searchParams.set("locale", lang)
    return url.toString()
  } catch {
    return `${base}${base.includes("?") ? "&" : "?"}locale=${lang}`
  }
}

function clearBookHash() {
  if (window.location.hash === "#book") {
    history.replaceState(null, "", window.location.pathname + window.location.search)
  }
}

/**
 * Opens the Calendly popup for links to `#book` (and `[data-open-calendly]` elements),
 * also when the page is opened with `#book` in the URL.
 */
export function CalendlyHandler({ url }: { url?: string }) {
  useEffect(() => {
    const open = async () => {
      const target = bookingUrl(url)
      if (!target) return
      clearBookHash()
      try {
        await loadWidget()
        window.Calendly?.initPopupWidget({ url: target })
      } catch {
        window.open(target, "_blank", "noopener,noreferrer")
      }
    }

    const isTrigger = (e: Event) =>
      e.target instanceof Element && e.target.closest(TRIGGER_SELECTOR) !== null

    // Start downloading as soon as the user shows intent, so the popup opens without delay.
    const onIntent = (e: Event) => {
      if (isTrigger(e)) loadWidget().catch(() => {})
    }
    const onClick = (e: MouseEvent) => {
      if (!isTrigger(e)) return
      e.preventDefault()
      e.stopPropagation()
      void open()
    }
    const onHashChange = () => {
      if (window.location.hash === "#book") void open()
    }

    onHashChange()
    const intentEvents = ["pointerover", "pointerdown", "focusin"] as const
    intentEvents.forEach((type) => document.addEventListener(type, onIntent, true))
    document.addEventListener("click", onClick, true)
    window.addEventListener("hashchange", onHashChange)
    return () => {
      intentEvents.forEach((type) => document.removeEventListener(type, onIntent, true))
      document.removeEventListener("click", onClick, true)
      window.removeEventListener("hashchange", onHashChange)
    }
  }, [url])

  return null
}
