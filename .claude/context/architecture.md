# Juby Stellar Vault App - Technical Architecture

## Project Context

**Hackathon:** Stellar Hackathon
**Project Name:** Juby Stellar Vault App
**Type:** World App Mini-App
**Core Objective:** Secure savings application with World ID authentication, fiat-to-USDC onboarding, cross-chain bridging to Stellar, and automated vault deposits.

## Strategic Goal

Create a minimal, impactful savings app that demonstrates real cross-ecosystem integration:
- **World ID** for human verification
- **World App** embedded wallet for USDC holdings
- **CCTP** (Cross-Chain Transfer Protocol) for bridging Worldchain → Stellar
- **Defindex** audited vaults on Stellar for diversified yields
- **Real retention mechanics** based on behavioral science, not gamification

## Architecture Overview

```
User Flow:
1. Login with World ID (human verification)
2. View USDC balance in World App embedded wallet
3. Deposit amount → triggers:
   - CCTP bridge: Worldchain → Stellar
   - Defindex API: deposit into audited vault
   - Developer fee capture
4. Dashboard: view deposits, yields, retention features
```

## Technology Stack

### Frontend: Next.js + MiniKit

**Framework:** Next.js 16 (current setup)
**MiniKit Integration:** World App SDK for Mini-Apps

#### MiniKit Commands Required
- `verifyHuman` - World ID authentication
- Wallet signature/permission requests
- Embedded wallet balance queries
- Transaction signing

#### Screen Count: 3 (Extreme Simplicity)
Minimalist design philosophy - judges should understand the app in 10 seconds.

### Backend: Node.js Serverless

**Environment:** Node.js serverless functions (Vercel/AWS Lambda)
**Database:** Supabase (simple, fast setup)

#### Core Responsibilities
1. **Proof Verification:** Validate World ID proofs (Mini-App requirement)
2. **Flow Orchestration:**
   - Authenticate human verification
   - Interact with Defindex API
   - Call Circle CCTP for bridging
   - Record transactions and retention metrics
3. **API Endpoints:**
   - `/api/auth/verify` - World ID validation
   - `/api/deposit` - Orchestrate deposit flow
   - `/api/dashboard` - User data and yields
   - `/api/withdraw` - Withdrawal processing

#### No Custom Smart Contracts
- Stellar vault is pre-audited by Defindex
- We only instantiate via their API + configure developer fees
- Reduces security risk and development time

### Blockchain Architecture

#### Three-Chain Integration

**1. Worldchain**
- **Role:** User's source of USDC funds
- **Integration:** Via World App embedded wallet
- **Action:** User signs transaction to bridge USDC

**2. Circle CCTP (Cross-Chain Transfer Protocol)**
- **Role:** Bridge layer
- **Function:** Transfer USDC from Worldchain → Stellar
- **API:** Circle's CCTP API endpoints
- **Flow:**
  ```
  User USDC (Worldchain)
    → CCTP burn on Worldchain
    → CCTP mint on Stellar
    → Arrives in user's Stellar address
  ```

**3. Stellar**
- **Role:** Final destination for savings
- **Vault:** Defindex pre-audited vault
- **Action:** USDC deposited into diversified vault
- **Yield Generation:** Via Defindex strategies
- **Developer Fee:** Configured during vault instantiation

## User Interface Design

### Principle: Extreme Simplicity
Three screens only. Each screen has one primary action.

---

### Screen 1: Home / Login

**Purpose:** Authentication entry point

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│         [Juby Logo/Icon]            │
│                                     │
│   "Ahorro diversificado en Stellar  │
│    con vaults auditados.            │
│    Control 100% tuyo."              │
│                                     │
│  [Verify with World ID – Start      │
│         Saving]                     │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Single button: "Verify with World ID – Start Saving"
- One-line explanation of value proposition
- Clean, trustworthy visual design

**Technical Flow:**
1. User taps button
2. MiniKit `verifyHuman` command
3. World ID proof generated
4. Backend validates proof
5. → Navigate to Deposit screen

---

### Screen 2: Deposit

**Purpose:** Primary savings action

