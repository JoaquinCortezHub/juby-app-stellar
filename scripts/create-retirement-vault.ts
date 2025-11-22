/**
 * Create Retirement Vault (Based on Official Defindex Workshop)
 *
 * This script creates a DeFindex vault for USDC retirement savings,
 * based on the audited example from:
 * https://github.com/paltalabs/stellar-workshop/blob/main/src/defindex.ts
 *
 * Run with: npx tsx scripts/create-retirement-vault.ts
 */

import "dotenv/config";
import DefindexSDK, { CreateDefindexVaultDepositDto, SupportedNetworks } from "@defindex/sdk";
import { Horizon, Keypair, Networks, rpc, TransactionBuilder } from "@stellar/stellar-sdk";

// ========================================
// CONSTANTS (Testnet)
// ========================================
const TESTNET_HORIZON_URL = "https://horizon-testnet.stellar.org";
const TESTNET_SOROBAN_URL = "https://soroban-testnet.stellar.org";

// Testnet contract addresses (from official workshop)
const TESTNET_USDC_ADDRESS = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"; // USDC testnet
const TESTNET_XLM_ADDRESS = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"; // XLM testnet
const TESTNET_SOROSWAP_ROUTER = "CCMAPXWVZD4USEKDWRYS7DA4Y3D7E2SDMGBFJUCEXTC7VN6CUBGWPFUS"; // Soroswap router
const TESTNET_STRATEGY = "CCSPRGGUP32M23CTU7RUAGXDNOHSA6O2BS2IK4NVUP5X2JQXKTSIQJKE"; // Example strategy

// ========================================
// SERVER INITIALIZATION
// ========================================
const horizonServer = new Horizon.Server(TESTNET_HORIZON_URL);
const sorobanServer = new rpc.Server(TESTNET_SOROBAN_URL);

const defindexSdk = new DefindexSDK({
  apiKey: process.env.DEFINDEX_API_KEY || undefined,
});

// ========================================
// MAIN FUNCTION
// ========================================

