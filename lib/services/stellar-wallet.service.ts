/**
 * Stellar Wallet Service
 *
 * Manages custodial Stellar wallets for users.
 * Backend creates and controls Stellar addresses while users only interact via World App.
 *
 * SECURITY:
 * - Stellar keypairs encrypted with AES-256-GCM
 * - Master encryption key stored in environment
 * - Users never see their Stellar private keys
 */

import { Keypair } from "@stellar/stellar-sdk";
import crypto from "crypto";
// import prisma from "@/lib/prisma"; // DISABLED FOR DEMO
import type { StellarWallet } from "@/lib/types/database.types";

// ========================================
// TYPES
// ========================================

export interface CreateWalletResult {
  userId: string;
  stellarPublicKey: string;
  walletId: string;
}

export interface EncryptedKeyData {
  encrypted: string;
  iv: string;
  tag: string;
}

// ========================================
// STELLAR WALLET SERVICE
// ========================================

export class StellarWalletService {
  private masterKey: Buffer;

  constructor(masterKeyHex?: string) {
    const keyHex = masterKeyHex || process.env.ENCRYPTION_MASTER_KEY;

    if (!keyHex) {
      throw new Error("ENCRYPTION_MASTER_KEY environment variable is required");
    }

    // Validate key length (must be 32 bytes = 64 hex chars)
    if (keyHex.length !== 64) {
      throw new Error(
        "ENCRYPTION_MASTER_KEY must be 32 bytes (64 hex characters). " +
        "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
      );
    }

    this.masterKey = Buffer.from(keyHex, "hex");
  }

