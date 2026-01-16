import { type NextRequest, NextResponse } from "next/server"
import { getNonce, deleteNonce, getClaim, setClaim, getXLink } from "@/lib/kv"
import { verifySolanaSignature, buildClaimMessage } from "@/lib/verify-signature"

const POINTS = {
  wallchain: 2500,
  kaito: 1800,
} as const

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, nftType, signature, nonce } = await req.json()

    if (!walletAddress || !nftType || !signature || !nonce) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (nftType !== "wallchain" && nftType !== "kaito") {
      return NextResponse.json(
        { error: "Invalid NFT type" },
        { status: 400 }
      )
    }

    // Verify nonce exists and is valid
    const storedNonce = await getNonce(nonce)

    if (!storedNonce) {
      return NextResponse.json(
        { error: "Invalid or expired nonce" },
        { status: 400 }
      )
    }

    if (storedNonce.walletAddress !== walletAddress || storedNonce.nftType !== nftType) {
      return NextResponse.json(
        { error: "Nonce mismatch" },
        { status: 400 }
      )
    }

    if (storedNonce.expiresAt < Date.now()) {
      await deleteNonce(nonce)
      return NextResponse.json(
        { error: "Nonce expired" },
        { status: 400 }
      )
    }

    // Verify X account is linked
    const xLink = await getXLink(walletAddress)

    if (!xLink) {
      return NextResponse.json(
        { error: "X account not linked. Please connect your X account first." },
        { status: 400 }
      )
    }

    // Check if already claimed
    const existingClaim = await getClaim(walletAddress, nftType)

    if (existingClaim) {
      return NextResponse.json(
        { error: "Already claimed" },
        { status: 400 }
      )
    }

    // Verify signature
    const message = buildClaimMessage(walletAddress, nftType, nonce)
    const isValid = verifySolanaSignature(message, signature, walletAddress)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    // Record the claim
    const points = POINTS[nftType as keyof typeof POINTS]

    await setClaim({
      walletAddress,
      nftType: nftType as "wallchain" | "kaito",
      xUsername: xLink.xUsername,
      signature,
      points,
      claimedAt: Date.now(),
    })

    // Delete the used nonce
    await deleteNonce(nonce)

    return NextResponse.json({
      success: true,
      points,
      nftType,
    })
  } catch (error) {
    console.error("Error processing claim:", error)
    return NextResponse.json(
      { error: "Failed to process claim" },
      { status: 500 }
    )
  }
}
