import type { Metadata } from "next"
import { DEFAULT_COPY, SITE_URL } from "@/lib/seo"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_COPY.title.de,
  description: DEFAULT_COPY.description.de,
  alternates: {
    canonical: "/de/",
    languages: {
      de: "/de/",
      en: "/en/",
      "x-default": "/de/",
    },
  },
  robots: { index: false, follow: true },
}

export default function RootRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content="0;url=/de/" />
      <script
        dangerouslySetInnerHTML={{
          __html: "window.location.replace('/de/');",
        }}
      />
    </>
  )
}
