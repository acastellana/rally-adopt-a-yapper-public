"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { motion, AnimatePresence } from "framer-motion"
import { GradientBlob } from "@/components/gradient-blob"
import { ClaimCard } from "@/components/claim-card"
import { WalletButton } from "@/components/wallet-button"
import { StatsBar } from "@/components/stats-bar"
import { WelcomeScreen } from "@/components/welcome-screen"
import { MultiWalletInput, type WalletAddresses } from "@/components/multi-wallet-input"
import { ConnectXModal } from "@/components/connect-x-modal"
import { Wallet, ArrowRight, Edit3, Zap, ExternalLink } from "lucide-react"
import { NFTS } from "@/lib/config"
import type { Eligibility, CollectionKey } from "@/lib/types"

// Mock wallet mode for testing
const MOCK_WALLET_ENABLED = process.env.NEXT_PUBLIC_MOCK_WALLET === "true"

// Mock signMessage function that returns a fake signature
const mockSignMessage = async (message: Uint8Array): Promise<Uint8Array> => {
  // Return a fake 64-byte signature (Ed25519 signature size)
  const fakeSignature = new Uint8Array(64)
  // Fill with deterministic data based on message
  for (let i = 0; i < 64; i++) {
    fakeSignature[i] = (message[i % message.length] + i) % 256
  }
  return fakeSignature
}

// Network colors for display
const NETWORK_COLORS: Record<string, string> = {
  solana: "#9945FF",
  eth: "#627EEA",
  base: "#0052FF",
  bsc: "#F0B90B",
}

const NETWORK_NAMES: Record<string, string> = {
  solana: "SOL",
  eth: "ETH",
  base: "BASE",
  bsc: "BSC",
}

const NETWORK_EXPLORERS: Record<string, string> = {
  solana: "https://solscan.io/account/",
  eth: "https://etherscan.io/address/",
  base: "https://basescan.org/address/",
  bsc: "https://bscscan.com/address/",
}

type AppStep = "landing" | "claim" | "welcome"

