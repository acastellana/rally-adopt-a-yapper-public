import { type NextRequest, NextResponse } from "next/server"
import { getHolderByAddress } from "@/lib/holders"
import { COLLECTIONS } from "@/lib/config"
import type { Eligibility } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const { solanaAddress, ethAddress, baseAddress, bscAddress } = await req.json()

    if (!solanaAddress && !ethAddress && !baseAddress && !bscAddress) {
      return NextResponse.json({ error: "At least one wallet address required" }, { status: 400 })
    }

    const eligibility: Eligibility = {
      wallchain: { eligible: false, count: 0 },
      kaito: { eligible: false, count: 0 },
      skaito: { eligible: false, count: 0 },
      cookie: { eligible: false, count: 0 },
    }

    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
    const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/i

    // Check Solana wallet (Wallchain/Quack Heads)
    if (solanaAddress && solanaAddressRegex.test(solanaAddress)) {
      const holder = getHolderByAddress(COLLECTIONS.wallchain.address, solanaAddress)
      if (holder) {
        eligibility.wallchain.eligible = true
        eligibility.wallchain.count = Math.floor(holder.quantity)
      }
    }

    // Check Ethereum wallet (Kaito/Yapybaras)
    if (ethAddress && evmAddressRegex.test(ethAddress)) {
      const holder = getHolderByAddress(COLLECTIONS.kaito.address, ethAddress)
      if (holder) {
        eligibility.kaito.eligible = true
        eligibility.kaito.count = Math.floor(holder.quantity)
      }
    }

    // Check Base wallet (Skaito tokens)
    if (baseAddress && evmAddressRegex.test(baseAddress)) {
      const holder = getHolderByAddress(COLLECTIONS.skaito.address, baseAddress)
      if (holder) {
        eligibility.skaito.eligible = true
        eligibility.skaito.count = Math.floor(holder.quantity)
      }
    }

    // Check BSC wallet (Cookie stake)
    if (bscAddress && evmAddressRegex.test(bscAddress)) {
      const holder = getHolderByAddress(COLLECTIONS.cookie.address, bscAddress)
      if (holder) {
        eligibility.cookie.eligible = true
        eligibility.cookie.count = Math.floor(holder.quantity)
      }
    }

    // Return primary wallet for signing (prefer Solana, then ETH, then Base, then BSC)
    const primaryWallet = solanaAddress || ethAddress || baseAddress || bscAddress

    return NextResponse.json({
      eligibility,
      walletAddress: primaryWallet,
      connectedWallets: {
        solana: solanaAddress || null,
        eth: ethAddress || null,
        base: baseAddress || null,
        bsc: bscAddress || null,
      },
    })
  } catch (error) {
    console.error("Error checking eligibility:", error)
    return NextResponse.json({ error: "Failed to check eligibility" }, { status: 500 })
  }
}
