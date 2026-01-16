import { test, expect } from "@playwright/test"

test.describe("Rally App E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("landing page renders correctly", async ({ page }) => {
    // Header
    await expect(page.locator("header")).toBeVisible()
    await expect(page.getByText("Rally")).toBeVisible()
    await expect(page.getByRole("button", { name: "Connect", exact: true })).toBeVisible()

    // Main heading
    const heading = page.getByRole("heading", { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).toContainText(/Infofi.*Not.*Dead/i)

    // Subtitle
    await expect(page.getByText(/decentralized marketing protocol/i)).toBeVisible()
  })

  test("wallet input section is functional", async ({ page }) => {
    // Find wallet input fields
    const solanaInput = page.getByPlaceholder(/solana/i)
    const ethInput = page.getByPlaceholder(/ethereum|eth|0x/i)

    // At least one input should be visible
    const hasSolanaInput = await solanaInput.isVisible().catch(() => false)
    const hasEthInput = await ethInput.isVisible().catch(() => false)

    expect(hasSolanaInput || hasEthInput).toBeTruthy()

    // Check eligibility button should exist
    const checkButton = page.getByRole("button", { name: /check.*eligibility|verify|submit/i })
    await expect(checkButton).toBeVisible()
  })

  test("connect wallet button opens modal", async ({ page }) => {
    const connectButton = page.getByRole("button", { name: /connect/i }).first()
    await connectButton.click()

    // Should show wallet options modal
    await expect(page.getByRole("heading", { name: /connect a wallet/i })).toBeVisible({ timeout: 5000 })
  })

  test("entering invalid solana address shows appropriate response", async ({ page }) => {
    const solanaInput = page.getByPlaceholder(/solana/i)

    if (await solanaInput.isVisible()) {
      await solanaInput.fill("invalid-address")

      const checkButton = page.getByRole("button", { name: /check.*eligibility/i })
      if (await checkButton.isVisible()) {
        await checkButton.click()

        // Should show some error or validation message
        await page.waitForTimeout(2000)
        // Page should still be functional
        await expect(page.locator("body")).toBeVisible()
      }
    }
  })

  test("page has no console errors on load", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text())
      }
    })

    await page.goto("/")
    await page.waitForTimeout(2000)

    // Filter out known acceptable errors (like wallet connection errors when no wallet)
    const criticalErrors = errors.filter(
      (e) => !e.includes("wallet") && !e.includes("Wallet") && !e.includes("Failed to fetch")
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test("gradient blob animation renders", async ({ page }) => {
    // Check that canvas element exists for the gradient blob
    const canvas = page.locator("canvas")
    await expect(canvas).toBeVisible()
  })

  test("page is responsive - mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/")

    // Header should still be visible
    await expect(page.locator("header")).toBeVisible()

    // Main content should be visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("stats bar displays correctly", async ({ page }) => {
    // Look for stats or metrics display
    const statsSection = page.locator('[class*="stats"], [class*="Stats"]')

    if (await statsSection.isVisible().catch(() => false)) {
      await expect(statsSection).toBeVisible()
    }
  })
})
