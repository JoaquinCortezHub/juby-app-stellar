/**
 * GET /api/defindex/balance?userPublicKey=GXXX...
 *
 * Get user's vault balance and shares.
 */

import { NextRequest, NextResponse } from "next/server";
import { initializeDefindexService } from "@/lib/services/defindex.service";

export async function GET(request: NextRequest) {
  try {
    // Get userPublicKey from query parameters
    const { searchParams } = new URL(request.url);
    const userPublicKey = searchParams.get("userPublicKey");

    // Validate required fields
    if (!userPublicKey) {
      return NextResponse.json(
        { success: false, error: "userPublicKey query parameter is required" },
        { status: 400 }
      );
    }

    // Initialize Defindex service
    const defindexService = initializeDefindexService();

    // Get vault balance
    const balanceResponse = await defindexService.getVaultBalance(userPublicKey);

    if (!balanceResponse.success) {
      return NextResponse.json(balanceResponse, { status: 500 });
    }

    // TODO: Fetch from database for cached balance
    // const dbBalance = await getVaultBalanceFromDb(userPublicKey);

    return NextResponse.json(balanceResponse);
  } catch (error) {
    console.error("Error in /api/defindex/balance:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
