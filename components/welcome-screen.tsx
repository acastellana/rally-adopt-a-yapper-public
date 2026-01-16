"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, PartyPopper, Sparkles } from "lucide-react"

interface Confetti {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  size: number
  color: string
  opacity: number
}

interface WelcomeScreenProps {
  totalPoints: number
}

export function WelcomeScreen({ totalPoints }: WelcomeScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const confettiRef = useRef<Confetti[]>([])
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener("resize", resize)

    // Rally brand color palette for confetti
    const colors = ["#4E11CC", "#E943DE", "#FF78E2", "#FFB527", "#FFFFFF"]

    const createBurst = (originX: number, originY: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.random() - 0.5) * Math.PI - Math.PI / 2
        const velocity = Math.random() * 20 + 14
        confettiRef.current.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * velocity + (Math.random() - 0.5) * 6,
          vy: Math.sin(angle) * velocity,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 15,
          size: Math.random() * 10 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: 1,
        })
      }
    }

    // Initial bursts
    const width = window.innerWidth
    const height = window.innerHeight
    setTimeout(() => createBurst(width * 0.2, height, 60), 0)
    setTimeout(() => createBurst(width * 0.8, height, 60), 100)
    setTimeout(() => createBurst(width * 0.5, height, 50), 200)
    setTimeout(() => createBurst(width * 0.35, height, 40), 300)
    setTimeout(() => createBurst(width * 0.65, height, 40), 400)

    setTimeout(() => setShowContent(true), 400)

    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      confettiRef.current = confettiRef.current.filter((c) => {
        c.vy += 0.4
        c.vx *= 0.99
        c.x += c.vx
        c.y += c.vy
        c.rotation += c.rotationSpeed

        if (c.y > height * 0.6) c.opacity -= 0.012
        if (c.y > height + 50 || c.opacity <= 0) return false

        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.rotate((c.rotation * Math.PI) / 180)
        ctx.globalAlpha = c.opacity
        ctx.fillStyle = c.color

        // Mix of rectangles and circles
        if (Math.random() > 0.5) {
          ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, c.size / 3, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
        return true
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

      {/* Multiple gradient glows */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="absolute h-[600px] w-[600px] rounded-full blur-[150px]"
          style={{
            background: "radial-gradient(circle, #4E11CC 0%, transparent 70%)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1 }}
        />
        <motion.div
          className="absolute h-[400px] w-[400px] rounded-full blur-[100px]"
          style={{
            background: "radial-gradient(circle, #E943DE 0%, transparent 70%)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>

      {showContent && (
        <motion.div
          className="relative z-10 flex flex-col items-center px-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="mb-10"
          >
            <div className="relative">
              {/* Pulsing rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-secondary/30"
                animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-secondary/30"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
              />

              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary via-secondary to-[#FF78E2] glow-magenta">
                <PartyPopper className="h-12 w-12 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl font-black tracking-tight text-foreground md:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to <span className="text-gradient-rally">Rally</span>
          </motion.h1>

          <motion.div
            className="mt-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 px-12 py-8 backdrop-blur-xl">
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(233, 67, 222, 0.2), transparent)",
                }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
              />

              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">You've earned</p>
              <p className="mt-2 font-mono text-6xl font-black text-gradient-rally">{totalPoints.toLocaleString()}</p>
              <p className="mt-2 text-xl font-bold text-muted-foreground">RLP</p>
            </div>
            <p className="mt-6 text-muted-foreground">by being adopted, because thanks to Nikita.</p>
          </motion.div>

          <motion.p
            className="mt-12 flex items-center gap-2 text-lg text-foreground/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Sparkles className="h-5 w-5 text-secondary" />
            You've received immediate access to Rally.
          </motion.p>

          <motion.button
            className="group relative mt-8 overflow-hidden rounded-full px-10 py-4 font-bold text-white transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Animated gradient background */}
            <span
              className="absolute inset-0 animate-shimmer"
              style={{
                background: "linear-gradient(90deg, #4E11CC, #E943DE, #FF78E2, #E943DE, #4E11CC)",
                backgroundSize: "200% 100%",
              }}
            />

            {/* Shine effect */}
            <motion.span
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.8 }}
            />

            <span className="relative flex items-center gap-3">
              Access the Platform
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