**Layout:**
```
┌─────────────────────────────────────┐
│  World App Balance: $XXX USDC      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Amount to Deposit            │ │
│  │  $__________                  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ℹ️ "Tu dinero se moverá a Stellar  │
│     vía CCTP y entrará en un vault │
│     diversificado con yields        │
│     seguros."                       │
│                                     │
│  [Depositar y Activar Auto-Save]   │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- World App embedded wallet balance (fetched via MiniKit)
- Amount input field
- Info card explaining the process
- Primary CTA: "Depositar y Activar Auto-Save"

**Technical Flow:**
1. User enters amount
2. Tap deposit button
3. MiniKit requests wallet signature
4. Backend `/api/deposit`:
   - Verify human (if needed)
   - Initiate CCTP bridge
   - Call Defindex API to deposit
   - Record transaction
5. Show loading state
6. → Navigate to Dashboard on success

---

### Screen 3: Dashboard

**Purpose:** Track savings, view yields, manage deposits

**Layout:**
```
┌─────────────────────────────────────┐
│  Total Depositado                   │
│  $XXX USDC                          │
│                                     │
│  Yield Estimado (Anual)             │
│  X.XX%                              │
│                                     │
│  Último Depósito                    │
│  $XX USDC - DD/MM/YYYY              │
│                                     │
│  ──────────────────────────────     │
│                                     │
│  [Agregar Depósito Rápido]          │
│  [Retirar]                          │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- Total deposited (aggregated from backend)
- Estimated yield (fetched from Defindex API)
- Last deposit info
- Two action buttons: Add deposit, Withdraw

**Technical Flow:**
1. On load: call `/api/dashboard`
2. Display user's vault data
3. Yield data from Defindex
4. Buttons → navigate or trigger withdrawal

---

## Retention Mechanics (Behavioral Science, No Gamification)

### Philosophy
No meaningless badges or fake achievements. Real mechanisms based on savings psychology.

---

### 1. Auto-Save Controlled (Behavioral Nudge)

**Mechanism:** Default action prompting with easy opt-out

**Implementation:**
- When user returns to app, show modal/banner:
  ```
  "¿Querés programar ahorro automático semanal de $X?
  Lo podés cancelar cuando quieras."

  [Sí, activar]  [No, tal vez después]
  ```

**Science Behind It:**
- Default bias: People are more likely to save when it's the default option
- Frequency commitment increases retention by 3× (proven in behavioral economics)
- Emphasize control ("cancelar cuando quieras") reduces resistance

**Technical Implementation:**
- Store user preference in Supabase
- If opted in: weekly reminder notification
- Backend cron job checks auto-save preferences
- Optionally auto-execute deposits if user pre-authorizes

---

### 2. Goal Anchoring

**Mechanism:** Single, static, meaningful goal

**Implementation:**
- Display on dashboard:
  ```
  🎯 Tu meta de seguridad: 1 mes de gastos
  Llevas el X%
  [Progress bar]
  ```

**Science Behind It:**
- Goal-setting theory: Specific goals increase motivation
- Anchoring to "1 month of expenses" is concrete and universally understood
- Single goal prevents cognitive overload
- Progress visualization creates commitment

**Technical Implementation:**
- During onboarding, ask: "¿Cuánto gastás al mes?" (optional)
- Store target amount
- Calculate percentage: `(total_deposited / monthly_expenses) * 100`
- Display on dashboard

---

### 3. "Silent Report" Mensual

**Mechanism:** Monthly email with performance update

**Implementation:**
- Single email per month:
  ```
  Subject: Tu ahorro creció un X% este mes

  Body:
  "Tu ahorro creció un X% este mes. Bien hecho.

  Total ahora: $XXX USDC
  Yield ganado: $XX USDC

  [Ver Dashboard]"
  ```

**Science Behind It:**
- Loss aversion: Seeing growth creates fear of losing progress
- Social proof: Positive reinforcement without spam
- Low frequency (monthly) prevents annoyance, maintains engagement
- Zero spam = maximum retention

**Technical Implementation:**
- Backend cron job: 1st of each month
- Query all users with deposits
- Calculate monthly growth
- Send via email service (SendGrid/Resend)
- Track open rates in Supabase

---

## Technical Implementation Details

### Frontend Tasks

#### 1. MiniKit Integration
```typescript
// World ID Authentication
import { MiniKit } from '@worldcoin/minikit-js'

// Login flow
const handleLogin = async () => {
  const result = await MiniKit.commands.verifyHuman()
  // Send proof to backend for validation
}

// Wallet commands
const getBalance = async () => {
  const balance = await MiniKit.commands.getBalance()
  return balance.usdc
}

const requestSignature = async (transaction) => {
  const signature = await MiniKit.commands.sign(transaction)
  return signature
}
```

