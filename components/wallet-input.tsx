"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react"

interface WalletInputProps {
  onSubmit: (solanaAddress: string, ethAddress: string) => void
  isLoading: boolean
  error?: string | null
}

export function WalletInput({ onSubmit, isLoading, error }: WalletInputProps) {
  const [solanaAddress, setSolanaAddress] = useState("8KDgqkk3FgZCjMozaASfQcm5JZfKNgBKA5vQXEJzY6cr")
  const [ethAddress, setEthAddress] = useState("")
  const [focusedField, setFocusedField] = useState<"solana" | "eth" | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((solanaAddress.trim() || ethAddress.trim()) && !isLoading) {
      onSubmit(solanaAddress.trim(), ethAddress.trim())
    }
  }

  const isSolanaValid = solanaAddress.length >= 32 && solanaAddress.length <= 44
  const isEthValid = /^0x[a-fA-F0-9]{40}$/.test(ethAddress)
  const hasAnyAddress = solanaAddress.trim() || ethAddress.trim()

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <motion.div
        className="space-y-5 rounded-3xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary/20">
              <span className="h-2 w-2 rounded-full bg-secondary" />
            </span>
            Solana Address
            <span className="text-xs font-normal text-muted-foreground">(for Quack Heads)</span>
          </label>
          <motion.div
            className={`relative overflow-hidden rounded-2xl border-2 bg-background/50 transition-all duration-300 ${
              focusedField === "solana" ? "border-secondary glow-magenta" : "border-border/50 hover:border-border"
            }`}
          >
            <div className="flex items-center">
              <div className="pl-4">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={solanaAddress}
                onChange={(e) => setSolanaAddress(e.target.value)}
                onFocus={() => setFocusedField("solana")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter Solana wallet address..."
                className="flex-1 bg-transparent px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                disabled={isLoading}
              />
              <AnimatePresence mode="wait">
                {solanaAddress && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                    className="pr-4"
                  >
                    {isSolanaValid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20">
              <span className="h-2 w-2 rounded-full bg-primary" />
            </span>
            Ethereum Address
            <span className="text-xs font-normal text-muted-foreground">(for Yapybaras)</span>
          </label>
          <motion.div
            className={`relative overflow-hidden rounded-2xl border-2 bg-background/50 transition-all duration-300 ${
              focusedField === "eth" ? "border-primary glow-indigo" : "border-border/50 hover:border-border"
            }`}
          >
            <div className="flex items-center">
              <div className="pl-4">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={ethAddress}
                onChange={(e) => setEthAddress(e.target.value)}
                onFocus={() => setFocusedField("eth")}
                onBlur={() => setFocusedField(null)}
                placeholder="0x..."
                className="flex-1 bg-transparent px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                disabled={isLoading}
              />
              <AnimatePresence mode="wait">
                {ethAddress && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                    className="pr-4"
                  >
                    {isEthValid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Submit button with shimmer effect */}
        <motion.button
          type="submit"
          disabled={!hasAnyAddress || isLoading}
          className="relative mt-2 w-full overflow-hidden rounded-2xl py-4 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
          whileHover={hasAnyAddress && !isLoading ? { scale: 1.02 } : {}}
          whileTap={hasAnyAddress && !isLoading ? { scale: 0.98 } : {}}
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
                Check Eligibility
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
              className="overflow-hidden"
            >
              <p className="flex items-center justify-center gap-2 rounded-xl bg-destructive/10 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Enter at least one address to check your eligibility
      </p>
    </form>
  )
}
