import { type NextRequest, NextResponse } from "next/server"
import { isMockEnabled, getAllMockClaims } from "@/lib/mock-store"
import { getAllClaims } from "@/lib/kv"

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

    const totalPoints =
      (claims.wallchain?.points || 0) + (claims.kaito?.points || 0)

    return NextResponse.json({
      claims: {
        wallchain: claims.wallchain
          ? { claimed: true, points: claims.wallchain.points, claimedAt: claims.wallchain.claimedAt }
          : { claimed: false },
        kaito: claims.kaito
          ? { claimed: true, points: claims.kaito.points, claimedAt: claims.kaito.claimedAt }
          : { claimed: false },
      },
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
