import { type NextRequest, NextResponse } from "next/server"
import { isMockXAuthEnabled, setMockXLink } from "@/lib/mock-store"
import { getAccessToken } from "@/lib/oauth"
import { getOAuthToken, deleteOAuthToken, setXLink } from "@/lib/kv"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const oauthToken = searchParams.get("oauth_token")
    const oauthVerifier = searchParams.get("oauth_verifier")
    const denied = searchParams.get("denied")
    const walletAddress = searchParams.get("wallet")

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""

    // User denied access
    if (denied) {
      return NextResponse.redirect(`${appUrl}?x_auth=denied`)
    }

    if (!oauthToken || !oauthVerifier) {
      return NextResponse.redirect(`${appUrl}?x_auth=error&message=missing_params`)
    }

    // MOCK MODE: Handle mock tokens
    if (isMockXAuthEnabled() && oauthToken.startsWith("mock_")) {
      const mockUsername = "mock_user"
      const mockUserId = "123456789"

      // Store mock X link
      if (walletAddress) {
        setMockXLink({
          xUserId: mockUserId,
          xUsername: mockUsername,
          walletAddress: walletAddress.toLowerCase(),
          linkedAt: Date.now(),
        })
      }

      return NextResponse.redirect(
        `${appUrl}?x_auth=success&username=${encodeURIComponent(mockUsername)}`
      )
    }

    // Real OAuth flow
    const consumerKey = process.env.X_CONSUMER_KEY
    const consumerSecret = process.env.X_CONSUMER_SECRET

    if (!consumerKey || !consumerSecret) {
      return NextResponse.redirect(`${appUrl}?x_auth=error&message=not_configured`)
    }

    const storedToken = await getOAuthToken(oauthToken)
    if (!storedToken) {
      return NextResponse.redirect(`${appUrl}?x_auth=error&message=token_expired`)
    }

    const accessTokenResult = await getAccessToken(
      consumerKey,
      consumerSecret,
      oauthToken,
      storedToken.oauthTokenSecret,
      oauthVerifier
    )

    await setXLink({
      xUserId: accessTokenResult.userId,
      xUsername: accessTokenResult.screenName,
      walletAddress: storedToken.walletAddress,
      linkedAt: Date.now(),
    })

    await deleteOAuthToken(oauthToken)

    return NextResponse.redirect(
      `${appUrl}?x_auth=success&username=${encodeURIComponent(accessTokenResult.screenName)}`
    )
  } catch (error) {
    console.error("Error in X OAuth callback:", error)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
    return NextResponse.redirect(`${appUrl}?x_auth=error&message=callback_failed`)
  }
}
