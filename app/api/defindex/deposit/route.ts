/**
 * POST /api/defindex/deposit
 *
 * Build a deposit transaction for the user to sign.
 * Returns unsigned XDR that must be signed via MiniKit.
 */

import { NextRequest, NextResponse } from "next/server";
import { initializeDefindexService } from "@/lib/services/defindex.service";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userPublicKey, amount, slippageBps, invest } = body;

    // Validate required fields
    if (!userPublicKey) {
      return NextResponse.json(
        { success: false, error: "userPublicKey is required" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Initialize Defindex service
    const defindexService = initializeDefindexService();

    // Build deposit transaction
    const depositResponse = await defindexService.buildDepositTransaction({
      userPublicKey,
      amount,
      slippageBps,
      invest,
    });

    return NextResponse.json(depositResponse);
  } catch (error) {
    console.error("Error in /api/defindex/deposit:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
