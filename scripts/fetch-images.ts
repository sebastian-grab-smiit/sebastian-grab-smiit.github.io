/**
 * Downloads every logo referenced in the Google Sheet, resizes it and stores it as WebP
 * in public/cv-images. Runs automatically before `npm run build` (prebuild).
 *
 *   npm run images
 *
 * Images that cannot be downloaded are reported and keep their original URL, so a
 * single unreachable logo never breaks the build.
 */
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import sharp from "sharp"
import { fetchCv, type CvData } from "@/lib/sheet"
import { IMAGE_DIR, imageKey, isRemote } from "@/lib/sheet/images"

/** Logos are shown at most 64px tall (certificates); 2x for high-DPI screens. */
const MAX_WIDTH = 256
const MAX_HEIGHT = 128
const TIMEOUT_MS = 15_000
const CONCURRENCY = 8

export async function optimizeLogo(input: Buffer) {
  const { data, info } = await sharp(input, { animated: false })
    .resize({ width: MAX_WIDTH, height: MAX_HEIGHT, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85, alphaQuality: 90 })
    .toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height }
}

export function logoUrls(data: CvData): string[] {
  const urls = [
    ...data.certificates.map((c) => c.logoUrl),
    ...data.academics.map((a) => a.logoUrl),
    ...data.resume.map((r) => r.logoUrl),
    ...data.projects.map((p) => p.logoUrl),
  ]
  return [...new Set(urls.filter(isRemote))]
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": "Mozilla/5.0 (compatible; cv-site-build)" },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  const urls = logoUrls(await fetchCv({ localImages: false }))
  mkdirSync(IMAGE_DIR, { recursive: true })

  const existing = new Map(readdirSync(IMAGE_DIR).map((f) => [f.split("-")[0], f]))
  const wanted = new Set(urls.map(imageKey))
  for (const [key, file] of existing) {
    if (!wanted.has(key)) rmSync(join(IMAGE_DIR, file))
  }

  const failures: string[] = []
  let downloaded = 0
  let bytesIn = 0
  let bytesOut = 0
  const queue = urls.filter((url) => !existing.has(imageKey(url)))

  async function worker() {
    for (let url = queue.shift(); url; url = queue.shift()) {
      try {
        const input = await download(url)
        const { data, width, height } = await optimizeLogo(input)
        const file = join(IMAGE_DIR, `${imageKey(url)}-${width}x${height}.webp`)
        if (!existsSync(file)) writeFileSync(file, data)
        downloaded++
        bytesIn += input.length
        bytesOut += data.length
      } catch (err) {
        failures.push(`${url}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const kb = (n: number) => `${Math.round(n / 1024)} KB`
  console.log(
    `Logos: ${urls.length} referenced, ${urls.length - downloaded - failures.length} cached, ` +
      `${downloaded} downloaded (${kb(bytesIn)} -> ${kb(bytesOut)})`,
  )
  if (failures.length > 0) {
    console.warn(
      `\n${failures.length} logo(s) could not be downloaded and keep their remote URL:\n` +
        failures.map((f) => `  - ${f}`).join("\n"),
    )
  }
}

if (process.argv[1]?.endsWith("fetch-images.ts")) {
  main().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
