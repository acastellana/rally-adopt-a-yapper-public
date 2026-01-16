import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
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

    if (nftType !== "wallchain" && nftType !== "kaito") {
      return NextResponse.json(
        { error: "Invalid NFT type" },
        { status: 400 }
      )
    }

    // Generate random nonce
    const nonce = crypto.randomBytes(32).toString("hex")

    // Store nonce with 5 minute TTL
    await setNonce(nonce, {
      walletAddress,
      nftType,
      expiresAt: Date.now() + 300000, // 5 minutes
    })

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
