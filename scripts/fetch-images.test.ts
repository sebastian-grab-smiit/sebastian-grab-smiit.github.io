import sharp from "sharp"
import { describe, expect, it } from "vitest"
import { imageSize } from "@/lib/image-size"
import { imageKey, localImage } from "@/lib/sheet/images"
import { certificates, projects, resume } from "@/test/fixtures"
import { logoUrls, optimizeLogo } from "./fetch-images"

const png = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 4, background: "#21569c" } })
    .png()
    .toBuffer()

describe("optimizeLogo", () => {
  it("downscales large logos into a 256x128 box as WebP", async () => {
    const { data, width, height } = await optimizeLogo(await png(1200, 400))

    expect({ width, height }).toEqual({ width: 256, height: 85 })
    expect((await sharp(data).metadata()).format).toBe("webp")
  })

  it("never enlarges small logos", async () => {
    const { width, height } = await optimizeLogo(await png(40, 40))
    expect({ width, height }).toEqual({ width: 40, height: 40 })
  })
})

describe("logoUrls", () => {
  it("collects unique remote logo URLs only", () => {
    const remote = "https://example.com/logo.png"
    const urls = logoUrls({
      personal: [],
      languages: [],
      skills: [],
      academics: [],
      certificates: [{ ...certificates[0], logoUrl: remote }],
      resume: [{ ...resume[0], logoUrl: "/assets/local.webp" }],
      projects: projects.map((p) => ({ ...p, logoUrl: remote })),
    })
    expect(urls).toEqual([remote])
  })
})

describe("localImage", () => {
  it("keeps site-relative paths and unknown remote URLs unchanged", () => {
    expect(localImage("/assets/logo.webp")).toBe("/assets/logo.webp")
    expect(localImage("https://example.com/not-downloaded.png")).toBe(
      "https://example.com/not-downloaded.png",
    )
  })

  it("derives a stable key per URL", () => {
    expect(imageKey("https://a.example/logo.png")).toBe(imageKey("https://a.example/logo.png"))
    expect(imageKey("https://a.example/logo.png")).toHaveLength(16)
  })
})

describe("imageSize", () => {
  it("reads the intrinsic size from a localized file name", () => {
    expect(imageSize("/cv-images/0123456789abcdef-256x85.webp")).toEqual({ width: 256, height: 85 })
    expect(imageSize("https://example.com/logo.png")).toBeUndefined()
  })
})
