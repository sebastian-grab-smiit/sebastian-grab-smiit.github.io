import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import { siteConfig } from "@/site.config"

/**
 * Accepted, documented exceptions. Keep this list short and explain every entry.
 * - Header CTA: white on brand magenta #F703EB has a contrast of 3.4:1 (AA needs 4.5:1).
 *   Fixing it means a darker magenta (e.g. #C800BD, 5.0:1), which is a brand decision.
 */
const KNOWN_ISSUES = ['nav a[href="#book"][data-slot="button"]']

test.describe("CV site", () => {
  test("root redirects to the German CV", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/de\/$/)
  })

  for (const lang of ["de", "en"] as const) {
    test(`renders the ${lang} page with all sections`, async ({ page }) => {
      await page.goto(`/${lang}/`)

      await expect(page).toHaveTitle(new RegExp(siteConfig.name))
      await expect(page.locator("html")).toHaveAttribute("lang", lang)
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
      for (const id of ["hero", "focus", "skills", "experience", "certificates", "projects"]) {
        await expect(page.locator(`section#${id}`)).toBeAttached()
      }

      const jsonLd = JSON.parse(
        (await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}",
      )
      expect(jsonLd["@type"]).toBe("Person")
    })
  }

  test("language switcher navigates to the English page", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "covered on desktop")
    await page.goto("/de/")

    const trigger = page.getByRole("button", { name: /^Language:/ }).filter({ visible: true })
    await trigger.click()
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
    await page.getByRole("button", { name: "English" }).filter({ visible: true }).click()

    await expect(page).toHaveURL(/\/en\/$/)
  })

  test("downloads the CV bundle as a zip", async ({ page }) => {
    await page.goto("/de/")
    const button = page.getByRole("button", { name: /Lebenslauf|CV/ }).first()
    await expect(button).toBeVisible({ timeout: 15_000 })

    const [download] = await Promise.all([page.waitForEvent("download"), button.click()])

    expect(download.suggestedFilename()).toMatch(/\.zip$/)
  })

  test("unknown pages show the 404 page", async ({ page }) => {
    const response = await page.goto("/does-not-exist/")
    expect(response?.status()).toBe(404)
    await expect(page.getByRole("heading", { name: /nicht gefunden|not found/i })).toBeVisible()
  })

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto("/de/")
    // Wait for the intro overlay to finish so the real content is analyzed.
    await expect(page.locator("#hero")).toBeVisible()
    await page.waitForTimeout(3_000)

    const builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"])
    for (const selector of KNOWN_ISSUES) builder.exclude(selector)
    const results = await builder.analyze()
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    )

    expect(
      serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length}x)`),
      "accessibility violations",
    ).toEqual([])
  })
})
