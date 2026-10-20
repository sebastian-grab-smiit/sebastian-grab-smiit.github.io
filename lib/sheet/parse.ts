import Papa from "papaparse"
import type { RowOf, SheetSpec } from "./schema"

export class SheetValidationError extends Error {
  constructor(
    readonly sheet: string,
    readonly issues: string[],
  ) {
    super(`Sheet "${sheet}" is invalid:\n${issues.map((i) => `  - ${i}`).join("\n")}`)
    this.name = "SheetValidationError"
  }
}

function clean(cell: unknown): string {
  if (typeof cell !== "string") return ""
  return cell
    .replace(/^"+|"+$/g, "")
    .replace(/\r/g, "")
    .trim()
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase()
}

function checkHeader(sheet: string, spec: SheetSpec, header: string[]): string[] {
  const issues: string[] = []
  Object.values(spec).forEach((column, i) => {
    const actual = header[i]
    if (actual === undefined) {
      if (!column.optional)
        issues.push(`column ${i + 1}: expected "${column.header}", but the column is missing`)
      return
    }
    if (normalizeHeader(actual) !== normalizeHeader(column.header)) {
      issues.push(`column ${i + 1}: expected header "${column.header}", found "${actual}"`)
    }
  })
  if (issues.length > 0) {
    issues.push(
      `expected columns: ${Object.values(spec)
        .map((c) => c.header)
        .join(" | ")}`,
    )
  }
  return issues.length > 0 ? [`header row of "${sheet}" does not match:`, ...issues] : []
}

/**
 * Parses the CSV export of one sheet tab into typed rows.
 *
 * All problems (header mismatch and every invalid cell) are collected and thrown
 * together as a {@link SheetValidationError}, with spreadsheet row numbers, so a
 * broken sheet can be fixed in a single pass.
 */
export function parseSheet<S extends SheetSpec>(sheet: string, spec: S, csv: string): RowOf<S>[] {
  const { data } = Papa.parse<string[]>(csv, { skipEmptyLines: "greedy" })
  const [header = [], ...body] = data.map((row) => row.map(clean))

  const headerIssues = checkHeader(sheet, spec, header)
  if (headerIssues.length > 0) throw new SheetValidationError(sheet, headerIssues)

  const keys = Object.keys(spec) as (keyof S & string)[]
  const issues: string[] = []
  const rows: RowOf<S>[] = []

  body.forEach((cells, i) => {
    const rowNumber = i + 2 // 1-based, after the header row
    const row = {} as Record<string, unknown>
    keys.forEach((key, col) => {
      const column = spec[key]
      const result = column.schema.safeParse(cells[col] ?? "")
      if (result.success) {
        row[key] = result.data
      } else {
        const message = result.error.issues[0]?.message ?? "invalid value"
        issues.push(
          `row ${rowNumber}, column "${column.header}": ${message} (got "${cells[col] ?? ""}")`,
        )
      }
    })
    rows.push(row as RowOf<S>)
  })

  if (issues.length > 0) throw new SheetValidationError(sheet, issues)
  return rows
}