export default function Page() {
  const { publicKey, connected, signMessage } = useWallet()
  const { setVisible } = useWalletModal()

  const [claimed, setClaimed] = useState<Set<number>>(new Set())
  const [step, setStep] = useState<AppStep>("landing")

  // Multi-wallet state
  const [walletAddresses, setWalletAddresses] = useState<WalletAddresses>({
    solana: null,
    eth: null,
    base: null,
    bsc: null,
  })
  const [eligibility, setEligibility] = useState<Eligibility | null>(null)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)
  const [eligibilityError, setEligibilityError] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState<"connect" | "manual">("manual")

  const [showXModal, setShowXModal] = useState(false)
  const [xConnected, setXConnected] = useState(false)
  const [xUsername, setXUsername] = useState<string | null>(null)

  // Determine active wallet address for signing (prefer Solana, then any connected wallet)
  const activeWalletAddress = connected && publicKey
    ? publicKey.toBase58()
    : walletAddresses.solana || walletAddresses.eth || walletAddresses.base || walletAddresses.bsc

  // Use mock signMessage in mock mode when no real wallet is connected
  const effectiveSignMessage = useMemo(() => {
    if (signMessage) return signMessage
    if (MOCK_WALLET_ENABLED && activeWalletAddress) return mockSignMessage
    return null
  }, [signMessage, activeWalletAddress])

  // Get connected networks for display
  const connectedNetworks = useMemo(() => {
    return Object.entries(walletAddresses)
      .filter(([, addr]) => addr !== null)
      .map(([network, addr]) => ({ network, address: addr as string }))
  }, [walletAddresses])

  const handleOpenWalletModal = () => {
    setVisible(true)
  }

  // Check for existing claims when eligibility is checked
  const fetchClaimStatus = useCallback(async (walletAddr: string) => {
    try {
      const response = await fetch(`/api/claim/status?wallet=${encodeURIComponent(walletAddr)}`)
      const data = await response.json()

      if (response.ok && data.claims) {
        const claimedIds = new Set<number>()
        const collectionKeys: CollectionKey[] = ["wallchain", "kaito", "skaito", "cookie"]
        for (const key of collectionKeys) {
          if (data.claims[key]?.claimed) {
            const nft = NFTS.find((n) => n.key === key)
            if (nft) claimedIds.add(nft.id)
          }
        }
        setClaimed(claimedIds)
      }
    } catch {
      // Ignore errors - claims will just show as unclaimed
    }
  }, [])

  // Check for existing X link
  const checkXLinkStatus = useCallback(async (walletAddr: string) => {
    try {
      const response = await fetch(`/api/auth/x/status?wallet=${encodeURIComponent(walletAddr)}`)
      const data = await response.json()

      if (response.ok && data.linked) {
        setXConnected(true)
        setXUsername(`@${data.username}`)
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const checkEligibility = useCallback(
    async (addresses: WalletAddresses) => {
      setIsCheckingEligibility(true)
      setEligibilityError(null)

      try {
        const response = await fetch("/api/check-eligibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            solanaAddress: addresses.solana || null,
            ethAddress: addresses.eth || null,
            baseAddress: addresses.base || null,
            bscAddress: addresses.bsc || null,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to check eligibility")
        }

        setEligibility(data.eligibility)
        setWalletAddresses(addresses)

        // Use primary wallet for X link and claims (prefer Solana)
        const primaryWallet = addresses.solana || addresses.eth || addresses.base || addresses.bsc
        if (primaryWallet) {
          await fetchClaimStatus(primaryWallet)
          const hasXLink = await checkXLinkStatus(primaryWallet)
          if (!hasXLink) {
            setShowXModal(true)
          }
        }

        setStep("claim")
      } catch (err) {
        setEligibilityError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setIsCheckingEligibility(false)
      }
    },
    [fetchClaimStatus, checkXLinkStatus]
  )

  const handleWalletConnect = useCallback(() => {
    if (publicKey && !eligibility) {
      checkEligibility({ solana: publicKey.toBase58(), eth: null, base: null, bsc: null })
    }
  }, [publicKey, eligibility, checkEligibility])

  // Fix: Move side effect from render to useEffect
  useEffect(() => {
    if (connected && publicKey && !eligibility && !isCheckingEligibility && !eligibilityError && step === "landing") {
      checkEligibility({ solana: publicKey.toBase58(), eth: null, base: null, bsc: null })
    }
  }, [connected, publicKey, eligibility, isCheckingEligibility, eligibilityError, step, checkEligibility])

  const handleXConnected = (username: string) => {
    setXUsername(username)
    setXConnected(true)
    setShowXModal(false)
  }

  const handleClaim = (id: number) => {
    const newClaimed = new Set([...claimed, id])
    setClaimed(newClaimed)

    const eligibleNfts = NFTS.filter((nft) => eligibility?.[nft.key as CollectionKey]?.eligible)
    if (newClaimed.size === eligibleNfts.length && eligibleNfts.length > 0) {
      setTimeout(() => setStep("welcome"), 1200)
    }
  }

  const eligibleNfts = NFTS.filter((nft) => eligibility?.[nft.key as CollectionKey]?.eligible)
  const totalPoints = eligibleNfts.reduce((sum, nft) => sum + nft.points, 0)
  const pointsClaimed = eligibleNfts.filter((n) => claimed.has(n.id)).reduce((sum, nft) => sum + nft.points, 0)
  const allClaimed = claimed.size === eligibleNfts.length && eligibleNfts.length > 0

  const handleReset = () => {
    setWalletAddresses({ solana: null, eth: null, base: null, bsc: null })
    setEligibility(null)
    setClaimed(new Set())
    setEligibilityError(null)
    setStep("landing")
    setXConnected(false)
    setXUsername(null)
  }

  const hasAnyWallet = connectedNetworks.length > 0
  const isActive = connected || hasAnyWallet

  if (step === "welcome") {
    const claimedNftKeys = eligibleNfts.map(nft => nft.key)
    return <WelcomeScreen totalPoints={totalPoints} claimedCollections={claimedNftKeys} />
  }

  return (
    <div className="relative min-h-screen bg-background">
      <GradientBlob />

      <ConnectXModal isOpen={showXModal && !!activeWalletAddress} walletAddress={activeWalletAddress} onConnected={handleXConnected} />

      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-2xl">
        <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {/* Logo with animated gradient */}
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-secondary to-[#FF78E2]"
              animate={{
                boxShadow: [
                  "0 0 0 rgba(233, 67, 222, 0)",
                  "0 0 30px rgba(233, 67, 222, 0.4)",
                  "0 0 0 rgba(233, 67, 222, 0)",
                ],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              <Zap className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-xl font-black tracking-tight text-foreground">Rally</span>
          </motion.div>

          {step === "claim" && hasAnyWallet && !connected ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleReset}
              className="flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2.5 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-secondary/10 hover:text-foreground"
            >
              <Edit3 className="h-4 w-4" />
              Change Address
            </motion.button>
          ) : (
            <WalletButton onConnect={handleWalletConnect} />
          )}
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 pt-18">
        <div className="mx-auto max-w-5xl px-6 py-24">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
              </span>
              Season 1 Live
            </motion.span>

            <h1 className="mt-10 text-balance text-5xl font-black tracking-tight text-foreground md:text-7xl lg:text-8xl">
              Infofi is <span className="text-gradient-rally">Not Dead</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
              Sorry you guys were fucked by Nikita. We&apos;re building a decentralized marketing protocol and would
              like to invite you.
            </p>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {step === "landing" && !isActive ? (
              <motion.div
                key="connect"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="mt-20 flex flex-col items-center"
              >
                {/* Mode toggle with new styling */}
                <div className="mb-10 flex items-center gap-1 rounded-full border border-border/50 bg-card/50 p-1.5 backdrop-blur-sm">
                  <button
                    onClick={() => setInputMode("connect")}
                    className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                      inputMode === "connect"
                        ? "bg-gradient-to-r from-primary to-secondary text-white glow-indigo"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Connect Wallet
                  </button>
                  <button
                    onClick={() => setInputMode("manual")}
                    className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                      inputMode === "manual"
                        ? "bg-gradient-to-r from-primary to-secondary text-white glow-indigo"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Enter Address
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {inputMode === "connect" ? (
                    <motion.div
                      key="wallet-connect"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col items-center"
                    >
                      {/* Animated wallet icon */}
                      <motion.div
                        className="relative mb-12"
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      >
                        <div className="relative">
                          {/* Pulsing rings */}
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-secondary/30"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          />
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-secondary/30"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                          />

                          <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-border/50 bg-card/50 backdrop-blur-sm">
                            <Wallet className="h-14 w-14 text-muted-foreground" strokeWidth={1.5} />
                          </div>
                        </div>
                      </motion.div>

                      <h2 className="text-2xl font-bold text-foreground">Connect your wallet</h2>
                      <p className="mt-3 text-center text-muted-foreground">to check your eligibility and claim RLP</p>

                      <motion.button
                        onClick={handleOpenWalletModal}
                        className="group relative mt-10 overflow-hidden rounded-full px-10 py-4 font-bold text-white transition-all"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {/* Animated gradient */}
                        <span
                          className="absolute inset-0 animate-shimmer"
                          style={{
                            background: "linear-gradient(90deg, #4E11CC, #E943DE, #FF78E2, #E943DE, #4E11CC)",
                            backgroundSize: "200% 100%",
                          }}
                        />
                        <span className="relative flex items-center gap-3">
                          <Wallet className="h-5 w-5" />
                          Connect Wallet
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="manual-input"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex w-full flex-col items-center"
                    >
                      <MultiWalletInput
                        onSubmit={checkEligibility}
                        isLoading={isCheckingEligibility}
                        error={eligibilityError}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : step === "claim" ? (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-20">
                {isCheckingEligibility ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-24"
                  >
                    <div className="relative">
                      <motion.div
                        className="h-16 w-16 rounded-full border-4 border-secondary/30"
                        style={{ borderTopColor: "#E943DE" }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                    </div>
                    <p className="mt-6 text-lg text-muted-foreground">Checking your eligibility...</p>
                  </motion.div>
                ) : eligibility && xConnected ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-10 flex flex-col items-center gap-3"
                    >
                      <p className="text-sm font-medium text-muted-foreground">Connected wallets</p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {connectedNetworks.map(({ network, address }) => (
                          <a
                            key={network}
                            href={`${NETWORK_EXPLORERS[network]}${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-3 py-2 font-mono text-xs text-foreground transition-colors hover:bg-card/80"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: NETWORK_COLORS[network] }}
                            />
                            <span className="font-medium">{NETWORK_NAMES[network]}</span>
                            <span className="text-muted-foreground">{address.slice(0, 4)}...{address.slice(-4)}</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </a>
                        ))}
                      </div>
                      {xUsername && (
                        <span className="rounded-full border border-foreground/30 bg-foreground/10 px-4 py-2 text-sm font-medium text-foreground">
                          {xUsername}
                        </span>
                      )}
                    </motion.div>

                    <StatsBar totalPoints={totalPoints} nftsOwned={eligibleNfts.length} pointsClaimed={pointsClaimed} />

                    {eligibleNfts.length > 0 ? (
                      <>
                        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
                          {eligibleNfts.map((nft, i) => (
                            <ClaimCard
                              key={nft.id}
                              id={nft.id}
                              nftKey={nft.key}
                              name={nft.name}
                              collection={nft.collection}
                              description={nft.description}
                              image={nft.image}
                              points={nft.points}
                              rarity={nft.rarity}
                              claimed={claimed.has(nft.id)}
                              onClaim={() => handleClaim(nft.id)}
                              index={i}
                              walletAddress={activeWalletAddress}
                              signMessage={effectiveSignMessage}
                            />
                          ))}
                        </div>

                        {!allClaimed && !effectiveSignMessage && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-8 text-center text-sm text-muted-foreground"
                          >
                            Connect your wallet to sign and claim your RLP rewards
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-14 flex flex-col items-center rounded-3xl border border-border/50 bg-card/50 p-14 text-center backdrop-blur-xl"
                      >
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
                          <Wallet className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="mt-8 text-2xl font-bold text-foreground">No eligible NFTs found</h3>
                        <p className="mt-3 max-w-md text-muted-foreground">
                          These wallets don&apos;t hold any Quack Heads or Yapybaras NFTs. Make sure you&apos;re
                          checking the correct addresses.
                        </p>
                        <motion.button
                          onClick={handleReset}
                          className="mt-10 rounded-full border border-border/50 bg-card/50 px-8 py-3.5 font-semibold text-foreground backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-secondary/10"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Try Another Address
                        </motion.button>
                      </motion.div>
                    )}
                  </>
                ) : eligibility && !xConnected ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-24"
                  >
                    <p className="text-lg text-muted-foreground">Connect your X account to continue...</p>
                  </motion.div>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
