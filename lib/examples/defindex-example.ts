/**
 * Defindex Integration Example
 *
 * This file demonstrates how to use the Defindex service
 * for deposits and vault operations.
 *
 * NOTE: This is for reference/testing only. In production,
 * transactions should be signed via MiniKit on the frontend.
 */

import { Keypair, Networks, TransactionBuilder } from "@stellar/stellar-sdk";
import {
  DefindexService,
  DefindexConfig,
} from "../services/defindex.service";
import { SupportedNetworks } from "@defindex/sdk";

// ========================================
// EXAMPLE 1: Initialize Defindex Service
// ========================================

function exampleInitialize() {
  const config: DefindexConfig = {
    apiKey: process.env.DEFINDEX_API_KEY,
    vaultAddress:
      process.env.DEFINDEX_VAULT_ADDRESS ||
      "CDVPCLH7ISXWEAH4CQA7WWDZ3YKROPRGQGQXD4SINZT55L5LH2YMADVK",
    network: SupportedNetworks.TESTNET,
    defaultSlippageBps: 500, // 5%
    autoInvest: false,
  };

  const defindexService = new DefindexService(config);
  console.log("Defindex service initialized:", defindexService.getConfig());

  return defindexService;
}

// ========================================
// EXAMPLE 2: Build Deposit Transaction
// ========================================

async function exampleBuildDeposit() {
  const service = exampleInitialize();

  // User's public key (from World App / MiniKit)
  const userPublicKey = "GCAXSAYRQTFEYXXWYY5QV7TBZSZSSWLX2VGGIEAMU6UGNZNIW6NQXS37";

  // Amount in stroops (7 decimals)
  // 100 USDC = 1000000000 stroops
  const amount = DefindexService.amountToStroops(100);

  console.log("\nBuilding deposit transaction:");
  console.log("  User:", userPublicKey);
  console.log("  Amount:", DefindexService.stroopsToAmount(amount), "USDC");

  const depositResponse = await service.buildDepositTransaction({
    userPublicKey,
    amount,
    slippageBps: 500, // 5% slippage
    invest: false, // Keep as idle
  });

  console.log("\nDeposit transaction built:");
  console.log("  Success:", depositResponse.success);
  console.log("  Vault:", depositResponse.vaultAddress);
  console.log("  XDR length:", depositResponse.xdr.length);

  return depositResponse;
}

// ========================================
// EXAMPLE 3: Sign and Submit Transaction
// ========================================

async function exampleSignAndSubmit() {
  // NOTE: In production, signing happens on frontend via MiniKit
  // This example uses a keypair for demonstration only

  const service = exampleInitialize();

  // Create a test keypair (DO NOT USE IN PRODUCTION)
  const userKeypair = Keypair.random();
  console.log("\nTest User Created:");
  console.log("  Public Key:", userKeypair.publicKey());
  console.log("  Secret Key:", userKeypair.secret());

  // Build deposit transaction
  const depositResponse = await service.buildDepositTransaction({
    userPublicKey: userKeypair.publicKey(),
    amount: DefindexService.amountToStroops(10), // 10 USDC
  });

  console.log("\nTransaction built, now signing...");

  // Parse and sign the transaction
  const transaction = TransactionBuilder.fromXDR(
    depositResponse.xdr,
    Networks.TESTNET
  );
  transaction.sign(userKeypair);
  const signedXdr = transaction.toXDR();

  console.log("Transaction signed!");

  // Submit to Stellar network
  console.log("\nSubmitting to Stellar...");
  const submitResponse = await service.submitTransaction({ signedXdr });

  console.log("\nSubmit Result:");
  console.log("  Success:", submitResponse.success);
  console.log("  Transaction Hash:", submitResponse.transactionHash);
  console.log("  Return Value:", submitResponse.returnValue);

  return submitResponse;
}

// ========================================
// EXAMPLE 4: Query Vault Balance
// ========================================

async function exampleQueryBalance() {
  const service = exampleInitialize();

  const userPublicKey = "GCAXSAYRQTFEYXXWYY5QV7TBZSZSSWLX2VGGIEAMU6UGNZNIW6NQXS37";

  console.log("\nQuerying vault balance for:", userPublicKey);

  const balanceResponse = await service.getVaultBalance(userPublicKey);

  console.log("\nBalance Result:");
  console.log("  Success:", balanceResponse.success);
  console.log("  Vault:", balanceResponse.vaultAddress);
  console.log(
    "  Balance:",
    balanceResponse.balance
      ? DefindexService.stroopsToAmount(balanceResponse.balance)
      : 0,
    "USDC"
  );
  console.log(
    "  Shares:",
    balanceResponse.vaultShares
      ? DefindexService.stroopsToAmount(balanceResponse.vaultShares)
      : 0
  );

  return balanceResponse;
}

