/**
 * Validates the Google Sheet without building the site.
 *
 *   npm run check:sheet
 *
 * Prints the row count per tab and language, flags tabs where the German and English
 * versions have a different number of rows, and exits non-zero on any validation error.
 */
import { fetchCv, type CvData } from "@/lib/sheet"

function countByLanguage(rows: { language: string }[]) {
  return {
    DE: rows.filter((r) => r.language === "DE").length,
    EN: rows.filter((r) => r.language === "EN").length,
  }
}

async function main() {
  const data: CvData = await fetchCv()
  const warnings: string[] = []

  console.log("Sheet         DE    EN")
  for (const [name, rows] of Object.entries(data)) {
    const { DE, EN } = countByLanguage(rows)
    console.log(`${name.padEnd(12)} ${String(DE).padStart(3)}   ${String(EN).padStart(3)}`)
    if (DE !== EN) warnings.push(`"${name}" has ${DE} German and ${EN} English rows`)
  }

  for (const lang of ["DE", "EN"] as const) {
    if (!data.personal.some((p) => p.language === lang)) {
      throw new Error(`"personal" has no row for ${lang}; the ${lang} page would be empty`)
    }
  }

  if (warnings.length > 0) {
    console.warn(`\nWarnings:\n${warnings.map((w) => `  - ${w}`).join("\n")}`)
  }
  console.log("\nSheet is valid.")
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
