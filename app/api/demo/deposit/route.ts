/**
 * POST /api/demo/deposit
 *
 * Hackathon demo endpoint: Creates/funds a mock wallet and deposits to Defindex.
 * This is a simplified flow for demonstration purposes.
 */

import { NextRequest, NextResponse } from "next/server";
import { initializeStellarWalletService } from "@/lib/services/stellar-wallet.service";
import { initializeDefindexService, DefindexService } from "@/lib/services/defindex.service";
import { getDemoUsdcFundingService } from "@/lib/services/demo-usdc-funding.service";

// Hardcoded demo user - in production this would come from auth
const DEMO_USER_ID = "hackathon-demo-user";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { amount, invest } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Default to auto-invest if not specified
    const shouldInvest = invest !== undefined ? invest : true;

    console.log(`🎯 Demo deposit request: ${amount} USDC (auto-invest: ${shouldInvest})`);

    // Initialize services
    const walletService = initializeStellarWalletService();
    const defindexService = initializeDefindexService();

    // Step 1: Create or get custodial wallet
    console.log("📦 Creating/getting demo wallet...");
    const wallet = await walletService.createWalletForUser(DEMO_USER_ID);
    console.log(`✅ Wallet: ${wallet.stellarPublicKey}`);

    // Step 2: Fund wallet with Soroban testnet airdrop
    // This automatically provides XLM and sets up the account for Soroban usage
    console.log("💰 Requesting Soroban testnet airdrop...");
    const usdcFundingService = getDemoUsdcFundingService();

    const fundingResult = await usdcFundingService.fundWalletWithAirdrop(
      wallet.stellarPublicKey
    );

    if (!fundingResult.success) {
      console.error("❌ Airdrop failed:", fundingResult.error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to fund wallet with testnet airdrop",
          details: fundingResult.error,
        },
        { status: 500 }
      );
    }

    console.log("✅ Wallet funded with testnet airdrop");
    console.log(`   TX Hash: ${fundingResult.airdropTxHash}`);

    // Step 3: Convert amount to stroops (Stellar's smallest unit, 7 decimals)
    const amountStroops = DefindexService.amountToStroops(amount);

    // Step 4: Backend signs and deposits to Defindex
    // Note: Current vault accepts XLM deposits (shown as "USDC" in UI for demo simplicity)
    console.log(`🏦 Depositing ${amount} tokens (XLM) to Defindex vault...`);

    const depositResult = await defindexService.depositForUser(
      DEMO_USER_ID,
      amountStroops,
      500,  // 5% slippage
      shouldInvest  // Pass invest parameter
    );

    if (!depositResult.success) {
      console.error("❌ Deposit failed:", depositResult.error);

      // Return error with helpful message
      return NextResponse.json(
        {
          success: false,
          error: depositResult.error || "Deposit failed",
          details: "For demo: Make sure DEFINDEX_VAULT_ADDRESS is set correctly",
        },
        { status: 500 }
      );
    }

    console.log("✅ Deposit successful!");
    console.log(`   TX Hash: ${depositResult.transactionHash}`);

    // Step 5: Get updated balance
    const balance = await defindexService.getUserVaultBalance(DEMO_USER_ID);

    // Return success response
    return NextResponse.json({
      success: true,
      transactionHash: depositResult.transactionHash,
      stellarPublicKey: wallet.stellarPublicKey,
      depositedAmount: amount,
      vaultShares: depositResult.returnValue,
      totalBalance: DefindexService.stroopsToAmount(balance.balance || 0),
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${depositResult.transactionHash}`,
    });
  } catch (error) {
    console.error("❌ Demo deposit error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        isDemo: true,
        hint: "This is a demo endpoint. Check backend logs for details.",
      },
      { status: 500 }
    );
  }
}
