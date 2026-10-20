import { describe, expect, it } from "vitest"
import { parseSheet, SheetValidationError } from "./parse"
import { sheets } from "./schema"

const RESUME_HEADER =
  "Sprache,Startdatum,Enddatum,Unternehmen,Adresse,Logo Url,Rolle,Beschreibung,Aufgaben"

function parseError(fn: () => unknown): SheetValidationError {
  try {
    fn()
  } catch (err) {
    if (err instanceof SheetValidationError) return err
    throw err
  }
  throw new Error("expected a SheetValidationError")
}

describe("parseSheet", () => {
  it("maps columns to typed fields", () => {
    const csv = `${RESUME_HEADER}\nDE,2021-05-01,,smiit GmbH,Ehingen,https://example.com/logo.png,Gründer,Text,• A • B`
    const [row] = parseSheet("resume", sheets.resume, csv)

    expect(row).toEqual({
      language: "DE",
      start: new Date("2021-05-01T00:00:00Z"),
      end: null,
      company: "smiit GmbH",
      address: "Ehingen",
      logoUrl: "https://example.com/logo.png",
      role: "Gründer",
      description: "Text",
      tasks: "• A • B",
      technologies: "",
    })
  })

  it("accepts an optional trailing column when present", () => {
    const csv = `${RESUME_HEADER},Technologien\nEN,2021-05-01,,ACME,,,Dev,,,TypeScript;SQL`
    const [row] = parseSheet("resume", sheets.resume, csv)
    expect(row.technologies).toBe("TypeScript;SQL")
  })

  it("parses numbers with comma or dot and empty cells as null", () => {
    const header = "Sprache,Startdatum,Enddatum,Hochschule,Logo Url,Abschluss,Beschreibung,Note"
    const rows = parseSheet(
      "academics",
      sheets.academics,
      `${header}\nDE,2020-10-01,2023-09-30,DHBW,,B.A.,,"1,5"\nEN,2020-10-01,2023-09-30,DHBW,,B.A.,,`,
    )
    expect(rows.map((r) => r.grade)).toEqual([1.5, null])
  })

  it("skips fully empty rows", () => {
    const csv = `Sprache,Group,Skill,Level (0-100)\nDE,Coding,SQL,85\n,,,\n\nEN,Coding,SQL,85`
    expect(parseSheet("skills", sheets.skills, csv)).toHaveLength(2)
  })

  it("rejects a header row that does not match the schema", () => {
    const csv = `Sprache,Skill,Group,Level (0-100)\nDE,SQL,Coding,85`
    const error = parseError(() => parseSheet("skills", sheets.skills, csv))

    expect(error.issues.join("\n")).toContain('column 2: expected header "Group", found "Skill"')
  })

  it("rejects a missing required column", () => {
    const csv = `Sprache,Group,Skill\nDE,Coding,SQL`
    const error = parseError(() => parseSheet("skills", sheets.skills, csv))

    expect(error.issues.join("\n")).toContain('expected "Level (0-100)", but the column is missing')
  })

  it("reports every invalid cell with its spreadsheet row number", () => {
    const csv = [
      "Sprache,Group,Skill,Level (0-100)",
      "DE,Coding,SQL,85",
      "FR,Coding,Go,120",
      "EN,Coding,,abc",
    ].join("\n")
    const error = parseError(() => parseSheet("skills", sheets.skills, csv))

    expect(error.issues).toEqual([
      'row 3, column "Sprache": expected "DE" or "EN" (got "FR")',
      'row 3, column "Level (0-100)": must be between 0 and 100 (got "120")',
      'row 4, column "Skill": must not be empty (got "")',
      'row 4, column "Level (0-100)": expected a number (got "abc")',
    ])
    expect(error.message).toContain('Sheet "skills" is invalid')
  })

  it("rejects dates that are not ISO formatted", () => {
    const csv = "Sprache,Name,Datum,Logo URL\nDE,PSM I,01.04.2022,"
    const error = parseError(() => parseSheet("certificates", sheets.certificates, csv))

    expect(error.issues[0]).toContain("expected a date in the format YYYY-MM-DD")
  })

  it("rejects image URLs that are neither absolute nor site-relative", () => {
    const csv = "Sprache,Name,Datum,Logo URL\nDE,PSM I,2022-04-01,logo.png"
    const error = parseError(() => parseSheet("certificates", sheets.certificates, csv))

    expect(error.issues[0]).toContain("expected an http(s) URL or a path starting with /")
  })
})