#### 2. Three Screens Implementation
- **Route structure:**
  - `/` - Home/Login
  - `/deposit` - Deposit screen
  - `/dashboard` - Dashboard
- Use Next.js App Router
- Server Components for data fetching
- Client Components for MiniKit interactions

#### 3. API Integration
```typescript
// Deposit flow
const handleDeposit = async (amount: number) => {
  // 1. Request signature from World App
  const signature = await MiniKit.commands.sign({
    amount,
    destination: 'stellar_vault_address'
  })

  // 2. Call backend
  const result = await fetch('/api/deposit', {
    method: 'POST',
    body: JSON.stringify({ amount, signature })
  })

  // 3. Show loading state
  // 4. Navigate to dashboard on success
}
```

#### 4. Display Yields and Balances
- Fetch from `/api/dashboard`
- Real-time updates from Defindex API
- Loading skeletons for better UX

---

### Backend Tasks

#### 1. World ID Validation
```javascript
// /api/auth/verify
export async function POST(request) {
  const { proof } = await request.json()

  // Verify proof with World ID API
  const isValid = await verifyWorldIdProof(proof)

  if (isValid) {
    // Generate session token
    // Store in database
    return { success: true, token }
  }

  return { success: false }
}
```

#### 2. Deposit Endpoint
```javascript
// /api/deposit
export async function POST(request) {
  const { amount, signature, userId } = await request.json()

  // 1. Verify human (check session)
  const user = await validateUser(userId)

  // 2. Call CCTP bridge
  const bridgeResult = await bridgeUSDC({
    from: 'worldchain',
    to: 'stellar',
    amount,
    userAddress: user.worldchainAddress
  })

  // 3. Wait for CCTP confirmation
  await waitForBridge(bridgeResult.txHash)

  // 4. Call Defindex deposit
  const vaultDeposit = await defindexAPI.deposit({
    vault: 'juby_vault',
    amount,
    userAddress: user.stellarAddress
  })

  // 5. Record in database
  await db.transactions.create({
    userId,
    amount,
    type: 'deposit',
    bridgeTx: bridgeResult.txHash,
    vaultTx: vaultDeposit.txHash,
    timestamp: new Date()
  })

  return { success: true, txHash: vaultDeposit.txHash }
}
```

#### 3. Dashboard Endpoint
```javascript
// /api/dashboard
export async function GET(request) {
  const userId = await getUserFromSession(request)

  // Fetch user data
  const transactions = await db.transactions.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' }
  })

  // Calculate totals
  const totalDeposited = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0)

  // Fetch yield from Defindex
  const vaultData = await defindexAPI.getVault({
    vault: 'juby_vault',
    userAddress: user.stellarAddress
  })

  return {
    totalDeposited,
    estimatedYield: vaultData.apy,
    lastDeposit: transactions[0],
    currentValue: vaultData.userBalance
  }
}
```

#### 4. Database Schema (Supabase)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id VARCHAR(255) UNIQUE NOT NULL,
  worldchain_address VARCHAR(255),
  stellar_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(18, 6) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'deposit', 'withdraw'
  bridge_tx VARCHAR(255),
  vault_tx VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Retention settings table
CREATE TABLE retention_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  auto_save_enabled BOOLEAN DEFAULT FALSE,
  auto_save_amount DECIMAL(18, 6),
  auto_save_frequency VARCHAR(20), -- 'weekly', 'biweekly', 'monthly'
  monthly_expense_goal DECIMAL(18, 6),
  last_email_sent TIMESTAMP
);
```

---

## Integration Points

### Circle CCTP API

**Documentation:** https://developers.circle.com/stablecoins/docs/cctp-getting-started

**Key Endpoints:**
- `POST /v1/transfers` - Initiate cross-chain transfer
- `GET /v1/transfers/{id}` - Check transfer status

**Flow:**
```javascript
// Burn USDC on Worldchain
const burnTx = await cctp.burn({
  amount,
  destinationChain: 'stellar',
  recipientAddress: stellarAddress
})

