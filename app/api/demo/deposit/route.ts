/**
 * POST /api/demo/deposit
 *
 * Hackathon demo endpoint: Creates/funds a mock wallet and deposits to Defindex.
 * This is a simplified flow for demonstration purposes.
 */

import { NextRequest, NextResponse } from "next/server";
import { initializeStellarWalletService } from "@/lib/services/stellar-wallet.service";
import { initializeDefindexService, DefindexService } from "@/lib/services/defindex.service";

// Hardcoded demo user - in production this would come from auth
const DEMO_USER_ID = "hackathon-demo-user";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { amount } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    console.log(`🎯 Demo deposit request: ${amount} USDC`);

    // Initialize services
    const walletService = initializeStellarWalletService();
    const defindexService = initializeDefindexService();

    // Step 1: Create or get custodial wallet
    console.log("📦 Creating/getting demo wallet...");
    const wallet = await walletService.createWalletForUser(DEMO_USER_ID);
    console.log(`✅ Wallet: ${wallet.stellarPublicKey}`);

    // Step 2: Fund wallet with testnet XLM (if needed)
    console.log("💰 Funding wallet with testnet XLM...");
    try {
      const fundResponse = await fetch(
        `https://friendbot.stellar.org?addr=${wallet.stellarPublicKey}`
      );
      if (fundResponse.ok) {
        console.log("✅ Wallet funded with XLM");
      }
    } catch (error) {
      console.log("⚠️  Wallet funding skipped (may already be funded)");
    }

    // Step 3: Convert amount to stroops (Stellar's smallest unit)
    const amountStroops = DefindexService.amountToStroops(amount);

    // Step 4: Backend signs and deposits to Defindex
    console.log(`🏦 Depositing ${amount} USDC to Defindex vault...`);

    const depositResult = await defindexService.depositForUser(
      DEMO_USER_ID,
      amountStroops,
      500  // 5% slippage
    );

    if (!depositResult.success) {
      console.error("❌ Deposit failed:", depositResult.error);

      // Return error with helpful message
      return NextResponse.json(
        {
          success: false,
          error: depositResult.error || "Deposit failed",
          details: "For demo: Make sure DEFINDEX_VAULT_ADDRESS is set and you have testnet USDC",
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
