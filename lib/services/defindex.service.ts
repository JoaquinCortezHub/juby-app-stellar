/**
 * Defindex Service
 *
 * Handles all interactions with Defindex vaults on Stellar network.
 * Provides methods for depositing USDC into vaults, querying balances,
 * and managing vault operations.
 */

import DefindexSDK, { SupportedNetworks } from "@defindex/sdk";
import { TransactionBuilder, Networks } from "@stellar/stellar-sdk";
import { getStellarWalletService } from "./stellar-wallet.service";
import prisma from "@/lib/prisma";

// ========================================
// ENUMS
// ========================================

export enum BridgeStatus {
  INITIATED = "INITIATED",
  ATTESTED = "ATTESTED",
  MINTED = "MINTED",
  DEPOSITED = "DEPOSITED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// ========================================
// TYPES
// ========================================

export interface DefindexConfig {
  apiKey?: string;
  vaultAddress: string;
  network: SupportedNetworks;
  defaultSlippageBps: number;
  autoInvest: boolean;
}

export interface DepositParams {
  userPublicKey: string;
  amount: number; // Amount in stroops (7 decimals for USDC)
  slippageBps?: number; // Optional, defaults to config
  invest?: boolean; // Optional, defaults to config
}

export interface DepositResponse {
  success: boolean;
  xdr: string; // Unsigned transaction XDR for user to sign
  vaultAddress: string;
  amount: number;
  slippageBps: number;
}

export interface SubmitTransactionParams {
  signedXdr: string;
}

export interface SubmitTransactionResponse {
  success: boolean;
  transactionHash: string;
  returnValue?: any;
  error?: string;
}

export interface VaultBalanceResponse {
  success: boolean;
  userPublicKey: string;
  vaultAddress: string;
  balance?: number;
  vaultShares?: number;
  error?: string;
}

export interface WithdrawParams {
  userPublicKey: string;
  shares: number; // Number of vault shares to withdraw
  slippageBps?: number; // Optional, defaults to config
}

export interface WithdrawResponse {
  success: boolean;
  xdr: string; // Unsigned transaction XDR for user to sign
  vaultAddress: string;
  shares: number;
  slippageBps: number;
}

// ========================================
// DEFINDEX SERVICE CLASS
// ========================================

export class DefindexService {
  private sdk: DefindexSDK;
  private config: DefindexConfig;

  constructor(config: DefindexConfig) {
    this.config = config;
    this.sdk = new DefindexSDK({
      apiKey: config.apiKey,
    });
  }

