import { type NextRequest, NextResponse } from "next/server"
import { isMockXAuthEnabled } from "@/lib/mock-store"
import { getRequestToken } from "@/lib/oauth"
import { setOAuthToken } from "@/lib/kv"

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // MOCK MODE: Return mock authorization URL
    if (isMockXAuthEnabled()) {
      const mockToken = `mock_${Date.now()}`
      const mockAuthUrl = `${appUrl}/api/auth/x/callback?oauth_token=${mockToken}&oauth_verifier=mock_verifier&wallet=${walletAddress}`

      return NextResponse.json({
        authorizationUrl: mockAuthUrl,
      })
    }

    // Real OAuth flow
    const consumerKey = process.env.X_CONSUMER_KEY
    const consumerSecret = process.env.X_CONSUMER_SECRET

    if (!consumerKey || !consumerSecret) {
      console.error("Missing X OAuth credentials")
      return NextResponse.json(
        { error: "X authentication not configured" },
        { status: 503 }
      )
    }

    const callbackUrl = `${appUrl}/api/auth/x/callback`
    const result = await getRequestToken(consumerKey, consumerSecret, callbackUrl)

    await setOAuthToken({
      oauthToken: result.oauthToken,
      oauthTokenSecret: result.oauthTokenSecret,
      walletAddress,
      expiresAt: Date.now() + 600000,
    })

    return NextResponse.json({
      authorizationUrl: result.authorizationUrl,
    })
  } catch (error) {
    console.error("Error in X authentication:", error)
    return NextResponse.json(
      { error: "Failed to initiate X authentication" },
      { status: 500 }
    )
  }
}
