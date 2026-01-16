import { PublicKey } from "@solana/web3.js"
import nacl from "tweetnacl"

export function verifySolanaSignature(
  message: string,
  signature: string,
  publicKeyBase58: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message)
    const signatureBytes = new Uint8Array(Buffer.from(signature, "base64"))
    const publicKey = new PublicKey(publicKeyBase58)
    const publicKeyBytes = publicKey.toBytes()

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
  } catch (error) {
    console.error("Signature verification error:", error)
    return false
  }
}

export function buildClaimMessage(
  walletAddress: string,
  nftType: string,
  nonce: string
): string {
  return `Rally Protocol Claim\nWallet: ${walletAddress}\nNFT: ${nftType}\nNonce: ${nonce}`
}
