/**
 * Mock store for development/testing when OAuth and KV are not configured
 * Replace with real storage (Vercel KV) in production
 *
 * Enable via environment variables:
 * - MOCK_X_AUTH=true - Mock X OAuth
 * - MOCK_WALLET_SIGNATURE=true - Mock wallet signature verification
 * - MOCK_KV_STORE=true - Mock Vercel KV store
 */

import type { XLink, Claim, ClaimNonce, OAuthRequestToken } from "./types"

// Check if mocking is enabled
export const isMockEnabled = () => process.env.MOCK_KV_STORE === "true"
export const isMockXAuthEnabled = () => process.env.MOCK_X_AUTH === "true"
export const isMockSignatureEnabled = () => process.env.MOCK_WALLET_SIGNATURE === "true"

// In-memory stores
const mockXLinks = new Map<string, XLink>()
const mockClaims = new Map<string, Claim>()
const mockNonces = new Map<string, ClaimNonce>()
const mockOAuthTokens = new Map<string, OAuthRequestToken>()

// ============ X Link Operations ============

export function getMockXLink(walletAddress: string): XLink | null {
  return mockXLinks.get(walletAddress.toLowerCase()) || null
}

export function setMockXLink(link: XLink): void {
  mockXLinks.set(link.walletAddress.toLowerCase(), link)
}

export function deleteMockXLink(walletAddress: string): void {
  mockXLinks.delete(walletAddress.toLowerCase())
}

// ============ Claim Operations ============

export function getMockClaim(walletAddress: string, nftType: string): Claim | null {
  return mockClaims.get(`${walletAddress.toLowerCase()}:${nftType}`) || null
}

export function setMockClaim(claim: Claim): void {
  mockClaims.set(`${claim.walletAddress.toLowerCase()}:${claim.nftType}`, claim)
}

export function getAllMockClaims(walletAddress: string): { wallchain: Claim | null; kaito: Claim | null } {
  return {
    wallchain: getMockClaim(walletAddress, "wallchain"),
    kaito: getMockClaim(walletAddress, "kaito"),
  }
}

// ============ Nonce Operations ============

export function getMockNonce(nonce: string): ClaimNonce | null {
  const stored = mockNonces.get(nonce)
  if (!stored) return null

  // Check expiration
  if (stored.expiresAt < Date.now()) {
    mockNonces.delete(nonce)
    return null
  }

  return stored
}

export function setMockNonce(nonce: string, data: ClaimNonce): void {
  mockNonces.set(nonce, data)
}

export function deleteMockNonce(nonce: string): void {
  mockNonces.delete(nonce)
}

// ============ OAuth Token Operations ============

export function getMockOAuthToken(oauthToken: string): OAuthRequestToken | null {
  const stored = mockOAuthTokens.get(oauthToken)
  if (!stored) return null

  // Check expiration
  if (stored.expiresAt < Date.now()) {
    mockOAuthTokens.delete(oauthToken)
    return null
  }

  return stored
}

export function setMockOAuthToken(data: OAuthRequestToken): void {
  mockOAuthTokens.set(data.oauthToken, data)
}

export function deleteMockOAuthToken(oauthToken: string): void {
  mockOAuthTokens.delete(oauthToken)
}
