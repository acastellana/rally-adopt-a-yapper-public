"use client"

import { Image, Lock, Sparkles } from "lucide-react"

const SAMPLE_CARDS = [
  {
    name: "Quack Heads",
    collection: "Wallchain",
    assetType: "nft" as const,
    description: "Owning a Wallchain NFT",
    points: 2500,
  },
  {
    name: "Yapybaras",
    collection: "Kaito",
    assetType: "nft" as const,
    description: "Owning a Yapybara NFT",
    points: 1800,
  },
  {
    name: "sKAITO",
    collection: "Kaito",
    assetType: "staked" as const,
    description: "Staking sKAITO tokens",
    points: 1500,
  },
  {
    name: "Cookie",
    collection: "Cookie",
    assetType: "staked" as const,
    description: "Staking Cookie tokens",
    points: 1200,
  },
]

const assetTypeConfig = {
  nft: {
    label: "NFT",
    icon: Image,
    pillClass: "bg-primary/20 text-primary border-primary/30",
    subtleText: "Genesis NFT",
  },
  staked: {
    label: "Staked",
    icon: Lock,
    pillClass: "bg-accent/20 text-accent border-accent/30",
    subtleText: "Staked Token",
  },
  token: {
    label: "Token",
    icon: Sparkles,
    pillClass: "bg-secondary/20 text-secondary border-secondary/30",
    subtleText: "Token Holder",
  },
}

export default function TestBadgesPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Asset Type Badge Styles</h1>
        <p className="mb-12 text-muted-foreground">Compare different badge style options for distinguishing NFTs vs Staked tokens</p>

        {/* Option A: Pill Badge */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Option A: Pill Badge</h2>
          <p className="mb-6 text-sm text-muted-foreground">Small rounded pill in the top corner with icon</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_CARDS.map((card) => {
              const config = assetTypeConfig[card.assetType]
              return (
                <div
                  key={card.name}
                  className="rounded-2xl border border-border/50 bg-card/80 p-6"
                >
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.pillClass}`}>
                      <config.icon className="h-3 w-3" />
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{card.collection}</p>
                  <h3 className="mt-2 text-xl font-bold text-foreground">{card.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
                  <p className="mt-4 font-mono text-2xl font-bold text-gradient-rally">{card.points.toLocaleString()} RLP</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Option B: Icon + Text inline */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Option B: Icon + Text (Inline with Collection)</h2>
          <p className="mb-6 text-sm text-muted-foreground">Icon with label shown inline before the collection name</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_CARDS.map((card) => {
              const config = assetTypeConfig[card.assetType]
              return (
                <div
                  key={card.name}
                  className="rounded-2xl border border-border/50 bg-card/80 p-6"
                >
                  <div className="flex items-center gap-2">
                    <config.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{card.collection}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-foreground">{card.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
                  <p className="mt-4 font-mono text-2xl font-bold text-gradient-rally">{card.points.toLocaleString()} RLP</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Option C: Subtle Tag */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Option C: Subtle Tag</h2>
          <p className="mb-6 text-sm text-muted-foreground">Subtle text below the title describing the asset type</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_CARDS.map((card) => {
              const config = assetTypeConfig[card.assetType]
              return (
                <div
                  key={card.name}
                  className="rounded-2xl border border-border/50 bg-card/80 p-6"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{card.collection}</p>
                  <h3 className="mt-2 text-xl font-bold text-foreground">{card.name}</h3>
                  <p className="mt-1 text-xs font-medium text-muted-foreground/70">{config.subtleText}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
                  <p className="mt-4 font-mono text-2xl font-bold text-gradient-rally">{card.points.toLocaleString()} RLP</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Tweet Text Examples */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Tweet Text Examples</h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-card/50 p-4">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">NFTs only:</p>
              <p className="text-foreground">i just got 4,300 RLP for holding Quack Heads & Yapybaras NFTs @wallchain_xyz @KaitoAI</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 p-4">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Staked only:</p>
              <p className="text-foreground">i just got 2,700 RLP for staking sKAITO & Cookie @KaitoAI @cookiedotfun</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 p-4">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Mixed:</p>
              <p className="text-foreground">i just got 7,000 RLP for holding Quack Heads & Yapybaras NFTs + staking sKAITO & Cookie @wallchain_xyz @KaitoAI @cookiedotfun</p>
            </div>
          </div>
        </section>

        {/* Current Implementation */}
        <section>
          <h2 className="mb-6 text-xl font-semibold text-foreground">Current Implementation: Option A (Pill Badge)</h2>
          <p className="text-muted-foreground">The pill badge style has been implemented in the claim cards. Visit the main page to see it in action.</p>
        </section>
      </div>
    </div>
  )
}
