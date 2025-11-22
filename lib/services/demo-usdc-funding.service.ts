/**
 * Demo Token Funding Service
 *
 * Utility for funding demo/test wallets with testnet tokens on Stellar testnet.
 * Uses Soroban's requestAirdrop() to get testnet XLM automatically.
 *
 * Note: Currently configured for XLM deposits to match the Defindex vault configuration.
 * The vault CDM7U3IQTUE65ZUFOBLV7NI46GYHNBSXAYAXJ3W3EK4Z7S2RE2EYIBDW accepts XLM deposits.
 *
 * IMPORTANT: Only use on testnet! Not for production.
 */

import { rpc } from "@stellar/stellar-sdk";

// ========================================
// TYPES
// ========================================

export interface FundingResult {
  success: boolean;
  airdropTxHash?: string;
  error?: string;
}

// ========================================
// DEMO USDC FUNDING SERVICE
// ========================================

export class DemoUsdcFundingService {
  private sorobanServer: rpc.Server;
  private usdcContractId: string;

  constructor() {
    // Initialize Soroban RPC server (testnet)
    const sorobanUrl =
      process.env.STELLAR_SOROBAN_URL || "https://soroban-testnet.stellar.org";
    this.sorobanServer = new rpc.Server(sorobanUrl);

    // Use testnet XLM contract (matches the Defindex vault configuration)
    // The current vault accepts XLM deposits, which can be obtained via requestAirdrop()
    this.usdcContractId =
      process.env.USDC_STELLAR_ADDRESS ||
      "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

    console.log(`✅ Demo token funding service initialized`);
    console.log(`   Token Contract (XLM): ${this.usdcContractId}`);
  }

  /**
   * Fund a wallet with testnet tokens using Soroban airdrop
   *
   * On Soroban testnet, requestAirdrop() automatically:
   * 1. Funds the account with XLM
   * 2. Adds necessary contract authorizations
   * 3. Provides testnet tokens
   *
   * @param targetPublicKey - Stellar public key to fund
   * @returns Funding result
   */
  async fundWalletWithAirdrop(
    targetPublicKey: string
  ): Promise<FundingResult> {
    try {
      console.log(`💵 Requesting airdrop for ${targetPublicKey}...`);

      // Request airdrop from Soroban testnet
      // This automatically funds the account with XLM and sets up for Soroban usage
      await this.sorobanServer.requestAirdrop(targetPublicKey);

      console.log(`✅ Airdrop completed successfully`);

      return {
        success: true,
        airdropTxHash: "airdrop-success",
      };
    } catch (error) {
      console.error("Error requesting airdrop:", error);

      // Check if account already exists
      if (error instanceof Error && error.message.includes("createAccountAlreadyExist")) {
        console.log(`   ℹ️  Account already funded`);
        return {
          success: true,
          airdropTxHash: "already-exists",
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get USDC contract ID
   */
  getUsdcContractId(): string {
    return this.usdcContractId;
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

let demoUsdcFundingServiceInstance: DemoUsdcFundingService | null = null;

/**
 * Get or create the singleton DemoUsdcFundingService instance
 */
export function getDemoUsdcFundingService(): DemoUsdcFundingService {
  if (!demoUsdcFundingServiceInstance) {
    demoUsdcFundingServiceInstance = new DemoUsdcFundingService();
  }
  return demoUsdcFundingServiceInstance;
}
