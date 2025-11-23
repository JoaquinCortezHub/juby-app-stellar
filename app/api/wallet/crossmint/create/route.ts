import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/wallet/crossmint/create
 *
 * Creates a Crossmint Stellar smart wallet for the authenticated user.
 * Uses email-based signing for non-custodial control.
 *
 * Flow:
 * 1. Verify user is authenticated via World App
 * 2. Get user's email from session
 * 3. Call Crossmint API to create Stellar smart wallet
 * 4. Store wallet address in database
 * 5. Return wallet details to frontend
 */
export async function POST(req: NextRequest) {
  try {
    // DEMO MODE: Mock everything for testing
    console.log(`🎯 [DEMO] Mock Crossmint wallet creation`);

    // Parse request body to get email if provided
    const body = await req.json();
    const { email } = body;

    // Mock user session
    const mockUserId = "demo-user-" + Date.now();
    const mockUserEmail = email || "demo@example.com";

    console.log(`📬 [DEMO] Creating Crossmint wallet for user ${mockUserId} (${mockUserEmail})`);

    // Mock wallet data
    const mockAddress = `G${Math.random().toString(36).substring(2, 15).toUpperCase()}${Math.random().toString(36).substring(2, 15).toUpperCase()}DEMO`;

    const mockWallet = {
      address: mockAddress,
      email: mockUserEmail,
      chainType: "stellar" as const,
      type: "smart" as const,
      createdAt: new Date(),
      signerType: "email" as const,
    };

    // Store in global mock storage
    if (!(global as any).__mockCrossmintWallets) {
      (global as any).__mockCrossmintWallets = new Map();
    }
    (global as any).__mockCrossmintWallets.set(mockUserId, mockWallet);

    console.log(`✅ [DEMO] Created mock Crossmint wallet: ${mockAddress}`);

    // 5. Return wallet details
    return NextResponse.json({
      success: true,
      wallet: mockWallet,
    });
  } catch (error) {
    console.error("Error creating Crossmint wallet:", error);

    return NextResponse.json(
      {
        error: "Failed to create Crossmint wallet",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wallet/crossmint/create
 *
 * Gets the user's existing Crossmint wallet if it exists.
 */
export async function GET(req: NextRequest) {
  try {
    // DEMO MODE: Mock retrieval
    console.log(`🎯 [DEMO] Mock Crossmint wallet retrieval`);

    // Get from mock storage
    const mockWallets = (global as any).__mockCrossmintWallets as Map<string, any>;

    if (!mockWallets || mockWallets.size === 0) {
      return NextResponse.json(
        { error: "Crossmint wallet not found" },
        { status: 404 }
      );
    }

    // Return first wallet (for demo purposes)
    const wallet = Array.from(mockWallets.values())[0];

    // 3. Return wallet details
    return NextResponse.json({
      success: true,
      wallet: wallet,
    });
  } catch (error) {
    console.error("Error fetching Crossmint wallet:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch Crossmint wallet",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
