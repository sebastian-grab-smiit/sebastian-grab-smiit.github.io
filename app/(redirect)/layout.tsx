import type React from "react"

export default function RedirectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background:
            "linear-gradient(to bottom, #B9CAF4, #C7D4F6, #D9E1FA)",
        }}
      >
        {children}
      </body>
    </html>
  )
}
