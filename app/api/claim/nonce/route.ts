import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { isMockEnabled, setMockNonce } from "@/lib/mock-store"
import { setNonce } from "@/lib/kv"
import { buildClaimMessage } from "@/lib/verify-signature"

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, nftType } = await req.json()

    if (!walletAddress || !nftType) {
      return NextResponse.json(
        { error: "Wallet address and NFT type required" },
        { status: 400 }
      )
    }

    const validTypes = ["wallchain", "kaito", "skaito", "cookie"]
    if (!validTypes.includes(nftType)) {
      return NextResponse.json(
        { error: "Invalid NFT type" },
        { status: 400 }
      )
    }

    // Generate random nonce
    const nonce = crypto.randomBytes(32).toString("hex")
    const nonceData = {
      walletAddress,
      nftType,
      expiresAt: Date.now() + 300000, // 5 minutes
    }

    // Store nonce
    if (isMockEnabled()) {
      setMockNonce(nonce, nonceData)
    } else {
      await setNonce(nonce, nonceData)
    }

    // Build message for signing
    const message = buildClaimMessage(walletAddress, nftType, nonce)

    return NextResponse.json({
      nonce,
      message,
    })
  } catch (error) {
    console.error("Error generating nonce:", error)
    return NextResponse.json(
      { error: "Failed to generate claim nonce" },
      { status: 500 }
    )
  }
}
