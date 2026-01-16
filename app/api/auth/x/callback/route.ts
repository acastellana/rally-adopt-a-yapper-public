import { type NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/oauth"
import { getOAuthToken, deleteOAuthToken, setXLink } from "@/lib/kv"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const oauthToken = searchParams.get("oauth_token")
    const oauthVerifier = searchParams.get("oauth_verifier")
    const denied = searchParams.get("denied")

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""

    // User denied access
    if (denied) {
      return NextResponse.redirect(`${appUrl}?x_auth=denied`)
    }

    if (!oauthToken || !oauthVerifier) {
      return NextResponse.redirect(`${appUrl}?x_auth=error&message=missing_params`)
    }

    const consumerKey = process.env.X_CONSUMER_KEY
    const consumerSecret = process.env.X_CONSUMER_SECRET

    if (!consumerKey || !consumerSecret) {
      return NextResponse.redirect(`${appUrl}?x_auth=error&message=not_configured`)
    }

    // Retrieve stored token data
    const storedToken = await getOAuthToken(oauthToken)

    if (!storedToken) {
      return NextResponse.redirect(`${appUrl}?x_auth=error&message=token_expired`)
    }

    // Exchange for access token
    const accessTokenResult = await getAccessToken(
      consumerKey,
      consumerSecret,
      oauthToken,
      storedToken.oauthTokenSecret,
      oauthVerifier
    )

    // Store the X link
    await setXLink({
      xUserId: accessTokenResult.userId,
      xUsername: accessTokenResult.screenName,
      walletAddress: storedToken.walletAddress,
      linkedAt: Date.now(),
    })

    // Clean up the request token
    await deleteOAuthToken(oauthToken)

    // Redirect back to the app with success
    return NextResponse.redirect(
      `${appUrl}?x_auth=success&username=${encodeURIComponent(accessTokenResult.screenName)}`
    )
  } catch (error) {
    console.error("Error in X OAuth callback:", error)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
    return NextResponse.redirect(`${appUrl}?x_auth=error&message=callback_failed`)
  }
}
