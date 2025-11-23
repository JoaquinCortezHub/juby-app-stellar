/**
 * POST /api/defindex/withdraw
 *
 * Build a withdrawal transaction for the user to sign.
 * Returns unsigned XDR that must be signed via MiniKit.
 */

import { NextRequest, NextResponse } from "next/server";
import { initializeDefindexService } from "@/lib/services/defindex.service";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userPublicKey, shares, slippageBps } = body;

    // Validate required fields
    if (!userPublicKey) {
      return NextResponse.json(
        { success: false, error: "userPublicKey is required" },
        { status: 400 }
      );
    }

    if (!shares || shares <= 0) {
      return NextResponse.json(
        { success: false, error: "shares must be greater than 0" },
        { status: 400 }
      );
    }

    // Initialize Defindex service
    const defindexService = initializeDefindexService();

    // Build withdrawal transaction
    const withdrawResponse = await defindexService.buildWithdrawTransaction({
      userPublicKey,
      shares,
      slippageBps,
    });

    return NextResponse.json(withdrawResponse);
  } catch (error) {
    console.error("Error in /api/defindex/withdraw:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
