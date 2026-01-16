import type { NFTConfig } from "./types"

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
]

export const COLLECTIONS = {
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
} as const
