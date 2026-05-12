import type { Metadata } from "next"
import type { Locale } from "./dictionary"

export const SITE_NAME = "Sebastian Grab"
export const SITE_URL = "https://grab.smiit.de"

type LocalizedString = { de: string; en: string }

export function buildPageMetadata({
  lang,
  title,
  description,
  path = "/",
}: {
  lang: Locale
  title: LocalizedString
  description: LocalizedString
  path?: string
}): Metadata {
  const t = title[lang]
  const d = description[lang]
  const url = `${SITE_URL}/${lang}${path === "/" ? "" : path}`

  return {
    metadataBase: new URL(SITE_URL),
    title: t,
    description: d,
    alternates: {
      canonical: url,
      languages: {
        de: `${SITE_URL}/de/`,
        en: `${SITE_URL}/en/`,
        "x-default": `${SITE_URL}/de/`,
      },
    },
    openGraph: {
      title: t,
      description: d,
      url,
      siteName: SITE_NAME,
      locale: lang === "de" ? "de_DE" : "en_US",
      type: "profile",
      images: [
        {
          url: "/og-image.webp",
          width: 1920,
          height: 999,
          alt: SITE_NAME,
        },
        {
          url: "/og-image.png",
          width: 1920,
          height: 999,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t,
      description: d,
      images: ["/og-image.webp", "/og-image.png"],
    },
  }
}
