// Minimal static server for the exported site in ./out (used by `npm start` and the E2E tests).
// Mirrors GitHub Pages: directory index.html, trailing-slash redirects and 404.html.
import { createReadStream, existsSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, normalize, resolve } from "node:path"

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

function send(res, status, file) {
  res.writeHead(status, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" })
  createReadStream(file).pipe(res)
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
    if (existsSync(index)) return send(res, 200, index)
  } else if (existsSync(file)) {
    return send(res, 200, file)
  }

  send(res, 404, join(root, "404.html"))
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`))
