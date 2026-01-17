#!/usr/bin/env python3
"""
Contract Address Database
Stores NFT and Token contract addresses with metadata
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "contracts.db"


def create_database():
    """Create the SQLite database and tables."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create NFTs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS nfts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            project TEXT NOT NULL,
            holders INTEGER,
            total_nfts INTEGER,
            address TEXT NOT NULL UNIQUE,
            network TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create Tokens table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            project TEXT,
            holders INTEGER,
            total_staked TEXT,
            address TEXT NOT NULL,
            chain TEXT NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(address, chain)
        )
    """)

    conn.commit()
    conn.close()
    print(f"Database created at: {DB_PATH}")


def populate_nfts():
    """Insert NFT contract data."""
    nfts = [
        {
            "name": "Yapybaras",
            "project": "Kaito",
            "holders": 1003,
            "total_nfts": 1500,
            "address": "0x9830b32f7210f0857a859c2a86387e4d1bb760b8",
            "network": "ETH"
        },
        {
            "name": "Quack Heads",
            "project": "Wallchain",
            "holders": 1480,  # 1.48K
            "total_nfts": 1999,
            "address": "HxSsfM9WxQWj79chAUNL6osZxQjJj5iMUwrjEfRBvYBR",
            "network": "Solana"
        }
    ]

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    for nft in nfts:
        cursor.execute("""
            INSERT OR REPLACE INTO nfts (name, project, holders, total_nfts, address, network)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (nft["name"], nft["project"], nft["holders"], nft["total_nfts"],
              nft["address"], nft["network"]))

    conn.commit()
    conn.close()
    print(f"Inserted {len(nfts)} NFT contracts")


def populate_tokens():
    """Insert Token contract data."""
    tokens = [
        {
            "name": "Skaito",
            "project": "Kaito",
            "holders": 17245,
            "total_staked": "21M",
            "address": "0x548D3B444da39686d1a6F1544781d154e7cD1EF7",
            "chain": "Base",
            "notes": "Average holding amount 2-3K"
        },
        {
            "name": "Cookie",
            "project": None,
            "holders": 93000,  # 93K
            "total_staked": "15M",
            "address": "0xC0041EF357B183448B235a8Ea73Ce4E4eC8c265F",
            "chain": "Base",
            "notes": None
        },
        {
            "name": "Cookie",
            "project": None,
            "holders": 24500,  # 24.5K
            "total_staked": "33M",
            "address": "0x09fb72CBEa86AFBB5E5A4ac6f48a783A01799017",
            "chain": "BSC",
            "notes": None
        }
    ]

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    for token in tokens:
        cursor.execute("""
            INSERT OR REPLACE INTO tokens (name, project, holders, total_staked, address, chain, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (token["name"], token["project"], token["holders"], token["total_staked"],
              token["address"], token["chain"], token["notes"]))

    conn.commit()
    conn.close()
    print(f"Inserted {len(tokens)} Token contracts")


def verify_data():
    """Verify all data was inserted correctly."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("\n" + "="*80)
    print("VERIFICATION REPORT")
    print("="*80)

    # Verify NFTs
    print("\n--- NFT CONTRACTS ---")
    cursor.execute("SELECT * FROM nfts")
    nfts = cursor.fetchall()
    print(f"Total NFT records: {len(nfts)}")

    for nft in nfts:
        print(f"\n  Name: {nft['name']}")
        print(f"  Project: {nft['project']}")
        print(f"  Holders: {nft['holders']:,}")
        print(f"  Total NFTs: {nft['total_nfts']:,}")
        print(f"  Address: {nft['address']}")
        print(f"  Network: {nft['network']}")

    # Verify Tokens
    print("\n--- TOKEN CONTRACTS ---")
    cursor.execute("SELECT * FROM tokens")
    tokens = cursor.fetchall()
    print(f"Total Token records: {len(tokens)}")

    for token in tokens:
        print(f"\n  Name: {token['name']}")
        print(f"  Project: {token['project'] or 'N/A'}")
        print(f"  Holders: {token['holders']:,}")
        print(f"  Total Staked: {token['total_staked']}")
        print(f"  Address: {token['address']}")
        print(f"  Chain: {token['chain']}")
        if token['notes']:
            print(f"  Notes: {token['notes']}")

    conn.close()

    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print(f"NFT Contracts: {len(nfts)}")
    print(f"Token Contracts: {len(tokens)}")
    print(f"Total Contracts: {len(nfts) + len(tokens)}")

    # Verification checks
    expected_nfts = 2
    expected_tokens = 3

    all_good = True
    if len(nfts) != expected_nfts:
        print(f"WARNING: Expected {expected_nfts} NFTs, got {len(nfts)}")
        all_good = False
    if len(tokens) != expected_tokens:
        print(f"WARNING: Expected {expected_tokens} tokens, got {len(tokens)}")
        all_good = False

    if all_good:
        print("\nAll data verified successfully!")

    return all_good


def fetch_all():
    """Fetch and return all contracts as dictionaries."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM nfts")
    nfts = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT * FROM tokens")
    tokens = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return {"nfts": nfts, "tokens": tokens}


def get_by_network(network: str):
    """Get all contracts on a specific network/chain."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT 'nft' as type, * FROM nfts WHERE network = ?", (network,))
    results = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT 'token' as type, * FROM tokens WHERE chain = ?", (network,))
    results.extend([dict(row) for row in cursor.fetchall()])

    conn.close()
    return results


def get_by_project(project: str):
    """Get all contracts for a specific project."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT 'nft' as type, * FROM nfts WHERE project = ?", (project,))
    results = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT 'token' as type, * FROM tokens WHERE project = ?", (project,))
    results.extend([dict(row) for row in cursor.fetchall()])

    conn.close()
    return results


if __name__ == "__main__":
    print("Setting up Contract Address Database...")
    print("-" * 40)

    # Create database and tables
    create_database()

    # Populate with data
    populate_nfts()
    populate_tokens()

    # Verify everything worked
    verify_data()
