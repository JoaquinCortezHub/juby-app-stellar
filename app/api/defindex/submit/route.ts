/**
 * POST /api/defindex/submit
 *
 * Submit a user-signed transaction to the Stellar network.
 * Returns transaction hash and result.
 */

import { NextRequest, NextResponse } from "next/server";
import { initializeDefindexService } from "@/lib/services/defindex.service";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { signedXdr } = body;

    // Validate required fields
    if (!signedXdr) {
      return NextResponse.json(
        { success: false, error: "signedXdr is required" },
        { status: 400 }
      );
    }

    // Initialize Defindex service
    const defindexService = initializeDefindexService();

    // Submit signed transaction
    const submitResponse = await defindexService.submitTransaction({
      signedXdr,
    });

    if (!submitResponse.success) {
      return NextResponse.json(submitResponse, { status: 500 });
    }

    // TODO: Store transaction in database
    // await storeDeposit({
    //   userPublicKey: ...,
    //   amount: ...,
    //   transactionHash: submitResponse.transactionHash,
    //   vaultShares: submitResponse.returnValue,
    //   status: 'confirmed'
    // });

    return NextResponse.json(submitResponse);
  } catch (error) {
    console.error("Error in /api/defindex/submit:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
