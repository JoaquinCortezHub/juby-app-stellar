# Juby Stellar Vault App - Architecture

## Overview

Juby is a secure savings app that bridges USDC from Worldchain to Stellar and deposits into Defindex vaults for yield generation.

**Key Insight**: Users interact via World App (Worldchain) while backend handles all Stellar operations through custodial wallets.

---

## Architecture Components

### 1. Frontend (Next.js)
- World ID authentication
- MiniKit wallet integration (Worldchain)
- Simple 3-screen UI (Home, Deposit, Dashboard)

### 2. Backend (Next.js API Routes)
- Defindex vault integration
- Custodial Stellar wallet management
- CCTP bridge orchestration (future)
- Database management

### 3. Blockchain Integration
- **Worldchain**: User's World App wallet (non-custodial)
- **CCTP**: Bridge USDC between chains
- **Stellar**: Defindex vaults, backend-managed wallets (custodial)

### 4. Database (Supabase + Prisma)
- Custodial wallet storage (encrypted keypairs)
- Deposit tracking
- Balance management

---

## Two Implementation Modes

### Mode 1: Non-Custodial (Basic Defindex)

**Use Case**: Direct Stellar wallet users

**Flow**:
```
User with Stellar wallet (Freighter, Albedo)
    ↓
Frontend builds deposit transaction
    ↓
User signs with their wallet
    ↓
Frontend submits to Stellar
    ↓
Deposit into Defindex vault
```

**Pros**: User controls keys
**Cons**: Requires Stellar wallet, complex UX

### Mode 2: Custodial (Production)

**Use Case**: World App users (Worldchain)

**Flow**:
```
User on World App (Worldchain)
    ↓
User signs CCTP bridge transaction
    ↓
USDC bridges to Stellar (custodial address)
    ↓
Backend signs Defindex deposit
    ↓
User sees "Earning yield!"
```

**Pros**: Simple UX, no Stellar wallet needed
**Cons**: Backend holds Stellar keys (custodial)

---

## Custodial Architecture (Recommended)

### Why Custodial on Stellar?

**Problem**: Users are on Worldchain (World App) but Defindex is on Stellar.
- Users can't sign Stellar transactions from Worldchain
- Installing 2 wallets defeats the UX simplicity

**Solution**: Backend manages Stellar addresses for users
- User controls World App wallet (non-custodial on Worldchain)
- Backend controls Stellar address (custodial on Stellar)
- User never sees Stellar side → just "deposit and earn"

### Security Model

```
┌─────────────────────────────────────────────────────────┐
│ WORLDCHAIN (Non-Custodial)                              │
│                                                          │
│  User's World App Wallet                                │
│  - User controls private keys                           │
│  - User signs all transactions                          │
│  - Full custody                                         │
└─────────────────────────────────────────────────────────┘
                      ↓
              CCTP Bridge
                      ↓
┌─────────────────────────────────────────────────────────┐
│ STELLAR (Custodial)                                     │
│                                                          │
│  Backend-Managed Stellar Address                        │
│  - Backend creates wallet for user                      │
│  - Backend stores encrypted keypair                     │
│  - Backend signs all transactions                       │
│  - Custodial (backend holds keys)                       │
└─────────────────────────────────────────────────────────┘
```

### Key Management

**Encryption**: AES-256-GCM
- Stellar keypairs encrypted before storage
- Master key stored in environment (dev) or KMS (production)
- Each keypair has unique IV and authentication tag

**Storage**: PostgreSQL (Supabase)
```sql
stellar_wallets:
  - user_id (unique)
  - stellar_public_key
  - encrypted_secret_key
  - encryption_iv
  - encryption_tag
```

**Access**: Backend only
- Frontend never sees Stellar keys
- API endpoints don't expose keys
- Signing happens server-side

---

## Complete User Flow

### Phase 1: Stellar-Only (Current)
```
User with Stellar wallet
    ↓
Deposit USDC to Defindex vault
    ↓
See balance and yield
```

### Phase 2: Add CCTP Bridge
```
User has USDC on Worldchain
    ↓
Bridge to Stellar via CCTP
    ↓
Deposit to Defindex vault
```

### Phase 3: World App Integration (Full)
```
1. User logs in with World ID
    ↓
2. Backend creates custodial Stellar wallet
    ↓
3. User clicks "Deposit" in World App
    ↓
4. User signs CCTP bridge (Worldchain)
    ↓
5. Backend monitors USDC arrival on Stellar
    ↓
6. Backend signs Defindex deposit
    ↓
7. User sees "Earning X% yield!"
```

---

## Services Architecture

### StellarWalletService
**Purpose**: Manage custodial Stellar wallets

**Methods**:
```typescript
createWalletForUser(userId: string): Promise<CreateWalletResult>
getUserStellarAddress(userId: string): Promise<string>
signTransactionForUser(userId: string, xdr: string): Promise<string>
```

**Security**:
- Encrypts keypairs with AES-256-GCM
- Never exposes private keys
- Validates all operations

### DefindexService
**Purpose**: Interact with Defindex vaults

**Non-Custodial Methods**:
```typescript
buildDepositTransaction(params): Promise<DepositResponse>  // Returns unsigned XDR
submitTransaction(params): Promise<SubmitTransactionResponse>  // Submits signed XDR
```

