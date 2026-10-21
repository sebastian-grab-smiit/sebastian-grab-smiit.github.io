import { createHash } from "node:crypto"
import { readdirSync } from "node:fs"
import { join } from "node:path"

/**
 * Logos referenced in the sheet are downloaded and optimized before each build
 * (scripts/fetch-images.ts) and served from the site itself instead of hotlinking
 * third-party servers: smaller files, proper caching, no third-party cookies, and
 * no broken logos when another site changes.
 */
export const IMAGE_DIR = join(process.cwd(), "public", "cv-images")
export const IMAGE_PATH = "/cv-images"

export function imageKey(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 16)
}

export function isRemote(url: string): boolean {
  return /^https?:\/\//.test(url)
}

let localFiles: Map<string, string> | undefined

function listLocalFiles(): Map<string, string> {
  if (!localFiles) {
    localFiles = new Map()
    try {
      for (const file of readdirSync(IMAGE_DIR)) {
        localFiles.set(file.split("-")[0], file)
      }
    } catch {
      // Not downloaded (e.g. `next dev` without `npm run images`): keep the remote URLs.
    }
  }
  return localFiles
}

/** Local path of a downloaded image, or the original URL if it is not available locally. */
export function localImage(url: string): string {
  if (!isRemote(url)) return url
  const file = listLocalFiles().get(imageKey(url))
  return file ? `${IMAGE_PATH}/${file}` : url
}