  /**
   * Build a deposit transaction for user to sign
   *
   * This method creates an unsigned transaction XDR that the user
   * must sign with their private key (via MiniKit on frontend).
   *
   * @param params - Deposit parameters
   * @returns Unsigned transaction XDR and metadata
   */
  async buildDepositTransaction(
    params: DepositParams
  ): Promise<DepositResponse> {
    try {
      const slippageBps = params.slippageBps ?? this.config.defaultSlippageBps;
      const invest = params.invest ?? this.config.autoInvest;

      // Validate amount
      if (params.amount <= 0) {
        throw new Error("Deposit amount must be greater than 0");
      }

      // Validate public key format (basic check)
      if (!params.userPublicKey.startsWith("G") || params.userPublicKey.length !== 56) {
        throw new Error("Invalid Stellar public key format");
      }

      console.log("Building deposit transaction:", {
        vaultAddress: this.config.vaultAddress,
        caller: params.userPublicKey,
        amount: params.amount,
        slippageBps,
        invest,
        network: this.config.network,
      });

      // Build deposit transaction using Defindex SDK
      const depositResponse = await this.sdk.depositToVault(
        this.config.vaultAddress,
        {
          caller: params.userPublicKey,
          amounts: [params.amount],
          slippageBps,
          invest,
        },
        this.config.network
      );

      if (!depositResponse.xdr) {
        throw new Error("Failed to build deposit transaction: No XDR returned");
      }

      return {
        success: true,
        xdr: depositResponse.xdr,
        vaultAddress: this.config.vaultAddress,
        amount: params.amount,
        slippageBps,
      };
    } catch (error) {
      console.error("Error building deposit transaction:", error);
      throw new Error(
        `Failed to build deposit transaction: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Submit a signed transaction to the Stellar network
   *
   * @param params - Signed transaction XDR
   * @returns Transaction result with hash and return value
   */
  async submitTransaction(
    params: SubmitTransactionParams
  ): Promise<SubmitTransactionResponse> {
    try {
      console.log("Submitting signed transaction to Stellar network...");

      // Submit the signed transaction via Defindex SDK
      const txResponse = await this.sdk.sendTransaction(
        params.signedXdr,
        this.config.network
      );

      // Handle different response types
      const transactionHash = 'hash' in txResponse ? txResponse.hash : txResponse.txHash;

      console.log("Transaction submitted successfully:", {
        hash: transactionHash,
        returnValue: txResponse.returnValue,
      });

      return {
        success: true,
        transactionHash,
        returnValue: txResponse.returnValue,
      };
    } catch (error) {
      console.error("Error submitting transaction:", error);
      return {
        success: false,
        transactionHash: "",
        error:
          error instanceof Error ? error.message : "Failed to submit transaction",
      };
    }
  }

  /**
   * Build a withdrawal transaction for user to sign
   *
   * This method creates an unsigned transaction XDR that the user
   * must sign with their private key (via MiniKit on frontend).
   * The withdrawal burns vault shares and returns underlying assets.
   *
   * @param params - Withdrawal parameters
   * @returns Unsigned transaction XDR and metadata
   */
  async buildWithdrawTransaction(
    params: WithdrawParams
  ): Promise<WithdrawResponse> {
    try {
      const slippageBps = params.slippageBps ?? this.config.defaultSlippageBps;

      // Validate shares amount
      if (params.shares <= 0) {
        throw new Error("Withdrawal shares must be greater than 0");
      }

      // Validate public key format (basic check)
      if (!params.userPublicKey.startsWith("G") || params.userPublicKey.length !== 56) {
        throw new Error("Invalid Stellar public key format");
      }

      console.log("Building withdrawal transaction:", {
        vaultAddress: this.config.vaultAddress,
        caller: params.userPublicKey,
        shares: params.shares,
        slippageBps,
        network: this.config.network,
      });

      // Build withdrawal transaction using Defindex SDK
      const withdrawResponse = await this.sdk.withdrawShares(
        this.config.vaultAddress,
        {
          caller: params.userPublicKey,
          shares: params.shares,
          slippageBps,
        },
        this.config.network
      );

      if (!withdrawResponse.xdr) {
        throw new Error("Failed to build withdrawal transaction: No XDR returned");
      }

      return {
        success: true,
        xdr: withdrawResponse.xdr,
        vaultAddress: this.config.vaultAddress,
        shares: params.shares,
        slippageBps,
      };
    } catch (error) {
      console.error("Error building withdrawal transaction:", error);
      throw new Error(
        `Failed to build withdrawal transaction: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get user's balance in the vault
   *
   * Note: This is a placeholder. Actual implementation would query
   * the vault contract directly using Stellar SDK.
   *
   * @param userPublicKey - User's Stellar public key
   * @returns Vault balance information
   */
  async getVaultBalance(
    userPublicKey: string
  ): Promise<VaultBalanceResponse> {
    try {
      // TODO: Implement actual vault balance query
      // This would typically involve:
      // 1. Query vault contract for user's shares
      // 2. Query vault contract for total assets
      // 3. Calculate user's balance from shares

      console.log("Querying vault balance for user:", userPublicKey);

      return {
        success: true,
        userPublicKey,
        vaultAddress: this.config.vaultAddress,
        balance: 0, // Placeholder
        vaultShares: 0, // Placeholder
      };
    } catch (error) {
      console.error("Error querying vault balance:", error);
      return {
        success: false,
        userPublicKey,
        vaultAddress: this.config.vaultAddress,
        error:
          error instanceof Error
            ? error.message
            : "Failed to query vault balance",
      };
    }
  }

  /**
   * Helper: Convert amount from human-readable to stroops
   *
   * USDC on Stellar has 7 decimals, so 1 USDC = 10000000 stroops
   *
   * @param amount - Human-readable amount (e.g., 100.5)
   * @returns Amount in stroops
   */
  static amountToStroops(amount: number): number {
    return Math.floor(amount * 10000000);
  }

  /**
   * Helper: Convert amount from stroops to human-readable
   *
   * @param stroops - Amount in stroops
   * @returns Human-readable amount
   */
  static stroopsToAmount(stroops: number): number {
    return stroops / 10000000;
  }

  // ========================================
  // CUSTODIAL METHODS (Backend Signs)
  // ========================================

  /**
   * Deposit to vault with backend signing (custodial)
   *
   * This method handles the entire deposit flow:
   * 1. Get user's Stellar address
   * 2. Build deposit transaction
   * 3. Sign with backend-managed key
   * 4. Submit to Stellar network
   * 5. Record in database
   *
   * @param userId - User identifier (World ID)
   * @param amount - Amount in stroops
   * @param slippageBps - Optional slippage tolerance
   * @param invest - Optional, whether to auto-invest (defaults to config)
   * @returns Transaction result
   */
  async depositForUser(
    userId: string,
    amount: number,
    slippageBps?: number,
    invest?: boolean
  ): Promise<SubmitTransactionResponse> {
    try {
      const walletService = getStellarWalletService();

      // Get user's Stellar address
      const stellarWallet = await walletService.getUserWallet(userId);
      const stellarPublicKey = stellarWallet.stellarPublicKey;

      console.log(`💰 Depositing ${DefindexService.stroopsToAmount(amount)} USDC for user ${userId}`);
      console.log(`   Stellar address: ${stellarPublicKey}`);

      // Build deposit transaction
      const depositResponse = await this.buildDepositTransaction({
        userPublicKey: stellarPublicKey,
        amount,
        slippageBps,
        invest,
      });

      console.log(`   Transaction built, now signing with backend key...`);

      // Sign transaction with backend-managed key
      const signedXdr = await walletService.signTransactionForUser(
        userId,
        depositResponse.xdr
      );

      console.log(`   Transaction signed, submitting to Stellar...`);

      // Submit to Stellar network
      const submitResponse = await this.submitTransaction({ signedXdr });

      if (!submitResponse.success) {
        throw new Error(submitResponse.error || "Failed to submit transaction");
      }

      console.log(`✅ Deposit successful! TX: ${submitResponse.transactionHash}`);

      // Extract vault shares from return value
      // Return value format: [ [amounts], totalShares, null ]
      let vaultShares: string | undefined;
      if (Array.isArray(submitResponse.returnValue) && submitResponse.returnValue.length >= 2) {
        vaultShares = String(submitResponse.returnValue[1]);
      }

      // Record in database
      await this.recordDeposit({
        userId,
        stellarWalletId: stellarWallet.id,
        amount,
        slippageBps: depositResponse.slippageBps,
        defindexDepositTx: submitResponse.transactionHash,
        vaultShares,
      });

      return submitResponse;
    } catch (error) {
      console.error("Error in depositForUser:", error);
      return {
        success: false,
        transactionHash: "",
        error: error instanceof Error ? error.message : "Failed to deposit",
      };
    }
  }

  /**
   * Record deposit in database
   *
   * @param params - Deposit details
   */
  private async recordDeposit(params: {
    userId: string;
    stellarWalletId: string;
    amount: number;
    slippageBps: number;
    defindexDepositTx: string;
    vaultShares?: any;
  }): Promise<void> {
    // Create deposit record
    await prisma.deposit.create({
      data: {
        userId: params.userId,
        stellarWalletId: params.stellarWalletId,
        amountUsdc: BigInt(params.amount),
        slippageBps: params.slippageBps,
        bridgeStatus: BridgeStatus.DEPOSITED, // Skip bridge steps for now
        defindexDepositTx: params.defindexDepositTx,
        vaultShares: params.vaultShares ? BigInt(params.vaultShares) : null,
        completedAt: new Date(),
      },
    });

    // Update vault balance
    await prisma.vaultBalance.upsert({
      where: { userId: params.userId },
      create: {
        userId: params.userId,
        stellarWalletId: params.stellarWalletId,
        vaultAddress: this.config.vaultAddress,
        totalDeposited: BigInt(params.amount),
        vaultShares: params.vaultShares ? BigInt(params.vaultShares) : BigInt(0),
      },
      update: {
        totalDeposited: {
          increment: BigInt(params.amount),
        },
        vaultShares: params.vaultShares
          ? { increment: BigInt(params.vaultShares) }
          : undefined,
        updatedAt: new Date(),
      },
    });

    console.log(`📝 Recorded deposit in database`);
  }

  /**
   * Get user's vault balance from database
   *
   * @param userId - User identifier
   * @returns Vault balance information
   */
  async getUserVaultBalance(userId: string): Promise<VaultBalanceResponse> {
    try {
      const walletService = getStellarWalletService();
      const stellarPublicKey = await walletService.getUserStellarAddress(userId);

      const vaultBalance = await prisma.vaultBalance.findUnique({
        where: { userId },
      });

      if (!vaultBalance) {
        return {
          success: true,
          userPublicKey: stellarPublicKey,
          vaultAddress: this.config.vaultAddress,
          balance: 0,
          vaultShares: 0,
        };
      }

      return {
        success: true,
        userPublicKey: stellarPublicKey,
        vaultAddress: this.config.vaultAddress,
        balance: Number(vaultBalance.totalDeposited),
        vaultShares: Number(vaultBalance.vaultShares),
      };
    } catch (error) {
      console.error("Error getting user vault balance:", error);
      return {
        success: false,
        userPublicKey: "",
        vaultAddress: this.config.vaultAddress,
        error: error instanceof Error ? error.message : "Failed to get balance",
      };
    }
  }

  /**
   * Withdraw from vault with backend signing (custodial)
   *
   * This method handles the entire withdrawal flow:
   * 1. Get user's Stellar address and vault shares
   * 2. Build withdrawal transaction
   * 3. Sign with backend-managed key
   * 4. Submit to Stellar network
   * 5. Record in database
   *
   * @param userId - User identifier (World ID)
   * @param shares - Number of vault shares to withdraw
   * @param slippageBps - Optional slippage tolerance
   * @returns Transaction result
   */
  async withdrawForUser(
    userId: string,
    shares: number,
    slippageBps?: number
  ): Promise<SubmitTransactionResponse> {
    try {
      const walletService = getStellarWalletService();

      // Get user's Stellar address
      const stellarWallet = await walletService.getUserWallet(userId);
      const stellarPublicKey = stellarWallet.stellarPublicKey;

      console.log(`💸 Withdrawing ${shares} shares for user ${userId}`);
      console.log(`   Stellar address: ${stellarPublicKey}`);

      // Check user's vault balance
      const vaultBalance = await prisma.vaultBalance.findUnique({
        where: { userId },
      });

      if (!vaultBalance || Number(vaultBalance.vaultShares) < shares) {
        throw new Error("Insufficient vault shares for withdrawal");
      }

      // Build withdrawal transaction
      const withdrawResponse = await this.buildWithdrawTransaction({
        userPublicKey: stellarPublicKey,
        shares,
        slippageBps,
      });

      console.log(`   Transaction built, now signing with backend key...`);

      // Sign transaction with backend-managed key
      const signedXdr = await walletService.signTransactionForUser(
        userId,
        withdrawResponse.xdr
      );

      console.log(`   Transaction signed, submitting to Stellar...`);

      // Submit to Stellar network
      const submitResponse = await this.submitTransaction({ signedXdr });

      if (!submitResponse.success) {
        throw new Error(submitResponse.error || "Failed to submit transaction");
      }

      console.log(`✅ Withdrawal successful! TX: ${submitResponse.transactionHash}`);

      // Extract withdrawn amounts from return value
      // Return value format: [ [amounts] ]
      let withdrawnAmounts: any = null;
      if (Array.isArray(submitResponse.returnValue) && submitResponse.returnValue.length >= 1) {
        withdrawnAmounts = submitResponse.returnValue[0];
      }

      // Record in database
      await this.recordWithdrawal({
        userId,
        stellarWalletId: stellarWallet.id,
        shares,
        slippageBps: withdrawResponse.slippageBps,
        defindexWithdrawTx: submitResponse.transactionHash,
        withdrawnAmounts,
      });

      return submitResponse;
    } catch (error) {
      console.error("Error in withdrawForUser:", error);
      return {
        success: false,
        transactionHash: "",
        error: error instanceof Error ? error.message : "Failed to withdraw",
      };
    }
  }

  /**
   * Record withdrawal in database
   *
   * @param params - Withdrawal details
   */
  private async recordWithdrawal(params: {
    userId: string;
    stellarWalletId: string;
    shares: number;
    slippageBps: number;
    defindexWithdrawTx: string;
    withdrawnAmounts?: any;
  }): Promise<void> {
    // Calculate amount withdrawn (first amount in the array for single-asset vaults)
    let amountWithdrawn = BigInt(0);
    if (Array.isArray(params.withdrawnAmounts) && params.withdrawnAmounts.length > 0) {
      amountWithdrawn = BigInt(params.withdrawnAmounts[0]);
    }

    // Create withdrawal record
    await prisma.withdrawal.create({
      data: {
        userId: params.userId,
        stellarWalletId: params.stellarWalletId,
        amountUsdc: amountWithdrawn,
        vaultShares: BigInt(params.shares),
        slippageBps: params.slippageBps,
        defindexWithdrawTx: params.defindexWithdrawTx,
        completedAt: new Date(),
      },
    });

    // Update vault balance
    await prisma.vaultBalance.update({
      where: { userId: params.userId },
      data: {
        vaultShares: {
          decrement: BigInt(params.shares),
        },
        totalDeposited: {
          decrement: amountWithdrawn,
        },
        updatedAt: new Date(),
      },
    });

    console.log(`📝 Recorded withdrawal in database`);
  }

  /**
   * Get current configuration
   */
  getConfig(): DefindexConfig {
    return { ...this.config };
  }
}

// ========================================
// SINGLETON INSTANCE FACTORY
// ========================================

let defindexServiceInstance: DefindexService | null = null;

/**
 * Get or create the singleton Defindex service instance
 *
 * @param config - Optional configuration (required on first call)
 * @returns DefindexService instance
 */
export function getDefindexService(
  config?: DefindexConfig
): DefindexService {
  if (!defindexServiceInstance) {
    if (!config) {
      throw new Error(
        "DefindexService configuration required on first initialization"
      );
    }
    defindexServiceInstance = new DefindexService(config);
  }
  return defindexServiceInstance;
}

/**
 * Initialize the Defindex service with environment variables
 *
 * This should be called once at application startup
 */
export function initializeDefindexService(): DefindexService {
  const config: DefindexConfig = {
    apiKey: process.env.DEFINDEX_API_KEY,
    vaultAddress: process.env.DEFINDEX_VAULT_ADDRESS || "",
    network:
      process.env.STELLAR_NETWORK === "MAINNET"
        ? SupportedNetworks.MAINNET
        : SupportedNetworks.TESTNET,
    defaultSlippageBps: parseInt(
      process.env.DEFAULT_SLIPPAGE_BPS || "500",
      10
    ),
    autoInvest: process.env.AUTO_INVEST === "true",
  };

  // Validate required configuration
  if (!config.vaultAddress) {
    throw new Error("DEFINDEX_VAULT_ADDRESS environment variable is required");
  }

  return getDefindexService(config);
}
