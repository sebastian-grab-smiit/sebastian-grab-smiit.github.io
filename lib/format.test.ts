import { describe, expect, it } from "vitest"
import { bulletize, formatMonth, formatRange, splitTags } from "./format"

const d = (iso: string) => new Date(`${iso}T00:00:00Z`)

describe("formatMonth", () => {
  it("formats month and year per locale", () => {
    expect(formatMonth("de", d("2022-10-01"), "heute")).toBe("Okt. 2022")
    expect(formatMonth("en", d("2022-10-01"), "present")).toBe("Oct 2022")
  })

  it("does not shift the month for the first day in western time zones", () => {
    // Regression: local-time formatting rendered 2022-10-01 as "Sep 2022" in the US.
    const original = process.env.TZ
    process.env.TZ = "America/Los_Angeles"
    try {
      expect(formatMonth("en", d("2022-10-01"), "present")).toBe("Oct 2022")
    } finally {
      process.env.TZ = original
    }
  })

  it("falls back to the present label without a date", () => {
    expect(formatMonth("de", null, "heute")).toBe("heute")
  })
})

describe("formatRange", () => {
  it("formats an open-ended range", () => {
    expect(formatRange("de", d("2021-05-01"), null, "heute")).toBe("Mai 2021 – heute")
  })

  it("collapses a range within one month", () => {
    expect(formatRange("en", d("2022-04-01"), d("2022-04-30"), "present")).toBe("Apr 2022")
  })

  it("formats a closed range", () => {
    expect(formatRange("en", d("2020-09-15"), d("2023-09-30"), "present")).toBe(
      "Sep 2020 – Sep 2023",
    )
  })
})

describe("splitTags", () => {
  it("splits on semicolons and drops blanks", () => {
    expect(splitTags("Power BI; Azure ;;Python")).toEqual(["Power BI", "Azure", "Python"])
    expect(splitTags("")).toEqual([])
  })
})

describe("bulletize", () => {
  it("splits on bullet characters", () => {
    expect(bulletize("• Analyse • Umsetzung ")).toEqual(["Analyse", "Umsetzung"])
    expect(bulletize("")).toEqual([])
  })
})
