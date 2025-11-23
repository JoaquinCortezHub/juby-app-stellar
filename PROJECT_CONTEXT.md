# Juby Stellar Vault App - Project Context

**Hackathon**: Stellar Hackathon
**Project**: Mini savings vault app with World ID authentication and cross-chain integration

---

## 🎯 Project Objective

Create a secure savings mini-app that:
- Authenticates users with World ID (proof of humanity)
- Enables fiat → USDC onboarding via World App
- Bridges USDC from Worldchain → Stellar via CCTP (Cross-Chain Transfer Protocol)
- Deposits into a diversified Stellar vault using Defindex
- Implements developer fees
- Drives retention through behavioral science (NOT gamification)

---

## 🏗️ Architecture

### Frontend
- **Tech**: Next.js (minimal setup)
- **Integration**: MiniKit for World App integration
  - Login with World ID (`verifyHuman` command)
  - Request wallet signature/permission from World App
- **UI**: 3 extremely simple screens

### Backend
- **Tech**: Node.js + serverless functions
- **Responsibilities**:
  - Verify World ID proofs (Mini App requirement)
  - Orchestrate the flow:
    - Validate human authentication proofs
    - Interact with Defindex API
    - Call Circle CCTP for USDC bridge (Worldchain → Stellar)
    - Record deposits, history, retention metrics
- **Database**: Supabase (simple setup)
- **Note**: NO custom smart contracts (Stellar vault is audited by Defindex)

### Blockchain Flow
1. **Worldchain**: Where user holds their USDC
2. **CCTP**: Bridge USDC from Worldchain → Stellar
3. **Stellar**: Where the Defindex vault exists (already deployed and audited)
   - We only instantiate it via their API with fee configuration

---

## 🖥️ User Interface (3 Screens)

### 1. Home / Login
**Elements:**
- Button: "Verify with World ID – Start Saving"
- One-line explanation: "Ahorro diversificado en Stellar con vaults auditados. Control 100% tuyo."

### 2. Deposit Screen
**Elements:**
- Display World App embedded wallet balance
- Amount input field
- Info card: "Tu dinero se moverá a Stellar vía CCTP y entrará en un vault diversificado con yields seguros."
- Button: "Depositar y Activar Auto-Save"
- Confirmation in user's wallet (via MiniKit)

### 3. Dashboard
**Display:**
- Total deposited
- Estimated vault yield (from Defindex)
- Last deposit timestamp

**Actions:**
- Button: "Agregar depósito rápido"
- Button: "Retirar"

---

## 🔁 Retention Mechanics (Science-Based, NO Gamification)

### 1. Auto-Save Controlado (Behavioral Nudge)
- Prompt on return: "¿Querés programar ahorro automático semanal de $X? Lo podés cancelar cuando quieras."
- **Evidence**: Setting frequency increases retention 3×

### 2. Goal Anchoring
- Single, static goal: "Tu meta de seguridad: 1 mes de gastos. Llevas el X%."
- **Rationale**: One goal → no distraction, maintains focus

### 3. "Silent Report" Monthly
- One monthly email: "Tu ahorro creció un X% este mes. Bien hecho."
- **Strategy**: Zero spam → maximum retention

---

## 🔧 Technical Implementation

### Frontend Tasks
- [ ] Integrate MiniKit SDK
  - [ ] World ID login flow
  - [ ] Wallet command integration
- [ ] Build 3 core screens (Home, Deposit, Dashboard)
- [ ] Connect to backend APIs (deposit, withdraw, dashboard data)
- [ ] Display Defindex yields and balances

### Backend Tasks
- [ ] World ID validation endpoint
- [ ] Deposit endpoint flow:
  1. Verify human proof
  2. Request MiniKit signature
  3. Call CCTP (Worldchain → Stellar bridge)
  4. Call Defindex deposit API
  5. Record transaction in database
- [ ] Dashboard data endpoint
  - [ ] Fetch user balance
  - [ ] Fetch vault yields from Defindex
  - [ ] Fetch transaction history
- [ ] Setup Supabase database schema
- [ ] Implement developer fee logic

### Integration Points

#### MiniKit Commands
- `verifyHuman`: World ID authentication
- Wallet signature requests for transactions

#### CCTP Integration
- Circle's Cross-Chain Transfer Protocol
- Bridge USDC: Worldchain → Stellar

#### Defindex API
- Vault instantiation with fee configuration
- Deposit operations
- Yield/balance queries
- Withdrawal operations

---

## 🏆 Winning Strategy

1. **Real Cross-Ecosystem Integration**: World ID + CCTP + Stellar vault (Defindex)
2. **Impactful Use Case**: Secure savings with real yields
3. **Simplicity**: Judges can test in 10 seconds
4. **Scientific Retention**: Behavioral psychology > meaningless badges
5. **No Custom Smart Contracts**: Leverages audited, production-ready infrastructure

---

## 📚 Key Resources

### APIs & SDKs
- **MiniKit**: World App integration SDK
- **World ID**: Proof of humanity protocol
- **Circle CCTP**: Cross-chain transfer protocol for USDC
- **Defindex API**: Stellar vault management

### Chains
- **Worldchain**: User's USDC source
- **Stellar**: Vault destination

---

## 🚀 Development Phases

### Phase 1: Authentication & Wallet
- World ID integration
- MiniKit wallet connection
- Basic UI scaffold

### Phase 2: Backend Infrastructure
- Proof verification
- Database setup
- API endpoints

### Phase 3: Cross-Chain Bridge
- CCTP integration
- Transaction orchestration
- Error handling

### Phase 4: Vault Integration
- Defindex API connection
- Deposit/withdraw flows
- Yield tracking

### Phase 5: Retention Features
- Auto-save prompts
- Goal tracking
- Monthly reports

### Phase 6: Polish & Testing
- UI refinement
- End-to-end testing
- Performance optimization

---

## 💡 Design Principles

1. **Extreme Simplicity**: Every screen serves ONE clear purpose
2. **User Control**: Users own their wallet, we just orchestrate
3. **Real Value**: Actual yields, no fake rewards
4. **Behavioral Science**: Proven retention mechanisms
5. **Security First**: Audited vaults, no custom contracts
6. **Speed**: Fast load times, instant feedback

---

## 🛡️ Security Considerations

- World ID prevents Sybil attacks
- No custody of user funds (self-custodial via World App)
- Defindex vaults are audited
- CCTP is Circle's production bridge
- Backend validates all proofs before executing transactions

---

## 📊 Success Metrics

- User authentication success rate
- Deposit completion rate
- Average deposit size
- Retention (Day 7, Day 30)
- Auto-save activation rate
- Goal completion percentage

---

## 🔗 Technical Flow Diagram

```
User (World App)
    ↓
[World ID Auth] → Frontend (Next.js + MiniKit)
    ↓
Backend (Node.js)
    ↓
1. Verify Proof
2. CCTP Bridge (Worldchain → Stellar)
3. Defindex Deposit
    ↓
Stellar Vault (Defindex)
    ↓
Returns: Balance, Yield, Status
    ↓
Dashboard Display
```

---

## 📝 Notes

- This is a hackathon project focused on rapid integration
- Leverage existing, audited infrastructure
- Prioritize working demo over perfect code
- Document all integration points for judges
- Keep UI minimal and functional
