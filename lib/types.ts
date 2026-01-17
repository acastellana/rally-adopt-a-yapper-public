export interface XLink {
  xUserId: string
  xUsername: string
  walletAddress: string
  linkedAt: number
}

export type CollectionKey = "wallchain" | "kaito" | "skaito" | "cookie"

export interface Claim {
  walletAddress: string
  nftType: CollectionKey
  xUsername: string
  signature: string
  points: number
  claimedAt: number
}

export interface ClaimNonce {
  walletAddress: string
  nftType: string
  expiresAt: number
}

export interface OAuthRequestToken {
  oauthToken: string
  oauthTokenSecret: string
  walletAddress: string
  expiresAt: number
}

export interface EligibilityItem {
  eligible: boolean
  count: number
}

export interface Eligibility {
  wallchain: EligibilityItem  // Solana - Quack Heads
  kaito: EligibilityItem      // ETH - Yapybaras
  skaito: EligibilityItem     // Base - Skaito token
  cookie: EligibilityItem     // BSC - Cookie stake
}

export interface NFTConfig {
  id: number
  key: CollectionKey
  name: string
  collection: string
  description: string
  image: string
  points: number
  rarity: "common" | "rare" | "legendary"
}
