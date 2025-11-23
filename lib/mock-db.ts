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

export interface MockDeposit {
  id: string;
  userId: string;
  stellarWalletId: string;
  worldchainTxHash: string | null;
  cctpAttestation: string | null;
  bridgeStatus: string;
  stellarMintTx: string | null;
  defindexDepositTx: string | null;
  amountUsdc: bigint;
  vaultShares: bigint | null;
  slippageBps: number;
  initiatedAt: Date;
  completedAt: Date | null;
}

export interface MockVaultBalance {
  id: string;
  userId: string;
  stellarWalletId: string;
  vaultAddress: string;
  totalDeposited: bigint;
  vaultShares: bigint;
  lastYieldCheck: Date | null;
  estimatedYield: bigint;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockWithdrawal {
  id: string;
  userId: string;
  stellarWalletId: string;
  amountUsdc: bigint;
  vaultShares: bigint;
  slippageBps: number;
  defindexWithdrawTx: string | null;
  stellarBurnTx: string | null;
  worldchainMintTx: string | null;
  status: string;
  initiatedAt: Date;
  completedAt: Date | null;
}

// In-memory storage
const wallets: Map<string, MockStellarWallet> = new Map();
const deposits: Map<string, MockVaultDeposit[]> = new Map();
const depositRecords: Map<string, MockDeposit> = new Map();
const vaultBalances: Map<string, MockVaultBalance> = new Map();
const withdrawalRecords: Map<string, MockWithdrawal> = new Map();

let walletIdCounter = 1;
let depositIdCounter = 1;
let depositRecordIdCounter = 1;
let vaultBalanceIdCounter = 1;
let withdrawalIdCounter = 1;

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

  deposit: {
    create: async (params: {
      data: {
        userId: string;
        stellarWalletId: string;
        worldchainTxHash?: string | null;
        cctpAttestation?: string | null;
        bridgeStatus: string;
        stellarMintTx?: string | null;
        defindexDepositTx?: string | null;
        amountUsdc: bigint;
        vaultShares?: bigint | null;
        slippageBps: number;
        completedAt?: Date | null;
      };
    }) => {
      const deposit: MockDeposit = {
        id: `deposit-record-${depositRecordIdCounter++}`,
        userId: params.data.userId,
        stellarWalletId: params.data.stellarWalletId,
        worldchainTxHash: params.data.worldchainTxHash ?? null,
        cctpAttestation: params.data.cctpAttestation ?? null,
        bridgeStatus: params.data.bridgeStatus,
        stellarMintTx: params.data.stellarMintTx ?? null,
        defindexDepositTx: params.data.defindexDepositTx ?? null,
        amountUsdc: params.data.amountUsdc,
        vaultShares: params.data.vaultShares ?? null,
        slippageBps: params.data.slippageBps,
        initiatedAt: new Date(),
        completedAt: params.data.completedAt ?? null,
      };

      depositRecords.set(deposit.id, deposit);
      return deposit;
    },

    findMany: async (params?: { where?: { userId?: string } }) => {
      if (!params?.where?.userId) {
        return Array.from(depositRecords.values());
      }
      return Array.from(depositRecords.values()).filter(
        (d) => d.userId === params?.where?.userId
      );
    },
  },

