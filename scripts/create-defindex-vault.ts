/**
 * Script to Create Your Own Defindex Vault
 *
 * This creates a new vault that YOU manage, with custom configuration.
 * Only run this if you want your own vault instead of using a public one.
 *
 * USAGE:
 *
 * 1. Generate vault management keypairs:
 *    npx tsx scripts/create-defindex-vault.ts generate-keys
 *    (Copy the generated keys to .env.local)
 *
 * 2. Fund the manager wallet on testnet:
 *    npx tsx scripts/create-defindex-vault.ts fund-wallet
 *
 * 3. Create the vault:
 *    npx tsx scripts/create-defindex-vault.ts
 *    (Copy the vault address to .env.local as DEFINDEX_VAULT_ADDRESS)
 */

import { config } from "dotenv";
import { Keypair, rpc } from "@stellar/stellar-sdk";
import { initializeDefindexService } from "../lib/services/defindex.service";
import { SupportedNetworks } from "@defindex/sdk";

// Load environment variables from .env.local
config({ path: ".env.local" });

// ========================================
// VAULT CONFIGURATION
// ========================================

// You need to decide these addresses:
const VAULT_CONFIG = {
  // Manager: Can pause strategies, update fees, etc.
  // Use your Stellar address or generate a new keypair
  manager: process.env.VAULT_MANAGER_ADDRESS || "",

  // Emergency Manager: Can rescue funds from strategies in emergency
  emergencyManager: process.env.VAULT_EMERGENCY_MANAGER || "",

  // Fee Receiver: Where vault fees are sent
  // Could be your developer wallet
  feeReceiver: process.env.DEVELOPER_FEE_RECEIVER || "",

  // Rebalance Manager: Can rebalance strategies
  rebalanceManager: process.env.VAULT_REBALANCE_MANAGER || "",

  // Vault fee in basis points (100 = 1%)
  vaultFeeBps: 100, // 1% fee

  // Vault name and symbol
  name: "Juby Retirement Vault",
  symbol: "JRVY",

  // Assets (USDC on Stellar testnet)
  assets: [
    {
      address: process.env.USDC_STELLAR_ADDRESS || "",
      strategies: [], // Start with no strategies (idle vault)
    },
  ],

  // Soroswap router for swaps (testnet)
  soroswapRouter: "CCMAPXWVZD4USEKDWRYS7DA4Y3D7E2SDMGBFJUCEXTC7VN6CUBGWPFUS",

  // Can the vault contract be upgraded later?
  upgradable: true,
};

// ========================================
// CREATE VAULT
// ========================================

async function createVault() {
  console.log("=".repeat(70));
  console.log("CREATE DEFINDEX VAULT");
  console.log("=".repeat(70));
  console.log();

  try {
    // Validate configuration
    if (!VAULT_CONFIG.manager) {
      throw new Error("VAULT_MANAGER_ADDRESS not set in .env.local");
    }

    if (!VAULT_CONFIG.assets[0].address) {
      throw new Error("USDC_STELLAR_ADDRESS not set in .env.local");
    }

    console.log("📋 Vault Configuration:");
    console.log(`   Name: ${VAULT_CONFIG.name}`);
    console.log(`   Symbol: ${VAULT_CONFIG.symbol}`);
    console.log(`   Manager: ${VAULT_CONFIG.manager}`);
    console.log(`   Fee: ${VAULT_CONFIG.vaultFeeBps / 100}%`);
    console.log();

    // Initialize Defindex SDK
    const defindexService = initializeDefindexService();
    const sdk = (defindexService as any).sdk; // Access SDK directly

    console.log("🏗️  Creating vault...");
    console.log("   This will return an unsigned transaction.");
    console.log("   You'll need to sign it with your manager key.");
    console.log();

    // Create vault transaction
    const createVaultResponse = await sdk.createVault(
      {
        // Roles configuration (IMPORTANT: These indices are defined by Defindex contract)
        roles: {
          "0": VAULT_CONFIG.emergencyManager,  // Role 0: Emergency Manager
          "1": VAULT_CONFIG.feeReceiver,       // Role 1: Fee Receiver
          "2": VAULT_CONFIG.manager,           // Role 2: Manager
          "3": VAULT_CONFIG.rebalanceManager,  // Role 3: Rebalance Manager
        },

        // Vault parameters
        vault_fee_bps: VAULT_CONFIG.vaultFeeBps,

        // Assets and strategies
        assets: VAULT_CONFIG.assets.map(asset => ({
          address: asset.address,
          strategies: asset.strategies,
        })),

        // Soroswap router for asset swaps
        soroswap_router: VAULT_CONFIG.soroswapRouter,

        // Vault metadata
        name_symbol: {
          name: VAULT_CONFIG.name,
          symbol: VAULT_CONFIG.symbol,
        },

        // Upgradability
        upgradable: VAULT_CONFIG.upgradable,

        // Caller (manager must sign)
        caller: VAULT_CONFIG.manager,
      },
      SupportedNetworks.TESTNET
    );

    console.log("✅ Vault transaction created!");
    console.log();
    console.log("📝 Transaction XDR:");
    console.log(createVaultResponse.xdr);
    console.log();
    console.log("⚠️  NEXT STEPS:");
    console.log("1. Sign this XDR with your manager wallet");
    console.log("2. Submit the signed transaction to Stellar");
    console.log("3. The vault address will be in the transaction result");
    console.log();
    console.log("💡 To sign and submit:");
    console.log("   - Use Freighter wallet extension");
    console.log("   - Or use Stellar CLI: stellar tx sign-and-send");
    console.log("   - Or use laboratory.stellar.org");
    console.log();

    // If you have the manager secret key, you can sign here:
    const managerSecretKey = process.env.VAULT_MANAGER_SECRET_KEY;
    if (managerSecretKey) {
      console.log("🔐 Found manager secret key, signing...");

      const managerKeypair = Keypair.fromSecret(managerSecretKey);
      const { TransactionBuilder, Networks } = await import("@stellar/stellar-sdk");

      // Parse and sign transaction
      const transaction = TransactionBuilder.fromXDR(
        createVaultResponse.xdr,
        Networks.TESTNET
      );

      transaction.sign(managerKeypair);
      const signedXdr = transaction.toXDR();

      console.log("✅ Transaction signed!");
      console.log();
      console.log("📤 Submitting to Stellar...");

      // Submit transaction
      const submitResponse = await sdk.sendTransaction(
        signedXdr,
        SupportedNetworks.TESTNET
      );

      const txHash = 'hash' in submitResponse
        ? submitResponse.hash
        : submitResponse.txHash;

      // Extract vault address from transaction result
      const vaultAddress = submitResponse.returnValue;

      console.log("✅ Vault created successfully!");
      console.log();
      console.log("📋 Vault Details:");
      console.log(`   Vault Address: ${vaultAddress}`);
      console.log(`   Transaction Hash: ${txHash}`);
      console.log(`   Transaction URL: https://stellar.expert/explorer/testnet/tx/${txHash}`);
      console.log();
      console.log("⚠️  IMPORTANT: Add this to your .env.local:");
      console.log(`   DEFINDEX_VAULT_ADDRESS=${vaultAddress}`);
      console.log();
    }

  } catch (error) {
    console.error("❌ Failed to create vault:", error);

    if (error instanceof Error) {
      console.log();
      console.log("Error details:", error.message);

      if (error.message.includes("VAULT_MANAGER_ADDRESS")) {
        console.log();
        console.log("💡 Fix: Add vault manager addresses to .env.local:");
        console.log();
        console.log("   # Generate a new keypair for vault management:");
        console.log("   # stellar keys generate vault-manager --network testnet");
        console.log();
        console.log("   VAULT_MANAGER_ADDRESS=GXXXXXXXXX...");
        console.log("   VAULT_MANAGER_SECRET_KEY=SXXXXXXXXX...");
        console.log("   VAULT_EMERGENCY_MANAGER=GXXXXXXXXX...");
        console.log("   VAULT_REBALANCE_MANAGER=GXXXXXXXXX...");
        console.log("   DEVELOPER_FEE_RECEIVER=GXXXXXXXXX...");
      }
    }
  }
}

