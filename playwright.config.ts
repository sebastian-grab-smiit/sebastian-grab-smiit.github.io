import { defineConfig, devices } from "@playwright/test"

const PORT = 4173

/**
 * E2E tests run against the static export in ./out (`npm run build` first),
 * served the same way GitHub Pages serves it.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `node scripts/serve-static.mjs out`,
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/de/`,
    reuseExistingServer: !process.env.CI,
  },
})
