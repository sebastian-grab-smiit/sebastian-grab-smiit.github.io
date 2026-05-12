import type { Metadata } from "next"

const title = "Sebastian Grab – Lebenslauf"
const description =
  "Lebenslauf von Sebastian Grab: Werdegang, Projekte, Kenntnisse und Zertifikate."

export const metadata: Metadata = {
  metadataBase: new URL("https://grab.smiit.de"),
  title,
  description,
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
