/**
 * POST /api/demo/withdraw
 *
 * Demo withdrawal endpoint - backend signs the transaction (custodial)
 * For hackathon demo purposes only
 */

import { NextRequest, NextResponse } from "next/server";
import { initializeDefindexService, DefindexService } from "@/lib/services/defindex.service";

// Hardcoded demo user ID for hackathon (must match deposit endpoint)
const DEMO_USER_ID = "hackathon-demo-user";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { shares } = body;

    // Validate required fields
    if (!shares || shares <= 0) {
      return NextResponse.json(
        { success: false, error: "shares must be greater than 0" },
        { status: 400 }
      );
    }

    console.log(`🎮 DEMO WITHDRAWAL: ${shares} shares for user ${DEMO_USER_ID}`);

    // Initialize Defindex service
    const defindexService = initializeDefindexService();

    // Perform custodial withdrawal (backend signs)
    const withdrawResult = await defindexService.withdrawForUser(
      DEMO_USER_ID,
      shares
    );

    if (!withdrawResult.success) {
      return NextResponse.json(withdrawResult, { status: 500 });
    }

    // Convert shares to approximate amount for display
    const approximateAmount = DefindexService.stroopsToAmount(shares);

    console.log(`✅ DEMO WITHDRAWAL COMPLETE`);
    console.log(`   Transaction: ${withdrawResult.transactionHash}`);
    console.log(`   Shares withdrawn: ${shares}`);

    return NextResponse.json({
      success: true,
      transactionHash: withdrawResult.transactionHash,
      shares,
      approximateAmount,
      message: "Withdrawal completed successfully",
    });
  } catch (error) {
    console.error("❌ Error in /api/demo/withdraw:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
