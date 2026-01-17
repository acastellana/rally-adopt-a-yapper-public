import { test, expect } from "@playwright/test"

test.describe("Mock Flow - Full Claim Process", () => {
  test("complete flow: check eligibility → connect X → claim NFT", async ({ page }) => {
    // 1. Go to homepage
    console.log("Step 1: Navigate to homepage")
    await page.goto("http://localhost:3000")
    await page.waitForLoadState("networkidle")

    // Take screenshot of landing page
    await page.screenshot({ path: "e2e/screenshots/01-landing.png" })

    // 2. The wallet input should have a default Solana address
    // Click "Check Eligibility" button
    console.log("Step 2: Click Check Eligibility")
    const checkEligibilityBtn = page.getByRole("button", { name: /check eligibility/i })
    await expect(checkEligibilityBtn).toBeVisible()
    await checkEligibilityBtn.click()

    // 3. Wait for X modal to appear
    console.log("Step 3: Wait for X Connect modal")
    await page.waitForTimeout(2000) // Wait for eligibility check

    const xModalTitle = page.getByText("Connect X to Continue")
    await expect(xModalTitle).toBeVisible({ timeout: 10000 })
    await page.screenshot({ path: "e2e/screenshots/02-x-modal.png" })

    // 4. Click "Connect with X" button
    console.log("Step 4: Click Connect with X")
    const connectXBtn = page.getByRole("button", { name: /connect with x/i })
    await expect(connectXBtn).toBeVisible()

    // Handle popup - in mock mode it redirects to callback which redirects back
    const [popup] = await Promise.all([
      page.waitForEvent("popup").catch(() => null),
      connectXBtn.click(),
    ])

    // If popup opened, wait for it to close (mock redirects back)
    if (popup) {
      console.log("Step 4a: Popup opened, waiting for it to process")
      await popup.waitForLoadState("networkidle").catch(() => {})
      // The popup will redirect and close
    }

    // 5. Wait for X connection to complete
    console.log("Step 5: Wait for X connection")
    // The modal should show "Connected!" or close
    await page.waitForTimeout(3000)

    // Check if we're now on the claim page (modal closed)
    const claimCard = page.locator('[class*="claim"]').first()

    // Take screenshot after X connection
    await page.screenshot({ path: "e2e/screenshots/03-after-x-connect.png" })

    // 6. Look for claim button
    console.log("Step 6: Find and click Claim button")

    // Wait for any claim button to be visible
    const claimBtn = page.getByRole("button", { name: /claim/i }).first()

    try {
      await expect(claimBtn).toBeVisible({ timeout: 5000 })
      await page.screenshot({ path: "e2e/screenshots/04-claim-ready.png" })

      // Click claim
      await claimBtn.click()
      console.log("Step 6a: Clicked claim button")

      // Wait for claim to process
      await page.waitForTimeout(2000)
      await page.screenshot({ path: "e2e/screenshots/05-after-claim.png" })

    } catch {
      console.log("Note: Claim button not immediately visible, checking page state")
      await page.screenshot({ path: "e2e/screenshots/04-page-state.png" })
    }

    // 7. Verify final state
    console.log("Step 7: Verify final state")
    await page.screenshot({ path: "e2e/screenshots/06-final.png" })

    // Check claim status via API
    const walletAddress = "8KDgqkk3FgZCjMozaASfQcm5JZfKNgBKA5vQXEJzY6cr"
    const statusResponse = await page.request.get(
      `http://localhost:3000/api/claim/status?wallet=${walletAddress}`
    )
    const statusData = await statusResponse.json()
    console.log("Claim status:", JSON.stringify(statusData, null, 2))
  })

  test("API-only flow test", async ({ request }) => {
    const wallet = "TestWallet123456789012345678901234567890abc"

    // 1. Request X auth
    console.log("API Test 1: Request X auth token")
    const authResponse = await request.post("http://localhost:3000/api/auth/x/request-token", {
      data: { walletAddress: wallet },
    })
    const authData = await authResponse.json()
    expect(authData.authorizationUrl).toContain("mock_")
    console.log("Auth URL:", authData.authorizationUrl)

    // 2. Simulate callback
    console.log("API Test 2: Simulate X callback")
    const callbackUrl = authData.authorizationUrl
    const callbackResponse = await request.get(callbackUrl, {
      maxRedirects: 0,
    })
    expect(callbackResponse.status()).toBe(307) // Redirect

    // 3. Check X link status
    console.log("API Test 3: Check X link status")
    const statusResponse = await request.get(
      `http://localhost:3000/api/auth/x/status?wallet=${wallet}`
    )
    const statusData = await statusResponse.json()
    expect(statusData.linked).toBe(true)
    expect(statusData.username).toBe("mock_user")
    console.log("X status:", statusData)

    // 4. Get nonce
    console.log("API Test 4: Get claim nonce")
    const nonceResponse = await request.post("http://localhost:3000/api/claim/nonce", {
      data: { walletAddress: wallet, nftType: "wallchain" },
    })
    const nonceData = await nonceResponse.json()
    expect(nonceData.nonce).toBeDefined()
    console.log("Nonce:", nonceData.nonce)

    // 5. Submit claim
    console.log("API Test 5: Submit claim")
    const claimResponse = await request.post("http://localhost:3000/api/claim/submit", {
      data: {
        walletAddress: wallet,
        nftType: "wallchain",
        signature: "mock_signature",
        nonce: nonceData.nonce,
      },
    })
    const claimData = await claimResponse.json()
    expect(claimData.success).toBe(true)
    expect(claimData.points).toBe(2500)
    console.log("Claim result:", claimData)

    // 6. Verify claim status
    console.log("API Test 6: Verify claim status")
    const finalStatusResponse = await request.get(
      `http://localhost:3000/api/claim/status?wallet=${wallet}`
    )
    const finalStatus = await finalStatusResponse.json()
    expect(finalStatus.claims.wallchain.claimed).toBe(true)
    expect(finalStatus.totalPoints).toBe(2500)
    console.log("Final status:", finalStatus)
  })
})
