import crypto from "crypto"

interface OAuthParams {
  oauth_consumer_key: string
  oauth_token?: string
  oauth_signature_method: string
  oauth_timestamp: string
  oauth_nonce: string
  oauth_version: string
  oauth_callback?: string
  oauth_verifier?: string
  [key: string]: string | undefined
}

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()
  )
}

function generateNonce(): string {
  return crypto.randomBytes(16).toString("hex")
}

function generateTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString()
}

export function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string = ""
): string {
  // Sort and encode parameters
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join("&")

  // Create signature base string
  const signatureBaseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParams),
  ].join("&")

  // Create signing key
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`

  // Generate HMAC-SHA1 signature
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBaseString)
    .digest("base64")

  return signature
}

export function buildAuthorizationHeader(
  oauthParams: Record<string, string>
): string {
  const headerParams = Object.keys(oauthParams)
    .filter((key) => key.startsWith("oauth_"))
    .sort()
    .map((key) => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(", ")

  return `OAuth ${headerParams}`
}

export interface RequestTokenResult {
  oauthToken: string
  oauthTokenSecret: string
  authorizationUrl: string
}

export async function getRequestToken(
  consumerKey: string,
  consumerSecret: string,
  callbackUrl: string
): Promise<RequestTokenResult> {
  const url = "https://api.twitter.com/oauth/request_token"

  const oauthParams: OAuthParams = {
    oauth_consumer_key: consumerKey,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: generateTimestamp(),
    oauth_nonce: generateNonce(),
    oauth_version: "1.0",
    oauth_callback: callbackUrl,
  }

  const signature = generateOAuthSignature(
    "POST",
    url,
    oauthParams as Record<string, string>,
    consumerSecret
  )

  const allParams = {
    ...oauthParams,
    oauth_signature: signature,
  }

  const authHeader = buildAuthorizationHeader(allParams as Record<string, string>)

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to get request token: ${response.status} ${text}`)
  }

  const body = await response.text()
  const params = new URLSearchParams(body)

  const oauthToken = params.get("oauth_token")
  const oauthTokenSecret = params.get("oauth_token_secret")

  if (!oauthToken || !oauthTokenSecret) {
    throw new Error("Invalid response from Twitter")
  }

  return {
    oauthToken,
    oauthTokenSecret,
    authorizationUrl: `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`,
  }
}

export interface AccessTokenResult {
  oauthToken: string
  oauthTokenSecret: string
  userId: string
  screenName: string
}

export async function getAccessToken(
  consumerKey: string,
  consumerSecret: string,
  oauthToken: string,
  oauthTokenSecret: string,
  oauthVerifier: string
): Promise<AccessTokenResult> {
  const url = "https://api.twitter.com/oauth/access_token"

  const oauthParams: OAuthParams = {
    oauth_consumer_key: consumerKey,
    oauth_token: oauthToken,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: generateTimestamp(),
    oauth_nonce: generateNonce(),
    oauth_version: "1.0",
    oauth_verifier: oauthVerifier,
  }

  const signature = generateOAuthSignature(
    "POST",
    url,
    oauthParams as Record<string, string>,
    consumerSecret,
    oauthTokenSecret
  )

  const allParams = {
    ...oauthParams,
    oauth_signature: signature,
  }

  const authHeader = buildAuthorizationHeader(allParams as Record<string, string>)

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to get access token: ${response.status} ${text}`)
  }

  const body = await response.text()
  const params = new URLSearchParams(body)

  const accessToken = params.get("oauth_token")
  const accessTokenSecret = params.get("oauth_token_secret")
  const userId = params.get("user_id")
  const screenName = params.get("screen_name")

  if (!accessToken || !accessTokenSecret || !userId || !screenName) {
    throw new Error("Invalid response from Twitter")
  }

  return {
    oauthToken: accessToken,
    oauthTokenSecret: accessTokenSecret,
    userId,
    screenName,
  }
}

export async function verifyCredentials(
  consumerKey: string,
  consumerSecret: string,
  oauthToken: string,
  oauthTokenSecret: string
): Promise<{ id_str: string; screen_name: string }> {
  const url = "https://api.twitter.com/1.1/account/verify_credentials.json"

  const oauthParams: OAuthParams = {
    oauth_consumer_key: consumerKey,
    oauth_token: oauthToken,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: generateTimestamp(),
    oauth_nonce: generateNonce(),
    oauth_version: "1.0",
  }

  const signature = generateOAuthSignature(
    "GET",
    url,
    oauthParams as Record<string, string>,
    consumerSecret,
    oauthTokenSecret
  )

  const allParams = {
    ...oauthParams,
    oauth_signature: signature,
  }

  const authHeader = buildAuthorizationHeader(allParams as Record<string, string>)

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: authHeader,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to verify credentials: ${response.status} ${text}`)
  }

  return response.json()
}
