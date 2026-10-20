import { PDFDocument } from "pdf-lib"
import { describe, expect, it } from "vitest"
import {
  academics,
  certificates,
  languages,
  person,
  projects,
  resume,
  skills,
} from "@/test/fixtures"
import { buildCvPdf } from "./cv-pdf"
import { buildProjectsPdf } from "./projects-pdf"

// Smoke tests: the generators must produce valid PDFs from realistic data.
// Image loading fails gracefully in Node (relative URLs), so no network is needed.

describe("buildCvPdf", () => {
  it("renders a single-page CV", async () => {
    const progress: number[] = []
    const bytes = await buildCvPdf({
      locale: "de",
      person,
      resume,
      academics,
      skills,
      languages,
      certificates,
      onProgress: (p) => progress.push(p),
    })

    const doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBe(1)
    expect(doc.getTitle()).toBe("Erika Mustermann - CV")
    expect(progress.at(-1)).toBeLessThanOrEqual(1)
  })
})

describe("buildProjectsPdf", () => {
  it("paginates a long project list", async () => {
    const bytes = await buildProjectsPdf({ locale: "en", person, projects })

    const doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBeGreaterThan(1)
  })
})
