"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function Header({ forceLang }: { forceLang?: string }) {
  const pathname = usePathname() || "/"
  const detectedLang = pathname.startsWith("/en") ? "en" : "de"
  const lang = forceLang || detectedLang
  const cvHref = `/${lang}/`

  const L =
    lang === "de"
      ? {
          start: "Start",
          focus: "Mein Fokus",
          experience: "Erfahrung",
          projects: "Projekte",
          contact: "Sprechen Sie mit mir",
        }
      : {
          start: "Home",
          focus: "My focus",
          experience: "Experience",
          projects: "Projects",
          contact: "Talk to a difital expert",
        }

  const navLinks = [
    { href: "#hero", label: L.start },
    { href: "#focus", label: L.focus },
    { href: "#skills", label: L.experience },
    { href: "#projects", label: L.projects },
  ]

  const contactHref = "#book"

  return (
    <nav
      aria-label={lang === "de" ? "Hauptnavigation" : "Main navigation"}
      className="fixed top-0 w-full z-50 transition-all duration-300 bg-transparent backdrop-blur-md"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-18">
          <Link href={cvHref} className="flex items-center relative group" scroll={false}>
            <Image
              src="/logo_black.png"
              alt="smiit"
              width={140}
              height={48}
              className="h-11 lg:h-12 w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden lg:flex items-center gap-14">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 text-sm font-medium text-black hover:text-black/70 transition-colors cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <a href={contactHref} className="hidden lg:block">
              <Button className="bg-[#F703EB] hover:bg-[#DE02D2] text-white rounded-md px-3 py-2 font-medium text-sm tracking-tight cursor-pointer shadow-none border-none">
                {L.contact}
              </Button>
            </a>
            <div className="px-2 hidden lg:block">
              <LanguageSwitcher />
            </div>

            <div className="lg:hidden flex items-center gap-3">
              <a
                href={contactHref}
                aria-label={L.contact}
                className="h-8.5 w-8.5 rounded-lg border border-[#F703EB] bg-[#F703EB]/85 backdrop-blur-md flex items-center justify-center shadow-sm"
              >
                <CalendarDays className="h-4 w-4 text-white" />
              </a>

              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