  /**
   * Create a new custodial Stellar wallet for a user
   *
   * @param userId - Unique user identifier (e.g., World ID)
   * @returns Stellar public key and wallet ID
   */
  async createWalletForUser(userId: string): Promise<CreateWalletResult> {
    // DEMO MODE: Check in-memory storage
    if (!(global as any).__mockWallets) {
      (global as any).__mockWallets = new Map();
    }
    const mockWallets = (global as any).__mockWallets as Map<string, any>;

    const existing = mockWallets.get(userId);
    if (existing) {
      return {
        userId: existing.userId,
        stellarPublicKey: existing.stellarPublicKey,
        walletId: existing.id,
      };
    }

    // DEMO MODE: Use hardcoded testnet wallet with valid checksum
    // This wallet needs to be funded on testnet via Stellar friendbot
    const DEMO_SECRET_KEY = process.env.DEMO_STELLAR_SECRET_KEY || "SAFQMVRYDPELFSBXYCC2SSSSF47I2AQ6A7JOTM5THVEAUDWXRP6Z2FT3";

    const keypair = Keypair.fromSecret(DEMO_SECRET_KEY);
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();

    // Encrypt the secret key
    const encryptedData = this.encryptSecretKey(secretKey);

    // Store in memory (DEMO MODE)
    const mockWallet = {
      id: `mock-wallet-${Date.now()}`,
      userId,
      stellarPublicKey: publicKey,
      encryptedSecretKey: encryptedData.encrypted,
      encryptionIv: encryptedData.iv,
      encryptionTag: encryptedData.tag,
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    mockWallets.set(userId, mockWallet);

    console.log(`✅ [DEMO] Using hardcoded testnet wallet for user ${userId}: ${publicKey}`);

    return {
      userId: mockWallet.userId,
      stellarPublicKey: mockWallet.stellarPublicKey,
      walletId: mockWallet.id,
    };
  }

  /**
   * Get user's Stellar public key
   *
   * @param userId - User identifier
   * @returns Stellar public key
   */
  async getUserStellarAddress(userId: string): Promise<string> {
    // DEMO MODE: Get from in-memory storage
    const mockWallets = (global as any).__mockWallets as Map<string, any>;
    const wallet = mockWallets?.get(userId);

    if (!wallet) {
      throw new Error(`No Stellar wallet found for user: ${userId}`);
    }

    return wallet.stellarPublicKey;
  }

  /**
   * Get user's Stellar wallet details
   *
   * @param userId - User identifier
   * @returns Full wallet record
   */
  async getUserWallet(userId: string): Promise<StellarWallet> {
    // DEMO MODE: Get from in-memory storage
    const mockWallets = (global as any).__mockWallets as Map<string, any>;
    const wallet = mockWallets?.get(userId);

    if (!wallet) {
      throw new Error(`No Stellar wallet found for user: ${userId}`);
    }

    return wallet as StellarWallet;
  }

  /**
   * Get Stellar Keypair for signing transactions
   * INTERNAL USE ONLY - Never expose to frontend!
   *
   * @param userId - User identifier
   * @returns Stellar Keypair object
   */
  async getKeypairForUser(userId: string): Promise<Keypair> {
    const wallet = await this.getUserWallet(userId);

    // Decrypt the secret key
    const secretKey = this.decryptSecretKey(
      wallet.encryptedSecretKey,
      wallet.encryptionIv,
      wallet.encryptionTag
    );

    // Create Keypair from secret
    const keypair = Keypair.fromSecret(secretKey);

    // DEMO MODE: Update last used in memory
    const mockWallets = (global as any).__mockWallets as Map<string, any>;
    if (mockWallets?.has(userId)) {
      const mockWallet = mockWallets.get(userId);
      mockWallet.lastUsed = new Date();
      mockWallets.set(userId, mockWallet);
    }

    return keypair;
  }

  /**
   * Sign a transaction XDR with user's Stellar key
   * INTERNAL USE ONLY - Backend signs on behalf of user
   *
   * @param userId - User identifier
   * @param xdr - Unsigned transaction XDR
   * @returns Signed transaction XDR
   */
  async signTransactionForUser(userId: string, xdr: string): Promise<string> {
    const { TransactionBuilder, Networks } = await import("@stellar/stellar-sdk");

    const keypair = await this.getKeypairForUser(userId);

    // Parse transaction
    const network = process.env.STELLAR_NETWORK === "MAINNET"
      ? Networks.PUBLIC
      : Networks.TESTNET;

    const transaction = TransactionBuilder.fromXDR(xdr, network);

    // Sign transaction
    transaction.sign(keypair);

    console.log(`✅ Signed transaction for user ${userId}`);

    return transaction.toXDR();
  }

  /**
   * Encrypt a Stellar secret key using AES-256-GCM
   *
   * @param secretKey - Stellar secret key (starts with S)
   * @returns Encrypted data with IV and auth tag
   */
  private encryptSecretKey(secretKey: string): EncryptedKeyData {
    // Generate random IV (12 bytes for GCM)
    const iv = crypto.randomBytes(12);

    // Create cipher
    const cipher = crypto.createCipheriv("aes-256-gcm", this.masterKey, iv);

    // Encrypt
    let encrypted = cipher.update(secretKey, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get authentication tag
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex"),
    };
  }

  /**
   * Decrypt a Stellar secret key using AES-256-GCM
   *
   * @param encrypted - Encrypted secret key
   * @param ivHex - Initialization vector (hex)
   * @param tagHex - Authentication tag (hex)
   * @returns Decrypted Stellar secret key
   */
  private decryptSecretKey(
    encrypted: string,
    ivHex: string,
    tagHex: string
  ): string {
    // Convert hex strings to buffers
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");

    // Create decipher
    const decipher = crypto.createDecipheriv("aes-256-gcm", this.masterKey, iv);
    decipher.setAuthTag(tag);

    // Decrypt
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Check if user has a Stellar wallet
   *
   * @param userId - User identifier
   * @returns true if wallet exists
   */
  async userHasWallet(userId: string): Promise<boolean> {
    // DEMO MODE: Check in-memory storage
    const mockWallets = (global as any).__mockWallets as Map<string, any>;
    return mockWallets?.has(userId) || false;
  }

  /**
   * Get all wallet addresses (for monitoring/admin)
   *
   * @returns List of all Stellar public keys
   */
  async getAllWalletAddresses(): Promise<string[]> {
    // DEMO MODE: Get from in-memory storage
    const mockWallets = (global as any).__mockWallets as Map<string, any>;
    if (!mockWallets) return [];

    return Array.from(mockWallets.values()).map((w: any) => w.stellarPublicKey);
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

let stellarWalletServiceInstance: StellarWalletService | null = null;

/**
 * Get or create the singleton StellarWalletService instance
 *
 * @param masterKeyHex - Optional master key (uses env var if not provided)
 * @returns StellarWalletService instance
 */
export function getStellarWalletService(
  masterKeyHex?: string
): StellarWalletService {
  if (!stellarWalletServiceInstance) {
    stellarWalletServiceInstance = new StellarWalletService(masterKeyHex);
  }
  return stellarWalletServiceInstance;
}

/**
 * Initialize the Stellar wallet service with environment variables
 */
export function initializeStellarWalletService(): StellarWalletService {
  return getStellarWalletService();
}