// ========================================
// GENERATE KEYPAIRS HELPER
// ========================================

function generateKeypairs() {
  console.log("=".repeat(70));
  console.log("GENERATE VAULT MANAGEMENT KEYPAIRS");
  console.log("=".repeat(70));
  console.log();

  const roles = [
    "Manager",
    "Emergency Manager",
    "Fee Receiver",
    "Rebalance Manager",
  ];

  console.log("Generated keypairs for vault roles:");
  console.log();

  for (const role of roles) {
    const keypair = Keypair.random();
    console.log(`${role}:`);
    console.log(`  Public:  ${keypair.publicKey()}`);
    console.log(`  Secret:  ${keypair.secret()}`);
    console.log();
  }

  console.log("⚠️  IMPORTANT:");
  console.log("1. Save these keys securely!");
  console.log("2. Add to .env.local (never commit to git)");
  console.log("3. Fund manager address with testnet XLM:");
  console.log("   https://laboratory.stellar.org/#account-creator");
  console.log();
}

// ========================================
// FUND WALLET HELPER (TESTNET ONLY)
// ========================================

async function fundWallet() {
  console.log("=".repeat(70));
  console.log("FUND VAULT MANAGER WALLET (TESTNET)");
  console.log("=".repeat(70));
  console.log();

  try {
    if (!process.env.VAULT_MANAGER_ADDRESS) {
      throw new Error("VAULT_MANAGER_ADDRESS not set in .env.local");
    }

    const sorobanUrl = process.env.STELLAR_SOROBAN_URL || "https://soroban-testnet.stellar.org";
    const sorobanServer = new rpc.Server(sorobanUrl);

    console.log(`💰 Requesting airdrop for: ${process.env.VAULT_MANAGER_ADDRESS}`);
    console.log(`   Using: ${sorobanUrl}`);
    console.log();

    await sorobanServer.requestAirdrop(process.env.VAULT_MANAGER_ADDRESS);

    console.log("✅ Airdrop successful!");
    console.log("   Your manager wallet is now funded with testnet XLM");
    console.log();
    console.log("💡 Next step: Run the vault creation script");
    console.log("   npx tsx scripts/create-defindex-vault.ts");
    console.log();
  } catch (error) {
    console.error("❌ Failed to fund wallet:", error);

    if (error instanceof Error) {
      console.log();
      console.log("Error details:", error.message);

      if (error.message.includes("VAULT_MANAGER_ADDRESS")) {
        console.log();
        console.log("💡 Fix: First generate keypairs:");
        console.log("   npx tsx scripts/create-defindex-vault.ts generate-keys");
      }
    }
  }
}

// ========================================
// RUN
// ========================================

const command = process.argv[2];

if (command === "generate-keys") {
  generateKeypairs();
} else if (command === "fund-wallet") {
  fundWallet()
    .then(() => {
      console.log("✅ Done");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed:", error);
      process.exit(1);
    });
} else {
  createVault()
    .then(() => {
      console.log("✅ Done");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed:", error);
      process.exit(1);
    });
}