// Mint USDC on Stellar (auto or manual)
await cctp.mint({
  burnTxHash: burnTx.hash,
  destinationChain: 'stellar'
})
```

**Error Handling:**
- Bridge timeouts (typically 10-15 minutes)
- Failed attestations
- Insufficient balance
- Network congestion

---

### Defindex API

**Purpose:** Interact with audited Stellar vaults

**Key Operations:**
- Vault instantiation (one-time setup)
- Deposit into vault
- Query vault balance and yield
- Withdraw from vault
- Configure developer fees

**Example Integration:**
```javascript
// Setup vault (one time)
const vault = await defindex.createVault({
  name: 'Juby Savings Vault',
  strategies: ['stellar-stable', 'usdc-yield'],
  developerFee: 0.5 // 0.5% fee
})

// Deposit
await defindex.deposit({
  vaultId: vault.id,
  amount: depositAmount,
  userAddress: stellarAddress
})

// Query
const data = await defindex.getVaultData({
  vaultId: vault.id,
  userAddress: stellarAddress
})
```

---

## Why This Wins the Hackathon

### 1. Real Cross-Ecosystem Integration
- **World ID** (Worldcoin) + **CCTP** (Circle) + **Stellar vault** (Defindex)
- Shows genuine interoperability, not siloed development
- Demonstrates understanding of multiple ecosystems

### 2. Real-World Impact
- Solves actual problem: accessible retirement savings in Latin America
- Not a toy or proof-of-concept
- Audited vaults = security and trust

### 3. Simplicity = Usability
- Judges can use the app in 10 seconds
- Three screens, one clear flow
- No learning curve, no confusion

### 4. Retention Based on Science
- Not gamification gimmicks
- Behavioral economics: auto-save nudging, goal anchoring, loss aversion
- Demonstrates product thinking, not just technical implementation

### 5. Production-Ready Architecture
- No custom smart contracts (reduces risk)
- Serverless backend (scales easily)
- MiniKit integration (follows World App best practices)
- Pre-audited vault (security handled)

---

## Development Priorities

### Phase 1: Core Flow (Hackathon MVP)
1. MiniKit integration (World ID auth + wallet)
2. Three screens (Home, Deposit, Dashboard)
3. Backend `/api/deposit` orchestration
4. CCTP bridge integration
5. Defindex vault deposit
6. Basic dashboard display

### Phase 2: Retention Features
1. Auto-save modal and preference storage
2. Goal anchoring calculation and display
3. Monthly email cron job
4. Dashboard enhancements

### Phase 3: Polish & Demo
1. Error handling and loading states
2. Responsive design (mobile-first)
3. Demo video creation
4. Judge presentation materials

---

## Technical Risks & Mitigations

### Risk 1: CCTP Bridge Latency
- **Issue:** Bridge can take 10-15 minutes
- **Mitigation:**
  - Show clear loading state with progress
  - Send notification when complete
  - Allow user to navigate away

### Risk 2: World ID Proof Validation
- **Issue:** Proof validation must be server-side
- **Mitigation:**
  - Follow World ID Mini-App requirements exactly
  - Test extensively
  - Implement retry logic

### Risk 3: Defindex API Rate Limits
- **Issue:** API may have rate limits
- **Mitigation:**
  - Cache vault data aggressively
  - Implement request queuing
  - Contact Defindex team for limits

### Risk 4: Multi-Chain Complexity
- **Issue:** Three blockchains = three failure points
- **Mitigation:**
  - Comprehensive error handling
  - Transaction monitoring
  - Rollback logic where possible

---

## Environment Variables Required

```env
# World ID
WORLD_ID_APP_ID=app_xxx
WORLD_ID_API_KEY=xxx

# Circle CCTP
CCTP_API_KEY=xxx
CCTP_API_URL=https://api.circle.com

# Defindex
DEFINDEX_API_KEY=xxx
DEFINDEX_VAULT_ID=xxx

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# Email
SENDGRID_API_KEY=xxx
FROM_EMAIL=noreply@juby.app

# App
NEXT_PUBLIC_APP_URL=https://juby.app
JWT_SECRET=xxx
```

---

## Resources

- **World App MiniKit Docs:** https://docs.worldcoin.org/mini-apps
- **Circle CCTP Docs:** https://developers.circle.com/stablecoins/docs/cctp-getting-started
- **Defindex Docs:** [Contact team for API documentation]
- **Stellar Docs:** https://developers.stellar.org/
- **Supabase Docs:** https://supabase.com/docs

---

**Document Version:** 1.0
**Last Updated:** 2025-11-20
**Status:** Hackathon Architecture - Ready for Implementation