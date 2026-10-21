"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import ReactCountryFlag from "react-country-flag"

type Lang = "de" | "en"

const languages: Array<{
  code: Lang
  label: string
  short: string
  country: string
}> = [
  { code: "de", label: "Deutsch", short: "DE", country: "DE" },
  { code: "en", label: "English", short: "EN", country: "GB" },
]

function computeLangFromPath(pathname: string | null | undefined): Lang {
  if (!pathname) return "de"
  if (pathname.startsWith("/en")) return "en"
  return "de"
}

function buildPathForLang(pathname: string, target: Lang): string {
  if (pathname === "/" || pathname === "") return `/${target}/`
  if (pathname.startsWith("/de/") || pathname === "/de") {
    return pathname.replace(/^\/de(\/|$)/, `/${target}/`)
  }
  if (pathname.startsWith("/en/") || pathname === "/en") {
    return pathname.replace(/^\/en(\/|$)/, `/${target}/`)
  }
  return `/${target}${pathname.endsWith("/") ? "" : "/"}`
}

function Flag({ country }: { country: string }) {
  return (
    <ReactCountryFlag
      countryCode={country}
      svg
      style={{ width: "1.1rem", height: "1.1rem", borderRadius: "2px" }}
      aria-hidden="true"
    />
  )
}

export function LanguageSwitcher({ light = false }: { light?: boolean }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const current = useMemo(() => computeLangFromPath(pathname), [pathname])
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  // Hover opens the menu for mouse users; the click that usually follows must not close it again.
  const openedByHoverRef = useRef(false)
  const menuId = useId()

  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen])

  const selectLang = useCallback(
    (target: Lang) => {
      setIsOpen(false)
      if (target === current) return
      const nextPath = buildPathForLang(pathname, target)
      router.push(`${nextPath}${window.location.search}${window.location.hash}`)
    },
    [current, pathname, router],
  )

  const currentLang = languages.find((l) => l.code === current) || languages[0]

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => {
        openedByHoverRef.current = !isOpen
        setIsOpen(true)
      }}
      onMouseLeave={() => setIsOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsOpen(false)
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (openedByHoverRef.current) {
            openedByHoverRef.current = false
            return
          }
          setIsOpen((open) => !open)
        }}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={`Language: ${currentLang.label}`}
        className={`flex items-center gap-2 px-2 py-2 text-small font-medium transition-colors cursor-pointer bg-transparent border-none ${
          light ? "text-white hover:text-white/70" : "text-black hover:text-black/70"
        }`}
      >
        {currentLang.short}
        <ChevronDown
          aria-hidden="true"
          className={`w-4 h-4 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id={menuId}
        className={`absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-md border border-black/10 rounded-xl shadow-xl transition-all duration-200 z-50 ${
          isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
        }`}
      >
        <ul className="p-1">
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                lang={lang.code}
                aria-current={lang.code === current ? "true" : undefined}
                onClick={() => selectLang(lang.code)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-small rounded-lg transition-colors cursor-pointer ${
                  lang.code === current
                    ? "bg-black/5 text-black font-medium"
                    : "text-gray-700 hover:bg-black/5"
                }`}
              >
                <Flag country={lang.country} />
                <span>{lang.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
