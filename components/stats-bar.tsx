"use client"

import { motion } from "framer-motion"
import { TrendingUp, Award, CheckCircle } from "lucide-react"

interface StatsBarProps {
  totalPoints: number
  nftsOwned: number
  pointsClaimed: number
}

export function StatsBar({ totalPoints, nftsOwned, pointsClaimed }: StatsBarProps) {
  const stats = [
    {
      label: "Available",
      value: totalPoints - pointsClaimed,
      suffix: "RLP",
      icon: TrendingUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      label: "Achievements",
      value: nftsOwned,
      suffix: "",
      icon: Award,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Claimed",
      value: pointsClaimed,
      suffix: "RLP",
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-2 backdrop-blur-xl"
    >
      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-50"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(233, 67, 222, 0.1), transparent)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-4 rounded-2xl bg-background/50 px-6 py-5"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <motion.span
                  className="font-mono text-2xl font-bold text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  {stat.value.toLocaleString()}
                </motion.span>
                {stat.suffix && <span className="text-sm font-medium text-muted-foreground">{stat.suffix}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
