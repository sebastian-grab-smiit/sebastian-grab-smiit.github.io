/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site for GitHub Pages; CV data is fetched from the Google Sheet at build time.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
}

export default nextConfig
