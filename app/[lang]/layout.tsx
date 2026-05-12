import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"
import "../globals.css"
import Footer from "@/components/footer"
import Header from "@/components/header"
import { ScrollToTop } from "@/components/scroll-to-top"
import { CalendlyHandler } from "@/components/calendly-handler"
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider"
import { SITE_NAME, SITE_URL, buildPageMetadata } from "@/lib/seo"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  return buildPageMetadata({
    lang: lang === "en" ? "en" : "de",
    title: {
      de: "Sebastian Grab – Lebenslauf",
      en: "Sebastian Grab – CV",
    },
    description: {
      de: "Lebenslauf von Sebastian Grab: Werdegang, Projekte, Kenntnisse und Zertifikate.",
      en: "Sebastian Grab's CV: experience, projects, skills, and certificates.",
    },
  })
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0B162D" },
  ],
  width: "device-width",
  initialScale: 1,
}

export async function generateStaticParams() {
  return [{ lang: "de" }, { lang: "en" }]
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sebastian Grab",
  jobTitle: "Co-Founder & Software Engineer",
  url: SITE_URL,
  email: "sebastian.grab@smiit.de",
  worksFor: {
    "@type": "Organization",
    name: SITE_NAME,
    url: "https://www.smiit.de",
  },
  sameAs: [
    "https://www.linkedin.com/in/sebastian-grab/",
    "https://www.smiit.de",
  ],
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const { lang } = await params
  return (
    <html lang={lang}>
      <body
        className={`${geist.variable} ${geistMono.variable} ${playfair.variable} font-sans antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <SmoothScrollProvider>
          <ScrollToTop />
          <CalendlyHandler />
          <Header forceLang={lang} />
          {children}
          <Footer forceLang={lang} />
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
