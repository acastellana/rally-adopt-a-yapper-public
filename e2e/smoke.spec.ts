import { test, expect } from "@playwright/test"

test.describe("Rally App Smoke Test", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/")

    // Check page title
    await expect(page).toHaveTitle(/Rally/)

    // Check main heading is visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()

    // Check for key UI elements
    await expect(page.locator("body")).toBeVisible()
  })

  test("landing page shows wallet connection options", async ({ page }) => {
    await page.goto("/")

    // Look for wallet-related text or buttons
    const walletText = page.getByText(/wallet/i).first()
    await expect(walletText).toBeVisible({ timeout: 10000 })
  })
})