async function createRetirementVault() {
  console.log("🚀 Creating Juby Retirement Vault");
  console.log("=".repeat(70));
  console.log();

  try {
    // ========================================
    // STEP 1: CREATE VAULT MANAGER WALLET
    // ========================================
    console.log("📝 STEP 1: Creating Vault Manager Wallet");
    console.log("=".repeat(40));

    const managerKeypair = Keypair.random();
    console.log("🏛️  Vault Manager wallet created:");
    console.log(`   Public Key: ${managerKeypair.publicKey()}`);
    console.log(`   Secret Key: ${managerKeypair.secret()}`);
    console.log();
    console.log("⚠️  SAVE THESE KEYS SECURELY!");
    console.log("   Add to your .env.local:");
    console.log(`   VAULT_MANAGER_ADDRESS=${managerKeypair.publicKey()}`);
    console.log(`   VAULT_MANAGER_SECRET_KEY=${managerKeypair.secret()}`);
    console.log();

    // Fund the vault manager wallet via Friendbot
    console.log("💰 Funding vault manager with testnet XLM...");
    try {
      await sorobanServer.requestAirdrop(managerKeypair.publicKey());
      console.log("✅ Vault manager funded successfully");
    } catch (error) {
      console.warn("⚠️  Airdrop might have failed, trying Friendbot...");
      try {
        const response = await fetch(
          `https://friendbot.stellar.org?addr=${managerKeypair.publicKey()}`
        );
        if (response.ok) {
          console.log("✅ Vault manager funded via Friendbot");
        }
      } catch (e) {
        console.error("❌ Failed to fund wallet. Please fund manually:");
        console.log(`   https://laboratory.stellar.org/#account-creator?network=test`);
        console.log(`   Address: ${managerKeypair.publicKey()}`);
        return;
      }
    }
    console.log();

    // ========================================
    // STEP 2: CONFIGURE VAULT
    // ========================================
    console.log("⚙️  STEP 2: Configuring Retirement Vault");
    console.log("=".repeat(40));

    /**
     * Vault Configuration (Based on Official Workshop):
     * - All roles assigned to manager for simplicity
     * - 1% management fee (100 basis points)
     * - USDC as the primary asset
     * - No strategies initially (idle vault, safest for retirement)
     * - Upgradable for future improvements
     * - Initial deposit: 10 USDC (100000000 stroops)
     */
    const vaultConfig: CreateDefindexVaultDepositDto = {
      roles: {
        0: managerKeypair.publicKey(), // Emergency Manager
        1: managerKeypair.publicKey(), // Fee Receiver
        2: managerKeypair.publicKey(), // Manager
        3: managerKeypair.publicKey()  // Rebalance Manager
      },
      vault_fee_bps: 100, // 1% management fee (reasonable for retirement)
      assets: [{
        address: TESTNET_USDC_ADDRESS, // USDC testnet
        strategies: [] // No strategies = idle vault (safest)
        // strategies: [{  // Uncomment to add yield strategy
        //   address: TESTNET_STRATEGY,
        //   name: "USDC Yield Strategy",
        //   paused: false
        // }]
      }],
      soroswap_router: TESTNET_SOROSWAP_ROUTER,
      name_symbol: {
        name: "Juby Retirement Vault",
        symbol: "JRVY"
      },
      upgradable: true,
      caller: managerKeypair.publicKey(),
      amounts: [100000000],        // Initial deposit: 10 USDC
      deposit_amounts: [100000000] // Same amount for vault creation
    };

    console.log("📋 Vault Configuration:");
    console.log(`   Name: ${vaultConfig.name_symbol.name}`);
    console.log(`   Symbol: ${vaultConfig.name_symbol.symbol}`);
    console.log(`   Fee: ${vaultConfig.vault_fee_bps / 100}%`);
    console.log(`   Manager: ${managerKeypair.publicKey()}`);
    console.log(`   Asset: USDC`);
    console.log(`   Strategies: ${vaultConfig.assets[0].strategies.length} (idle vault)`);
    console.log(`   Initial Deposit: ${vaultConfig.deposit_amounts[0] / 10000000} USDC`);
    console.log();

    // ========================================
    // STEP 3: CREATE VAULT
    // ========================================
    console.log("🏗️  STEP 3: Creating Vault on Stellar Testnet");
    console.log("=".repeat(40));

    console.log("🔨 Building vault creation transaction...");
    const createVaultResponse = await defindexSdk.createVaultWithDeposit(
      vaultConfig,
      SupportedNetworks.TESTNET
    );

    console.log("✅ Transaction built successfully");
    console.log("📝 Signing transaction with vault manager...");

    // Parse, sign and submit the vault creation transaction
    const tx = TransactionBuilder.fromXDR(createVaultResponse.xdr!, Networks.TESTNET);
    tx.sign(managerKeypair);

    console.log("📤 Submitting vault creation transaction to Stellar...");
    console.log("   ⏳ This may take 10-30 seconds...");
    console.log();

    const txResponse = await defindexSdk.sendTransaction(
      tx.toXDR(),
      SupportedNetworks.TESTNET
    );

    // Extract vault contract address from response
    const vaultContract = txResponse.returnValue;

    console.log("🎉 Vault Created Successfully!");
    console.log("=".repeat(70));
    console.log();
    console.log("📋 Your Retirement Vault:");
    console.log(`   Vault Address: ${vaultContract}`);
    console.log(`   Name: ${vaultConfig.name_symbol.name}`);
    console.log(`   Symbol: ${vaultConfig.name_symbol.symbol}`);
    console.log(`   Manager: ${managerKeypair.publicKey()}`);
    console.log(`   Initial Deposit: ${vaultConfig.deposit_amounts[0] / 10000000} USDC`);
    console.log();

    console.log("🔍 View on Stellar Expert:");
    const txHash = 'hash' in txResponse ? txResponse.hash : txResponse.txHash;
    console.log(`   https://stellar.expert/explorer/testnet/tx/${txHash}`);
    console.log();

    console.log("✅ NEXT STEPS:");
    console.log("1. Add vault address to your .env.local:");
    console.log(`   DEFINDEX_VAULT_ADDRESS=${vaultContract}`);
    console.log();
    console.log("2. Save your manager keys (ALREADY SHOWN ABOVE)");
    console.log();
    console.log("3. Test deposits:");
    console.log("   npx tsx scripts/test-custodial-deposit.ts");
    console.log();
    console.log("=".repeat(70));

  } catch (error) {
    console.error("\n❌ Error creating vault:", error);

    if (error instanceof Error) {
      console.error("🔍 Error message:", error.message);

      if (error.message.includes("airdrop")) {
        console.log();
        console.log("💡 Fix: Fund manager manually:");
        console.log("   https://laboratory.stellar.org/#account-creator");
      }

      if (error.message.includes("DEFINDEX_API_KEY")) {
        console.log();
        console.log("💡 Note: API key is optional for basic operations");
        console.log("   You can leave it empty in .env.local");
      }
    }
  }
}

// ========================================
// RUN
// ========================================

createRetirementVault()
  .then(() => {
    console.log("✅ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
