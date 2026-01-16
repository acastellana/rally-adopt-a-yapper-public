import { describe, it, expect } from "vitest"
import { NFTS, COLLECTIONS } from "../../lib/config"

describe("NFT Configuration", () => {
  describe("NFTS", () => {
    it("should have exactly 2 NFT configurations", () => {
      expect(NFTS).toHaveLength(2)
    })

    it("should have wallchain NFT with correct properties", () => {
      const wallchain = NFTS.find((nft) => nft.key === "wallchain")

      expect(wallchain).toBeDefined()
      expect(wallchain?.name).toBe("Quack Heads")
      expect(wallchain?.points).toBe(2500)
      expect(wallchain?.rarity).toBe("legendary")
    })

    it("should have kaito NFT with correct properties", () => {
      const kaito = NFTS.find((nft) => nft.key === "kaito")

      expect(kaito).toBeDefined()
      expect(kaito?.name).toBe("Yapybaras")
      expect(kaito?.points).toBe(1800)
      expect(kaito?.rarity).toBe("rare")
    })

    it("should have unique IDs", () => {
      const ids = NFTS.map((nft) => nft.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(NFTS.length)
    })

    it("should have unique keys", () => {
      const keys = NFTS.map((nft) => nft.key)
      const uniqueKeys = new Set(keys)

      expect(uniqueKeys.size).toBe(NFTS.length)
    })
  })

  describe("COLLECTIONS", () => {
    it("should have wallchain collection with Solana address", () => {
      expect(COLLECTIONS.wallchain).toBeDefined()
      expect(COLLECTIONS.wallchain.chain).toBe("solana")
      expect(COLLECTIONS.wallchain.address).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
    })

    it("should have kaito collection with Ethereum address", () => {
      expect(COLLECTIONS.kaito).toBeDefined()
      expect(COLLECTIONS.kaito.chain).toBe("ethereum")
      expect(COLLECTIONS.kaito.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
  })
})
