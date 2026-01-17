import { type NextRequest, NextResponse } from "next/server"
import { isMockEnabled, getAllMockClaims } from "@/lib/mock-store"
import { getAllClaims } from "@/lib/kv"
import type { CollectionKey } from "@/lib/types"

const ALL_COLLECTION_KEYS: CollectionKey[] = ["wallchain", "kaito", "skaito", "cookie"]

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const walletAddress = searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      )
    }

    const claims = isMockEnabled()
      ? getAllMockClaims(walletAddress)
      : await getAllClaims(walletAddress)

    const totalPoints = ALL_COLLECTION_KEYS.reduce(
      (sum, key) => sum + (claims[key]?.points || 0),
      0
    )

    const claimsResponse = ALL_COLLECTION_KEYS.reduce((acc, key) => {
      acc[key] = claims[key]
        ? { claimed: true, points: claims[key]!.points, claimedAt: claims[key]!.claimedAt }
        : { claimed: false }
      return acc
    }, {} as Record<CollectionKey, { claimed: boolean; points?: number; claimedAt?: number }>)

    return NextResponse.json({
      claims: claimsResponse,
      totalPoints,
    })
  } catch (error) {
    console.error("Error checking claim status:", error)
    return NextResponse.json(
      { error: "Failed to check claim status" },
      { status: 500 }
    )
  }
}
