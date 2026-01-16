import { NextRequest, NextResponse } from "next/server"
import { getHolders, getAllHolders, getContractByAddress, initializeDb } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    initializeDb()

    const searchParams = request.nextUrl.searchParams
    const contractAddress = searchParams.get("contract")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "50")
    const all = searchParams.get("all") === "true"

    if (!contractAddress) {
      return NextResponse.json(
        { error: "Contract address is required" },
        { status: 400 }
      )
    }

    const contract = getContractByAddress(contractAddress)
    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      )
    }

    if (all) {
      const holders = getAllHolders(contractAddress)
      return NextResponse.json({
        contract,
        holders,
        total: holders.length,
        network: contract.network,
        contractAddress: contract.address,
      })
    }

    const { holders, total, totalPages } = getHolders(contractAddress, page, pageSize)

    return NextResponse.json({
      contract,
      holders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      network: contract.network,
      contractAddress: contract.address,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      { error: "Failed to fetch holders" },
      { status: 500 }
    )
  }
}
