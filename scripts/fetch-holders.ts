/**
 * Fetch holder data from APIs and save as JSON files
 * Run with: npx tsx scripts/fetch-holders.ts
 */

import fs from "fs"
import path from "path"
import { config } from "dotenv"

config({ path: ".env.local" })

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || ""
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || ""

if (!HELIUS_API_KEY) {
  console.error("Error: HELIUS_API_KEY not set in .env.local")
  process.exit(1)
}

const DATA_DIR = path.join(process.cwd(), "data")

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Fetch NFT holders from Helius API (Solana)
async function fetchQuackHeads(): Promise<{ address: string; quantity: number }[]> {
  const collectionAddress = "HxSsfM9WxQWj79chAUNL6osZxQjJj5iMUwrjEfRBvYBR"
  console.log("Fetching Quack Heads holders from Helius...")

  const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  const ownerBalances = new Map<string, number>()
  let page = 1
  const limit = 1000

  while (true) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "helius-holders",
        method: "getAssetsByGroup",
        params: {
          groupKey: "collection",
          groupValue: collectionAddress,
          page,
          limit,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`Helius API error: ${data.error.message}`)
    }

    const items = data.result?.items || []
    if (items.length === 0) break

    for (const item of items) {
      const owner = item.ownership?.owner
      if (owner) {
        ownerBalances.set(owner, (ownerBalances.get(owner) || 0) + 1)
      }
    }

    process.stdout.write(`\r  Fetched ${ownerBalances.size} holders (page ${page})...`)

    if (items.length < limit) break
    page++

    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  const holders: { address: string; quantity: number }[] = []
  for (const [address, quantity] of ownerBalances) {
    holders.push({ address, quantity })
  }
  holders.sort((a, b) => b.quantity - a.quantity)

  console.log(`\n  ✓ Fetched ${holders.length} Quack Heads holders`)
  return holders
}

// Fetch holders from Blockscout (ETH, Base)
async function fetchFromBlockscout(
  contractAddress: string,
  network: "ETH" | "Base",
  name: string,
  isToken: boolean = false
): Promise<{ address: string; quantity: number }[]> {
  const baseUrls: Record<string, string> = {
    ETH: "https://eth.blockscout.com",
    Base: "https://base.blockscout.com",
  }

  const baseUrl = baseUrls[network]
  console.log(`Fetching ${name} holders from ${network} Blockscout...`)

  const endpoint = `${baseUrl}/api/v2/tokens/${contractAddress}/holders`
  const allHolders: { address: string; quantity: number }[] = []
  let nextPageParams: string | null = null
  let pageCount = 0

  do {
    const url = nextPageParams ? `${endpoint}?${nextPageParams}` : endpoint

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    })

    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.items) {
      for (const item of data.items) {
        let quantity: number
        if (isToken) {
          // For tokens, value is in wei (18 decimals)
          const rawValue = item.value || "0"
          quantity = parseFloat(rawValue) / 1e18
        } else {
          // For NFTs, value is the count
          quantity = parseInt(item.value || "1")
        }

        allHolders.push({
          address: item.address?.hash || item.address,
          quantity: quantity,
        })
      }
    }

    nextPageParams = data.next_page_params
      ? new URLSearchParams(data.next_page_params).toString()
      : null

    pageCount++
    process.stdout.write(`\r  Fetched ${allHolders.length} holders (page ${pageCount})...`)

    await new Promise((resolve) => setTimeout(resolve, 250))
  } while (nextPageParams)

  console.log(`\n  ✓ Fetched ${allHolders.length} ${name} holders`)
  return allHolders
}

// Fetch holders from BscScan
async function fetchFromBscScan(
  contractAddress: string,
  name: string
): Promise<{ address: string; quantity: number }[]> {
  console.log(`Fetching ${name} holders from BscScan...`)

  if (!BSCSCAN_API_KEY) {
    console.log("  ⚠ BSCSCAN_API_KEY not set, skipping...")
    return []
  }

  const allHolders: { address: string; quantity: number }[] = []
  let page = 1
  const pageSize = 10000

  while (true) {
    const url = `https://api.bscscan.com/api?module=token&action=tokenholderlist&contractaddress=${contractAddress}&page=${page}&offset=${pageSize}&apikey=${BSCSCAN_API_KEY}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`BscScan API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== "1" || !data.result || data.result.length === 0) {
      if (page === 1) {
        console.log(`  ⚠ BscScan tokenholderlist may require paid API plan`)
      }
      break
    }

    for (const item of data.result) {
      allHolders.push({
        address: item.TokenHolderAddress,
        quantity: parseFloat(item.TokenHolderQuantity) / 1e18,
      })
    }

    process.stdout.write(`\r  Fetched ${allHolders.length} holders (page ${page})...`)

    if (data.result.length < pageSize) break
    page++

    // BscScan rate limit: 5 calls/sec for free tier
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  console.log(`\n  ✓ Fetched ${allHolders.length} ${name} holders`)
  return allHolders
}

async function main() {
  console.log("Fetching holder data for all collections...\n")

  try {
    // 1. Quack Heads (Solana)
    const quackHeads = await fetchQuackHeads()
    fs.writeFileSync(
      path.join(DATA_DIR, "quack-heads.json"),
      JSON.stringify(quackHeads, null, 2)
    )

    // 2. Yapybaras (ETH NFT)
    const yapybaras = await fetchFromBlockscout(
      "0x9830b32f7210f0857a859c2a86387e4d1bb760b8",
      "ETH",
      "Yapybaras",
      false
    )
    fs.writeFileSync(
      path.join(DATA_DIR, "yapybaras.json"),
      JSON.stringify(yapybaras, null, 2)
    )

    // 3. Skaito (Base token)
    const skaito = await fetchFromBlockscout(
      "0x548D3B444da39686d1a6F1544781d154e7cD1EF7",
      "Base",
      "Skaito",
      true
    )
    fs.writeFileSync(
      path.join(DATA_DIR, "skaito.json"),
      JSON.stringify(skaito, null, 2)
    )

    // 4. Cookie (Base token)
    const cookieBase = await fetchFromBlockscout(
      "0xC0041EF357B183448B235a8Ea73Ce4E4eC8c265F",
      "Base",
      "Cookie (Base)",
      true
    )
    fs.writeFileSync(
      path.join(DATA_DIR, "cookie-base.json"),
      JSON.stringify(cookieBase, null, 2)
    )

    // 5. Cookie (BSC token)
    const cookieBsc = await fetchFromBscScan(
      "0x09fb72CBEa86AFBB5E5A4ac6f48a783A01799017",
      "Cookie (BSC)"
    )
    fs.writeFileSync(
      path.join(DATA_DIR, "cookie-bsc.json"),
      JSON.stringify(cookieBsc, null, 2)
    )

    console.log("\n✓ All holder data fetched and saved!")
    console.log("\nSummary:")
    console.log(`  - Quack Heads: ${quackHeads.length} holders`)
    console.log(`  - Yapybaras: ${yapybaras.length} holders`)
    console.log(`  - Skaito: ${skaito.length} holders`)
    console.log(`  - Cookie (Base): ${cookieBase.length} holders`)
    console.log(`  - Cookie (BSC): ${cookieBsc.length} holders`)
  } catch (error) {
    console.error("\n✗ Error fetching holders:", error)
    process.exit(1)
  }
}

main()
