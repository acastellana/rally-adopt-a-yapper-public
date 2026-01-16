"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"

export function GradientBlob() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    // Floating particles with Rally colors
    const particles: {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      opacity: number
    }[] = []

    const colors = ["#4E11CC", "#E943DE", "#FF78E2", "#FFB527"]

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
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
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Floating particles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />

      {/* Electric Indigo blob - top right */}
      <motion.div
        className="absolute -right-32 -top-32 h-[700px] w-[700px] rounded-full opacity-40 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #4E11CC 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Radiant Magenta blob - center left */}
      <motion.div
        className="absolute -left-40 top-1/3 h-[600px] w-[600px] rounded-full opacity-35 blur-[100px]"
        style={{
          background: "radial-gradient(circle, #E943DE 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Neon Pink blob - bottom */}
      <motion.div
        className="absolute -bottom-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-30 blur-[80px]"
        style={{
          background: "radial-gradient(circle, #FF78E2 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Sunrise Gold accent - small floating */}
      <motion.div
        className="absolute right-1/4 top-1/2 h-[300px] w-[300px] rounded-full opacity-25 blur-[60px]"
        style={{
          background: "radial-gradient(circle, #FFB527 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 60, 0],
          y: [0, -60, 0],
        }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 6,
        }}
      />

      {/* Grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(rgba(10,10,10,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(10,10,10,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
