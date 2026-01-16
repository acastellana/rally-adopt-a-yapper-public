import Database from "better-sqlite3"
import path from "path"

const DB_PATH = path.join(process.cwd(), "data", "holders.db")

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma("journal_mode = WAL")
  }
  return db
}

export function initializeDb() {
  const db = getDb()

  // Create contracts table
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

  // Create holders table
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

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_holders_contract ON holders(contract_address);
    CREATE INDEX IF NOT EXISTS idx_holders_rank ON holders(contract_address, rank);
    CREATE INDEX IF NOT EXISTS idx_contracts_network ON contracts(network);
    CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(type);
  `)

  return db
}

export interface Contract {
  id: number
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

export interface Holder {
  id: number
  contract_address: string
  rank: number
  address: string
  quantity: number
  percentage: string
}

// Get all contracts
export function getAllContracts(): Contract[] {
  const db = getDb()
  const rows = db.prepare(`SELECT * FROM contracts ORDER BY type, name`).all() as any[]
  return rows.map((row) => ({
    ...row,
    verified: Boolean(row.verified),
  }))
}

// Get contracts by type
export function getContractsByType(type: "nft" | "token"): Contract[] {
  const db = getDb()
  const rows = db.prepare(`SELECT * FROM contracts WHERE type = ? ORDER BY name`).all(type) as any[]
  return rows.map((row) => ({
    ...row,
    verified: Boolean(row.verified),
  }))
}

// Get contract by address
export function getContractByAddress(address: string): Contract | undefined {
  const db = getDb()
  const row = db.prepare(`SELECT * FROM contracts WHERE LOWER(address) = LOWER(?)`).get(address) as any
  if (!row) return undefined
  return {
    ...row,
    verified: Boolean(row.verified),
  }
}

// Get holders for a contract with pagination
export function getHolders(
  contractAddress: string,
  page: number = 1,
  pageSize: number = 50
): { holders: Holder[]; total: number; totalPages: number } {
  const db = getDb()
  const offset = (page - 1) * pageSize

  const holders = db
    .prepare(
      `SELECT * FROM holders
       WHERE LOWER(contract_address) = LOWER(?)
       ORDER BY rank
       LIMIT ? OFFSET ?`
    )
    .all(contractAddress, pageSize, offset) as Holder[]

  const countResult = db
    .prepare(`SELECT COUNT(*) as count FROM holders WHERE LOWER(contract_address) = LOWER(?)`)
    .get(contractAddress) as { count: number }

  const total = countResult.count
  const totalPages = Math.ceil(total / pageSize)

  return { holders, total, totalPages }
}

// Get all holders for a contract (no pagination)
export function getAllHolders(contractAddress: string): Holder[] {
  const db = getDb()
  return db
    .prepare(
      `SELECT * FROM holders
       WHERE LOWER(contract_address) = LOWER(?)
       ORDER BY rank`
    )
    .all(contractAddress) as Holder[]
}

// Check if a wallet address holds NFTs for a specific contract
export function getHolderByAddress(
  contractAddress: string,
  walletAddress: string
): Holder | undefined {
  const db = getDb()
  return db
    .prepare(
      `SELECT * FROM holders
       WHERE LOWER(contract_address) = LOWER(?)
       AND LOWER(address) = LOWER(?)`
    )
    .get(contractAddress, walletAddress) as Holder | undefined
}

// Insert or update a contract
export function upsertContract(contract: Omit<Contract, "id">): void {
  const db = getDb()
  db.prepare(`
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
  `).run(
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
}

// Insert holders in bulk
export function insertHolders(contractAddress: string, holders: Omit<Holder, "id" | "contract_address">[]): void {
  const db = getDb()

  // Delete existing holders for this contract
  db.prepare(`DELETE FROM holders WHERE LOWER(contract_address) = LOWER(?)`).run(contractAddress)

  // Insert new holders
  const insert = db.prepare(`
    INSERT INTO holders (contract_address, rank, address, quantity, percentage)
    VALUES (?, ?, ?, ?, ?)
  `)

  const insertMany = db.transaction((holders: Omit<Holder, "id" | "contract_address">[]) => {
    for (const holder of holders) {
      insert.run(contractAddress, holder.rank, holder.address, holder.quantity, holder.percentage)
    }
  })

  insertMany(holders)
}

// Get database stats
export function getStats(): { totalContracts: number; totalHolders: number; verifiedContracts: number } {
  const db = getDb()
  const contracts = db.prepare(`SELECT COUNT(*) as count, SUM(verified) as verified FROM contracts`).get() as {
    count: number
    verified: number
  }
  const holders = db.prepare(`SELECT COUNT(*) as count FROM holders`).get() as { count: number }

  return {
    totalContracts: contracts.count,
    totalHolders: holders.count,
    verifiedContracts: contracts.verified || 0,
  }
}
