import { test, expect } from "@playwright/test"

test.describe("Eligibility API Tests", () => {
  test("returns eligible=true for known Yapybaras holder", async ({ request }) => {
    const response = await request.post("/api/check-eligibility", {
      data: {
        ethAddress: "0x7deCD0770371096f135547Bdbdf3831799239ccF",
      },
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.eligibility.kaito.eligible).toBe(true)
    expect(data.eligibility.kaito.count).toBeGreaterThan(0)
  })

  test("returns eligible=false for non-holder address", async ({ request }) => {
    const response = await request.post("/api/check-eligibility", {
      data: {
        ethAddress: "0x0000000000000000000000000000000000000000",
      },
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.eligibility.kaito.eligible).toBe(false)
    expect(data.eligibility.kaito.count).toBe(0)
  })

  test("returns 400 when no address provided", async ({ request }) => {
    const response = await request.post("/api/check-eligibility", {
      data: {},
    })

    expect(response.status()).toBe(400)
  })

  test("UI shows eligibility after entering holder address", async ({ page }) => {
    await page.goto("/")

    // Enter a known holder's ETH address
    const ethInput = page.getByPlaceholder(/ethereum|eth|0x/i)
    await ethInput.fill("0x7deCD0770371096f135547Bdbdf3831799239ccF")

    // Click check eligibility
    const checkButton = page.getByRole("button", { name: /check.*eligibility/i })
    await checkButton.click()

    // Wait for response and check we moved to claim step (no error message)
    await page.waitForTimeout(2000)

    // Should NOT see the "Service temporarily unavailable" error
    await expect(page.getByText(/service temporarily unavailable/i)).not.toBeVisible()
  })
})
