# Setup Guide - Custodial Defindex Integration

## Quick Setup (5 Minutes)

### 1. Generate Encryption Key

```bash
# Generate a 32-byte encryption key for Stellar keypairs
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add to `.env.local`:

```env
ENCRYPTION_MASTER_KEY=<paste-generated-key-here>
```

### 2. Set Up Supabase Database

#### Option A: Use Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **Settings** > **Database**
3. Copy the **Connection String** (URI mode)
4. Add to `.env.local`:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

#### Option B: Local PostgreSQL

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/juby_app
```

### 3. Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

### 4. Add Defindex Configuration

Get testnet vault address from Defindex team and add to `.env.local`:

```env
DEFINDEX_VAULT_ADDRESS=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
USDC_STELLAR_ADDRESS=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 5. Run Test Script

```bash
# Test the custodial deposit flow
npx tsx scripts/test-custodial-deposit.ts
```

---

## Complete .env.local Example

```env
# ========================================
# DATABASE CONFIGURATION
# ========================================
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres

# ========================================
# ENCRYPTION CONFIGURATION
# ========================================
ENCRYPTION_MASTER_KEY=a1b2c3d4e5f6...  # 64 hex characters

# ========================================
# DEFINDEX CONFIGURATION
# ========================================
DEFINDEX_API_KEY=your_api_key_here
DEFINDEX_VAULT_ADDRESS=CXXXXXXXXXX
USDC_STELLAR_ADDRESS=CXXXXXXXXXX

# ========================================
# STELLAR NETWORK CONFIGURATION
# ========================================
STELLAR_NETWORK=TESTNET
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_SOROBAN_URL=https://soroban-testnet.stellar.org

# ========================================
# DEPOSIT CONFIGURATION
# ========================================
DEFAULT_SLIPPAGE_BPS=500
AUTO_INVEST=false
```

---

## What Gets Created

### Database Tables

1. **stellar_wallets** - Custodial Stellar addresses
   - Encrypted secret keys
   - User mappings

2. **deposits** - Deposit transactions
   - CCTP bridge status
   - Defindex deposit tracking

3. **vault_balances** - User vault balances
   - Total deposited
   - Vault shares owned

4. **withdrawals** - Withdrawal transactions (future)

### Services

1. **StellarWalletService**
   - Create custodial wallets
   - Encrypt/decrypt keypairs
   - Sign transactions

2. **DefindexService** (updated)
   - `depositForUser()` - Backend signs deposit
   - `getUserVaultBalance()` - Query from database
   - Records all transactions

---

## Testing Without Defindex Vault

You can test wallet creation and encryption without a Defindex vault:

```typescript
import { initializeStellarWalletService } from "./lib/services/stellar-wallet.service";

const walletService = initializeStellarWalletService();

// Create wallet
const wallet = await walletService.createWalletForUser("test-user-1");
console.log("Stellar address:", wallet.stellarPublicKey);

// Get wallet
const address = await walletService.getUserStellarAddress("test-user-1");
console.log("Retrieved address:", address);
```

---

## Troubleshooting

### "ENCRYPTION_MASTER_KEY must be 32 bytes"

Generate a new key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### "DATABASE_URL environment variable is required"

Add your Supabase connection string to `.env.local`

### "No Stellar wallet found for user"

Create wallet first:
```typescript
await walletService.createWalletForUser(userId);
```

### "DEFINDEX_VAULT_ADDRESS environment variable is required"

Add vault address to `.env.local` or contact Defindex team for testnet address

---

## Security Checklist

- [x] Stellar keypairs encrypted with AES-256-GCM
- [x] Master key stored in environment (never committed)
- [x] Database stores only encrypted keys
- [x] Backend signs all Stellar transactions
- [x] Users never see Stellar private keys
- [ ] TODO: Add rate limiting
- [ ] TODO: Add audit logging
- [ ] TODO: Use KMS in production (AWS KMS, Google Cloud KMS)

---

## Next Steps

1. ✅ Run setup steps above
2. ✅ Test wallet creation
3. ✅ Verify database records
4. ⏳ Get testnet USDC for testing deposits
5. ⏳ Build frontend UI
6. ⏳ Add CCTP bridge integration
7. ⏳ Integrate World App

---

## Production Considerations

### Key Management

**Development**: Environment variable
```env
ENCRYPTION_MASTER_KEY=abc123...
```

**Production**: Use KMS
```typescript
// AWS KMS example
const kms = new AWS.KMS();
const masterKey = await kms.decrypt({
  CiphertextBlob: process.env.KMS_ENCRYPTED_KEY
});
```

### Database

**Development**: Supabase free tier

**Production**:
- Supabase Pro (connection pooling)
- Or dedicated PostgreSQL with read replicas

### Monitoring

Add to your monitoring stack:
- Deposit success rate
- Average deposit time
- Encryption/decryption performance
- Database connection pool usage

---

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stellar SDK Docs](https://stellar.github.io/js-stellar-sdk/)
- [Defindex SDK Docs](https://docs.defindex.io/)
