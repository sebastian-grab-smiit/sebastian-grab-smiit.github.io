"use client"

import { motion } from "framer-motion"
import type { Certificate } from "@/lib/sheet"
import type { Dictionary, Locale } from "@/lib/dictionary"
import { formatMonth } from "@/lib/format"

interface CertificatesProps {
  certificates: Certificate[]
  locale: Locale
  dict: Dictionary
}

export default function Certificates({ certificates, locale, dict }: CertificatesProps) {
  if (certificates.length === 0) return null

  const sorted = [...certificates].sort(
    (a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0),
  )

  return (
    <section
      id="certificates"
      className="relative bg-background -mt-6 md:-mt-12 pb-16 md:pb-24"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="font-serif text-[1.7rem] sm:text-[2rem] md:text-[2.2rem] leading-tight text-[#0B162D] tracking-tight mb-8 md:mb-10 text-left sm:text-center 3xl:text-left"
        >
          {dict.sections.certificates}
        </motion.h2>

        {/* Mobile + tablet: horizontal scroll-snap carousel */}
        <div className="lg:hidden -mx-4 sm:-mx-6 overflow-x-auto snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch gap-4 px-4 sm:px-6 pb-2">
            {sorted.map((c, idx) => (
              <CertificateCard
                key={`${c.certificateName}-${idx}`}
                c={c}
                idx={idx}
                locale={locale}
                className="shrink-0 snap-start"
              />
            ))}
          </div>
        </div>

        {/* Desktop: wrapped grid */}
        <div className="hidden lg:flex flex-wrap items-stretch justify-center gap-6">
          {sorted.map((c, idx) => (
            <CertificateCard
              key={`${c.certificateName}-${idx}`}
              c={c}
              idx={idx}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function CertificateCard({
  c,
  idx,
  locale,
  className = "",
}: {
  c: Certificate
  idx: number
  locale: Locale
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4) }}
      className={`w-[220px] sm:w-[240px] bg-white rounded-[1.25rem] p-5 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-shadow border border-transparent hover:border-black/5 ${className}`}
    >
      {c.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={c.logoUrl}
          alt={c.certificateName}
          className="h-16 w-auto object-contain mb-3"
        />
      ) : (
        <div className="h-16 w-16 mb-3 rounded-md bg-black/5" aria-hidden="true" />
      )}
      <div className="text-sm font-medium text-black leading-snug text-balance">
        {c.certificateName}
      </div>
      <div className="text-xs font-mono text-black/55 mt-1">
        {c.date ? formatMonth(locale, c.date, "") : ""}
      </div>
    </motion.div>
  )
}
