"use client"

import { useCallback, useMemo, useState } from "react"
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

  const selectLang = useCallback(
    (target: Lang) => {
      if (target === current) return
      const nextPath = buildPathForLang(pathname, target)
      const search = typeof window !== "undefined" ? window.location.search : ""
      const hash = typeof window !== "undefined" ? window.location.hash : ""
      router.push(`${nextPath}${search}${hash}`)
      setIsOpen(false)
    },
    [current, pathname, router],
  )

  const currentLang = languages.find((l) => l.code === current) || languages[0]

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={`flex items-center gap-2 px-2 py-2 text-sm font-medium transition-colors cursor-pointer bg-transparent border-none outline-none ${
          light ? "text-white hover:text-white/70" : "text-black hover:text-black/70"
        }`}
        aria-label="Language selection"
      >
        {currentLang.short}
        <ChevronDown className="w-4 h-4 opacity-60" />
      </button>

      <div
        className={`absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-md border border-black/10 rounded-xl shadow-xl transition-all duration-200 z-50 ${
          isOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-2"
        }`}
      >
        <div className="p-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => selectLang(lang.code)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                lang.code === current
                  ? "bg-black/5 text-black font-medium"
                  : "text-gray-700 hover:bg-black/5"
              }`}
            >
              <Flag country={lang.country} />
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
