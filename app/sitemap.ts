import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return (["de", "en"] as const).map((lang) => ({
    url: `${SITE_URL}/${lang}/`,
    lastModified,
    changeFrequency: "monthly",
    priority: lang === "de" ? 1.0 : 0.9,
    alternates: {
      languages: {
        de: `${SITE_URL}/de/`,
        en: `${SITE_URL}/en/`,
        "x-default": `${SITE_URL}/de/`,
      },
    },
  }))
}
