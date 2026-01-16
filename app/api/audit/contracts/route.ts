import { NextResponse } from "next/server"
import { getAllContracts, getContractsByType, getStats, initializeDb } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    initializeDb()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as "nft" | "token" | null

    let contracts
    if (type && (type === "nft" || type === "token")) {
      contracts = getContractsByType(type)
    } else {
      contracts = getAllContracts()
    }

    const stats = getStats()

    return NextResponse.json({
      contracts,
      stats,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    )
  }
}
