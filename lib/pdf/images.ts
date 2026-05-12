import type { PDFDocument, PDFImage } from "pdf-lib"

function isPng(buf: Uint8Array): boolean {
  return (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  )
}

function isJpg(buf: Uint8Array): boolean {
  return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
}

async function blobToPngBytes(blob: Blob): Promise<Uint8Array | null> {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    return null
  }
  try {
    const bitmap = await createImageBitmap(blob)
    const maxSide = 256
    const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const w = Math.max(1, Math.round(bitmap.width * ratio))
    const h = Math.max(1, Math.round(bitmap.height * ratio))
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0, w, h)
    const pngBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    )
    if (!pngBlob) return null
    return new Uint8Array(await pngBlob.arrayBuffer())
  } catch {
    return null
  }
}

interface LoadedImage {
  bytes: Uint8Array
  format: "png" | "jpg"
}

async function loadImage(url: string): Promise<LoadedImage | null> {
  try {
    const res = await fetch(url, { mode: "cors", credentials: "omit" })
    if (!res.ok) return null
    const blob = await res.blob()
    const arr = new Uint8Array(await blob.arrayBuffer())
    if (isPng(arr)) return { bytes: arr, format: "png" }
    if (isJpg(arr)) return { bytes: arr, format: "jpg" }
    const png = await blobToPngBytes(new Blob([arr], { type: blob.type }))
    return png ? { bytes: png, format: "png" } : null
  } catch {
    return null
  }
}

export async function loadAndEmbedImages(
  doc: PDFDocument,
  urls: Array<string | null | undefined>,
  onItemLoaded?: () => void,
): Promise<Map<string, PDFImage>> {
  const unique = Array.from(new Set(urls.filter((u): u is string => Boolean(u))))
  if (unique.length === 0) return new Map()
  const results = await Promise.allSettled(
    unique.map(async (u) => {
      const r = await loadImage(u)
      onItemLoaded?.()
      return r
    }),
  )
  const map = new Map<string, PDFImage>()
  for (let i = 0; i < unique.length; i++) {
    const r = results[i]
    if (r.status !== "fulfilled" || !r.value) continue
    try {
      const img =
        r.value.format === "jpg"
          ? await doc.embedJpg(r.value.bytes)
          : await doc.embedPng(r.value.bytes)
      map.set(unique[i], img)
    } catch {
      // skip
    }
  }
  return map
}
