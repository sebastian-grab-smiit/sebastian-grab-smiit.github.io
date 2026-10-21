"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import type { Dictionary, Locale } from "@/lib/dictionary"
import { BRAND, hexToRgb } from "@/lib/brand"
import { siteConfig } from "@/site.config"
import { MobileFocusCinema, type CinemaItem } from "./mobile-cinema"
import { AnalyticsPreview } from "./previews/analytics-preview"
import { AppsPreview } from "./previews/apps-preview"
import type { PreviewProps } from "./previews/shell"
import { StrategyPreview } from "./previews/strategy-preview"

interface FocusProps {
  dict: Dictionary
  locale: Locale
}

type FocusCard = {
  key: "apps" | "analytics" | "strategy"
  accent: string
  accentLight: string
  renderPreview: (props: PreviewProps) => React.ReactNode
}

export default function Focus({ dict, locale }: FocusProps) {
  const previews = dict.focus.previews
  const cards: FocusCard[] = [
    {
      key: "apps",
      accent: BRAND.magenta,
      accentLight: BRAND.magentaLight,
      renderPreview: (props) => <AppsPreview {...props} t={previews.apps} />,
    },
    {
      key: "analytics",
      accent: BRAND.blue,
      accentLight: BRAND.blueLight,
      renderPreview: (props) => <AnalyticsPreview {...props} t={previews.analytics} />,
    },
    {
      key: "strategy",
      accent: BRAND.slate,
      accentLight: BRAND.slateLight,
      renderPreview: (props) => <StrategyPreview {...props} t={previews.strategy} />,
    },
  ]
  const hrefFor = (card: FocusCard) => `${siteConfig.company.url}/${locale}/services/${card.key}`

  const cinemaItems: CinemaItem[] = cards.map((card) => ({
    title: dict.focus.cards[card.key].title,
    description: dict.focus.cards[card.key].description,
    href: hrefFor(card),
    accent: { hex: card.accent, lightHex: card.accentLight, rgb: hexToRgb(card.accent) },
    renderPreview: (isRevealed) =>
      card.renderPreview({ accent: card.accent, isRevealed, compact: true }),
  }))

  const headerInner = (
    <div className="sm:text-center 3xl:text-left">
      <span className="inline-flex items-center gap-2 text-caption font-semibold tracking-[0.22em] uppercase text-brand mb-5">
        <span
          aria-hidden="true"
          className="inline-block h-px w-7 bg-gradient-to-r from-transparent to-brand"
        />
        {dict.focus.eyebrow}
      </span>
      <h2 className="font-serif text-h2 text-ink tracking-tight">{dict.sections.focus}</h2>
    </div>
  )

  return (
    <section id="focus" className="relative bg-background -mt-8 3xl:-mt-48 pb-4 md:pb-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: cinema scroll */}
        <MobileFocusCinema items={cinemaItems} header={headerInner} />

        {/* Tablet + Desktop */}
        <div className="hidden md:block">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            {headerInner}
          </motion.div>

          <div className="mt-6 md:mt-8 grid grid-cols-4 min-[1270px]:grid-cols-3 gap-5 md:gap-6">
            {cards.map((card, idx) => (
              <motion.a
                key={card.key}
                href={hrefFor(card)}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className={`group relative bg-white rounded-[1rem] border border-black/5 p-5 md:p-6 shadow-sm hover:shadow-xl transition-shadow flex flex-col overflow-hidden col-span-2 min-[1270px]:col-span-1 ${
                  idx === 2 ? "col-start-2 min-[1270px]:col-start-auto" : ""
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 md:gap-5 items-stretch">
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-serif text-h5 text-ink tracking-tight">
                      {dict.focus.cards[card.key].title}
                    </h3>
                    <p className="mt-3 text-body text-ink/70">
                      {dict.focus.cards[card.key].description}
                    </p>
                  </div>

                  <div className="w-full sm:w-[185px] md:w-[200px] shrink-0 flex">
                    {card.renderPreview({ accent: card.accent })}
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <span
                    className="inline-flex items-center gap-1.5 text-small font-medium transition-transform group-hover:translate-x-0.5"
                    style={{ color: card.accent }}
                  >
                    {dict.focus.learnMore}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
