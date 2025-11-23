/**
 * Test Crossmint Stellar Smart Wallet Creation
 *
 * This script tests the Crossmint integration by creating a test wallet.
 * Run with: npx tsx scripts/test-crossmint.ts
 */

import * as dotenv from "dotenv";
import { getCrossmintService } from "../lib/services/crossmint.service";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function testCrossmintWallet() {
  console.log("🧪 Testing Crossmint Stellar Smart Wallet Creation");
  console.log("=" .repeat(60));
  console.log("");

  try {
    // Initialize Crossmint service
    const crossmintService = getCrossmintService();
    console.log("✅ Crossmint service initialized");
    console.log("");

    // Test email and user ID
    const testEmail = `test-${Date.now()}@juby.example.com`;
    const testUserId = `test-user-${Date.now()}`;

    console.log("📝 Test Parameters:");
    console.log(`   Email: ${testEmail}`);
    console.log(`   User ID: ${testUserId}`);
    console.log("");

    // Create wallet
    console.log("🔐 Creating Stellar smart wallet...");
    const wallet = await crossmintService.createStellarSmartWallet({
      email: testEmail,
      userId: testUserId,
      alias: `juby-test-${testUserId}`,
    });

    console.log("");
    console.log("✅ SUCCESS! Wallet created:");
    console.log("=" .repeat(60));
    console.log(`   Address: ${wallet.address}`);
    console.log(`   Chain: ${wallet.chainType}`);
    console.log(`   Type: ${wallet.type}`);
    console.log(`   Owner: ${wallet.owner}`);
    console.log(`   Alias: ${wallet.alias}`);
    console.log(`   Created: ${wallet.createdAt}`);
    console.log("");
    console.log("   Signer Configuration:");
    console.log(`   - Type: ${wallet.config.adminSigner.type}`);
    console.log(`   - Locator: ${wallet.config.adminSigner.locator}`);
    console.log("");

    // Test fetching existing wallet
    console.log("📋 Testing wallet retrieval...");
    const existingWallet = await crossmintService.getWalletByEmail(testEmail);

    if (existingWallet) {
      console.log("✅ Successfully retrieved existing wallet");
      console.log(`   Address matches: ${existingWallet.address === wallet.address}`);
    } else {
      console.log("❌ Failed to retrieve wallet");
    }

    console.log("");
    console.log("=" .repeat(60));
    console.log("🎉 Test completed successfully!");
    console.log("");
    console.log("Next steps:");
    console.log("1. Check your Crossmint console for the new wallet");
    console.log("2. Visit http://localhost:3000/bridge to test in the app");
    console.log("3. The wallet can sign transactions via email");
    console.log("");
  } catch (error) {
    console.error("");
    console.error("❌ ERROR:", error);
    console.error("");

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("");

      if (error.message.includes("CROSSMINT_API_KEY")) {
        console.error("💡 Make sure CROSSMINT_API_KEY is set in .env.local");
      }
    }

    process.exit(1);
  }
}

// Run the test
testCrossmintWallet();
