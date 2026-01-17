/**
 * Seed script to populate the holders database
 * Run with: npx tsx scripts/seed-holders.ts
 */

import Database from "better-sqlite3"
import path from "path"
import fs from "fs"
import { config } from "dotenv"

// Load environment variables from .env.local
config({ path: ".env.local" })

// API Keys from environment
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || ""
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || ""
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || ""

if (!BSCSCAN_API_KEY) console.warn("Warning: BSCSCAN_API_KEY not set")
if (!HELIUS_API_KEY) console.warn("Warning: HELIUS_API_KEY not set")
if (!MORALIS_API_KEY) console.warn("Warning: MORALIS_API_KEY not set")

const DB_PATH = path.join(process.cwd(), "data", "holders.db")

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(DB_PATH)
db.pragma("journal_mode = WAL")

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    project TEXT,
    network TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('nft', 'token')),
    holders_count INTEGER NOT NULL,
    total_supply TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0,
    verified_at TEXT,
    source TEXT NOT NULL,
    explorer TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS holders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_address TEXT NOT NULL,
    rank INTEGER NOT NULL,
    address TEXT NOT NULL,
    quantity REAL NOT NULL,
    percentage TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_address) REFERENCES contracts(address),
    UNIQUE(contract_address, address)
  )
`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_holders_contract ON holders(contract_address);
  CREATE INDEX IF NOT EXISTS idx_holders_rank ON holders(contract_address, rank);
  CREATE INDEX IF NOT EXISTS idx_contracts_network ON contracts(network);
  CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(type);
`)

// Contract definitions
const contracts = [
  {
    address: "0x9830b32f7210f0857a859c2a86387e4d1bb760b8",
    name: "Yapybaras",
    project: "Kaito",
    network: "ETH",
    type: "nft" as const,
    holders_count: 1001,
    total_supply: "1500",
    verified: true,
    verified_at: new Date().toISOString(),
    source: "Blockscout",
    explorer: "https://etherscan.io/address/0x9830b32f7210f0857a859c2a86387e4d1bb760b8",
  },
  {
    address: "HxSsfM9WxQWj79chAUNL6osZxQjJj5iMUwrjEfRBvYBR",
    name: "Quack Heads",
    project: "Wallchain",
    network: "Solana",
    type: "nft" as const,
    holders_count: 1480,
    total_supply: "1999",
    verified: true,
    verified_at: new Date().toISOString(),
    source: "Helius",
    explorer: "https://solscan.io/token/HxSsfM9WxQWj79chAUNL6osZxQjJj5iMUwrjEfRBvYBR",
  },
  {
    address: "0x548D3B444da39686d1a6F1544781d154e7cD1EF7",
    name: "Skaito",
    project: "Kaito",
    network: "Base",
    type: "token" as const,
    holders_count: 17345,
    total_supply: "21105390870042485574806742",
    verified: true,
    verified_at: new Date().toISOString(),
    source: "Blockscout",
    explorer: "https://basescan.org/address/0x548D3B444da39686d1a6F1544781d154e7cD1EF7",
  },
  {
    address: "0xC0041EF357B183448B235a8Ea73Ce4E4eC8c265F",
    name: "Cookie",
    project: null,
    network: "Base",
    type: "token" as const,
    holders_count: 90456,
    total_supply: "209196154185784000000000000",
    verified: true,
    verified_at: new Date().toISOString(),
    source: "Blockscout",
    explorer: "https://basescan.org/address/0xC0041EF357B183448B235a8Ea73Ce4E4eC8c265F",
  },
  {
    address: "0x09fb72CBEa86AFBB5E5A4ac6f48a783A01799017",
    name: "Cookie",
    project: null,
    network: "BSC",
    type: "token" as const,
    holders_count: 24500,
    total_supply: "33000000000000000000000000",
    verified: true,
    verified_at: new Date().toISOString(),
    source: "BscScan",
    explorer: "https://bscscan.com/address/0x09fb72CBEa86AFBB5E5A4ac6f48a783A01799017",
  },
]

