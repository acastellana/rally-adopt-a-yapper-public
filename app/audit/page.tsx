"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, Shield, Coins, Image as ImageIcon, Zap, ChevronDown, Copy, Check, Users, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { NFT_SNAPSHOTS, TOKEN_SNAPSHOTS, SNAPSHOT_DATE, type ContractSnapshot } from "@/lib/data/holders-snapshot"

const NETWORK_COLORS: Record<string, string> = {
  ETH: "from-blue-500 to-indigo-600",
  Solana: "from-purple-500 to-fuchsia-500",
  Base: "from-blue-400 to-cyan-400",
  BSC: "from-yellow-500 to-amber-500",
}

const NETWORK_BG: Record<string, string> = {
  ETH: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  Solana: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  Base: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
  BSC: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString()
}

function truncateAddress(address: string): string {
  if (address.length <= 16) return address
  return `${address.slice(0, 8)}...${address.slice(-8)}`
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-zinc-700/50 transition-colors text-zinc-500 hover:text-zinc-300"
      title="Copy address"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  )
}

// Paginated Holders Table Component
function HoldersTable({ contract }: { contract: ContractSnapshot }) {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const holders = contract.holders
  const totalPages = Math.ceil(holders.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentHolders = holders.slice(startIndex, endIndex)

  const getExplorerUrl = (address: string) => {
    switch (contract.network) {
      case "ETH": return `https://etherscan.io/address/${address}`
      case "Solana": return `https://solscan.io/account/${address}`
      case "Base": return `https://basescan.org/address/${address}`
      case "BSC": return `https://bscscan.com/address/${address}`
      default: return "#"
    }
  }

  if (holders.length === 0) {
    return (
      <div className="rounded-lg bg-black/40 border border-zinc-800 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
        <p className="text-zinc-400 text-sm">
          Holder data requires API key for {contract.network}
        </p>
        <p className="text-zinc-600 text-xs mt-1">
          Total holders: {contract.holdersCount.toLocaleString()} (user-provided)
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-black/40 border border-zinc-800 overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-mono text-zinc-400">
            Top Holders <span className="text-zinc-600">({contract.holdersCount.toLocaleString()} total)</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {contract.verified ? (
            <span className="flex items-center gap-1 text-xs font-mono text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-mono text-amber-400">
              <AlertCircle className="h-3 w-3" />
              Unverified
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs font-mono text-zinc-500 uppercase tracking-wider border-b border-zinc-800/50">
              <th className="text-left px-4 py-2 w-16">Rank</th>
              <th className="text-left px-4 py-2">Address</th>
              <th className="text-right px-4 py-2">{contract.type === "token" ? "Balance" : "Qty"}</th>
              <th className="text-right px-4 py-2">%</th>
              <th className="text-center px-4 py-2 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {currentHolders.map((holder) => (
              <tr
                key={holder.address}
                className="border-b border-zinc-800/30 hover:bg-zinc-800/30 transition-colors group"
              >
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-mono ${holder.rank <= 3 ? 'text-amber-400' : 'text-zinc-500'}`}>
                    #{holder.rank}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <code className="text-xs font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    {truncateAddress(holder.address)}
                  </code>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-sm font-mono text-emerald-400">
                    {holder.quantity.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-xs font-mono text-zinc-500">
                    {holder.percentage}%
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton text={holder.address} />
                    <a
                      href={getExplorerUrl(holder.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-zinc-700/50 transition-colors text-zinc-500 hover:text-cyan-400"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-900/30">
          <div className="text-xs font-mono text-zinc-500">
            {startIndex + 1}-{Math.min(endIndex, holders.length)} of {holders.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentPage(1) }}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs font-mono text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              First
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)) }}
              disabled={currentPage === 1}
              className="p-1 rounded-md hover:bg-zinc-700/50 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={(e) => { e.stopPropagation(); setCurrentPage(pageNum) }}
                    className={`w-7 h-7 rounded text-xs font-mono transition-colors ${
                      currentPage === pageNum
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-zinc-500 hover:text-white hover:bg-zinc-700/50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)) }}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md hover:bg-zinc-700/50 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentPage(totalPages) }}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs font-mono text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Contract Row Component
function ContractRow({
  contract,
  isExpanded,
  onToggle,
  accentColor = "emerald"
}: {
  contract: ContractSnapshot
  isExpanded: boolean
  onToggle: () => void
  accentColor?: "emerald" | "cyan"
}) {
  const hoverBg = accentColor === "emerald" ? "hover:bg-emerald-500/10" : "hover:bg-cyan-500/10"
  const expandedBg = accentColor === "emerald" ? "bg-emerald-500/5" : "bg-cyan-500/5"

  return (
    <div className={`border-b border-zinc-800/50 last:border-b-0 ${isExpanded ? expandedBg : ''}`}>
      {/* Clickable Row */}
      <button
        onClick={onToggle}
        className={`w-full grid grid-cols-12 gap-4 px-6 py-4 ${hoverBg} transition-all cursor-pointer group text-left`}
      >
        <div className="col-span-3 flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${NETWORK_COLORS[contract.network]} flex items-center justify-center shadow-lg`}>
            <span className="text-sm font-bold text-white">{contract.name[0]}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{contract.name}</span>
              {contract.verified ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              )}
            </div>
            <div className="text-xs text-zinc-500">{contract.project || "—"}</div>
          </div>
        </div>
        <div className="col-span-2 flex items-center">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-zinc-600" />
            <span className="font-mono text-emerald-400">{formatNumber(contract.holdersCount)}</span>
          </div>
        </div>
        <div className="col-span-2 flex items-center font-mono text-zinc-400">
          {contract.type === "token" ? formatNumber(Math.floor(Number(BigInt(contract.totalSupply) / BigInt(10 ** 18)))) : contract.totalSupply}
        </div>
        <div className="col-span-4 flex items-center gap-3">
          <code className="text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
            {truncateAddress(contract.address)}
          </code>
          <span className={`text-xs font-mono px-2 py-1 rounded border ${NETWORK_BG[contract.network]}`}>
            {contract.network}
          </span>
        </div>
        <div className="col-span-1 flex items-center justify-end">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className={`p-2 rounded-lg ${isExpanded ? 'bg-zinc-800' : 'bg-transparent'} group-hover:bg-zinc-800 transition-colors`}
          >
            <ChevronDown className={`h-4 w-4 ${isExpanded ? 'text-emerald-400' : 'text-zinc-500'} group-hover:text-emerald-400 transition-colors`} />
          </motion.div>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 space-y-4">
              {/* Contract Address Card */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-700/50">
                <div className="flex-1">
                  <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Contract Address</div>
                  <code className="text-sm font-mono text-emerald-400 break-all select-all">
                    {contract.address}
                  </code>
                  <div className="mt-2 flex items-center gap-4 text-xs font-mono text-zinc-500">
                    <span>Source: {contract.source}</span>
                    {contract.verifiedAt && (
                      <span>Verified: {new Date(contract.verifiedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton text={contract.address} />
                  <a
                    href={contract.explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-cyan-400 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Holders Table */}
              <HoldersTable contract={contract} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AuditPage() {
  const [expandedContract, setExpandedContract] = useState<string | null>(null)

  const toggleContract = (address: string) => {
    setExpandedContract(prev => prev === address ? null : address)
  }

  const verifiedCount = [...NFT_SNAPSHOTS, ...TOKEN_SNAPSHOTS].filter(c => c.verified).length
  const totalCount = NFT_SNAPSHOTS.length + TOKEN_SNAPSHOTS.length

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Animated grid background */}
      <div className="fixed inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Scanline effect */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 136, 0.1) 2px, rgba(0, 255, 136, 0.1) 4px)",
        }}
      />

      {/* Glowing orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] animate-pulse" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Header */}
      <header className="relative z-40 border-b border-emerald-500/20 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500"
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="h-5 w-5 text-black" />
            </motion.div>
            <span className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Rally</span>
          </Link>

          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-mono text-emerald-400/80">AUDIT_MODE</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        {/* Title section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
            <span className="text-xs font-mono text-emerald-500/60 tracking-widest">SYSTEM.CONTRACTS</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Contract <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Registry</span>
          </h1>
          <p className="mt-4 text-zinc-500 font-mono text-sm">
            <span className="text-emerald-400">$</span> Verified contract addresses and holder snapshots
          </p>
          <p className="mt-2 text-zinc-600 font-mono text-xs">
            Snapshot: {new Date(SNAPSHOT_DATE).toLocaleString()} • {verifiedCount}/{totalCount} contracts verified via Blockscout
          </p>
        </motion.div>

        {/* Stats overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { label: "NFT Collections", value: NFT_SNAPSHOTS.length, icon: ImageIcon },
            { label: "Token Contracts", value: TOKEN_SNAPSHOTS.length, icon: Coins },
            { label: "Total Holders", value: formatNumber([...NFT_SNAPSHOTS, ...TOKEN_SNAPSHOTS].reduce((a, b) => a + b.holdersCount, 0)), icon: Users },
            { label: "Verified", value: `${verifiedCount}/${totalCount}`, icon: CheckCircle2 },
          ].map((stat) => (
            <div key={stat.label} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                <stat.icon className="h-5 w-5 text-emerald-400 mb-2" />
                <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
                <div className="text-xs text-zinc-500 font-mono">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* NFT Contracts Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">NFT Collections</h2>
            <span className="text-xs font-mono text-zinc-600 bg-zinc-800/50 px-2 py-1 rounded">{NFT_SNAPSHOTS.length} contracts</span>
            <span className="text-xs font-mono text-zinc-600 ml-auto">Click to expand</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-zinc-800 bg-zinc-900/50 text-xs font-mono text-zinc-500 uppercase tracking-wider">
              <div className="col-span-3">Collection</div>
              <div className="col-span-2">Holders</div>
              <div className="col-span-2">Supply</div>
              <div className="col-span-4">Address</div>
              <div className="col-span-1"></div>
            </div>

            {NFT_SNAPSHOTS.map((contract) => (
              <ContractRow
                key={contract.address}
                contract={contract}
                isExpanded={expandedContract === contract.address}
                onToggle={() => toggleContract(contract.address)}
                accentColor="emerald"
              />
            ))}
          </div>
        </motion.section>

        {/* Token Contracts Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Coins className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Token Contracts</h2>
            <span className="text-xs font-mono text-zinc-600 bg-zinc-800/50 px-2 py-1 rounded">{TOKEN_SNAPSHOTS.length} contracts</span>
            <span className="text-xs font-mono text-zinc-600 ml-auto">Click to expand</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-zinc-800 bg-zinc-900/50 text-xs font-mono text-zinc-500 uppercase tracking-wider">
              <div className="col-span-3">Token</div>
              <div className="col-span-2">Holders</div>
              <div className="col-span-2">Supply</div>
              <div className="col-span-4">Address</div>
              <div className="col-span-1"></div>
            </div>

            {TOKEN_SNAPSHOTS.map((contract) => (
              <ContractRow
                key={`${contract.address}-${contract.network}`}
                contract={contract}
                isExpanded={expandedContract === contract.address}
                onToggle={() => toggleContract(contract.address)}
                accentColor="cyan"
              />
            ))}
          </div>
        </motion.section>

        {/* Terminal footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 font-mono text-xs"
        >
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <span className="text-emerald-400">rally@audit</span>
            <span>~</span>
            <span className="text-zinc-600">$</span>
            <span className="text-zinc-400">verify --snapshot</span>
          </div>
          <div className="text-emerald-400">
            [OK] {verifiedCount} contracts verified via Blockscout API
          </div>
          <div className="text-amber-400">
            [WARN] {totalCount - verifiedCount} contracts pending verification (Solana, BSC require API keys)
          </div>
          <div className="text-zinc-600 mt-1">
            Snapshot: {new Date(SNAPSHOT_DATE).toISOString()}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
