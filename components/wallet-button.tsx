"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, Check, Loader2, LogOut } from "lucide-react"

interface WalletButtonProps {
  onConnect?: () => void
}

export function WalletButton({ onConnect }: WalletButtonProps) {
  const { publicKey, connecting, connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()

  const handleClick = () => {
    if (connected) {
      disconnect()
    } else {
      setVisible(true)
    }
  }

  if (connected && onConnect) {
    onConnect()
  }

  const truncate = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`

  return (
    <motion.button
      onClick={handleClick}
      className="group relative"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className={`relative flex items-center gap-3 rounded-full border-2 px-5 py-3 transition-all duration-300 ${
          connected
            ? "border-secondary/50 bg-secondary/10 glow-magenta"
            : "border-border/50 bg-card/50 backdrop-blur-sm hover:border-secondary/50 hover:bg-secondary/5"
        }`}
      >
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
            connected ? "bg-gradient-to-br from-secondary to-[#FF78E2]" : "bg-muted group-hover:bg-secondary/20"
          }`}
        >
          <AnimatePresence mode="wait">
            {connecting ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                transition={{ rotate: { duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" } }}
              >
                <Loader2 className="h-4 w-4 text-secondary" />
              </motion.div>
            ) : connected ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Check className="h-4 w-4 text-white" />
              </motion.div>
            ) : (
              <motion.div key="wallet" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Wallet className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-secondary" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="text-sm font-semibold text-foreground">
          {connecting ? "Connecting..." : connected ? truncate(publicKey!.toBase58()) : "Connect"}
        </span>

        {connected && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="opacity-0 transition-opacity group-hover:opacity-100"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        )}
      </div>
    </motion.button>
  )
}
