# Juby Stellar Vault App

**Stellar Hackathon Project**: Secure savings app with World ID authentication, USDC bridging, and Defindex vault integration.

## Overview

Juby enables users to deposit USDC from their World App wallet (Worldchain) into secure, yield-generating vaults on Stellar. The app handles cross-chain bridging via CCTP and uses backend-managed Stellar wallets for seamless UX.

**Key Features**:
- 🔐 World ID authentication (proof of humanity)
- 💰 Defindex vault integration for secure yields
- 🌉 CCTP bridge (Worldchain → Stellar)
- 🔑 Custodial Stellar wallets (backend-managed)
- 📊 Simple 3-screen UI (Home, Deposit, Dashboard)
- 🎯 Retention mechanics based on behavioral science

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd juby-app

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

### Environment Setup

```env
# Database (Supabase)
DATABASE_URL=postgresql://...

# Encryption (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_MASTER_KEY=<64-hex-chars>

# Defindex
DEFINDEX_VAULT_ADDRESS=CXXX...
USDC_STELLAR_ADDRESS=CXXX...

# Stellar
STELLAR_NETWORK=TESTNET
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

---

## Architecture

Juby uses a **custodial model on Stellar** while keeping users **non-custodial on Worldchain**:

```
User (World App - Worldchain) [Non-Custodial]
    ↓
User signs CCTP bridge transaction
    ↓
USDC arrives on Stellar (custodial address)
    ↓
Backend signs Defindex deposit [Custodial]
    ↓
User sees "Earning yield!"
```

**Why custodial on Stellar?**
- Users interact via World App (Worldchain)
- Can't sign Stellar transactions from Worldchain
- Backend handles Stellar operations transparently
- User never needs Stellar wallet

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

---

## Project Structure

```
juby-app/
├── app/
│   ├── api/
│   │   └── defindex/          # Defindex API endpoints
│   ├── page.tsx               # Home page
│   └── layout.tsx             # Root layout
├── lib/
│   ├── services/
│   │   ├── defindex.service.ts         # Defindex vault integration
│   │   └── stellar-wallet.service.ts   # Custodial wallet management
│   └── prisma.ts              # Prisma client
├── prisma/
│   └── schema.prisma          # Database schema
├── scripts/
│   └── test-custodial-deposit.ts  # Test script
├── docs/
│   ├── ARCHITECTURE.md        # Architecture documentation
│   ├── SETUP_GUIDE.md         # Setup instructions
│   └── PROJECT_CONTEXT.md     # Hackathon context
└── README.md                  # This file
```

---

## Core Services

### DefindexService

Handles Defindex vault operations:

```typescript
import { initializeDefindexService } from "@/lib/services/defindex.service";

const defindexService = initializeDefindexService();

// Custodial deposit (backend signs)
await defindexService.depositForUser(userId, amount);

// Non-custodial deposit (user signs)
const { xdr } = await defindexService.buildDepositTransaction({ userPublicKey, amount });
// User signs XDR
await defindexService.submitTransaction({ signedXdr });
```

### StellarWalletService

Manages custodial Stellar wallets:

```typescript
import { initializeStellarWalletService } from "@/lib/services/stellar-wallet.service";

const walletService = initializeStellarWalletService();

// Create custodial wallet
const wallet = await walletService.createWalletForUser(userId);

// Get stellar address
const address = await walletService.getUserStellarAddress(userId);

// Sign transaction (internal only)
const signedXdr = await walletService.signTransactionForUser(userId, xdr);
```

---

## API Endpoints

### POST /api/defindex/deposit
Build unsigned deposit transaction (non-custodial mode)

**Request**:
```json
{
  "userPublicKey": "GXXX...",
  "amount": 100000000,
  "slippageBps": 500
}
```

**Response**:
```json
{
  "success": true,
  "xdr": "AAAAAgAAAAB...",
  "vaultAddress": "CXXX..."
}
```

### POST /api/defindex/submit
Submit signed transaction

**Request**:
```json
{
  "signedXdr": "AAAAAgAAAAB..."
}
```

**Response**:
```json
{
  "success": true,
  "transactionHash": "abc123...",
  "returnValue": 100000000
}
```

### GET /api/defindex/balance?userPublicKey=GXXX
Query vault balance

**Response**:
```json
{
  "success": true,
  "balance": 100000000,
  "vaultShares": 10000000
}
```

---

## Testing

### Test Custodial Deposit Flow

```bash
npx tsx scripts/test-custodial-deposit.ts
```

This script:
1. Creates custodial Stellar wallet
2. Encrypts and stores keypair
3. Funds wallet with testnet XLM
4. Simulates Defindex deposit
5. Verifies database records

### Manual Testing

```bash
# Start dev server
npm run dev

# In another terminal, test deposit
curl -X POST http://localhost:3000/api/defindex/deposit \
  -H "Content-Type: application/json" \
  -d '{"userPublicKey":"GXXX...","amount":100000000}'
```

---

## Database Schema

### stellar_wallets
Custodial Stellar addresses with encrypted keypairs

### deposits
Deposit transaction tracking (CCTP bridge + Defindex)

### vault_balances
User balance and vault shares

### withdrawals
Withdrawal tracking (future)

See [prisma/schema.prisma](./prisma/schema.prisma) for full schema.

---

## Security

### Encryption
- **Algorithm**: AES-256-GCM
- **Key Storage**: Environment variable (dev) / KMS (production)
- **Keypairs**: Encrypted before database storage
- **Authentication**: GCM tags prevent tampering

### Access Control
- Backend-only key decryption
- No private keys in API responses
- No keys in logs
- Rate limiting (TODO)

### Custody Model
- **Worldchain**: Non-custodial (user controls keys)
- **Stellar**: Custodial (backend controls keys)
- **Mitigation**: KMS, multi-sig, insurance fund, audits

---

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code

npx prisma studio    # Open database GUI
npx prisma migrate dev  # Run migrations
npx tsx scripts/test-custodial-deposit.ts  # Test script
```

### Environment Variables

See [.env.example](./.env.example) for all available options.

---

## Roadmap

### Phase 1: Stellar-Only ✅
- [x] Defindex integration
- [x] Custodial Stellar wallets
- [x] Database schema
- [x] Test scripts

### Phase 2: CCTP Bridge ⏳
- [ ] CCTP integration
- [ ] Attestation monitoring
- [ ] Auto-deposit on USDC arrival
- [ ] Bridge status tracking

### Phase 3: World App ⏳
- [ ] World ID authentication
- [ ] MiniKit integration
- [ ] Frontend UI (3 screens)
- [ ] Retention features

### Phase 4: Polish ⏳
- [ ] Withdrawal flow
- [ ] Yield dashboard
- [ ] Goal tracking
- [ ] Production deployment

---

## Contributing

This is a hackathon project. Contributions welcome after the event!

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup instructions
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) - Hackathon project context

---

## Resources

- [Defindex](https://defindex.io/) - Stellar vault management
- [Stellar](https://stellar.org/) - Blockchain platform
- [World ID](https://worldcoin.org/world-id) - Proof of humanity
- [Circle CCTP](https://developers.circle.com/stablecoins/docs/cctp-getting-started) - Cross-chain bridge

---

## License

MIT

---

## Hackathon

**Event**: Stellar Hackathon
**Team**: Solo
**Status**: In Development

Built with ❤️ for the Stellar ecosystem
