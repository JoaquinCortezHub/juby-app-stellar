/**
 * Setup Demo USDC Source Account
 *
 * This script creates and configures a Stellar testnet account that will be used
 * as the source for funding demo wallets with USDC.
 *
 * Steps:
 * 1. Generate new Stellar keypair
 * 2. Fund with testnet XLM from Friendbot
 * 3. Add USDC trustline
 * 4. Display instructions for getting testnet USDC
 *
 * Run with: npx tsx scripts/setup-demo-usdc-source.ts
 */

import "dotenv/config";
import * as StellarSdk from "@stellar/stellar-sdk";

// ========================================
// CONFIGURATION
// ========================================

const HORIZON_URL =
  process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
// Standard testnet USDC issuer from Circle
const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

// ========================================
// MAIN SETUP FUNCTION
// ========================================

async function setupDemoUsdcSource() {
  console.log("=".repeat(70));
  console.log("DEMO USDC SOURCE ACCOUNT SETUP");
  console.log("=".repeat(70));
  console.log();

  try {
    // ========================================
    // STEP 1: Generate Keypair
    // ========================================
    console.log("📦 Step 1: Generating new Stellar keypair...");

    const keypair = StellarSdk.Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();

    console.log("✅ Keypair generated:");
    console.log(`   Public Key:  ${publicKey}`);
    console.log(`   Secret Key:  ${secretKey}`);
    console.log();
    console.log("   ⚠️  IMPORTANT: Save the secret key securely!");
    console.log();

    // ========================================
    // STEP 2: Fund with XLM from Friendbot
    // ========================================
    console.log("📦 Step 2: Funding account with testnet XLM...");

    const friendbotUrl = `https://friendbot.stellar.org?addr=${publicKey}`;
    const friendbotResponse = await fetch(friendbotUrl);

    if (!friendbotResponse.ok) {
      throw new Error("Failed to fund account from Friendbot");
    }

    console.log("✅ Account funded with testnet XLM");
    console.log();

    // Wait a bit for the network to process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // ========================================
    // STEP 3: Add USDC Trustline
    // ========================================
    console.log("📦 Step 3: Adding USDC trustline...");
    console.log(`   USDC Issuer: ${USDC_ISSUER}`);

    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(publicKey);

    const usdcAsset = new StellarSdk.Asset("USDC", USDC_ISSUER);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset: usdcAsset,
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(keypair);
    const result = await server.submitTransaction(transaction);

    console.log("✅ USDC trustline added");
    console.log(`   Transaction Hash: ${result.hash}`);
    console.log();

    // ========================================
    // STEP 4: Display Next Steps
    // ========================================
    console.log("=".repeat(70));
    console.log("NEXT STEPS");
    console.log("=".repeat(70));
    console.log();

    console.log("1️⃣  Add the secret key to your .env.local file:");
    console.log();
    console.log(`   DEMO_USDC_SOURCE_SECRET=${secretKey}`);
    console.log();

    console.log("2️⃣  Fund the account with testnet USDC:");
    console.log();
    console.log("   Option A: Use Stellar Quest USDC Faucet");
    console.log("   - Visit: https://quest.stellar.org/");
    console.log("   - Complete USDC tutorial to get testnet USDC");
    console.log();
    console.log("   Option B: Ask in Stellar Discord");
    console.log("   - Visit: https://discord.gg/stellardev");
    console.log("   - Ask in #soroban-help channel");
    console.log(`   - Share your public key: ${publicKey}`);
    console.log();
    console.log("   Option C: Manual transfer (if you have another funded account)");
    console.log(
      "   - Use stellar.expert or any Stellar wallet to send USDC"
    );
    console.log(`   - Destination: ${publicKey}`);
    console.log("   - Amount: At least 10,000 USDC for demos");
    console.log();

    console.log("3️⃣  Verify USDC balance:");
    console.log();
    console.log(
      `   Visit: https://stellar.expert/explorer/testnet/account/${publicKey}`
    );
    console.log("   Check that USDC balance > 0");
    console.log();

    console.log("4️⃣  Test the demo deposit flow:");
    console.log();
    console.log("   npm run dev");
    console.log("   # Then click 'Recibir e Invertir' button");
    console.log();

    console.log("=".repeat(70));
    console.log();

    console.log("✨ Account Details Summary:");
    console.log(`   Public Key:  ${publicKey}`);
    console.log(`   Secret Key:  ${secretKey}`);
    console.log(
      `   Explorer:    https://stellar.expert/explorer/testnet/account/${publicKey}`
    );
    console.log();
    console.log(
      "🔒 Remember: Keep the secret key secure and ONLY use for testnet demos!"
    );
    console.log();
    console.log("=".repeat(70));
  } catch (error) {
    console.error("❌ Setup failed:", error);

    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }

    process.exit(1);
  }
}

// ========================================
// RUN SETUP
// ========================================

setupDemoUsdcSource()
  .then(() => {
    console.log("✅ Setup completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });
