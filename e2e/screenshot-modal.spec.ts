import { test } from "@playwright/test"

test("capture wallet modal screenshot", async ({ page }) => {
  await page.goto("/")

  // Click connect button to open modal
  await page.getByRole("button", { name: /connect/i }).first().click()

  // Wait for modal to appear
  await page.waitForSelector(".wallet-adapter-modal-wrapper", { state: "visible" })
  await page.waitForTimeout(500) // Let animations complete

  // Take screenshot
  await page.screenshot({ path: "/tmp/rally-wallet-modal.png", fullPage: true })
})
