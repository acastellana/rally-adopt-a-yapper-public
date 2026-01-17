import { type NextRequest, NextResponse } from "next/server"
import { getHolderByAddress } from "@/lib/holders"

const COLLECTIONS = {
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
}

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, ethAddress } = await req.json()

    if (!walletAddress && !ethAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const eligibility = {
      wallchain: { eligible: false, count: 0 },
      kaito: { eligible: false, count: 0 },
    }

    // Check Solana wallet (Wallchain/Quack Heads)
    if (walletAddress) {
      const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
      if (solanaAddressRegex.test(walletAddress)) {
        const holder = getHolderByAddress(COLLECTIONS.wallchain.address, walletAddress)
        if (holder) {
          eligibility.wallchain.eligible = true
          eligibility.wallchain.count = Math.floor(holder.quantity)
        }
      }
    }

    // Check Ethereum wallet (Kaito/Yapybaras)
    if (ethAddress) {
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
      if (ethAddressRegex.test(ethAddress)) {
        const holder = getHolderByAddress(COLLECTIONS.kaito.address, ethAddress)
        if (holder) {
          eligibility.kaito.eligible = true
          eligibility.kaito.count = Math.floor(holder.quantity)
        }
      }
    }

    return NextResponse.json({
      eligibility,
      walletAddress: walletAddress || ethAddress,
    })
  } catch (error) {
    console.error("Error checking eligibility:", error)
    return NextResponse.json({ error: "Failed to check eligibility" }, { status: 500 })
  }
}
