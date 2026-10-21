"use client"

import Image from "next/image"
import { Mail, MapPin, Phone, Linkedin } from "lucide-react"
import { siteConfig } from "@/site.config"

export default function Footer({ forceLang }: { forceLang?: string }) {
  const lang = forceLang === "en" ? "en" : "de"

  const L =
    lang === "de"
      ? {
          rights: "Alle Rechte vorbehalten.",
          imprint: "Impressum",
          privacy: "Datenschutz",
          contact: "Kontakt",
        }
      : {
          rights: "All rights reserved.",
          imprint: "Legal Notice",
          privacy: "Privacy",
          contact: "Contact",
        }

  return (
    <footer className="bg-background py-10 border-t border-black/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between gap-8 sm:gap-12 mb-8 mt-4">
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-lg flex-shrink-0">
              <Image
                src={siteConfig.portrait}
                alt={siteConfig.name}
                fill
                sizes="(max-width: 640px) 64px, 80px"
                className="object-cover"
              />
            </div>
            <div className="space-y-1 pt-1">
              <div className="text-small font-semibold text-black">{siteConfig.name}</div>
              <div className="text-small text-black/70 leading-relaxed">
                {siteConfig.role}
                <br />
                {siteConfig.company.name}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-small font-semibold text-black">{L.contact}</h3>
            <ul className="space-y-2 text-small text-black/70">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-black transition-colors"
                >
                  {siteConfig.email}
                </a>
              </li>
              {siteConfig.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <a
                    href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                    className="hover:text-black transition-colors"
                  >
                    {siteConfig.phone}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{siteConfig.location}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-small font-semibold text-black">Links</h3>
            <ul className="space-y-2 text-small text-black/70">
              <li>
                <a
                  href={siteConfig.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-black transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://www.smiit.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors"
                >
                  smiit.de
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-caption text-black/55">
            © {new Date().getFullYear()} {siteConfig.name} · {siteConfig.company.name}. {L.rights}
          </p>
          <div className="flex gap-6 text-caption text-black/55">
            <a
              href={`https://www.smiit.de/${lang}/legal-notice`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              {L.imprint}
            </a>
            <a
              href={`https://www.smiit.de/${lang}/privacy`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              {L.privacy}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
