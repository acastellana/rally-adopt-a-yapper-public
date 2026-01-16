import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { POST } from "../../app/api/check-eligibility/route"

describe("check-eligibility API", () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("should return 503 when both API keys are missing", async () => {
    // Unset API keys
    delete process.env.HELIUS_API_KEY
    delete process.env.ALCHEMY_API_KEY

    const request = new NextRequest("http://localhost:3000/api/check-eligibility", {
      method: "POST",
      body: JSON.stringify({
        walletAddress: "7nYAh9pYrUJ7a7gJrY2sYZaJx9K3vHqNsrPRgE3yQJKn",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.error).toContain("temporarily unavailable")
  })

  it("should return 400 when no wallet address provided", async () => {
    const request = new NextRequest("http://localhost:3000/api/check-eligibility", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain("required")
  })

  it("should accept valid Solana address format", async () => {
    // Set a mock API key
    process.env.HELIUS_API_KEY = "test_key"

    // Mock fetch to avoid actual API calls
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ result: { items: [] } }),
    })
    vi.stubGlobal("fetch", mockFetch)

    const request = new NextRequest("http://localhost:3000/api/check-eligibility", {
      method: "POST",
      body: JSON.stringify({
        walletAddress: "7nYAh9pYrUJ7a7gJrY2sYZaJx9K3vHqNsrPRgE3yQJKn",
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)

    vi.unstubAllGlobals()
  })

  it("should not return mock data - only real API results or errors", async () => {
    // When API keys are missing, we should get 503, not fake eligibility data
    delete process.env.HELIUS_API_KEY
    delete process.env.ALCHEMY_API_KEY

    const request = new NextRequest("http://localhost:3000/api/check-eligibility", {
      method: "POST",
      body: JSON.stringify({
        walletAddress: "7nYAh9pYrUJ7a7gJrY2sYZaJx9K3vHqNsrPRgE3yQJKn",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    // Should NOT return eligibility data when API is unavailable
    expect(response.status).not.toBe(200)
    expect(data.eligibility).toBeUndefined()
  })
})
