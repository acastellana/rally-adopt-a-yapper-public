/**
 * Serverless-compatible holder lookup using JSON files
 * This replaces the better-sqlite3 implementation for Vercel deployment
 */

// Import holder data
import quackHeadsData from "@/data/quack-heads.json"
import yapybarasData from "@/data/yapybaras.json"
import skaitoData from "@/data/skaito.json"
import cookieBaseData from "@/data/cookie-base.json"
import cookieBscData from "@/data/cookie-bsc.json"

export interface Holder {
  address: string
  quantity: number
  rank?: number
  percentage?: string
}

export interface Contract {
  address: string
  name: string
  project: string | null
  network: string
  type: "nft" | "token"
  holders_count: number
  total_supply: string
  verified: boolean
  verified_at: string | null
  source: string
  explorer: string
}

// Contract definitions
const CONTRACTS: Contract[] = [
  {
    address: "HxSsfM9WxQWj79chAUNL6osZxQjJj5iMUwrjEfRBvYBR",
    name: "Quack Heads",
    project: "Wallchain",
    network: "Solana",
    type: "nft",
    holders_count: 0, // Will be updated from data
    total_supply: "1999",
    verified: true,
    verified_at: new Date().toISOString(),
    source: "Helius",
    explorer: "https://solscan.io/token/HxSsfM9WxQWj79chAUNL6osZxQjJj5iMUwrjEfRBvYBR",
  },
  {
    address: "0x9830b32f7210f0857a859c2a86387e4d1bb760b8",
    name: "Yapybaras",
    project: "Kaito",
    network: "ETH",
    type: "nft",
    holders_count: 0,
    total_supply: "1500",
    verified: true,
    verified_at: new Date().toISOString(),
    source: "Blockscout",
    explorer: "https://etherscan.io/address/0x9830b32f7210f0857a859c2a86387e4d1bb760b8",
  },
  {
    address: "0x548D3B444da39686d1a6F1544781d154e7cD1EF7",
    name: "Skaito",
    project: "Kaito",
    network: "Base",
    type: "token",
    holders_count: 0,
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
    type: "token",
    holders_count: 0,
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
    type: "token",
    holders_count: 0,
    total_supply: "33000000000000000000000000",
    verified: true,
    verified_at: new Date().toISOString(),
    source: "BscScan",
    explorer: "https://bscscan.com/address/0x09fb72CBEa86AFBB5E5A4ac6f48a783A01799017",
  },
]

// Map contract addresses to their data
const CONTRACT_DATA: Record<string, { address: string; quantity: number }[]> = {
  "hxssfm9wxqwj79chaunl6oszxqjjj5imuwrjefrbvybr": quackHeadsData as { address: string; quantity: number }[],
  "0x9830b32f7210f0857a859c2a86387e4d1bb760b8": yapybarasData as { address: string; quantity: number }[],
  "0x548d3b444da39686d1a6f1544781d154e7cd1ef7": skaitoData as { address: string; quantity: number }[],
  "0xc0041ef357b183448b235a8ea73ce4e4ec8c265f": cookieBaseData as { address: string; quantity: number }[],
  "0x09fb72cbea86afbb5e5a4ac6f48a783a01799017": cookieBscData as { address: string; quantity: number }[],
}

// Pre-process holder data into Maps for O(1) lookup
const holderMaps: Map<string, Map<string, Holder>> = new Map()
const holderArrays: Map<string, Holder[]> = new Map()

function normalizeAddress(address: string): string {
  return address.toLowerCase()
}

function getHolderData(contractAddress: string): { map: Map<string, Holder>; array: Holder[] } {
  const normalizedContract = normalizeAddress(contractAddress)

  if (!holderMaps.has(normalizedContract)) {
    const map = new Map<string, Holder>()
    const array: Holder[] = []
    const data = CONTRACT_DATA[normalizedContract] || []

    // Calculate total for percentage
    const total = data.reduce((sum, h) => sum + h.quantity, 0)

    // Check if this is a Solana address (case-sensitive)
    const isSolana = normalizedContract === "hxssfm9wxqwj79chaunl6oszxqjjj5imuwrjefrbvybr"

    data.forEach((holder, index) => {
      const percentage = total > 0 ? ((holder.quantity / total) * 100).toFixed(2) : "0"
      const holderWithMeta: Holder = {
        address: holder.address,
        quantity: holder.quantity,
        rank: index + 1,
        percentage,
      }

      // For Solana, use exact address; for EVM, normalize to lowercase
      const lookupKey = isSolana ? holder.address : normalizeAddress(holder.address)
      map.set(lookupKey, holderWithMeta)
      array.push(holderWithMeta)
    })

    holderMaps.set(normalizedContract, map)
    holderArrays.set(normalizedContract, array)
  }

  return {
    map: holderMaps.get(normalizedContract)!,
    array: holderArrays.get(normalizedContract)!,
  }
}

// Get holder by address
export function getHolderByAddress(
  contractAddress: string,
  walletAddress: string
): Holder | undefined {
  const { map } = getHolderData(contractAddress)
  const normalizedContract = normalizeAddress(contractAddress)

  // For Solana, use exact address; for EVM, normalize to lowercase
  const isSolana = normalizedContract === "hxssfm9wxqwj79chaunl6oszxqjjj5imuwrjefrbvybr"
  const lookupAddress = isSolana ? walletAddress : normalizeAddress(walletAddress)

  return map.get(lookupAddress)
}

// Get all holders for a contract
export function getAllHolders(contractAddress: string): Holder[] {
  const { array } = getHolderData(contractAddress)
  return array
}

// Get holders with pagination
export function getHolders(
  contractAddress: string,
  page: number = 1,
  pageSize: number = 50
): { holders: Holder[]; total: number; totalPages: number } {
  const { array } = getHolderData(contractAddress)
  const offset = (page - 1) * pageSize
  const holders = array.slice(offset, offset + pageSize)
  const total = array.length
  const totalPages = Math.ceil(total / pageSize)

  return { holders, total, totalPages }
}

// Get holder count
export function getHolderCount(contractAddress: string): number {
  const { array } = getHolderData(contractAddress)
  return array.length
}

// Get all contracts
export function getAllContracts(): Contract[] {
  // Update holder counts from actual data
  return CONTRACTS.map((contract) => ({
    ...contract,
    holders_count: getHolderCount(contract.address),
  }))
}

// Get contracts by type
export function getContractsByType(type: "nft" | "token"): Contract[] {
  return getAllContracts().filter((c) => c.type === type)
}

// Get contract by address
export function getContractByAddress(address: string): Contract | undefined {
  const contracts = getAllContracts()
  return contracts.find((c) => normalizeAddress(c.address) === normalizeAddress(address))
}

// Get database stats
export function getStats(): { totalContracts: number; totalHolders: number; verifiedContracts: number } {
  const contracts = getAllContracts()
  const totalHolders = contracts.reduce((sum, c) => sum + c.holders_count, 0)
  const verifiedContracts = contracts.filter((c) => c.verified).length

  return {
    totalContracts: contracts.length,
    totalHolders,
    verifiedContracts,
  }
}

// Compatibility function (no-op for JSON-based storage)
export function initializeDb() {
  // No-op - data is loaded from JSON imports
}
