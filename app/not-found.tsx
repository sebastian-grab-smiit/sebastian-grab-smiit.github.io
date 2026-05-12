"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })

export default function NotFound() {
  const pathname = usePathname() || "/"
  const lang = pathname.startsWith("/en") ? "en" : "de"
  const base = `/${lang}`

  const L =
    lang === "de"
      ? {
          title: "Seite nicht gefunden",
          description: "Die von Ihnen gesuchte Seite existiert leider nicht.",
          homeButton: "Zur Startseite",
        }
      : {
          title: "Page Not Found",
          description: "The page you are looking for does not exist.",
          homeButton: "Go to Homepage",
        }

  return (
    <html lang={lang}>
      <head>
        <title>{L.title}</title>
        <meta name="description" content={L.description} />
        <meta name="robots" content="noindex,follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0B162D" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} ${playfair.variable} font-sans antialiased`}
      >
        <main className="min-h-screen flex flex-col">
          <section className="relative w-full min-h-[70vh] h-[88vh] md:h-[95vh] max-h-[980px] rounded-b-[1.75rem] overflow-hidden bg-[url('/assets/not_found_mobile.webp')] md:bg-[url('/assets/not_found.webp')] bg-cover bg-center bg-no-repeat flex flex-col">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/45 via-white/25 to-black/35" />
            <div className="relative z-10 flex-grow flex items-start justify-center px-4 pt-20 mt-2 md:mt-0 md:pt-14">
              <div className="w-full max-w-3xl mx-auto text-center md:text-right font-serif">
                <div className="mb-8">
                  <h1 className="text-[100px] md:text-[150px] font-bold text-primary/20 leading-none">
                    404
                  </h1>
                </div>

                <div className="mt-12 mb-8">
                  <h2 className="text-3xl md:text-4xl mb-4 text-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]">
                    {L.title}
                  </h2>
                  <p className="text-lg md:text-xl text-black/85 mb-2 drop-shadow-[0_1px_2px_rgba(255,255,255,0.45)] md:max-w-[30ch] md:ml-auto">
                    {L.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-end items-center mt-10">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={base}>
                      <Home className="w-5 h-5 mr-2" />
                      {L.homeButton}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
          <Footer forceLang={lang} />
        </main>
      </body>
    </html>
  )
}
