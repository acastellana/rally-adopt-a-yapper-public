import { describe, it, expect } from "vitest"
import { buildClaimMessage } from "../../lib/verify-signature"

describe("Signature verification utilities", () => {
  describe("buildClaimMessage", () => {
    it("should build a correctly formatted claim message", () => {
      const walletAddress = "7nYAh9pYrUJ7a7gJrY2sYZaJx9K3vHqNsrPRgE3yQJKn"
      const nftType = "wallchain"
      const nonce = "abc123"

      const message = buildClaimMessage(walletAddress, nftType, nonce)

      expect(message).toBe(
        `Rally Protocol Claim\nWallet: ${walletAddress}\nNFT: ${nftType}\nNonce: ${nonce}`
      )
    })

    it("should handle different NFT types", () => {
      const walletAddress = "test_wallet"
      const nonce = "test_nonce"

      const wallchainMessage = buildClaimMessage(walletAddress, "wallchain", nonce)
      const kaitoMessage = buildClaimMessage(walletAddress, "kaito", nonce)

      expect(wallchainMessage).toContain("NFT: wallchain")
      expect(kaitoMessage).toContain("NFT: kaito")
    })

    it("should include all required fields", () => {
      const message = buildClaimMessage("wallet", "wallchain", "nonce")

      expect(message).toContain("Rally Protocol Claim")
      expect(message).toContain("Wallet:")
      expect(message).toContain("NFT:")
      expect(message).toContain("Nonce:")
    })
  })
})