// Insert contracts
const upsertContract = db.prepare(`
  INSERT INTO contracts (address, name, project, network, type, holders_count, total_supply, verified, verified_at, source, explorer, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(address) DO UPDATE SET
    name = excluded.name,
    project = excluded.project,
    network = excluded.network,
    type = excluded.type,
    holders_count = excluded.holders_count,
    total_supply = excluded.total_supply,
    verified = excluded.verified,
    verified_at = excluded.verified_at,
    source = excluded.source,
    explorer = excluded.explorer,
    updated_at = CURRENT_TIMESTAMP
`)

console.log("Seeding contracts...")
for (const contract of contracts) {
  upsertContract.run(
    contract.address,
    contract.name,
    contract.project,
    contract.network,
    contract.type,
    contract.holders_count,
    contract.total_supply,
    contract.verified ? 1 : 0,
    contract.verified_at,
    contract.source,
    contract.explorer
  )
  console.log(`  ✓ ${contract.name} (${contract.network})`)
}

// Fetch holders from Blockscout API
async function fetchHoldersFromBlockscout(
  contractAddress: string,
  network: "ETH" | "Base",
  type: "nft" | "token"
): Promise<{ address: string; quantity: number }[]> {
  const baseUrls: Record<string, string> = {
    ETH: "https://eth.blockscout.com",
    Base: "https://base.blockscout.com",
  }

  const baseUrl = baseUrls[network]
  if (!baseUrl) throw new Error(`Unsupported network: ${network}`)

  const endpoint =
    type === "nft"
      ? `${baseUrl}/api/v2/tokens/${contractAddress}/holders`
      : `${baseUrl}/api/v2/tokens/${contractAddress}/holders`

  const allHolders: { address: string; quantity: number }[] = []
  let nextPageParams: string | null = null

  console.log(`  Fetching holders from ${network} Blockscout...`)

  do {
    const url: string = nextPageParams ? `${endpoint}?${nextPageParams}` : endpoint

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    })

    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.items) {
      for (const item of data.items) {
        const quantity =
          type === "nft"
            ? parseInt(item.value || "1")
            : parseFloat(item.value) / 1e18 // Assuming 18 decimals for tokens

        allHolders.push({
          address: item.address?.hash || item.address,
          quantity: quantity,
        })
      }
    }

    nextPageParams = data.next_page_params
      ? new URLSearchParams(data.next_page_params).toString()
      : null

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200))

    process.stdout.write(`\r  Fetched ${allHolders.length} holders...`)
  } while (nextPageParams) // Fetch all holders

  console.log(`\r  Fetched ${allHolders.length} holders total`)
  return allHolders
}

// Fetch stakers from BSC staking contract using Moralis
async function fetchStakersFromMoralis(
  contractAddress: string
): Promise<{ address: string; quantity: number }[]> {
  console.log(`  Fetching stakers from Moralis (BSC transactions)...`)

  if (!MORALIS_API_KEY) {
    console.log(`  Error: MORALIS_API_KEY not set`)
    return []
  }

  const uniqueStakers = new Map<string, number>()
  let cursor: string | null = null

  do {
    const url = cursor
      ? `https://deep-index.moralis.io/api/v2.2/${contractAddress}?chain=bsc&limit=100&cursor=${cursor}`
      : `https://deep-index.moralis.io/api/v2.2/${contractAddress}?chain=bsc&limit=100`

    const response = await fetch(url, {
      headers: { "X-API-Key": MORALIS_API_KEY },
    })

    if (!response.ok) {
      throw new Error(`Moralis API error: ${response.status}`)
    }

    const data = await response.json()

    for (const tx of data.result || []) {
      const addr = tx.from_address?.toLowerCase()
      if (addr && addr !== contractAddress.toLowerCase()) {
        // Count interactions as "stake amount" proxy
        uniqueStakers.set(addr, (uniqueStakers.get(addr) || 0) + 1)
      }
    }

    cursor = data.cursor || null
    process.stdout.write(`\r  Found ${uniqueStakers.size} unique stakers...`)

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))
  } while (cursor && uniqueStakers.size < 50000)

  // Convert to array sorted by interaction count
  const holders = Array.from(uniqueStakers.entries())
    .map(([address, quantity]) => ({ address, quantity }))
    .sort((a, b) => b.quantity - a.quantity)

  console.log(`\r  Found ${holders.length} unique stakers total`)
  return holders
}

