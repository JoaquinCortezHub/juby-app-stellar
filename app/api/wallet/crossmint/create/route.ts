import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCrossmintService } from "@/lib/services/crossmint.service";
import prisma from "@/lib/prisma";

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
    // 1. Verify authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found in session" },
        { status: 400 }
      );
    }

    console.log(`📬 Creating Crossmint wallet for user ${userId} (${userEmail})`);

    // 2. Check if user already has a Crossmint wallet
    const existingCrossmintWallet = await prisma.crossmintWallet.findUnique({
      where: { userId },
    });

    if (existingCrossmintWallet) {
      console.log(`📋 User already has Crossmint wallet: ${existingCrossmintWallet.stellarAddress}`);
      return NextResponse.json({
        success: true,
        wallet: {
          address: existingCrossmintWallet.stellarAddress,
          email: userEmail,
          chainType: "stellar",
          type: "smart",
          createdAt: existingCrossmintWallet.createdAt,
        },
      });
    }

    // 3. Create Crossmint smart wallet
    const crossmintService = getCrossmintService();

    const wallet = await crossmintService.getOrCreateStellarWallet({
      email: userEmail,
      userId: userId,
      alias: `juby-${userId}`,
    });

    // 4. Store wallet in database
    const crossmintWallet = await prisma.crossmintWallet.create({
      data: {
        userId,
        stellarAddress: wallet.address,
        email: userEmail,
        crossmintOwnerLocator: wallet.owner,
        walletAlias: wallet.alias || `juby-${userId}`,
      },
    });

    console.log(`✅ Created and stored Crossmint wallet: ${wallet.address}`);

    // 5. Return wallet details
    return NextResponse.json({
      success: true,
      wallet: {
        address: wallet.address,
        email: userEmail,
        chainType: wallet.chainType,
        type: wallet.type,
        createdAt: crossmintWallet.createdAt,
        signerType: "email",
      },
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
    // 1. Verify authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. Get wallet from database
    const crossmintWallet = await prisma.crossmintWallet.findUnique({
      where: { userId },
    });

    if (!crossmintWallet) {
      return NextResponse.json(
        { error: "Crossmint wallet not found" },
        { status: 404 }
      );
    }

    // 3. Return wallet details
    return NextResponse.json({
      success: true,
      wallet: {
        address: crossmintWallet.stellarAddress,
        email: crossmintWallet.email,
        chainType: "stellar",
        type: "smart",
        createdAt: crossmintWallet.createdAt,
        signerType: "email",
      },
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
