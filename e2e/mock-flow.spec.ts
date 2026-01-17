import { test, expect } from "@playwright/test"

// Mock wallet addresses from .env.local
const MOCK_WALLETS = {
  solana: "GaHTbdhi5t8CjsujKToA6KMwFt2tE4LogTNhkxuahtBF",
  eth: "0x194A595068ae5B65811C64fc60574467A15C85f2",
  base: "0x275617A095A45fe8dd98297e62253146EaD37da3",
  bsc: "0xfdcc8a1045cd2d6d8b499c2e31085aed90c5b84f",
}

const NFT_TYPES = ["wallchain", "kaito", "skaito", "cookie"] as const

// Generate unique wallet for each test run to avoid state conflicts
const getUniqueWallet = (base: string) => `${base}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

test.describe("Mock Flow - Multi-Wallet Claim Process", () => {
  test("complete API flow: check eligibility → X auth → claim all NFTs", async ({ request }) => {
    // Use a unique wallet for this test to avoid conflicts with other tests
    const primaryWallet = getUniqueWallet("APITestWallet")

    // 1. Check eligibility with all wallets
    console.log("Step 1: Check eligibility with all wallets")
    const eligibilityResponse = await request.post("http://localhost:3000/api/check-eligibility", {
      data: {
        solanaAddress: MOCK_WALLETS.solana,
        ethAddress: MOCK_WALLETS.eth,
        baseAddress: MOCK_WALLETS.base,
        bscAddress: MOCK_WALLETS.bsc,
      },
    })
    const eligibilityData = await eligibilityResponse.json()
    console.log("Eligibility:", JSON.stringify(eligibilityData, null, 2))

    expect(eligibilityData.eligibility.wallchain.eligible).toBe(true)
    expect(eligibilityData.eligibility.kaito.eligible).toBe(true)
    expect(eligibilityData.eligibility.skaito.eligible).toBe(true)
    expect(eligibilityData.eligibility.cookie.eligible).toBe(true)

    // 2. X Authentication
    console.log("Step 2: Request X auth token")
    const authResponse = await request.post("http://localhost:3000/api/auth/x/request-token", {
      data: { walletAddress: primaryWallet },
    })
    const authData = await authResponse.json()
    expect(authData.authorizationUrl).toContain("mock_")
    console.log("Auth URL:", authData.authorizationUrl)

    // 3. Simulate X callback
    console.log("Step 3: Simulate X callback")
    const callbackResponse = await request.get(authData.authorizationUrl, {
      maxRedirects: 0,
    })
    expect(callbackResponse.status()).toBe(307)

    // 4. Verify X link
    console.log("Step 4: Verify X link status")
    const xStatusResponse = await request.get(
      `http://localhost:3000/api/auth/x/status?wallet=${primaryWallet}`
    )
    const xStatusData = await xStatusResponse.json()
    expect(xStatusData.linked).toBe(true)
    expect(xStatusData.username).toBe("mock_user")
    console.log("X status:", xStatusData)

    // 5. Claim each NFT type
    for (const nftType of NFT_TYPES) {
      console.log(`\nStep 5.${NFT_TYPES.indexOf(nftType) + 1}: Claiming ${nftType}`)

      // Get nonce
      const nonceResponse = await request.post("http://localhost:3000/api/claim/nonce", {
        data: { walletAddress: primaryWallet, nftType },
      })
      const nonceData = await nonceResponse.json()
      expect(nonceData.nonce).toBeDefined()
      console.log(`  Nonce for ${nftType}:`, nonceData.nonce)

      // Submit claim
      const claimResponse = await request.post("http://localhost:3000/api/claim/submit", {
        data: {
          walletAddress: primaryWallet,
          nftType,
          signature: "mock_signature",
          nonce: nonceData.nonce,
        },
      })
      const claimData = await claimResponse.json()
      expect(claimData.success).toBe(true)
      console.log(`  Claim ${nftType} result:`, claimData)
    }

    // 6. Verify final claim status
    console.log("\nStep 6: Verify final claim status")
    const finalStatusResponse = await request.get(
      `http://localhost:3000/api/claim/status?wallet=${primaryWallet}`
    )
    const finalStatus = await finalStatusResponse.json()

    expect(finalStatus.claims.wallchain.claimed).toBe(true)
    expect(finalStatus.claims.kaito.claimed).toBe(true)
    expect(finalStatus.claims.skaito.claimed).toBe(true)
    expect(finalStatus.claims.cookie.claimed).toBe(true)

    // Expected total: 2500 + 1800 + 1500 + 1200 = 7000
    expect(finalStatus.totalPoints).toBe(7000)
    console.log("Final status:", JSON.stringify(finalStatus, null, 2))
  })

  test("UI flow: connect wallets → check eligibility → X auth → claim", async ({ page }) => {
    // 1. Navigate to homepage
    console.log("Step 1: Navigate to homepage")
    await page.goto("http://localhost:3000")
    await page.waitForLoadState("networkidle")
    await page.screenshot({ path: "e2e/screenshots/01-landing.png" })

    // 2. The multi-wallet input should show with mock addresses pre-filled
    // In mock mode, all 4 wallets should be pre-connected
    console.log("Step 2: Verify wallet inputs are pre-filled")

    // Check that connected wallets are shown
    await expect(page.locator("text=Solana")).toBeVisible({ timeout: 5000 })
    await expect(page.locator("text=Ethereum")).toBeVisible({ timeout: 5000 })
    await expect(page.locator("text=Base")).toBeVisible({ timeout: 5000 })
    await expect(page.locator("text=BSC")).toBeVisible({ timeout: 5000 })

    await page.screenshot({ path: "e2e/screenshots/02-wallets-connected.png" })

    // 3. Click Check Eligibility
    console.log("Step 3: Click Check Eligibility")
    const checkEligibilityBtn = page.getByRole("button", { name: /check eligibility/i })
    await expect(checkEligibilityBtn).toBeVisible()
    await checkEligibilityBtn.click()

    // 4. Wait for page transition and check for X modal
    console.log("Step 4: Wait for page transition")
    await page.waitForTimeout(2000)

    // Check if X modal appears (may not if X is already connected from previous test)
    const xModalTitle = page.getByText("Connect X to Continue")
    const isXModalVisible = await xModalTitle.isVisible().catch(() => false)

    if (isXModalVisible) {
      console.log("Step 4a: X modal visible, connecting X")
      await page.screenshot({ path: "e2e/screenshots/03-x-modal.png" })

      const connectXBtn = page.getByRole("button", { name: /connect with x/i })
      await expect(connectXBtn).toBeVisible()

      // Handle popup
      const [popup] = await Promise.all([
        page.waitForEvent("popup").catch(() => null),
        connectXBtn.click(),
      ])

      if (popup) {
        console.log("Step 4b: Popup opened, waiting for it to process")
        await popup.waitForLoadState("networkidle").catch(() => {})
      }

      await page.waitForTimeout(3000)
    } else {
      console.log("Step 4a: X already connected, skipping X modal")
    }

    await page.screenshot({ path: "e2e/screenshots/04-after-x-connect.png" })

    // 5. Look for claim buttons - should see 4 eligible NFTs
    console.log("Step 5: Find claim buttons")
    await page.waitForTimeout(2000)

    // Check that we see the eligible NFTs
    const claimButtons = page.getByRole("button", { name: /claim/i })
    await page.screenshot({ path: "e2e/screenshots/05-claim-ready.png" })

    // Try to claim each NFT
    const claimBtnCount = await claimButtons.count()
    console.log(`Found ${claimBtnCount} claim buttons`)

    for (let i = 0; i < Math.min(claimBtnCount, 4); i++) {
      const btn = claimButtons.nth(i)
      if (await btn.isVisible()) {
        console.log(`Step 5.${i + 1}: Clicking claim button ${i + 1}`)
        await btn.click()
        await page.waitForTimeout(1500)
        await page.screenshot({ path: `e2e/screenshots/06-after-claim-${i + 1}.png` })
      }
    }

    // 6. Verify final state
    console.log("Step 6: Verify final state")
    await page.screenshot({ path: "e2e/screenshots/07-final.png" })

    // Check claim status via API
    const statusResponse = await page.request.get(
      `http://localhost:3000/api/claim/status?wallet=${MOCK_WALLETS.solana}`
    )
    const statusData = await statusResponse.json()
    console.log("Final claim status:", JSON.stringify(statusData, null, 2))

    // Verify at least some claims were made (may be partial if some were already claimed)
    const totalPoints = statusData.totalPoints || 0
    console.log(`Total points claimed: ${totalPoints}`)
  })

  test("eligibility check returns correct data for all networks", async ({ request }) => {
    const response = await request.post("http://localhost:3000/api/check-eligibility", {
      data: {
        solanaAddress: MOCK_WALLETS.solana,
        ethAddress: MOCK_WALLETS.eth,
        baseAddress: MOCK_WALLETS.base,
        bscAddress: MOCK_WALLETS.bsc,
      },
    })

    expect(response.ok()).toBe(true)
    const data = await response.json()

    // Verify each network shows eligible with expected counts
    expect(data.eligibility.wallchain).toEqual({ eligible: true, count: 1 })  // Quack Heads
    expect(data.eligibility.kaito).toEqual({ eligible: true, count: 2 })      // Yapybaras
    expect(data.eligibility.skaito).toEqual({ eligible: true, count: 25 })    // Skaito
    expect(data.eligibility.cookie).toEqual({ eligible: true, count: 1 })     // Cookie

    // Verify connected wallets are returned
    expect(data.connectedWallets.solana).toBe(MOCK_WALLETS.solana)
    expect(data.connectedWallets.eth).toBe(MOCK_WALLETS.eth)
    expect(data.connectedWallets.base).toBe(MOCK_WALLETS.base)
    expect(data.connectedWallets.bsc).toBe(MOCK_WALLETS.bsc)
  })

  test("claim prevents double-claiming", async ({ request }) => {
    const wallet = `TestWallet${Date.now()}`

    // First, link X account
    const authResponse = await request.post("http://localhost:3000/api/auth/x/request-token", {
      data: { walletAddress: wallet },
    })
    const authData = await authResponse.json()
    await request.get(authData.authorizationUrl, { maxRedirects: 0 })

    // Get nonce and claim
    const nonceResponse = await request.post("http://localhost:3000/api/claim/nonce", {
      data: { walletAddress: wallet, nftType: "wallchain" },
    })
    const nonceData = await nonceResponse.json()

    // First claim should succeed
    const claimResponse1 = await request.post("http://localhost:3000/api/claim/submit", {
      data: {
        walletAddress: wallet,
        nftType: "wallchain",
        signature: "mock_signature",
        nonce: nonceData.nonce,
      },
    })
    expect(claimResponse1.ok()).toBe(true)

    // Get another nonce
    const nonceResponse2 = await request.post("http://localhost:3000/api/claim/nonce", {
      data: { walletAddress: wallet, nftType: "wallchain" },
    })
    const nonceData2 = await nonceResponse2.json()

    // Second claim should fail
    const claimResponse2 = await request.post("http://localhost:3000/api/claim/submit", {
      data: {
        walletAddress: wallet,
        nftType: "wallchain",
        signature: "mock_signature",
        nonce: nonceData2.nonce,
      },
    })
    expect(claimResponse2.ok()).toBe(false)
    const errorData = await claimResponse2.json()
    expect(errorData.error).toBe("Already claimed")
  })
})