// Fetch NFT holders from Helius API (Solana) using DAS getAssetsByGroup
async function fetchHoldersFromHelius(
  collectionAddress: string
): Promise<{ address: string; quantity: number }[]> {
  console.log(`  Fetching holders from Helius (DAS API)...`)

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

    // Aggregate by owner
    for (const item of items) {
      const owner = item.ownership?.owner
      if (owner) {
        ownerBalances.set(owner, (ownerBalances.get(owner) || 0) + 1)
      }
    }

    process.stdout.write(`\r  Fetched ${ownerBalances.size} holders (page ${page})...`)

    if (items.length < limit) break
    page++

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  // Convert to array and sort
  const holders: { address: string; quantity: number }[] = []
  for (const [address, quantity] of ownerBalances) {
    holders.push({ address, quantity })
  }
  holders.sort((a, b) => b.quantity - a.quantity)

  console.log(`\r  Fetched ${holders.length} holders total`)
  return holders
}

// Insert holders
const deleteHolders = db.prepare(`DELETE FROM holders WHERE contract_address = ?`)
const insertHolder = db.prepare(`
  INSERT OR IGNORE INTO holders (contract_address, rank, address, quantity, percentage)
  VALUES (?, ?, ?, ?, ?)
`)
const countHolders = db.prepare(`SELECT COUNT(*) as count FROM holders WHERE contract_address = ?`)

// Check for flags
const forceRefresh = process.argv.includes("--force")

async function seedHolders() {
  console.log("\nFetching and seeding holders...")
  if (forceRefresh) console.log("(Force refresh - will delete and re-fetch all)")
  else console.log("(Incremental mode - will add new holders only)")

  for (const contract of contracts) {
    if (!contract.verified) {
      console.log(`\n${contract.name} (${contract.network}): Skipping (unverified)`)
      continue
    }

    const existing = countHolders.get(contract.address) as { count: number }
    console.log(`\n${contract.name} (${contract.network}): ${existing.count} existing holders`)

    try {
      let holders: { address: string; quantity: number }[]

      // Choose API based on network
      if (contract.network === "BSC") {
        holders = await fetchStakersFromMoralis(contract.address)
      } else if (contract.network === "Solana") {
        holders = await fetchHoldersFromHelius(contract.address)
      } else {
        holders = await fetchHoldersFromBlockscout(
          contract.address,
          contract.network as "ETH" | "Base",
          contract.type
        )
      }

      if (holders.length === 0) {
        console.log("  No holders found")
        continue
      }

      // Calculate total for percentage
      const total = holders.reduce((sum, h) => sum + h.quantity, 0)

      // Only delete existing if --force
      if (forceRefresh) {
        deleteHolders.run(contract.address)
      }

      // Insert holders (INSERT OR IGNORE skips duplicates)
      const beforeCount = (countHolders.get(contract.address) as { count: number }).count
      const insertMany = db.transaction(() => {
        holders.forEach((holder, index) => {
          const percentage = ((holder.quantity / total) * 100).toFixed(2)
          insertHolder.run(
            contract.address,
            index + 1,
            holder.address,
            holder.quantity,
            percentage
          )
        })
      })

      insertMany()
      const afterCount = (countHolders.get(contract.address) as { count: number }).count
      const newHolders = afterCount - beforeCount
      console.log(`  ✓ Added ${newHolders} new holders (total: ${afterCount})`)

      // Update contract holder count with actual DB count
      db.prepare(`UPDATE contracts SET holders_count = ?, updated_at = CURRENT_TIMESTAMP WHERE address = ?`).run(
        afterCount,
        contract.address
      )
    } catch (error) {
      console.error(`  ✗ Error: ${error}`)
    }
  }
}

// Run seeding
seedHolders()
  .then(() => {
    console.log("\n✓ Database seeding complete!")

    // Print stats
    const stats = db
      .prepare(
        `SELECT
        (SELECT COUNT(*) FROM contracts) as contracts,
        (SELECT COUNT(*) FROM holders) as holders,
        (SELECT SUM(verified) FROM contracts) as verified`
      )
      .get() as { contracts: number; holders: number; verified: number }

    console.log(`\nDatabase stats:`)
    console.log(`  Contracts: ${stats.contracts}`)
    console.log(`  Holders: ${stats.holders}`)
    console.log(`  Verified: ${stats.verified}/${stats.contracts}`)

    db.close()
  })
  .catch((error) => {
    console.error("Seeding failed:", error)
    db.close()
    process.exit(1)
  })
