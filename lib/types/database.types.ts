/**
 * Database Model Types
 *
 * These types mirror the Prisma schema but can be used independently
 * of Prisma Client, allowing the app to work with mock or real database.
 */

export interface StellarWallet {
  id: string;
  userId: string;
  stellarPublicKey: string;
  encryptedSecretKey: string;
  encryptionIv: string;
  encryptionTag: string;
  createdAt: Date;
  lastUsed: Date | null;
}

export interface Deposit {
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

export interface VaultBalance {
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

export interface Withdrawal {
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

export interface VaultDeposit {
  id: string;
  userId: string;
  stellarPublicKey: string;
  amount: number;
  transactionHash: string;
  vaultShares: string;
  createdAt: Date;
}

export interface CrossmintWallet {
  id: string;
  userId: string;
  stellarAddress: string;
  email: string;
  crossmintOwnerLocator: string;
  walletAlias: string | null;
  createdAt: Date;
  lastUsed: Date | null;
}
