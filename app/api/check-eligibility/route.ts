import { type NextRequest, NextResponse } from "next/server"

const COLLECTIONS = {
  wallchain: {
    address: "HxSsfM9WxQWj79chAUNL6osZxQjJj5iMUwrjEfRBvYBR",
    chain: "solana",
    name: "Quack Heads",
  },
  kaito: {
    address: "0x9830b32f7210f0857a859c2a86387e4d1bb760b8",
    chain: "ethereum",
    name: "Yapybaras",
  },
}

interface HeliusAsset {
  id: string
  content: {
    metadata: {
      name: string
      symbol: string
    }
  }
  grouping: Array<{
    group_key: string
    group_value: string
  }>
}

interface HeliusResponse {
  result: {
    items: HeliusAsset[]
    total: number
  }
}

async function checkSolanaNFTs(walletAddress: string, heliusApiKey: string) {
  const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "searchAssets",
      params: {
        ownerAddress: walletAddress,
        tokenType: "nonFungible",
        displayOptions: {
          showCollectionMetadata: true,
        },
        limit: 1000,
      },
    }),
  })

  const data: HeliusResponse = await response.json()
  return data.result?.items || []
}

async function checkEthereumNFTs(walletAddress: string, alchemyApiKey: string) {
  const contractAddress = COLLECTIONS.kaito.address
  const response = await fetch(
    `https://eth-mainnet.g.alchemy.com/nft/v3/${alchemyApiKey}/getNFTsForOwner?owner=${walletAddress}&contractAddresses[]=${contractAddress}&withMetadata=false`,
    {
      method: "GET",
      headers: { accept: "application/json" },
    },
  )

  const data = await response.json()
  return data.ownedNfts || []
}

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, ethAddress } = await req.json()

    if (!walletAddress && !ethAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const heliusApiKey = process.env.HELIUS_API_KEY
    const alchemyApiKey = process.env.ALCHEMY_API_KEY

    if (!heliusApiKey && !alchemyApiKey) {
      return NextResponse.json({
        eligibility: {
          wallchain: { eligible: true, count: 1 },
          kaito: { eligible: true, count: 2 },
        },
        walletAddress: walletAddress || ethAddress,
        mock: true,
      })
    }

    const eligibility = {
      wallchain: { eligible: false, count: 0 },
      kaito: { eligible: false, count: 0 },
    }

    if (walletAddress && heliusApiKey) {
      const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
      if (solanaAddressRegex.test(walletAddress)) {
        const solanaAssets = await checkSolanaNFTs(walletAddress, heliusApiKey)

        for (const asset of solanaAssets) {
          const collection = asset.grouping?.find((g) => g.group_key === "collection")
          if (collection?.group_value === COLLECTIONS.wallchain.address) {
            eligibility.wallchain.count++
            eligibility.wallchain.eligible = true
          }
        }
      }
    }

    if (ethAddress && alchemyApiKey) {
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
      if (ethAddressRegex.test(ethAddress)) {
        const ethNfts = await checkEthereumNFTs(ethAddress, alchemyApiKey)
        eligibility.kaito.count = ethNfts.length
        eligibility.kaito.eligible = ethNfts.length > 0
      }
    }

    return NextResponse.json({
      eligibility,
      walletAddress: walletAddress || ethAddress,
    })
  } catch (error) {
    console.error("Error checking eligibility:", error)
    return NextResponse.json({ error: "Failed to check eligibility" }, { status: 500 })
  }
}