  vaultBalance: {
    findUnique: async (params: { where: { userId: string } }) => {
      const balance = Array.from(vaultBalances.values()).find(
        (b) => b.userId === params.where.userId
      );
      return balance || null;
    },

    create: async (params: {
      data: {
        userId: string;
        stellarWalletId: string;
        vaultAddress: string;
        totalDeposited: bigint;
        vaultShares: bigint;
        lastYieldCheck?: Date | null;
        estimatedYield?: bigint;
      };
    }) => {
      const balance: MockVaultBalance = {
        id: `vault-balance-${vaultBalanceIdCounter++}`,
        userId: params.data.userId,
        stellarWalletId: params.data.stellarWalletId,
        vaultAddress: params.data.vaultAddress,
        totalDeposited: params.data.totalDeposited,
        vaultShares: params.data.vaultShares,
        lastYieldCheck: params.data.lastYieldCheck ?? null,
        estimatedYield: params.data.estimatedYield ?? BigInt(0),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vaultBalances.set(balance.id, balance);
      return balance;
    },

    update: async (params: {
      where: { userId: string };
      data: {
        totalDeposited?: { increment: bigint } | { decrement: bigint } | bigint;
        vaultShares?: { increment: bigint } | { decrement: bigint } | bigint;
        updatedAt?: Date;
      };
    }) => {
      const balance = Array.from(vaultBalances.values()).find(
        (b) => b.userId === params.where.userId
      );

      if (!balance) {
        throw new Error(`Vault balance for user ${params.where.userId} not found`);
      }

      // Handle increment/decrement operations
      if (params.data.totalDeposited) {
        if (typeof params.data.totalDeposited === 'object' && 'increment' in params.data.totalDeposited) {
          balance.totalDeposited += params.data.totalDeposited.increment;
        } else if (typeof params.data.totalDeposited === 'object' && 'decrement' in params.data.totalDeposited) {
          balance.totalDeposited -= params.data.totalDeposited.decrement;
        } else {
          balance.totalDeposited = params.data.totalDeposited as bigint;
        }
      }

      if (params.data.vaultShares) {
        if (typeof params.data.vaultShares === 'object' && 'increment' in params.data.vaultShares) {
          balance.vaultShares += params.data.vaultShares.increment;
        } else if (typeof params.data.vaultShares === 'object' && 'decrement' in params.data.vaultShares) {
          balance.vaultShares -= params.data.vaultShares.decrement;
        } else {
          balance.vaultShares = params.data.vaultShares as bigint;
        }
      }

      balance.updatedAt = new Date();
      return balance;
    },

    upsert: async (params: {
      where: { userId: string };
      create: {
        userId: string;
        stellarWalletId: string;
        vaultAddress: string;
        totalDeposited: bigint;
        vaultShares: bigint;
      };
      update: {
        totalDeposited?: { increment: bigint };
        vaultShares?: { increment: bigint };
      };
    }) => {
      const existing = Array.from(vaultBalances.values()).find(
        (b) => b.userId === params.where.userId
      );

      if (existing) {
        // Update
        if (params.update.totalDeposited?.increment) {
          existing.totalDeposited += params.update.totalDeposited.increment;
        }
        if (params.update.vaultShares?.increment) {
          existing.vaultShares += params.update.vaultShares.increment;
        }
        existing.updatedAt = new Date();
        return existing;
      } else {
        // Create
        const balance: MockVaultBalance = {
          id: `vault-balance-${vaultBalanceIdCounter++}`,
          userId: params.create.userId,
          stellarWalletId: params.create.stellarWalletId,
          vaultAddress: params.create.vaultAddress,
          totalDeposited: params.create.totalDeposited,
          vaultShares: params.create.vaultShares,
          lastYieldCheck: null,
          estimatedYield: BigInt(0),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        vaultBalances.set(balance.id, balance);
        return balance;
      }
    },
  },

  withdrawal: {
    create: async (params: {
      data: {
        userId: string;
        stellarWalletId: string;
        amountUsdc: bigint;
        vaultShares: bigint;
        slippageBps: number;
        defindexWithdrawTx: string | null;
        completedAt?: Date | null;
      };
    }) => {
      const withdrawal: MockWithdrawal = {
        id: `withdrawal-${withdrawalIdCounter++}`,
        userId: params.data.userId,
        stellarWalletId: params.data.stellarWalletId,
        amountUsdc: params.data.amountUsdc,
        vaultShares: params.data.vaultShares,
        slippageBps: params.data.slippageBps,
        defindexWithdrawTx: params.data.defindexWithdrawTx,
        stellarBurnTx: null,
        worldchainMintTx: null,
        status: 'INITIATED',
        initiatedAt: new Date(),
        completedAt: params.data.completedAt ?? null,
      };

      withdrawalRecords.set(withdrawal.id, withdrawal);
      return withdrawal;
    },

    findMany: async (params?: { where?: { userId?: string } }) => {
      if (!params?.where?.userId) {
        return Array.from(withdrawalRecords.values());
      }
      return Array.from(withdrawalRecords.values()).filter(
        (w) => w.userId === params?.where?.userId
      );
    },
  },
};

/**
 * Reset all in-memory data (useful for testing)
 */
export function resetMockDatabase() {
  wallets.clear();
  deposits.clear();
  depositRecords.clear();
  vaultBalances.clear();
  withdrawalRecords.clear();
  walletIdCounter = 1;
  depositIdCounter = 1;
  depositRecordIdCounter = 1;
  vaultBalanceIdCounter = 1;
  withdrawalIdCounter = 1;
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
    depositRecords: depositRecords.size,
    vaultBalances: vaultBalances.size,
    users: deposits.size,
  };
}
