/**
 * GET /api/wallet/address
 *
 * Returns the current user's Stellar wallet address
 */

import { NextResponse } from "next/server";
import { initializeStellarWalletService } from "@/lib/services/stellar-wallet.service";

// Hardcoded demo user - in production this would come from auth
const DEMO_USER_ID = "hackathon-demo-user";

export async function GET() {
  try {
    const walletService = initializeStellarWalletService();

    // Get or create wallet for demo user
    const wallet = await walletService.createWalletForUser(DEMO_USER_ID);

    return NextResponse.json({
      success: true,
      stellarPublicKey: wallet.stellarPublicKey,
    });
  } catch (error) {
    console.error("Error getting wallet address:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