**Custodial Methods**:
```typescript
depositForUser(userId: string, amount: number): Promise<SubmitTransactionResponse>
// Complete flow: build → sign → submit → record
```

**Flow Comparison**:
```
Non-Custodial:
  API → Build XDR → User Signs → API → Submit

Custodial:
  API → Build → Backend Signs → Submit → Record
```

---

## Database Schema

### stellar_wallets
```typescript
{
  id: string
  userId: string (unique)
  stellarPublicKey: string (unique)
  encryptedSecretKey: string
  encryptionIv: string
  encryptionTag: string
  createdAt: DateTime
  lastUsed: DateTime?
}
```

### deposits
```typescript
{
  id: string
  userId: string
  stellarWalletId: string

  // Worldchain side
  worldchainTxHash: string?
  cctpAttestation: string?
  bridgeStatus: BridgeStatus

  // Stellar side
  stellarMintTx: string?
  defindexDepositTx: string?

  // Amounts
  amountUsdc: bigint
  vaultShares: bigint?
  slippageBps: number

  // Timestamps
  initiatedAt: DateTime
  completedAt: DateTime?
}
```

### vault_balances
```typescript
{
  id: string
  userId: string (unique)
  stellarWalletId: string (unique)
  vaultAddress: string
  totalDeposited: bigint
  vaultShares: bigint
  lastYieldCheck: DateTime?
  estimatedYield: bigint
  updatedAt: DateTime
}
```

---

## API Endpoints

### Non-Custodial Mode

**POST /api/defindex/deposit**
```typescript
Request: { userPublicKey: string, amount: number }
Response: { xdr: string }  // Unsigned transaction
```

**POST /api/defindex/submit**
```typescript
Request: { signedXdr: string }
Response: { transactionHash: string }
```

### Custodial Mode (Future)

**POST /api/custodial/deposit**
```typescript
Request: { userId: string, amount: number }
Response: { transactionHash: string }  // Already signed and submitted
```

---

## Security Considerations

### Encryption
- ✅ AES-256-GCM (industry standard)
- ✅ Unique IV per keypair
- ✅ Authentication tags prevent tampering
- ✅ Master key in environment/KMS

### Access Control
- ✅ Backend-only key decryption
- ✅ No keys in logs or responses
- ✅ Rate limiting (TODO)
- ✅ Audit trail (TODO)

### Custody Risks
- ⚠️ Backend compromise → keys exposed
- ⚠️ Single point of failure

### Mitigations
- Use KMS in production (AWS KMS, Google Cloud KMS)
- Multi-sig for large withdrawals
- Insurance fund
- Regular security audits
- Open-source code for transparency

---

## Deployment Architecture

### Development
```
Next.js Dev Server (localhost:3000)
    ↓
Supabase (cloud PostgreSQL)
    ↓
Stellar Testnet
```

### Production
```
Vercel/Railway (Next.js)
    ↓
Supabase Pro (PostgreSQL)
    ↓
KMS (key management)
    ↓
Stellar Mainnet
```

---

## Technology Stack

### Frontend
- Next.js 16
- React 19
- TailwindCSS
- MiniKit SDK (World App)

### Backend
- Next.js API Routes
- Prisma (ORM)
- @defindex/sdk
- @stellar/stellar-sdk

### Database
- PostgreSQL (Supabase)
- Prisma migrations

### Blockchain
- Stellar (Defindex vaults)
- Worldchain (World App)
- Circle CCTP (bridge)

---

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Encryption
ENCRYPTION_MASTER_KEY=<64-hex-chars>

# Defindex
DEFINDEX_API_KEY=...
DEFINDEX_VAULT_ADDRESS=CXXX...
USDC_STELLAR_ADDRESS=CXXX...

# Stellar
STELLAR_NETWORK=TESTNET
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_SOROBAN_URL=https://soroban-testnet.stellar.org

# Deposit Settings
DEFAULT_SLIPPAGE_BPS=500
AUTO_INVEST=false
```

---

## Monitoring & Observability

### Key Metrics
- Deposit success rate (target: >99%)
- Average deposit time (target: <5s)
- Encryption/decryption performance
- Database query latency
- Vault yield tracking

### Alerts
- Failed deposits > 5%
- High latency > 10s
- Database connection issues
- Low balance warnings
- Unusual activity patterns

---

## Future Enhancements

### Short-term
- [ ] Withdrawal flow
- [ ] CCTP bridge integration
- [ ] World App integration
- [ ] Yield tracking dashboard

### Medium-term
- [ ] Multiple vault support
- [ ] Auto-compound yields
- [ ] Goal-based savings
- [ ] Retention features

### Long-term
- [ ] Multi-sig wallets
- [ ] Insurance fund
- [ ] DAO governance
- [ ] Cross-chain support

---

## References

- [Defindex Docs](https://docs.defindex.io/)
- [Stellar Docs](https://developers.stellar.org/)
- [Circle CCTP Docs](https://developers.circle.com/stablecoins/docs/cctp-getting-started)
- [MiniKit Docs](https://docs.worldcoin.org/mini-apps)
- [Prisma Docs](https://www.prisma.io/docs)
