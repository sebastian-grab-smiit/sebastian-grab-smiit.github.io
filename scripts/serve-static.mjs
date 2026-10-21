// Minimal static server for the exported site in ./out (used by `npm start` and the E2E tests).
// Mirrors GitHub Pages: directory index.html, trailing-slash redirects, 404.html and gzip.
import { createReadStream, existsSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, normalize, resolve } from "node:path"
import { createGzip } from "node:zlib"

const root = resolve(process.argv[2] ?? "out")
const port = Number(process.env.PORT ?? 3000)

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
}

if (!existsSync(root)) {
  console.error(`${root} does not exist. Run "npm run build" first.`)
  process.exit(1)
}

const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".txt", ".xml", ".svg"])

function send(req, res, status, file) {
  const headers = { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }
  const gzip =
    COMPRESSIBLE.has(extname(file)) && /\bgzip\b/.test(req.headers["accept-encoding"] ?? "")
  if (gzip) {
    res.writeHead(status, { ...headers, "content-encoding": "gzip", vary: "accept-encoding" })
    createReadStream(file).pipe(createGzip()).pipe(res)
  } else {
    res.writeHead(status, headers)
    createReadStream(file).pipe(res)
  }
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost")
  const pathname = decodeURIComponent(url.pathname)
  const file = normalize(join(root, pathname))
  if (!file.startsWith(root)) {
    res.writeHead(403).end()
    return
  }

  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!pathname.endsWith("/")) {
      res.writeHead(301, { location: `${pathname}/${url.search}` }).end()
      return
    }
    const index = join(file, "index.html")
    if (existsSync(index)) return send(req, res, 200, index)
  } else if (existsSync(file)) {
    return send(req, res, 200, file)
  }

  send(req, res, 404, join(root, "404.html"))
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`))
