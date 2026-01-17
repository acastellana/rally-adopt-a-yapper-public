"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, Loader2, Sparkles, CheckCircle2 } from "lucide-react"

// Network configuration
const NETWORKS = [
  {
    id: "solana",
    name: "Solana",
    color: "#9945FF",
    placeholder: "Solana address...",
    validate: (addr: string) => addr.length >= 32 && addr.length <= 44,
    mockEnv: "NEXT_PUBLIC_MOCK_SOLANA_ADDRESS"
  },
  {
    id: "eth",
    name: "Ethereum",
    color: "#627EEA",
    placeholder: "0x...",
    validate: (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr),
    mockEnv: "NEXT_PUBLIC_MOCK_ETH_ADDRESS"
  },
  {
    id: "base",
    name: "Base",
    color: "#0052FF",
    placeholder: "0x...",
    validate: (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr),
    mockEnv: "NEXT_PUBLIC_MOCK_BASE_ADDRESS"
  },
  {
    id: "bsc",
    name: "BSC",
    color: "#F0B90B",
    placeholder: "0x...",
    validate: (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr),
    mockEnv: "NEXT_PUBLIC_MOCK_BSC_ADDRESS"
  },
] as const

export type NetworkId = typeof NETWORKS[number]["id"]

export interface WalletAddresses {
  solana: string | null
  eth: string | null
  base: string | null
  bsc: string | null
}

// Get mock addresses from env
const getMockAddress = (networkId: NetworkId): string => {
  const envMap: Record<NetworkId, string | undefined> = {
    solana: process.env.NEXT_PUBLIC_MOCK_SOLANA_ADDRESS,
    eth: process.env.NEXT_PUBLIC_MOCK_ETH_ADDRESS,
    base: process.env.NEXT_PUBLIC_MOCK_BASE_ADDRESS,
    bsc: process.env.NEXT_PUBLIC_MOCK_BSC_ADDRESS,
  }
  return envMap[networkId] || ""
}

const MOCK_ENABLED = process.env.NEXT_PUBLIC_MOCK_WALLET === "true"

interface MultiWalletInputProps {
  onSubmit: (addresses: WalletAddresses) => void
  isLoading: boolean
  error?: string | null
}

export function MultiWalletInput({ onSubmit, isLoading, error }: MultiWalletInputProps) {
  // Initialize with mock addresses if enabled
  const [addresses, setAddresses] = useState<WalletAddresses>(() => ({
    solana: MOCK_ENABLED ? getMockAddress("solana") : null,
    eth: MOCK_ENABLED ? getMockAddress("eth") : null,
    base: MOCK_ENABLED ? getMockAddress("base") : null,
    bsc: MOCK_ENABLED ? getMockAddress("bsc") : null,
  }))

  const [activeInput, setActiveInput] = useState<NetworkId | null>(null)
  const [inputValue, setInputValue] = useState("")

  const connectedNetworks = NETWORKS.filter(n => addresses[n.id])
  const availableNetworks = NETWORKS.filter(n => !addresses[n.id])

  const handleAddNetwork = (networkId: NetworkId) => {
    setActiveInput(networkId)
    setInputValue(MOCK_ENABLED ? getMockAddress(networkId) : "")
  }

  const handleConfirmAddress = () => {
    if (!activeInput) return
    const network = NETWORKS.find(n => n.id === activeInput)
    if (!network || !network.validate(inputValue)) return

    setAddresses(prev => ({ ...prev, [activeInput]: inputValue }))
    setActiveInput(null)
    setInputValue("")
  }

  const handleRemoveNetwork = (networkId: NetworkId) => {
    setAddresses(prev => ({ ...prev, [networkId]: null }))
  }

  const handleCancelInput = () => {
    setActiveInput(null)
    setInputValue("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (connectedNetworks.length === 0 || isLoading) return
    onSubmit(addresses)
  }

  const activeNetwork = activeInput ? NETWORKS.find(n => n.id === activeInput) : null

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <motion.div
        className="rounded-3xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Connected wallets */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">Connected Wallets</label>

          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {connectedNetworks.map(network => (
                <motion.div
                  key={network.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-3 py-1.5"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: network.color }}
                  />
                  <span className="text-sm font-medium text-foreground">{network.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {addresses[network.id]?.slice(0, 4)}...{addresses[network.id]?.slice(-4)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveNetwork(network.id)}
                    className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}

              {connectedNetworks.length === 0 && !activeInput && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground/60"
                >
                  No wallets connected yet
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input for adding new network */}
        <AnimatePresence mode="wait">
          {activeInput && activeNetwork && (
            <motion.div
              key="input"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div
                className="rounded-2xl border-2 p-4 transition-colors"
                style={{ borderColor: `${activeNetwork.color}40` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: activeNetwork.color }}
                  />
                  <span className="text-sm font-semibold text-foreground">{activeNetwork.name}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={activeNetwork.placeholder}
                    className="flex-1 rounded-xl bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleConfirmAddress}
                    disabled={!activeNetwork.validate(inputValue)}
                    className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 transition-opacity"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelInput}
                    className="rounded-xl border border-border/50 px-4 py-2.5 text-sm text-muted-foreground hover:bg-background/50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add network buttons */}
        {availableNetworks.length > 0 && !activeInput && (
          <div className="mt-4">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Add Network</label>
            <div className="flex flex-wrap gap-2">
              {availableNetworks.map(network => (
                <motion.button
                  key={network.id}
                  type="button"
                  onClick={() => handleAddNetwork(network.id)}
                  className="flex items-center gap-2 rounded-full border border-dashed border-border/50 px-3 py-1.5 text-sm text-muted-foreground hover:border-secondary/50 hover:text-foreground transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="h-3 w-3" />
                  <span
                    className="h-2 w-2 rounded-full opacity-60"
                    style={{ backgroundColor: network.color }}
                  />
                  {network.name}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={connectedNetworks.length === 0 || isLoading}
          className="relative mt-6 w-full overflow-hidden rounded-2xl py-4 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
          whileHover={connectedNetworks.length > 0 && !isLoading ? { scale: 1.02 } : {}}
          whileTap={connectedNetworks.length > 0 && !isLoading ? { scale: 0.98 } : {}}
        >
          <span
            className="absolute inset-0 animate-shimmer"
            style={{
              background: "linear-gradient(90deg, #4E11CC, #E943DE, #FF78E2, #E943DE, #4E11CC)",
              backgroundSize: "200% 100%",
            }}
          />
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Checking Eligibility...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Check Eligibility ({connectedNetworks.length} wallet{connectedNetworks.length !== 1 ? "s" : ""})
              </>
            )}
          </span>
        </motion.button>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="overflow-hidden mt-4"
            >
              <p className="flex items-center justify-center gap-2 rounded-xl bg-destructive/10 py-3 text-sm text-destructive">
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Connect wallets from any supported network to check eligibility
      </p>
    </form>
  )
}