// ========================================
// EXAMPLE 5: Full Deposit Flow (API Simulation)
// ========================================

async function exampleFullFlow() {
  console.log("=".repeat(70));
  console.log("DEFINDEX DEPOSIT FLOW - FULL EXAMPLE");
  console.log("=".repeat(70));

  // Step 1: User initiates deposit (frontend)
  console.log("\n[STEP 1] User initiates deposit from frontend");
  const userPublicKey = "GCAXSAYRQTFEYXXWYY5QV7TBZSZSSWLX2VGGIEAMU6UGNZNIW6NQXS37";
  const depositAmount = 100; // 100 USDC

  // Step 2: Frontend calls /api/defindex/deposit
  console.log("\n[STEP 2] Frontend calls POST /api/defindex/deposit");
  const service = exampleInitialize();
  const depositTx = await service.buildDepositTransaction({
    userPublicKey,
    amount: DefindexService.amountToStroops(depositAmount),
    slippageBps: 500,
  });

  console.log("  ✅ Unsigned transaction created");
  console.log("  📤 XDR sent to frontend for signing");

  // Step 3: User signs via MiniKit (frontend)
  console.log("\n[STEP 3] User signs transaction via MiniKit");
  console.log("  🔏 MiniKit signature request...");
  console.log("  ✅ Transaction signed by user");

  // Step 4: Frontend calls /api/defindex/submit
  console.log("\n[STEP 4] Frontend calls POST /api/defindex/submit");
  console.log("  📤 Submitting signed XDR to Stellar network...");
  console.log("  ⏳ Waiting for confirmation...");

  // Step 5: Transaction confirmed
  console.log("\n[STEP 5] Transaction confirmed!");
  console.log("  ✅ Deposit successful");
  console.log("  💰 Amount:", depositAmount, "USDC");
  console.log("  🏦 Vault shares received");
  console.log("  📝 Transaction recorded in database");

  // Step 6: Update user dashboard
  console.log("\n[STEP 6] User dashboard updated");
  console.log("  📊 New balance displayed");
  console.log("  📈 Yield tracking started");

  console.log("\n" + "=".repeat(70));
  console.log("FLOW COMPLETE");
  console.log("=".repeat(70));
}

// ========================================
// EXAMPLE 6: Amount Conversion Helpers
// ========================================

function exampleAmountConversion() {
  console.log("\n" + "=".repeat(70));
  console.log("AMOUNT CONVERSION EXAMPLES");
  console.log("=".repeat(70));

  // Convert to stroops
  console.log("\nHuman-readable → Stroops:");
  console.log("  1 USDC =", DefindexService.amountToStroops(1), "stroops");
  console.log("  10.5 USDC =", DefindexService.amountToStroops(10.5), "stroops");
  console.log("  100 USDC =", DefindexService.amountToStroops(100), "stroops");

  // Convert from stroops
  console.log("\nStroops → Human-readable:");
  console.log("  10000000 stroops =", DefindexService.stroopsToAmount(10000000), "USDC");
  console.log("  105000000 stroops =", DefindexService.stroopsToAmount(105000000), "USDC");
  console.log("  1000000000 stroops =", DefindexService.stroopsToAmount(1000000000), "USDC");
}

// ========================================
// RUN EXAMPLES
// ========================================

async function runExamples() {
  try {
    // Example 1: Initialize
    console.log("\n📦 Example 1: Initialize Service");
    exampleInitialize();

    // Example 2: Build deposit
    console.log("\n📦 Example 2: Build Deposit Transaction");
    await exampleBuildDeposit();

    // Example 4: Query balance
    console.log("\n📦 Example 4: Query Balance");
    await exampleQueryBalance();

    // Example 5: Full flow
    await exampleFullFlow();

    // Example 6: Amount conversion
    exampleAmountConversion();

    // NOTE: Example 3 (Sign and Submit) is commented out
    // because it requires a funded testnet account
    // Uncomment and run on testnet if you want to test actual submission:
    //
    // console.log("\n📦 Example 3: Sign and Submit");
    // await exampleSignAndSubmit();
  } catch (error) {
    console.error("\n❌ Example Error:", error);
  }
}

// Uncomment to run examples:
// runExamples();

export {
  exampleInitialize,
  exampleBuildDeposit,
  exampleSignAndSubmit,
  exampleQueryBalance,
  exampleFullFlow,
  exampleAmountConversion,
  runExamples,
};
