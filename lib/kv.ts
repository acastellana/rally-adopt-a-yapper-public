import { kv } from "@vercel/kv"
import type { XLink, Claim, ClaimNonce, OAuthRequestToken } from "./types"

const NONCE_TTL = 300 // 5 minutes
const OAUTH_TTL = 600 // 10 minutes

// X Link operations
export async function getXLink(walletAddress: string): Promise<XLink | null> {
  return kv.get<XLink>(`xlink:${walletAddress}`)
}

export async function setXLink(link: XLink): Promise<void> {
  await kv.set(`xlink:${link.walletAddress}`, link)
}

// Claim operations
export async function getClaim(
  walletAddress: string,
  nftType: string
): Promise<Claim | null> {
  return kv.get<Claim>(`claim:${walletAddress}:${nftType}`)
}

export async function setClaim(claim: Claim): Promise<void> {
  await kv.set(`claim:${claim.walletAddress}:${claim.nftType}`, claim)
}

export async function getAllClaims(walletAddress: string): Promise<{
  wallchain: Claim | null
  kaito: Claim | null
  skaito: Claim | null
  cookie: Claim | null
}> {
  const [wallchain, kaito, skaito, cookie] = await Promise.all([
    getClaim(walletAddress, "wallchain"),
    getClaim(walletAddress, "kaito"),
    getClaim(walletAddress, "skaito"),
    getClaim(walletAddress, "cookie"),
  ])
  return { wallchain, kaito, skaito, cookie }
}

// Nonce operations
export async function getNonce(nonce: string): Promise<ClaimNonce | null> {
  return kv.get<ClaimNonce>(`nonce:${nonce}`)
}

export async function setNonce(nonce: string, data: ClaimNonce): Promise<void> {
  await kv.set(`nonce:${nonce}`, data, { ex: NONCE_TTL })
}

export async function deleteNonce(nonce: string): Promise<void> {
  await kv.del(`nonce:${nonce}`)
}

// OAuth request token operations
export async function getOAuthToken(
  oauthToken: string
): Promise<OAuthRequestToken | null> {
  return kv.get<OAuthRequestToken>(`oauth:${oauthToken}`)
}

export async function setOAuthToken(data: OAuthRequestToken): Promise<void> {
  await kv.set(`oauth:${data.oauthToken}`, data, { ex: OAUTH_TTL })
}

export async function deleteOAuthToken(oauthToken: string): Promise<void> {
  await kv.del(`oauth:${oauthToken}`)
}
