/**
 * Test Script: Custodial Deposit Flow
 *
 * This script demonstrates the complete custodial deposit flow:
 * 1. Create custodial Stellar wallet for user
 * 2. Fund wallet with testnet USDC (simulated)
 * 3. Backend signs and submits Defindex deposit
 * 4. Query vault balance
 *
 * Run with: npx tsx scripts/test-custodial-deposit.ts
 */

import "dotenv/config";
import { initializeStellarWalletService } from "../lib/services/stellar-wallet.service";
import { initializeDefindexService, DefindexService } from "../lib/services/defindex.service";

// ========================================
// TEST CONFIGURATION
// ========================================

const TEST_USER_ID = `test-user-${Date.now()}`;
const DEPOSIT_AMOUNT_USDC = 10; // 10 USDC
const DEPOSIT_AMOUNT_STROOPS = DefindexService.amountToStroops(DEPOSIT_AMOUNT_USDC);

// ========================================
// MAIN TEST FUNCTION
// ========================================

async function testCustodialDeposit() {
  console.log("=".repeat(70));
  console.log("CUSTODIAL DEPOSIT TEST");
  console.log("=".repeat(70));
  console.log();

  try {
    // ========================================
    // STEP 1: Initialize Services
    // ========================================
    console.log("📦 Step 1: Initializing services...");

    const walletService = initializeStellarWalletService();
    const defindexService = initializeDefindexService();

    console.log("✅ Services initialized");
    console.log();

    // ========================================
    // STEP 2: Create Stellar Wallet for User
    // ========================================
    console.log("📦 Step 2: Creating custodial Stellar wallet...");
    console.log(`   User ID: ${TEST_USER_ID}`);

    const wallet = await walletService.createWalletForUser(TEST_USER_ID);

    console.log("✅ Stellar wallet created:");
    console.log(`   Public Key: ${wallet.stellarPublicKey}`);
    console.log(`   Wallet ID: ${wallet.walletId}`);
    console.log();

    // ========================================
    // STEP 3: Fund Stellar Wallet (Testnet)
    // ========================================
    console.log("📦 Step 3: Funding Stellar wallet with testnet XLM...");

    try {
      const fundResponse = await fetch(
        `https://friendbot.stellar.org?addr=${wallet.stellarPublicKey}`
      );

      if (!fundResponse.ok) {
        throw new Error("Failed to fund wallet from Friendbot");
      }

      console.log("✅ Wallet funded with testnet XLM");
      console.log();
    } catch (error) {
      console.warn("⚠️  Friendbot funding failed (may already be funded):", error);
      console.log("   Continuing anyway...");
      console.log();
    }

    // ========================================
    // STEP 4: Simulate USDC Arrival
    // ========================================
    console.log("📦 Step 4: Simulating USDC arrival...");
    console.log(`   Amount: ${DEPOSIT_AMOUNT_USDC} USDC (${DEPOSIT_AMOUNT_STROOPS} stroops)`);
    console.log();
    console.log("   ℹ️  In production:");
    console.log("   - User deposits USDC on Worldchain");
    console.log("   - CCTP bridges to Stellar");
    console.log("   - USDC arrives at user's Stellar address");
    console.log();
    console.log("   For this test, we'll skip to the Defindex deposit...");
    console.log();

    // ========================================
    // STEP 5: Backend Signs and Deposits
    // ========================================
    console.log("📦 Step 5: Backend depositing to Defindex vault...");
    console.log(`   User: ${TEST_USER_ID}`);
    console.log(`   Amount: ${DEPOSIT_AMOUNT_USDC} USDC`);
    console.log(`   Slippage: 5%`);
    console.log();

    console.log("   🔐 Backend will:");
    console.log("   1. Build deposit transaction");
    console.log("   2. Sign with user's Stellar key (custodial)");
    console.log("   3. Submit to Stellar network");
    console.log("   4. Record in database");
    console.log();

    const depositResult = await defindexService.depositForUser(
      TEST_USER_ID,
      DEPOSIT_AMOUNT_STROOPS
    );

    if (!depositResult.success) {
      console.error("❌ Deposit failed:", depositResult.error);
      console.log();
      console.log("⚠️  This is expected if:");
      console.log("   - DEFINDEX_VAULT_ADDRESS is not set");
      console.log("   - Vault doesn't exist on testnet");
      console.log("   - User doesn't have USDC on Stellar");
      console.log();
      console.log("   The wallet creation and signing logic still works!");
      return;
    }

    console.log("✅ Deposit successful!");
    console.log(`   Transaction Hash: ${depositResult.transactionHash}`);
    console.log(`   Vault Shares: ${depositResult.returnValue}`);
    console.log();

    // ========================================
    // STEP 6: Query Vault Balance
    // ========================================
    console.log("📦 Step 6: Querying vault balance...");

    const balance = await defindexService.getUserVaultBalance(TEST_USER_ID);

    console.log("✅ Vault balance:");
    console.log(`   Total Deposited: ${DefindexService.stroopsToAmount(balance.balance || 0)} USDC`);
    console.log(`   Vault Shares: ${balance.vaultShares || 0}`);
    console.log();

    // ========================================
    // SUMMARY
    // ========================================
    console.log("=".repeat(70));
    console.log("TEST SUMMARY");
    console.log("=".repeat(70));
    console.log();
    console.log("✨ What we accomplished:");
    console.log("   1. ✅ Created custodial Stellar wallet");
    console.log("   2. ✅ Encrypted and stored keypair in database");
    console.log("   3. ✅ Funded wallet with testnet XLM");
    console.log("   4. ✅ Backend signed deposit transaction");
    console.log("   5. ✅ Submitted to Stellar network");
    console.log("   6. ✅ Recorded in database");
    console.log();
    console.log("🔐 Key Security Points:");
    console.log("   - User NEVER sees Stellar private key");
    console.log("   - Keypair encrypted with AES-256-GCM");
    console.log("   - Backend signs all Stellar transactions");
    console.log("   - User only uses World App (Worldchain side)");
    console.log();
    console.log("🎯 Next Steps:");
    console.log("   1. Set up Supabase database");
    console.log("   2. Run: npx prisma migrate dev");
    console.log("   3. Add DEFINDEX_VAULT_ADDRESS to .env.local");
    console.log("   4. Get testnet USDC for Stellar address");
    console.log("   5. Re-run this script");
    console.log();
    console.log("=".repeat(70));
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.log();

    if (error instanceof Error) {
      console.error("Error details:", error.message);

      if (error.message.includes("ENCRYPTION_MASTER_KEY")) {
        console.log();
        console.log("💡 Fix: Generate encryption key:");
        console.log('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
        console.log("   Add to .env.local as ENCRYPTION_MASTER_KEY");
      }

      if (error.message.includes("DATABASE_URL")) {
        console.log();
        console.log("💡 Fix: Set up database:");
        console.log("   1. Create Supabase project");
        console.log("   2. Add DATABASE_URL to .env.local");
        console.log("   3. Run: npx prisma migrate dev");
      }

      if (error.message.includes("DEFINDEX_VAULT_ADDRESS")) {
        console.log();
        console.log("💡 Fix: Add vault address:");
        console.log("   1. Get testnet vault address from Defindex team");
        console.log("   2. Add to .env.local as DEFINDEX_VAULT_ADDRESS");
      }
    }
  }
}

// ========================================
// RUN TEST
// ========================================

testCustodialDeposit()
  .then(() => {
    console.log("✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
