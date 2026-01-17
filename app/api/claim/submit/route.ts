import { type NextRequest, NextResponse } from "next/server"
import {
  isMockEnabled,
  isMockSignatureEnabled,
  getMockNonce,
  deleteMockNonce,
  getMockClaim,
  setMockClaim,
  getMockXLink,
} from "@/lib/mock-store"
import { getNonce, deleteNonce, getClaim, setClaim, getXLink } from "@/lib/kv"
import { verifySolanaSignature, buildClaimMessage } from "@/lib/verify-signature"
import type { CollectionKey } from "@/lib/types"

const POINTS: Record<CollectionKey, number> = {
  wallchain: 2500,
  kaito: 1800,
  skaito: 1500,
  cookie: 1200,
}

const VALID_NFT_TYPES: CollectionKey[] = ["wallchain", "kaito", "skaito", "cookie"]

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, nftType, signature, nonce } = await req.json()

    if (!walletAddress || !nftType || !signature || !nonce) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!VALID_NFT_TYPES.includes(nftType)) {
      return NextResponse.json(
        { error: "Invalid NFT type" },
        { status: 400 }
      )
    }

    const useMock = isMockEnabled()

    // Verify nonce exists and is valid
    const storedNonce = useMock ? getMockNonce(nonce) : await getNonce(nonce)

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
      if (useMock) {
        deleteMockNonce(nonce)
      } else {
        await deleteNonce(nonce)
      }
      return NextResponse.json(
        { error: "Nonce expired" },
        { status: 400 }
      )
    }

    // Verify X account is linked
    const xLink = useMock ? getMockXLink(walletAddress) : await getXLink(walletAddress)

    if (!xLink) {
      return NextResponse.json(
        { error: "X account not linked. Please connect your X account first." },
        { status: 400 }
      )
    }

    // Check if already claimed
    const existingClaim = useMock
      ? getMockClaim(walletAddress, nftType)
      : await getClaim(walletAddress, nftType)

    if (existingClaim) {
      return NextResponse.json(
        { error: "Already claimed" },
        { status: 400 }
      )
    }

    // Verify signature (skip if mocking signatures)
    if (!isMockSignatureEnabled()) {
      const message = buildClaimMessage(walletAddress, nftType, nonce)
      const isValid = verifySolanaSignature(message, signature, walletAddress)

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        )
      }
    }

    // Record the claim
    const points = POINTS[nftType as CollectionKey]
    const claimData = {
      walletAddress,
      nftType: nftType as CollectionKey,
      xUsername: xLink.xUsername,
      signature,
      points,
      claimedAt: Date.now(),
    }

    if (useMock) {
      setMockClaim(claimData)
      deleteMockNonce(nonce)
    } else {
      await setClaim(claimData)
      await deleteNonce(nonce)
    }

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
