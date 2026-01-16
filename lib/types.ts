export interface XLink {
  xUserId: string
  xUsername: string
  walletAddress: string
  linkedAt: number
}

export interface Claim {
  walletAddress: string
  nftType: "wallchain" | "kaito"
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

export interface Eligibility {
  wallchain: { eligible: boolean; count: number }
  kaito: { eligible: boolean; count: number }
}

export interface NFTConfig {
  id: number
  key: "wallchain" | "kaito"
  name: string
  collection: string
  description: string
  image: string
  points: number
  rarity: "common" | "rare" | "legendary"
}
