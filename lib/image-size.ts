/**
 * Intrinsic size of a localized sheet image, encoded in its file name
 * (`/cv-images/<hash>-<width>x<height>.webp`, see scripts/fetch-images.ts).
 * Lets `<img>` tags reserve their space without a manifest in the client bundle.
 */
export function imageSize(src: string): { width: number; height: number } | undefined {
  const match = /-(\d+)x(\d+)\.webp$/.exec(src)
  return match ? { width: Number(match[1]), height: Number(match[2]) } : undefined
}
