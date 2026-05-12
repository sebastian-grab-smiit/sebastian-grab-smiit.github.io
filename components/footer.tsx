"use client"

import Image from "next/image"
import { Mail, MapPin, Phone, Linkedin } from "lucide-react"

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
                src="/assets/sebastian.webp"
                alt="Sebastian Grab"
                fill
                sizes="(max-width: 640px) 64px, 80px"
                className="object-cover"
              />
            </div>
            <div className="space-y-1 pt-1">
              <div className="text-sm font-semibold text-black">Sebastian Grab</div>
              <div className="text-sm text-black/70 leading-relaxed">
                Co-Founder & Software Engineer
                <br />
                smiit GmbH
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-black">{L.contact}</h3>
            <ul className="space-y-2 text-sm text-black/70">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a
                  href="mailto:sebastian.grab@smiit.de"
                  className="hover:text-black transition-colors"
                >
                  sebastian.grab@smiit.de
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a
                  href="tel:+491604073198"
                  className="hover:text-black transition-colors"
                >
                  +49 160 4073198
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>70176 Stuttgart</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-black">Links</h3>
            <ul className="space-y-2 text-sm text-black/70">
              <li>
                <a
                  href="https://www.linkedin.com/in/sebastian-grab/"
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
          <p className="text-xs text-black/55">
            © {new Date().getFullYear()} Sebastian Grab · smiit GmbH. {L.rights}
          </p>
          <div className="flex gap-6 text-xs text-black/55">
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
