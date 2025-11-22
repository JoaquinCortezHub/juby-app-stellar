/**
 * In-memory database mock for hackathon demo
 * Replaces Prisma/Supabase with simple in-memory storage
 */

export interface MockStellarWallet {
  id: string;
  userId: string;
  stellarPublicKey: string;
  encryptedSecretKey: string;
  encryptionIv: string;
  encryptionTag: string;
  createdAt: Date;
  lastUsed: Date | null;
}

export interface MockVaultDeposit {
  id: string;
  userId: string;
  stellarPublicKey: string;
  amount: number;
  transactionHash: string;
  vaultShares: string;
  createdAt: Date;
}

// In-memory storage
const wallets: Map<string, MockStellarWallet> = new Map();
const deposits: Map<string, MockVaultDeposit[]> = new Map();

let walletIdCounter = 1;
let depositIdCounter = 1;

/**
 * Mock Prisma client for in-memory database
 */
export const mockPrisma = {
  stellarWallet: {
    findUnique: async (params: { where: { userId: string } }) => {
      const wallet = Array.from(wallets.values()).find(
        (w) => w.userId === params.where.userId
      );
      return wallet || null;
    },

    create: async (params: {
      data: {
        userId: string;
        stellarPublicKey: string;
        encryptedSecretKey: string;
        encryptionIv: string;
        encryptionTag: string;
      };
    }) => {
      const wallet: MockStellarWallet = {
        id: `wallet-${walletIdCounter++}`,
        userId: params.data.userId,
        stellarPublicKey: params.data.stellarPublicKey,
        encryptedSecretKey: params.data.encryptedSecretKey,
        encryptionIv: params.data.encryptionIv,
        encryptionTag: params.data.encryptionTag,
        createdAt: new Date(),
        lastUsed: null,
      };

      wallets.set(wallet.id, wallet);
      return wallet;
    },

    update: async (params: {
      where: { id: string };
      data: { lastUsed?: Date };
    }) => {
      const wallet = wallets.get(params.where.id);
      if (!wallet) {
        throw new Error(`Wallet ${params.where.id} not found`);
      }

      if (params.data.lastUsed) {
        wallet.lastUsed = params.data.lastUsed;
      }

      return wallet;
    },

    findMany: async (params?: { select?: { stellarPublicKey: boolean } }) => {
      return Array.from(wallets.values());
    },
  },

  vaultDeposit: {
    create: async (params: {
      data: {
        userId: string;
        stellarPublicKey: string;
        amount: number;
        transactionHash: string;
        vaultShares: string;
      };
    }) => {
      const deposit: MockVaultDeposit = {
        id: `deposit-${depositIdCounter++}`,
        userId: params.data.userId,
        stellarPublicKey: params.data.stellarPublicKey,
        amount: params.data.amount,
        transactionHash: params.data.transactionHash,
        vaultShares: params.data.vaultShares,
        createdAt: new Date(),
      };

      const userDeposits = deposits.get(params.data.userId) || [];
      userDeposits.push(deposit);
      deposits.set(params.data.userId, userDeposits);

      return deposit;
    },

    findMany: async (params: { where: { userId: string } }) => {
      return deposits.get(params.where.userId) || [];
    },
  },
};

/**
 * Reset all in-memory data (useful for testing)
 */
export function resetMockDatabase() {
  wallets.clear();
  deposits.clear();
  walletIdCounter = 1;
  depositIdCounter = 1;
}

/**
 * Get stats about mock database
 */
export function getMockDatabaseStats() {
  return {
    wallets: wallets.size,
    deposits: Array.from(deposits.values()).reduce(
      (sum, arr) => sum + arr.length,
      0
    ),
    users: deposits.size,
  };
}
