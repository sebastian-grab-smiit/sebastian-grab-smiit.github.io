import type { PDFFont } from "pdf-lib"
import { describe, expect, it } from "vitest"
import { sanitize, wrapJoinedTokens, wrapText } from "./text"

/** Monospace stand-in: every character is `size` units wide. */
const font = { widthOfTextAtSize: (text: string, size: number) => text.length * size } as PDFFont

describe("sanitize", () => {
  it("replaces characters outside WinAnsi with ASCII equivalents", () => {
    expect(sanitize("Umsatz → schneller … „gut“")).toBe('Umsatz -> schneller ... "gut"')
  })

  it("keeps Latin-1 characters such as umlauts", () => {
    expect(sanitize("Größe · Übersicht – ok")).toBe("Größe · Übersicht – ok")
  })

  it("replaces unsupported characters with a question mark", () => {
    expect(sanitize("Emoji 🚀")).toBe("Emoji ?")
    expect(sanitize(undefined)).toBe("")
  })
})

describe("wrapText", () => {
  it("wraps on word boundaries within the max width", () => {
    expect(wrapText("aa bb cc dd", font, 1, 5)).toEqual(["aa bb", "cc dd"])
  })

  it("keeps explicit line breaks and blank lines", () => {
    expect(wrapText("aa\n\nbb", font, 1, 10)).toEqual(["aa", "", "bb"])
  })

  it("hard-breaks words longer than a line", () => {
    expect(wrapText("abcdefgh", font, 1, 3)).toEqual(["abc", "def", "gh"])
  })
})

describe("wrapJoinedTokens", () => {
  it("joins tokens with the separator and wraps between tokens", () => {
    expect(wrapJoinedTokens(["SQL", "Python", "Go"], " · ", font, 1, 12)).toEqual([
      "SQL · Python",
      "Go",
    ])
  })
})
