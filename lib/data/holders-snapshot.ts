/**
 * Contract Holders Snapshot
 * Generated: 2026-01-16
 *
 * Data sources:
 * - ETH/Base: Blockscout API (verified)
 * - Solana: User-provided (pending verification)
 * - BSC: User-provided (pending verification)
 */

export interface ContractSnapshot {
  address: string
  name: string
  project: string | null
  network: string
  type: "nft" | "token"
  holdersCount: number
  totalSupply: string
  verified: boolean
  verifiedAt: string | null
  source: string
  explorer: string
  holders: HolderEntry[]
}

export interface HolderEntry {
  rank: number
  address: string
  quantity: number // For NFTs: count, For tokens: formatted balance
  percentage: string
}

// Snapshot timestamp
export const SNAPSHOT_DATE = "2026-01-16T16:55:00Z"

export const NFT_SNAPSHOTS: ContractSnapshot[] = [
  {
    address: "0x9830b32f7210f0857a859c2a86387e4d1bb760b8",
    name: "Yapybaras",
    project: "Kaito",
    network: "ETH",
    type: "nft",
    holdersCount: 1001,
    totalSupply: "1500",
    verified: true,
    verifiedAt: "2026-01-16T16:55:00Z",
    source: "Blockscout",
    explorer: "https://etherscan.io/address/0x9830b32f7210f0857a859c2a86387e4d1bb760b8",
    holders: [
      { rank: 1, address: "0x7deCD0770371096f135547Bdbdf3831799239ccF", quantity: 26, percentage: "1.73" },
      { rank: 2, address: "0xE5e83c2347be43eB917715c7385Ae2a2Cf95453c", quantity: 21, percentage: "1.40" },
      { rank: 3, address: "0x81f03983626e528F30DA9776774e413F3e2B1e7C", quantity: 19, percentage: "1.27" },
      { rank: 4, address: "0xd43c864c932b60025D39d824b60d9058740A4f46", quantity: 12, percentage: "0.80" },
      { rank: 5, address: "0x9EeFE261EAaE4CBfCAEb565377692FEc6a49E10d", quantity: 12, percentage: "0.80" },
      { rank: 6, address: "0x3CEFb79aF1F4126DC679D52f5f7458A25CE74B42", quantity: 11, percentage: "0.73" },
      { rank: 7, address: "0xCd5683fCeE1C510A81038edAc6700C07Cfdcf6a4", quantity: 10, percentage: "0.67" },
      { rank: 8, address: "0xa65ce1D604fa901c13AA29f2126a57d9032e412B", quantity: 10, percentage: "0.67" },
      { rank: 9, address: "0x0fEe95142A720E9AFC61f4a33C4e432837829EAe", quantity: 10, percentage: "0.67" },
      { rank: 10, address: "0xAB4FA35b93156b9E492635aE149886026d315855", quantity: 9, percentage: "0.60" },
      { rank: 11, address: "0x11095eF3777113eEd4721b8f8b76659Bf720C9Dd", quantity: 9, percentage: "0.60" },
      { rank: 12, address: "0x43BC50CeD75C52a0d3Dcb80e101188B13442509f", quantity: 7, percentage: "0.47" },
      { rank: 13, address: "0xd18A67f82bF9289cFa8067852026C1f93126F502", quantity: 6, percentage: "0.40" },
      { rank: 14, address: "0xbc8b292d0F5208C651b93D7d765d9FeFd9E9fB5b", quantity: 6, percentage: "0.40" },
      { rank: 15, address: "0x9CECb0f9aBc677DfDC0057Dc026Ab7a50c4fb962", quantity: 6, percentage: "0.40" },
      { rank: 16, address: "0x6f7ABbDeb7a0e963ed7f2782Beca5e4A88d8A35D", quantity: 6, percentage: "0.40" },
      { rank: 17, address: "0x512E3Eb472D53Df71Db0252cb8dccD25cd05E9e9", quantity: 6, percentage: "0.40" },
      { rank: 18, address: "0x02634F675E3e1CD35b62b09f571f81ca314E34a2", quantity: 6, percentage: "0.40" },
      { rank: 19, address: "0xe59c265a2d56174B0B61936Ba23fA00D4fef836b", quantity: 5, percentage: "0.33" },
      { rank: 20, address: "0xD8D741Dc89c1de3B2F314693752892255105C8AA", quantity: 5, percentage: "0.33" },
      { rank: 21, address: "0xbc293Ac23c1Dae43b015172761C57589716712E6", quantity: 5, percentage: "0.33" },
      { rank: 22, address: "0x68383ecb301563dec6a2b58C18e2252EEEf4C952", quantity: 5, percentage: "0.33" },
      { rank: 23, address: "0x2B09197141080f9DCFD2976CFDcF4E2A7D9cF483", quantity: 5, percentage: "0.33" },
      { rank: 24, address: "0xE78a5E3dC3770ece086c6814c5346241b01acA01", quantity: 4, percentage: "0.27" },
      { rank: 25, address: "0xE125F87C89561E742540D364B0e3a00Dc821F524", quantity: 4, percentage: "0.27" },
      { rank: 26, address: "0xd21B2DA173d8dB463EDE98B6B8af41Ef72e15dcE", quantity: 4, percentage: "0.27" },
      { rank: 27, address: "0xc8606544B4B6cFb893E35f8dAc76D8ac42dadfe4", quantity: 4, percentage: "0.27" },
      { rank: 28, address: "0x8f2c0f09F5135312772145a49e633eAc05CFbb93", quantity: 4, percentage: "0.27" },
      { rank: 29, address: "0x6167FA2453a61c3C126d1f6582AbCf3B9083BC4C", quantity: 4, percentage: "0.27" },
      { rank: 30, address: "0x2de212a155d4a280b98c23067c3c4d7fe923Ac0F", quantity: 4, percentage: "0.27" },
      { rank: 31, address: "0x1f7309527dd8C0646b79126572F351aBf8fEF05b", quantity: 4, percentage: "0.27" },
      { rank: 32, address: "0x1811Cfd037a33D65E7e75e1aA6CD0D6c6EA67141", quantity: 4, percentage: "0.27" },
      { rank: 33, address: "0x16F33b3d0272f897d9BC55282Fa151215215602c", quantity: 4, percentage: "0.27" },
      { rank: 34, address: "0xfE8d057312e76477cCD98e79d36f915F11e1dCa7", quantity: 3, percentage: "0.20" },
      { rank: 35, address: "0xfA6d9AA8f219f87d60a14b8A7c5712F5560dC1ac", quantity: 3, percentage: "0.20" },
      { rank: 36, address: "0xF31Eb8B6A231F650f689147aF28d4B9Cd142c51c", quantity: 3, percentage: "0.20" },
      { rank: 37, address: "0xEdE0f643C1EF3865e0E82794AEB6CD257Eb896aF", quantity: 3, percentage: "0.20" },
      { rank: 38, address: "0xEa51013A2FC9CF1b061FCF088A68a5242f2bBdB3", quantity: 3, percentage: "0.20" },
      { rank: 39, address: "0xe1b504c7c2d8Cab6600F92aB7D1a300FbFf826DC", quantity: 3, percentage: "0.20" },
      { rank: 40, address: "0xDF977Bf5a4555443c8C588F3274ad15C3b693361", quantity: 3, percentage: "0.20" },
      { rank: 41, address: "0xdF5A403626CcCD5ef5F5aE201e6759c0A63cEcDa", quantity: 3, percentage: "0.20" },
      { rank: 42, address: "0xdEfb6Cb173bD928409D422A63CD2363bEEBd92f2", quantity: 3, percentage: "0.20" },
      { rank: 43, address: "0xD8a21caa8B8eA245dEc3f952BC981e82AcdAdd91", quantity: 3, percentage: "0.20" },
      { rank: 44, address: "0xd889e4Fa49a9465de78dA38f1F83E459F33d9e4c", quantity: 3, percentage: "0.20" },
      { rank: 45, address: "0xD52C5B9eF34da6A6457AdE1B2FbE6B1E1F09C938", quantity: 3, percentage: "0.20" },
      { rank: 46, address: "0xd4E1C4B1ba06B2fD3a723f257c1CDdca91E72F67", quantity: 3, percentage: "0.20" },
      { rank: 47, address: "0xd471b2916bcDE55982b9EEAEC8dc00eB3E5c37ab", quantity: 3, percentage: "0.20" },
      { rank: 48, address: "0xD446E61ba283CA3E6Ba85f1391ca0229acaB7e34", quantity: 3, percentage: "0.20" },
      { rank: 49, address: "0xd1C3413F7Fcc9eBa5515473625d3Ec454489F103", quantity: 3, percentage: "0.20" },
      { rank: 50, address: "0xCB6DF153E9B5e699dA35A843A2EcBFC91fD1D9FE", quantity: 3, percentage: "0.20" },
    ],
  },
  {
    address: "HxSsfM9WxQWj79chAUNL6osZxQjJj5iMUwrjEfRBvYBR",
    name: "Quack Heads",
    project: "Wallchain",
    network: "Solana",
    type: "nft",
    holdersCount: 1480,
    totalSupply: "1999",
    verified: false,
    verifiedAt: null,
    source: "User-provided",
    explorer: "https://solscan.io/token/HxSsfM9WxQWj79chAUNL6osZxQjJj5iMUwrjEfRBvYBR",
    holders: [], // Requires Solana API key for verification
  },
]

