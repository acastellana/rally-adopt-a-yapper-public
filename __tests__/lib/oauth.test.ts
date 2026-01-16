import { describe, it, expect } from "vitest"
import { generateOAuthSignature, buildAuthorizationHeader } from "../../lib/oauth"

describe("OAuth 1.0a utilities", () => {
  describe("generateOAuthSignature", () => {
    it("should generate a valid HMAC-SHA1 signature", () => {
      const params = {
        oauth_consumer_key: "test_consumer_key",
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: "1234567890",
        oauth_nonce: "test_nonce",
        oauth_version: "1.0",
      }

      const signature = generateOAuthSignature(
        "POST",
        "https://api.twitter.com/oauth/request_token",
        params,
        "test_consumer_secret"
      )

      // Signature should be a base64 string
      expect(signature).toBeTruthy()
      expect(typeof signature).toBe("string")
      // Base64 strings only contain these characters
      expect(signature).toMatch(/^[A-Za-z0-9+/=]+$/)
    })

    it("should generate different signatures for different secrets", () => {
      const params = {
        oauth_consumer_key: "test_consumer_key",
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: "1234567890",
        oauth_nonce: "test_nonce",
        oauth_version: "1.0",
      }

      const signature1 = generateOAuthSignature(
        "POST",
        "https://api.twitter.com/oauth/request_token",
        params,
        "secret1"
      )

      const signature2 = generateOAuthSignature(
        "POST",
        "https://api.twitter.com/oauth/request_token",
        params,
        "secret2"
      )

      expect(signature1).not.toBe(signature2)
    })

    it("should include token secret in signature when provided", () => {
      const params = {
        oauth_consumer_key: "test_consumer_key",
        oauth_token: "test_token",
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: "1234567890",
        oauth_nonce: "test_nonce",
        oauth_version: "1.0",
      }

      const signatureWithoutTokenSecret = generateOAuthSignature(
        "POST",
        "https://api.twitter.com/oauth/access_token",
        params,
        "consumer_secret"
      )

      const signatureWithTokenSecret = generateOAuthSignature(
        "POST",
        "https://api.twitter.com/oauth/access_token",
        params,
        "consumer_secret",
        "token_secret"
      )

      expect(signatureWithoutTokenSecret).not.toBe(signatureWithTokenSecret)
    })
  })

  describe("buildAuthorizationHeader", () => {
    it("should build a valid OAuth Authorization header", () => {
      const params = {
        oauth_consumer_key: "test_key",
        oauth_nonce: "test_nonce",
        oauth_signature: "test_signature",
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: "1234567890",
        oauth_version: "1.0",
      }

      const header = buildAuthorizationHeader(params)

      expect(header.startsWith("OAuth ")).toBe(true)
      expect(header).toContain("oauth_consumer_key")
      expect(header).toContain("oauth_signature")
      expect(header).toContain("oauth_nonce")
    })

    it("should only include oauth_ prefixed parameters", () => {
      const params = {
        oauth_consumer_key: "test_key",
        oauth_nonce: "test_nonce",
        non_oauth_param: "should_not_appear",
      }

      const header = buildAuthorizationHeader(params)

      expect(header).toContain("oauth_consumer_key")
      expect(header).toContain("oauth_nonce")
      expect(header).not.toContain("non_oauth_param")
    })

    it("should percent-encode special characters", () => {
      const params = {
        oauth_consumer_key: "key with spaces",
        oauth_nonce: "nonce",
      }

      const header = buildAuthorizationHeader(params)

      // Spaces should be encoded as %20
      expect(header).toContain("key%20with%20spaces")
    })
  })
})
