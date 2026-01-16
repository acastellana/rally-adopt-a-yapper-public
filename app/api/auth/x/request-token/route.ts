import { type NextRequest, NextResponse } from "next/server"
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

    const consumerKey = process.env.X_CONSUMER_KEY
    const consumerSecret = process.env.X_CONSUMER_SECRET
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!consumerKey || !consumerSecret) {
      console.error("Missing X OAuth credentials")
      return NextResponse.json(
        { error: "X authentication not configured" },
        { status: 503 }
      )
    }

    if (!appUrl) {
      console.error("Missing NEXT_PUBLIC_APP_URL")
      return NextResponse.json(
        { error: "App URL not configured" },
        { status: 503 }
      )
    }

    const callbackUrl = `${appUrl}/api/auth/x/callback`

    const result = await getRequestToken(consumerKey, consumerSecret, callbackUrl)

    // Store the token secret and wallet address for the callback
    await setOAuthToken({
      oauthToken: result.oauthToken,
      oauthTokenSecret: result.oauthTokenSecret,
      walletAddress,
      expiresAt: Date.now() + 600000, // 10 minutes
    })

    return NextResponse.json({
      authorizationUrl: result.authorizationUrl,
    })
  } catch (error) {
    console.error("Error getting request token:", error)
    return NextResponse.json(
      { error: "Failed to initiate X authentication" },
      { status: 500 }
    )
  }
}