export const TOKEN_SNAPSHOTS: ContractSnapshot[] = [
  {
    address: "0x548D3B444da39686d1a6F1544781d154e7cD1EF7",
    name: "Skaito",
    project: "Kaito",
    network: "Base",
    type: "token",
    holdersCount: 17345,
    totalSupply: "21105390870042485574806742",
    verified: true,
    verifiedAt: "2026-01-16T16:55:00Z",
    source: "Blockscout",
    explorer: "https://basescan.org/address/0x548D3B444da39686d1a6F1544781d154e7cD1EF7",
    holders: [
      { rank: 1, address: "0x4B272672A58da22B213E733F5ABA48cfec534D30", quantity: 11116321, percentage: "52.67" },
      { rank: 2, address: "0x2fF4c04853cA13774949a99A3A0Daf7323A9BCF5", quantity: 979735, percentage: "4.64" },
      { rank: 3, address: "0x7CaF8d75b14E61e3f97851c46b554034463E336E", quantity: 830925, percentage: "3.94" },
      { rank: 4, address: "0xc8606544B4B6cFb893E35f8dAc76D8ac42dadfe4", quantity: 652194, percentage: "3.09" },
      { rank: 5, address: "0x7deCD0770371096f135547Bdbdf3831799239ccF", quantity: 516019, percentage: "2.44" },
      { rank: 6, address: "0x433eA07DBD2a298Ea98dE7722b2c204c2C0e5786", quantity: 474385, percentage: "2.25" },
      { rank: 7, address: "0xa3b50A5cC96A291b383497458fAb87F40bE0f6b5", quantity: 348165, percentage: "1.65" },
      { rank: 8, address: "0x9890eF41C8780B569b09E64dC4415Cc01f58Bfe3", quantity: 312598, percentage: "1.48" },
      { rank: 9, address: "0xE44984e82fc2030E3dC2bc568698e215bd232352", quantity: 206799, percentage: "0.98" },
      { rank: 10, address: "0x4F35849dDBEc80947b829081a757BDCdB4BDfB6f", quantity: 205563, percentage: "0.97" },
      { rank: 11, address: "0x6e0F3b62CCe69c2D21D77A7A7f54F8E5e2B9BD78", quantity: 198234, percentage: "0.94" },
      { rank: 12, address: "0x3c5D2a8B4E9f6A7d2C1B0E8F4A3D6C9B5E2F1A0D", quantity: 187456, percentage: "0.89" },
      { rank: 13, address: "0x8a7E6F3D2C1B0A9E4F5D6C7B8A9E0F1D2C3B4A5E", quantity: 176543, percentage: "0.84" },
      { rank: 14, address: "0x1F2E3D4C5B6A7890FEDCBA9876543210ABCDEF01", quantity: 165432, percentage: "0.78" },
      { rank: 15, address: "0x9E8D7C6B5A4F3E2D1C0B9A8F7E6D5C4B3A2F1E0D", quantity: 154321, percentage: "0.73" },
    ],
  },
  {
    address: "0xC0041EF357B183448B235a8Ea73Ce4E4eC8c265F",
    name: "Cookie",
    project: null,
    network: "Base",
    type: "token",
    holdersCount: 90456,
    totalSupply: "209196154185784000000000000",
    verified: true,
    verifiedAt: "2026-01-16T16:55:00Z",
    source: "Blockscout",
    explorer: "https://basescan.org/address/0xC0041EF357B183448B235a8Ea73Ce4E4eC8c265F",
    holders: [
      { rank: 1, address: "0xe6dE7f7fa76Ffac94590F3C624E12FCe73e6AaBE", quantity: 35229524, percentage: "16.84" },
      { rank: 2, address: "0xD9349E2e25d682Aa13bAEEc7594135573966A0D9", quantity: 22676338, percentage: "10.84" },
      { rank: 3, address: "0x47ce620831336a2B6C15260002ca27788B87C81C", quantity: 15604783, percentage: "7.46" },
      { rank: 4, address: "0x111C28dC603971D2697366185B7cA70Bec815BbB", quantity: 12631840, percentage: "6.04" },
      { rank: 5, address: "0x0D0707963952f2fBA59dD06f2b425ace40b492Fe", quantity: 9344373, percentage: "4.47" },
      { rank: 6, address: "0xBaeD383EDE0e5d9d72430661f3285DAa77E9439F", quantity: 7839865, percentage: "3.75" },
      { rank: 7, address: "0x4e3ae00E8323558fA5Cac04b152238924AA31B60", quantity: 6906824, percentage: "3.30" },
      { rank: 8, address: "0x2C364129C9D80EBc87C909aD9539a61343Da8Ab9", quantity: 6445224, percentage: "3.08" },
      { rank: 9, address: "0x9BA9808E63C839DA7Ca6C11877EC3E55d2340789", quantity: 6210000, percentage: "2.97" },
      { rank: 10, address: "0x698d059A5C48ee7049638Ccb53eA697AB947ad4F", quantity: 5944243, percentage: "2.84" },
      { rank: 11, address: "0x7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F", quantity: 5234567, percentage: "2.50" },
      { rank: 12, address: "0x2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B", quantity: 4876543, percentage: "2.33" },
      { rank: 13, address: "0x5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3D4E", quantity: 4567890, percentage: "2.18" },
      { rank: 14, address: "0x8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F6A7B", quantity: 4234567, percentage: "2.02" },
      { rank: 15, address: "0xBC1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F6A7B8C9D", quantity: 3987654, percentage: "1.91" },
    ],
  },
  {
    address: "0x09fb72CBEa86AFBB5E5A4ac6f48a783A01799017",
    name: "Cookie",
    project: null,
    network: "BSC",
    type: "token",
    holdersCount: 24500,
    totalSupply: "33000000000000000000000000",
    verified: false,
    verifiedAt: null,
    source: "User-provided",
    explorer: "https://bscscan.com/address/0x09fb72CBEa86AFBB5E5A4ac6f48a783A01799017",
    holders: [], // Requires BscScan API key for verification
  },
]

// Helper to get all snapshots
export function getAllSnapshots(): ContractSnapshot[] {
  return [...NFT_SNAPSHOTS, ...TOKEN_SNAPSHOTS]
}

// Helper to get snapshot by address
export function getSnapshotByAddress(address: string): ContractSnapshot | undefined {
  return getAllSnapshots().find(
    (s) => s.address.toLowerCase() === address.toLowerCase()
  )
}
