-- CreateEnum
CREATE TYPE "BridgeStatus" AS ENUM ('INITIATED', 'ATTESTED', 'MINTED', 'DEPOSITED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('INITIATED', 'WITHDRAWN', 'BRIDGING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "stellar_wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stellar_public_key" VARCHAR(56) NOT NULL,
    "encrypted_secret_key" TEXT NOT NULL,
    "encryption_iv" TEXT NOT NULL,
    "encryption_tag" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used" TIMESTAMP(3),

    CONSTRAINT "stellar_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crossmint_wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stellar_address" VARCHAR(56) NOT NULL,
    "email" TEXT NOT NULL,
    "crossmint_owner_locator" TEXT NOT NULL,
    "wallet_alias" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used" TIMESTAMP(3),

    CONSTRAINT "crossmint_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stellar_wallet_id" TEXT NOT NULL,
    "worldchain_tx_hash" VARCHAR(66),
    "cctp_attestation" TEXT,
    "bridge_status" "BridgeStatus" NOT NULL DEFAULT 'INITIATED',
    "stellar_mint_tx" VARCHAR(64),
    "defindex_deposit_tx" VARCHAR(64),
    "amount_usdc" BIGINT NOT NULL,
    "vault_shares" BIGINT,
    "slippage_bps" INTEGER NOT NULL DEFAULT 500,
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault_balances" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stellar_wallet_id" TEXT NOT NULL,
    "vault_address" VARCHAR(56) NOT NULL,
    "total_deposited" BIGINT NOT NULL DEFAULT 0,
    "vault_shares" BIGINT NOT NULL DEFAULT 0,
    "last_yield_check" TIMESTAMP(3),
    "estimated_yield" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vault_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stellar_wallet_id" TEXT NOT NULL,
    "amount_usdc" BIGINT NOT NULL,
    "vault_shares" BIGINT NOT NULL,
    "slippage_bps" INTEGER NOT NULL DEFAULT 500,
    "defindex_withdraw_tx" VARCHAR(64),
    "stellar_burn_tx" VARCHAR(64),
    "worldchain_mint_tx" VARCHAR(66),
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'INITIATED',
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stellar_wallets_user_id_key" ON "stellar_wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "stellar_wallets_stellar_public_key_key" ON "stellar_wallets"("stellar_public_key");

-- CreateIndex
CREATE INDEX "stellar_wallets_user_id_idx" ON "stellar_wallets"("user_id");

-- CreateIndex
CREATE INDEX "stellar_wallets_stellar_public_key_idx" ON "stellar_wallets"("stellar_public_key");

-- CreateIndex
CREATE UNIQUE INDEX "crossmint_wallets_user_id_key" ON "crossmint_wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "crossmint_wallets_stellar_address_key" ON "crossmint_wallets"("stellar_address");

-- CreateIndex
CREATE INDEX "crossmint_wallets_user_id_idx" ON "crossmint_wallets"("user_id");

-- CreateIndex
CREATE INDEX "crossmint_wallets_stellar_address_idx" ON "crossmint_wallets"("stellar_address");

-- CreateIndex
CREATE INDEX "crossmint_wallets_email_idx" ON "crossmint_wallets"("email");

-- CreateIndex
CREATE UNIQUE INDEX "deposits_defindex_deposit_tx_key" ON "deposits"("defindex_deposit_tx");

-- CreateIndex
CREATE INDEX "deposits_user_id_idx" ON "deposits"("user_id");

-- CreateIndex
CREATE INDEX "deposits_stellar_wallet_id_idx" ON "deposits"("stellar_wallet_id");

-- CreateIndex
CREATE INDEX "deposits_bridge_status_idx" ON "deposits"("bridge_status");

-- CreateIndex
CREATE INDEX "deposits_defindex_deposit_tx_idx" ON "deposits"("defindex_deposit_tx");

-- CreateIndex
CREATE UNIQUE INDEX "vault_balances_user_id_key" ON "vault_balances"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vault_balances_stellar_wallet_id_key" ON "vault_balances"("stellar_wallet_id");

-- CreateIndex
CREATE INDEX "vault_balances_user_id_idx" ON "vault_balances"("user_id");

-- CreateIndex
CREATE INDEX "vault_balances_stellar_wallet_id_idx" ON "vault_balances"("stellar_wallet_id");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawals_defindex_withdraw_tx_key" ON "withdrawals"("defindex_withdraw_tx");

-- CreateIndex
CREATE INDEX "withdrawals_user_id_idx" ON "withdrawals"("user_id");

-- CreateIndex
CREATE INDEX "withdrawals_stellar_wallet_id_idx" ON "withdrawals"("stellar_wallet_id");

-- CreateIndex
CREATE INDEX "withdrawals_status_idx" ON "withdrawals"("status");

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_stellar_wallet_id_fkey" FOREIGN KEY ("stellar_wallet_id") REFERENCES "stellar_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vault_balances" ADD CONSTRAINT "vault_balances_stellar_wallet_id_fkey" FOREIGN KEY ("stellar_wallet_id") REFERENCES "stellar_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_stellar_wallet_id_fkey" FOREIGN KEY ("stellar_wallet_id") REFERENCES "stellar_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
