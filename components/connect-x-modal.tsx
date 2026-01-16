"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, Loader2, Sparkles } from "lucide-react"

interface ConnectXModalProps {
  isOpen: boolean
  onConnected: (username: string) => void
}

export function ConnectXModal({ isOpen, onConnected }: ConnectXModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const handleConnectX = async () => {
    setIsConnecting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsConnecting(false)
    setIsConnected(true)
    setTimeout(() => {
      onConnected("@user")
    }, 800)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/50 bg-card/80 p-8 shadow-2xl backdrop-blur-xl"
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Animated background glow */}
              <motion.div
                className="absolute -inset-4 opacity-30 blur-3xl"
                style={{
                  background: "radial-gradient(circle, #E943DE 0%, transparent 70%)",
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              />

              {/* X Logo with animated ring */}
              <motion.div
                className="relative mx-auto mb-8"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              >
                <div className="relative flex h-24 w-24 items-center justify-center">
                  {/* Animated rings */}
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

                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-foreground">
                    {isConnected ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                      </motion.div>
                    ) : (
                      <X className="h-10 w-10 text-background" strokeWidth={2.5} />
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="relative text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h2 className="text-2xl font-bold text-foreground">
                  {isConnected ? <span className="text-gradient-rally">Connected!</span> : "Connect X to Continue"}
                </h2>
                <p className="mt-3 text-muted-foreground">
                  {isConnected
                    ? "Your X account has been linked successfully."
                    : "Link your X account to verify your identity and claim your RLP rewards."}
                </p>
              </motion.div>

              {!isConnected && (
                <motion.button
                  onClick={handleConnectX}
                  disabled={isConnecting}
                  className="relative mt-8 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-foreground px-6 py-4 font-bold text-background transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5" strokeWidth={2.5} />
                      Connect with X
                    </>
                  )}
                </motion.button>
              )}

              {isConnected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center justify-center gap-2 text-secondary"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Redirecting...</span>
                </motion.div>
              )}

              <motion.p
                className="mt-6 text-center text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                We'll never post without your permission
              </motion.p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
