"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Sparkles, Zap, AlertCircle, Image, Lock } from "lucide-react"
import type { AssetType } from "@/lib/types"

interface ClaimCardProps {
  id: number
  nftKey: string
  name: string
  collection: string
  description: string
  image: string
  points: number
  rarity: "common" | "rare" | "legendary"
  assetType: AssetType
  claimed: boolean
  onClaim: () => void
  index: number
  walletAddress: string | null
  signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | null
}

export function ClaimCard({
  nftKey,
  name,
  collection,
  description,
  points,
  rarity,
  assetType,
  claimed,
  onClaim,
  index,
  walletAddress,
  signMessage,
}: ClaimCardProps) {
  const [isClaiming, setIsClaiming] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClaim = async () => {
    if (claimed || isClaiming || !walletAddress || !signMessage) return

    setIsClaiming(true)
    setError(null)

    try {
      // Step 1: Get nonce and message to sign
      const nonceResponse = await fetch("/api/claim/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, nftType: nftKey }),
      })

      const nonceData = await nonceResponse.json()

      if (!nonceResponse.ok) {
        throw new Error(nonceData.error || "Failed to get claim nonce")
      }

      // Step 2: Sign the message with wallet
      const messageBytes = new TextEncoder().encode(nonceData.message)
      const signatureBytes = await signMessage(messageBytes)
      const signature = Buffer.from(signatureBytes).toString("base64")

      // Step 3: Submit the claim
      const claimResponse = await fetch("/api/claim/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          nftType: nftKey,
          signature,
          nonce: nonceData.nonce,
        }),
      })

      const claimData = await claimResponse.json()

      if (!claimResponse.ok) {
        throw new Error(claimData.error || "Failed to submit claim")
      }

      // Success - notify parent
      onClaim()
    } catch (err) {
      console.error("Claim error:", err)
      setError(err instanceof Error ? err.message : "Failed to claim")
    } finally {
      setIsClaiming(false)
    }
  }

  const rarityConfig = {
    common: {
      border: "border-muted-foreground/30",
      glow: "",
      badge: "bg-muted text-muted-foreground",
    },
    rare: {
      border: "border-secondary/50",
      glow: "glow-magenta",
      badge: "bg-gradient-to-r from-secondary to-[#FF78E2] text-white",
    },
    legendary: {
      border: "border-accent/50",
      glow: "glow-gold",
      badge: "bg-gradient-to-r from-accent to-[#FF78E2] text-[#0A0A0A]",
    },
  }

  const assetTypeConfig = {
    nft: {
      label: "NFT",
      icon: Image,
      className: "bg-primary/20 text-primary border-primary/30",
    },
    staked: {
      label: "Staked",
      icon: Lock,
      className: "bg-accent/20 text-accent border-accent/30",
    },
    token: {
      label: "Token",
      icon: Sparkles,
      className: "bg-secondary/20 text-secondary border-secondary/30",
    },
  }

  const config = rarityConfig[rarity]
  const assetConfig = assetTypeConfig[assetType]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`relative overflow-hidden rounded-3xl border-2 ${config.border} bg-card/80 backdrop-blur-xl transition-all duration-500 ${
          claimed ? "opacity-50" : isHovered ? config.glow : ""
        }`}
        animate={isHovered && !claimed ? { y: -8 } : { y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated border gradient */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: "linear-gradient(135deg, #4E11CC, #E943DE, #FF78E2, #FFB527)",
            padding: "2px",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        <div className="relative p-6">
          {/* Asset type badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${assetConfig.className}`}>
              <assetConfig.icon className="h-3 w-3" />
              {assetConfig.label}
            </span>
          </div>

          {/* Header with floating animation */}
          <div className="mb-6 flex items-start justify-between">
            <motion.div animate={isHovered ? { x: 4 } : { x: 0 }} transition={{ duration: 0.3 }}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{collection}</p>
              <h3 className="mt-2 text-xl font-bold text-foreground">{name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </motion.div>

            {/* Rarity badge with pulse animation */}
            {rarity !== "common" && (
              <motion.div
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${config.badge}`}
                animate={
                  rarity === "legendary"
                    ? {
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 0 0 rgba(255, 181, 39, 0)",
                          "0 0 20px rgba(255, 181, 39, 0.4)",
                          "0 0 0 rgba(255, 181, 39, 0)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <span className="flex items-center gap-1">
                  {rarity === "legendary" && <Zap className="h-3 w-3" />}
                  {rarity}
                </span>
              </motion.div>
            )}
          </div>

          {/* Points display with number animation */}
          <div className="mb-8">
            <motion.div
              className="flex items-baseline gap-3"
              animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-mono text-6xl font-black tracking-tighter text-gradient-rally">
                {points.toLocaleString()}
              </span>
              <span className="text-xl font-bold text-muted-foreground">RLP</span>
            </motion.div>

            {/* Animated underline */}
            <motion.div
              className="mt-3 h-1 rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isHovered ? 1 : 0.3 }}
              transition={{ duration: 0.5 }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <p className="flex items-center justify-center gap-2 rounded-xl bg-destructive/10 py-2 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Claim button with wave animation */}
          <motion.button
            onClick={handleClaim}
            disabled={claimed || isClaiming || !walletAddress || !signMessage}
            className="relative w-full overflow-hidden rounded-2xl py-4 text-sm font-bold uppercase tracking-wider transition-all disabled:cursor-not-allowed"
            whileHover={!claimed ? { scale: 1.02 } : {}}
            whileTap={!claimed ? { scale: 0.98 } : {}}
          >
            <AnimatePresence mode="wait">
              {claimed ? (
                <motion.span
                  key="claimed"
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="relative block"
                >
                  {/* Gradient border effect for claimed state - Rally colors */}
                  <span
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg, #FFB527, #FF78E2, #E943DE, #FF78E2, #FFB527)",
                      backgroundSize: "200% 200%",
                      animation: "gradientShift 3s ease infinite",
                    }}
                  />
                  <span className="absolute inset-[2px] rounded-2xl bg-card" />

                  {/* Pulse glow effect - Sunrise Gold */}
                  <motion.span
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      boxShadow: [
                        "0 0 15px rgba(255, 181, 39, 0.2)",
                        "0 0 30px rgba(255, 181, 39, 0.5)",
                        "0 0 15px rgba(255, 181, 39, 0.2)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />

                  <span className="relative flex items-center justify-center gap-2 py-4" style={{ color: "#FFB527" }}>
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <Check className="h-5 w-5" />
                    </motion.span>
                    Claimed
                  </span>
                </motion.span>
              ) : (
                <motion.span
                  key="claim"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative block"
                >
                  {/* Animated gradient background */}
                  <span
                    className="absolute inset-0 rounded-2xl animate-shimmer"
                    style={{
                      background: "linear-gradient(90deg, #4E11CC, #E943DE, #FF78E2, #E943DE, #4E11CC)",
                      backgroundSize: "200% 100%",
                    }}
                  />

                  {/* Shine effect on hover */}
                  <motion.span
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    }}
                    animate={isHovered ? { x: ["-100%", "100%"] } : {}}
                    transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.5 }}
                  />

                  <span className="relative flex items-center justify-center gap-2 py-4 text-white">
                    {isClaiming ? (
                      <>
                        <motion.div
                          className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        />
                        Signing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Claim RLP
                      </>
                    )}
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
