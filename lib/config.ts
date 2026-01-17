import type { NFTConfig, CollectionKey } from "./types"

export const NFTS: NFTConfig[] = [
  {
    id: 1,
    key: "wallchain",
    name: "Quack Heads",
    collection: "Wallchain",
    description: "Owning a Wallchain NFT",
    image: "/duck-quack-heads-nft-pixel-art.jpg",
    points: 2500,
    rarity: "legendary",
  },
  {
    id: 2,
    key: "kaito",
    name: "Yapybaras",
    collection: "Kaito",
    description: "Being a Kaito Staker",
    image: "/capybara-yapybara-nft-cute-art.jpg",
    points: 1800,
    rarity: "rare",
  },
  {
    id: 3,
    key: "skaito",
    name: "Skaito",
    collection: "Kaito",
    description: "Holding Skaito tokens",
    image: "/skaito-token.jpg",
    points: 1500,
    rarity: "common",
  },
  {
    id: 4,
    key: "cookie",
    name: "Cookie",
    collection: "Cookie",
    description: "Staking Cookie tokens",
    image: "/cookie-stake.jpg",
    points: 1200,
    rarity: "common",
  },
]

export const COLLECTIONS: Record<CollectionKey, { address: string; chain: string; name: string }> = {
  wallchain: {
    address: "HxSsfM9WxQWj79chAUNL6osZxQjJj5iMUwrjEfRBvYBR",
    chain: "solana",
    name: "Quack Heads",
  },
  kaito: {
    address: "0x9830b32f7210f0857a859c2a86387e4d1bb760b8",
    chain: "ethereum",
    name: "Yapybaras",
  },
  skaito: {
    address: "0x548D3B444da39686d1a6F1544781d154e7cD1EF7",
    chain: "base",
    name: "Skaito",
  },
  cookie: {
    address: "0x09fb72CBEa86AFBB5E5A4ac6f48a783A01799017",
    chain: "bsc",
    name: "Cookie",
  },
}
