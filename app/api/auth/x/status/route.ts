import { type NextRequest, NextResponse } from "next/server"
import { isMockEnabled, getMockXLink } from "@/lib/mock-store"
import { getXLink } from "@/lib/kv"

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

    // MOCK MODE: Use in-memory store
    if (isMockEnabled()) {
      const xLink = getMockXLink(walletAddress)

      if (!xLink) {
        return NextResponse.json({ linked: false })
      }

      return NextResponse.json({
        linked: true,
        username: xLink.xUsername,
        linkedAt: xLink.linkedAt,
      })
    }

    // Real KV lookup
    const xLink = await getXLink(walletAddress)

    if (!xLink) {
      return NextResponse.json({ linked: false })
    }

    return NextResponse.json({
      linked: true,
      username: xLink.xUsername,
      linkedAt: xLink.linkedAt,
    })
  } catch (error) {
    console.error("Error checking X link status:", error)
    return NextResponse.json(
      { error: "Failed to check X link status" },
      { status: 500 }
    )
  }
}
