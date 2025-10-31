# RemitFlow Africa - Product Requirements Document (PRD)

**Project Type**: MVP | Hedera Africa Hackathon 2025
**Track**: Onchain Finance & RWA
**Build Date**: October 31, 2025
**Submission Deadline**: October 31, 2025, 23:59 CET
**Repository**: remitflow-africa (GitHub - PUBLIC)

---

## 🎯 PROJECT OVERVIEW

RemitFlow Africa is a **Hedera-powered remittance platform MVP** that enables fast, affordable cross-border money transfers across African countries using blockchain technology. The platform solves the critical problem of high remittance fees (currently 8.5% vs. the UN target of 3%) by leveraging Hedera's Token Service (HTS) for low-cost token transfers and Hedera Consensus Service (HCS) for immutable audit logging.

**Core Value Proposition**: Send money across Africa for under 1% fee in under 5 seconds with regulatory compliance via immutable on-chain audit trails.

---

## 📊 BUSINESS PROBLEM

### Problem Statement
- **Current Remittance Cost**: 7.4-8.5% per transaction (World Bank 2025)
- **Annual Market Size**: $49 billion flowing into Sub-Saharan Africa
- **User Impact**: Family sending $100 loses $7.50-$8.50 to intermediaries
- **Settlement Time**: 3-5 days through traditional channels
- **Root Cause**: Multiple intermediaries, slow settlement, licensing overhead

### Market Opportunity
- **TAM (Total Addressable Market)**: $49B Sub-Saharan Africa remittances annually
- **SAM (Serviceable Addressable Market)**: $15B Nigeria market (largest recipient)
- **SOM (Serviceable Obtainable Market)**: $8M target for Year 1 at 0.1% penetration
- **Target Users**: African diaspora, migrant workers, families, small businesses

### Why Now?
- 1.1 billion mobile money accounts in Africa (proven digital payment adoption)
- Growing institutional interest in blockchain-based finance
- African central banks exploring digital currency infrastructure
- Regulatory openness in Nigeria, Kenya, Ghana for blockchain innovation

---

## 💡 SOLUTION DESIGN

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│              http://localhost:3000                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ User Interface: Initialize | Send Remittance        │  │
│  │ Components: WalletConnect | TransferForm | History   │  │
│  └─────────────────────────┬──────────────────────────────┘ │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                    HTTP REST API Calls
                    /api/init | /api/remit
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                  BACKEND (Express.js)                         │
│              http://localhost:5000                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ API Endpoints:                                       │  │
│  │ • POST /api/init - Initialize token + topic         │  │
│  │ • POST /api/remit - Execute remittance transfer     │  │
│  │ • GET /api/health - Service health check            │  │
│  │ • GET /api/info - Deployment info                   │  │
│  └────────────┬──────────────────────────┬──────────────┘  │
│              │                          │                   │
│     HTS Transactions          HCS Transactions              │
│     (Token Operations)        (Audit Logging)               │
│              │                          │                   │
└──────────────┼──────────────────────────┼────────────────────┘
               │                          │
               ▼                          ▼
    ┌──────────────────────────────────────────────────┐
    │         HEDERA TESTNET (Consensus Layer)        │
    │                                                  │
    │  HTS: Token Account Balances & Transfers        │
    │  HCS: Topic Logs & Transaction Records          │
    │                                                  │
    │  Network: Hedera Testnet (gossip consensus)     │
    │  Finality: 3-5 seconds (ABFT)                  │
    │  Cost: $0.0001 per transaction                  │
    └────────────────────────┬─────────────────────────┘
                             │
                             ▼
    ┌──────────────────────────────────────────────────┐
    │    HEDERA MIRROR NODE (Public Data Layer)       │
    │                                                  │
    │  HashScan: https://hashscan.io/testnet         │
    │  • Transaction Verification                     │
    │  • Token Balance Queries                        │
    │  • HCS Message Retrieval                        │
    │  • Audit Trail Verification                     │
    └──────────────────────────────────────────────────┘
```

### Core Features (MVP)

#### Feature 1: Token Initialization (HTS)
**Purpose**: Create stablecoin tokens representing African currencies
**Hedera Service**: Hedera Token Service (HTS)
**Transactions Used**:
- `TokenCreateTransaction`: Create rNGN (Remit Nigerian Naira) token
  - Token Name: "Remit Nigerian Naira"
  - Token Symbol: "rNGN"
  - Decimals: 2
  - Initial Supply: 1,000,000.00 tokens
  - Backed 1:1 by fiat reserves

**Why HTS**:
- Native token creation without smart contract overhead
- $0.0001 per transaction vs. $50+ through traditional banking
- Instant token transfers between accounts
- Immutable token history on-chain

**Economic Impact**:
- User sending $50 saves $4 vs. traditional (8% vs. 0.5%)
- At 10K monthly transactions, saves $40K/month for users
- Platform generates $2.50 revenue per transaction (0.5% fee)

**File**: `backend/src/hedera/token.js`
**Function**: `createRemittanceToken(tokenName, tokenSymbol)`

---

#### Feature 2: Token Transfer (HTS)
**Purpose**: Execute peer-to-peer remittance transfers with full accountability
**Hedera Service**: Hedera Token Service (HTS)
**Transactions Used**:
- `TokenTransferTransaction`: Transfer rNGN between accounts
  - From: Sender account (loses tokens)
  - To: Recipient account (receives tokens)
  - Amount: User-specified remittance amount
  - Max Fee: 2 HBAR (~$0.002 equivalent)

**Why HTS for Transfers**:
- Direct account-to-account transfers (no intermediaries)
- Atomic transaction (all-or-nothing, no partial states)
- 3-5 second finality (vs. 3-5 days for banks)
- Immutable transaction record on-chain

**Economic Impact**:
- Cost: ~$0.0001 per transfer
- Traditional wire transfer cost: $10-25
- Platform fee: 0.5% of amount (sustainable recurring revenue)
- User savings: 8.0% vs. traditional

**File**: `backend/src/hedera/token.js`
**Function**: `transferRemittance(tokenId, senderAccountId, recipientAccountId, amount)`

---

#### Feature 3: Immutable Audit Logging (HCS)
**Purpose**: Create regulatory-compliant transaction audit trail
**Hedera Service**: Hedera Consensus Service (HCS)
**Transactions Used**:
- `TopicCreateTransaction`: Create HCS topic for all transaction logs
  - Memo: "RemitFlow Africa - Immutable Remittance Audit Log"
  - Used for: Recording all remittance activity
  
- `TopicMessageSubmitTransaction`: Log each remittance transaction
  - Message Content: JSON with sender, recipient, amount, timestamp, fee, transaction hash
  - Purpose: Compliance with African financial regulators (CBN, CMA, BoG)

**Why HCS for Compliance**:
- Regulators require immutable audit trails
- HCS provides cryptographically signed consensus log
- Cannot be altered retroactively (violation detection)
- Cost: ~$0.0001 per log entry vs. $1-5 per traditional audit entry
- Queryable via Mirror Node for regulatory inspections

**Economic Impact**:
- Compliance infrastructure cost reduction: 99.99%
  - Traditional: $50K-100K/month for audit systems
  - RemitFlow: ~$30/month (at 10K daily transactions)
- Enables regulatory approval (no black-box transactions)
- Audit trail searchable by regulator query

**File**: `backend/src/hedera/consensus.js`
**Functions**:
- `createRemittanceAuditTopic()`
- `logRemittanceTransaction(topicId, transactionData)`

---

### User Workflows

#### Workflow 1: Initialize RemitFlow
**Trigger**: Application startup or new deployment
**Steps**:
1. User clicks "Initialize Now" button on frontend
2. Frontend calls `POST /api/init` endpoint
3. Backend creates HTS token (rNGN) via TokenCreateTransaction
4. Backend creates HCS topic via TopicCreateTransaction
5. Both IDs returned to frontend
6. User sees: Token ID and Topic ID displayed
7. User verifies on HashScan (optional)

**Time**: ~15 seconds
**Cost**: ~$0.0006 total
**Outcome**: RemitFlow ready to accept remittances

---

#### Workflow 2: Send Remittance
**Trigger**: User wants to send money across Africa
**Prerequisites**: RemitFlow initialized; user has testnet account IDs
**Steps**:
1. User enters sender account ID
2. User enters recipient account ID
3. User enters amount in rNGN
4. Frontend calculates and displays fee (0.5%)
5. User clicks "Send Remittance"
6. Frontend validates inputs and calls `POST /api/remit`
7. Backend executes TokenTransferTransaction on HTS
8. HTS transaction confirmed (3-5 seconds)
9. Backend immediately logs transaction to HCS via TopicMessageSubmitTransaction
10. Backend returns transaction hash to frontend
11. User sees success message with HashScan link
12. User (optionally) verifies transaction on HashScan Mirror Node

**Time**: ~5-10 seconds end-to-end
**Cost**: ~$0.0002 per remittance
**User Fee**: 0.5% of transfer amount
**User Saves**: 8.0% vs. traditional remittance

**Verification Points**:
- Transaction hash visible in frontend
- Transaction confirmed on HashScan (3-5 seconds after submission)
- HCS audit log entry created for compliance

---

## 🔧 TECHNICAL SPECIFICATIONS

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Blockchain** | Hedera Network | Testnet | Transaction settlement, immutable ledger |
| **Token Service** | HTS (Hedera SDK) | v2.42.0+ | Token creation, transfers, balances |
| **Consensus Service** | HCS (Hedera SDK) | v2.42.0+ | Immutable audit logging |
| **Backend Runtime** | Node.js | v16+ | Server runtime |
| **Backend Framework** | Express.js | v4.18+ | REST API server |
| **Frontend Framework** | React | v18.2+ | User interface |
| **Frontend Build** | Vite/Create React App | Latest | Build tooling |
| **Database** | None (State via Hedera) | N/A | All state stored on-chain |
| **Environment** | Dotenv | Latest | Configuration management |

### Key Dependencies

#### Backend (Node.js)
```json
{
  "@hashgraph/sdk": "^2.42.0",      // Hedera SDK for HTS/HCS
  "express": "^4.18.2",              // REST API framework
  "cors": "^2.8.5",                  // Cross-origin resource sharing
  "dotenv": "^16.3.1"                // Environment variables
}
```

#### Frontend (React)
```json
{
  "react": "^18.2.0",                // UI library
  "react-dom": "^18.2.0",            // React DOM rendering
  "react-scripts": "5.0.1"           // Build scripts
}
```

### Environment Configuration

**Required Environment Variables** (`.env` file):
```
HEDERA_ACCOUNT_ID=0.0.[YOUR_ACCOUNT_ID]
HEDERA_PRIVATE_KEY=[YOUR_PRIVATE_KEY]
HEDERA_NETWORK=testnet
PORT=5000
```

**How to Get**:
1. Go to https://portal.hedera.com
2. Create free testnet account
3. Copy Account ID (format: 0.0.XXXXX)
4. Copy Private Key (Ed25519 format)
5. Request 1000 tℏ from faucet (free)
6. Save to `.env` file (NEVER commit to GitHub)

### API Endpoints

#### POST /api/init
**Purpose**: Initialize RemitFlow (create token + audit topic)
**Request**: No body required
**Response**:
```json
{
  "success": true,
  "tokenId": "0.0.12345",
  "topicId": "0.0.67890",
  "message": "RemitFlow initialized successfully!",
  "timestamp": "2025-10-31T11:00:00Z"
}
```
**Hedera Operations**: 
- TokenCreateTransaction (HTS)
- TopicCreateTransaction (HCS)

---

#### POST /api/remit
**Purpose**: Execute remittance transfer with audit logging
**Request Body**:
```json
{
  "senderAccountId": "0.0.1000",
  "recipientAccountId": "0.0.1001",
  "amount": 1000,
  "currencyPair": "NGN"
}
```
**Response**:
```json
{
  "success": true,
  "transactionHash": "0.0.1000@1635758400.000000001",
  "amountSent": "1000",
  "currencyFee": "0.5%",
  "savingsVsTraditional": "8.0%",
  "hashscanLink": "https://hashscan.io/testnet/transaction/0.0.1000@1635758400.000000001",
  "timestamp": "2025-10-31T11:00:30Z"
}
```
**Hedera Operations**:
- TokenTransferTransaction (HTS)
- TopicMessageSubmitTransaction (HCS)

---

#### GET /api/health
**Purpose**: Health check and service status
**Response**:
```json
{
  "status": "ok",
  "service": "RemitFlow Africa MVP",
  "version": "1.0.0",
  "htsTokenId": "0.0.12345",
  "hcsTopicId": "0.0.67890",
  "timestamp": "2025-10-31T11:00:00Z"
}
```

---

#### GET /api/info
**Purpose**: Get deployment and service information
**Response**:
```json
{
  "service": "RemitFlow Africa - Hedera Powered Remittances",
  "deployedTokenId": "0.0.12345",
  "deployedTopicId": "0.0.67890",
  "network": "Hedera Testnet",
  "track": "Onchain Finance & RWA",
  "hederaServices": ["HTS (Token Service)", "HCS (Consensus Service)"],
  "transactionCost": "$0.0001 per remittance",
  "traditionalCost": "7.4-8.5% of amount",
  "userSavings": "8%+ per transaction",
  "timestamp": "2025-10-31T11:00:00Z"
}
```

---

### File Structure

```
remitflow-africa/
│
├── backend/
│   ├── src/
│   │   ├── index.js                 # Express server + API endpoints
│   │   ├── hedera/
│   │   │   ├── config.js            # Hedera client configuration
│   │   │   ├── token.js             # HTS token operations
│   │   │   └── consensus.js         # HCS audit logging operations
│   │   └── api/
│   │       └── routes.js            # API route definitions (optional)
│   ├── package.json                 # Node.js dependencies
│   ├── .env.example                 # Environment template
│   └── README.md                    # Backend documentation
│
├── frontend/
│   ├── public/
│   │   └── index.html               # HTML entry point
│   ├── src/
│   │   ├── index.js                 # React entry point
│   │   ├── App.jsx                  # Main React component
│   │   ├── App.css                  # Styles
│   │   └── components/              # Reusable components (future)
│   ├── package.json                 # React dependencies
│   └── .env                         # Frontend config (if needed)
│
├── .gitignore                       # Git exclusions (CRITICAL: must include .env)
├── .env                             # NEVER commit (local only)
├── .env.example                     # Template (commit to GitHub)
├── README.md                        # Project documentation
└── ARCHITECTURE.md                  # (Optional) Detailed architecture
```

### Code Organization

#### Backend Module: `hedera/config.js`
**Purpose**: Initialize Hedera client and operator
**Exports**: `{ client, accountId, privateKey }`
**Hedera Operations**:
- `Client.forTestnet()` - Connect to testnet
- `client.setOperator()` - Set transaction operator

#### Backend Module: `hedera/token.js`
**Purpose**: HTS token operations
**Exports**:
- `createRemittanceToken(tokenName, tokenSymbol)` - Create new token
- `transferRemittance(tokenId, sender, recipient, amount)` - Transfer tokens
**Hedera Operations**:
- `TokenCreateTransaction` - Create rNGN token
- `TokenTransferTransaction` - Execute token transfer

#### Backend Module: `hedera/consensus.js`
**Purpose**: HCS audit logging
**Exports**:
- `createRemittanceAuditTopic()` - Create HCS topic
- `logRemittanceTransaction(topicId, data)` - Log transaction to HCS
**Hedera Operations**:
- `TopicCreateTransaction` - Create audit topic
- `TopicMessageSubmitTransaction` - Submit audit log message

#### Backend Server: `index.js`
**Purpose**: Express API server
**Routes**:
- `POST /api/init` - Initialize token + topic
- `POST /api/remit` - Execute remittance with audit logging
- `GET /api/health` - Health check
- `GET /api/info` - Service information

#### Frontend Component: `App.jsx`
**Purpose**: Main React application
**State**:
- `initialized` - RemitFlow initialized status
- `tokenId` - Created HTS token ID
- `topicId` - Created HCS topic ID
- `senderAccount`, `recipientAccount`, `amount` - Remittance form data
- `transactionHash` - Result of remittance
- `loading`, `error`, `successMessage` - UI states
**Handlers**:
- `handleInit()` - Call /api/init and display results
- `handleSendRemittance()` - Validate form and call /api/remit

#### Frontend Styles: `App.css`
**Purpose**: Professional UI styling
**Components Styled**:
- Header with project title and network badge
- Initialization card (HTS token + HCS topic creation)
- Remittance card (form + transaction results)
- Comparison section (traditional vs. RemitFlow costs)
- Message boxes (error, success, info)
- Footer with project info

---

## 📋 DEPLOYMENT SPECIFICATIONS

### Local Development (MVP)

```bash
# Prerequisites
- Node.js v16+
- npm v8+
- Hedera Testnet Account (free from portal.hedera.com)

# Backend Setup (Terminal 1)
cd backend
npm install
cp .env.example .env
# Edit .env with Hedera credentials
npm start
# Expected: ✅ RemitFlow API Server running on port 5000

# Frontend Setup (Terminal 2)
cd frontend
npm install
npm start
# Expected: Browser opens at http://localhost:3000
```

### Testing on Hedera Testnet

1. **Initialize RemitFlow**:
   - Click "Initialize Now" in frontend
   - Wait for Token ID and Topic ID
   - Verify on HashScan: https://hashscan.io/testnet/token/[TOKEN_ID]

2. **Execute Test Remittance**:
   - Use testnet account IDs (e.g., 0.0.1000, 0.0.1001)
   - Enter amount (e.g., 100)
   - Click "Send Remittance"
   - Verify transaction on HashScan: https://hashscan.io/testnet/transaction/[HASH]

3. **Verify Audit Trail**:
   - Check HCS audit logs via Mirror Node API
   - Confirm immutable record created

### Production Considerations (Post-MVP)

- **Fiat On-Ramps**: Integration with payment processors for USD/EUR/NGN conversion
- **KYC/AML Compliance**: Identity verification and sanction screening
- **Mainnet Migration**: Deploy token + HCS on Hedera mainnet
- **Insurance**: Fund recovery in case of user error
- **Legal**: Operate under Money Services Business license in jurisdictions

---

## 🎯 HEDERA SERVICES JUSTIFICATION

### Why Hedera Token Service (HTS)?

**Problem Being Solved**: Creating and transferring currency tokens with minimal infrastructure

**Why HTS vs. Alternatives**:
- vs. Traditional Banking: Banks require months to onboard, charge $10K-100K monthly
- vs. ERC-20 (Ethereum): $50-500 per transaction cost; HTS costs $0.0001
- vs. Algorand ASA: Similar functionality; less regulatory clarity in Africa
- vs. Building Custom Smart Contracts: HTS provides battle-tested token logic

**How HTS Solves It**:
1. **Token Creation**: Create rNGN token in single transaction ($0.0001)
2. **Token Transfers**: Direct peer-to-peer transfers with instant finality ($0.0001 each)
3. **Account Management**: Native token association for users (atomic)
4. **Immutability**: All token state recorded on distributed ledger (cannot be reversed)

**Quantified Value**:
- Cost: $0.0001 per transaction
- Traditional wire transfer: $10-25
- **Savings**: 99.99% cost reduction
- At 10K monthly transactions: $40K/month in user savings

---

### Why Hedera Consensus Service (HCS)?

**Problem Being Solved**: Creating regulatory-compliant audit trails for financial transactions

**Why HCS vs. Alternatives**:
- vs. Centralized Audit Log: Vulnerable to tampering; regulators don't trust single entity
- vs. Blockchain Transactions: Storing audit data as transactions costs $1-5 each; HCS costs $0.0001
- vs. PostgreSQL Database: Database can be altered; regulators require immutable record

**How HCS Solves It**:
1. **Topic Creation**: Create HCS topic for audit trail (single transaction)
2. **Message Submission**: Submit transaction logs to HCS (cryptographically signed by consensus)
3. **Immutability**: Once recorded, cannot be altered without detection
4. **Queryability**: Auditors can retrieve full transaction history from Mirror Node

**Quantified Value**:
- Cost per audit entry: $0.0001
- Traditional audit log system: $50K-100K monthly (software + compliance staff)
- **Savings**: 99.99% cost reduction (at 10K daily transactions = ~$30/month)
- **Regulatory Benefit**: Immutable record satisfies CBN, CMA, BoG requirements
- **Transparency**: Auditors can independently verify transactions

---

### Why NOT HSCS (Smart Contracts) for MVP?

**Smart Contracts Would Add**:
- Automated exchange rate calculations
- Smart contract-based KYC/AML checks
- Programmatic compliance rules

**Why We Skip for MVP**:
- Adds 2-3 hours of development time (deadline pressure)
- HTS + HCS sufficient for core remittance flow
- Can add smart contracts in post-hackathon roadmap
- Judges evaluate MVP functionality, not advanced features

**Roadmap for HSCS**:
- Month 2: Add HSCS for automated exchange rates
- Month 3: Add HSCS for smart contract-based compliance
- Month 4: Add HSCS for programmable payouts

---

## ✅ ACCEPTANCE CRITERIA

### Functional Requirements (MVP)

| Requirement | Status | How Verified |
|-------------|--------|---|
| Create HTS token on testnet | ✅ MVP | Token ID visible on HashScan |
| Execute HTS token transfer | ✅ MVP | Transaction hash confirmed on HashScan |
| Create HCS audit topic | ✅ MVP | Topic ID visible on HashScan |
| Log transaction to HCS | ✅ MVP | Message submitted to HCS topic |
| REST API endpoint /api/init | ✅ MVP | Returns tokenId + topicId |
| REST API endpoint /api/remit | ✅ MVP | Returns transactionHash |
| React frontend displays results | ✅ MVP | Token ID, Topic ID, Tx Hash shown |
| Frontend links to HashScan | ✅ MVP | Clickable links to verify on-chain |
| Transaction verification | ✅ MVP | User can view on Mirror Node |
| No private keys in GitHub | ✅ MVP | .env in .gitignore |

### Non-Functional Requirements

| Requirement | Target | How Verified |
|-------------|--------|---|
| API response time | < 30s | Measure from request to response |
| Token creation time | < 15s | Time to receive tokenId |
| Remittance transfer time | < 10s | Finality time on HashScan |
| Cost per token creation | $0.0001 | HTS fee shown in logs |
| Cost per transfer | $0.0001 | HTS fee shown in logs |
| Cost per audit log | $0.0001 | HCS fee shown in logs |
| User savings vs. traditional | 8%+ | (1000 amount @ 0.5% fee vs. 8% traditional) |
| Uptime | 99% | Service available during testing |
| Error handling | Graceful | Clear error messages in UI |
| Code readability | High | Comments on complex logic |

---

## 📝 DOCUMENTATION REQUIREMENTS

### For Copilot / AI Assistants

#### What This Project Does
RemitFlow Africa is an MVP remittance platform that uses Hedera blockchain services to enable fast, low-cost money transfers across African countries.

#### Core Problem
Remittances to Africa cost 8.5% in fees (vs. 3% UN target), meaning families lose billions annually to intermediaries.

#### Solution Architecture
- **HTS**: Creates stablecoin tokens representing African currencies (rNGN, rKES, etc.)
- **HCS**: Creates immutable audit logs for regulatory compliance
- **Backend**: Node.js/Express API that orchestrates HTS + HCS operations
- **Frontend**: React UI for user interaction

#### Key Files to Understand
1. **`backend/src/hedera/token.js`**: HTS token creation + transfers
2. **`backend/src/hedera/consensus.js`**: HCS audit topic + logging
3. **`backend/src/index.js`**: Express server + API routes
4. **`frontend/src/App.jsx`**: React UI component
5. **`.env`**: Hedera testnet credentials (never commit)

#### Development Workflow
1. Start backend: `npm start` from `backend/` directory
2. Start frontend: `npm start` from `frontend/` directory
3. Initialize: Click "Initialize Now" in UI
4. Test transfer: Enter accounts + amount, click "Send Remittance"
5. Verify: Click HashScan link to confirm on-chain

#### Common Errors & Fixes
- **"Token creation failed"**: Check `.env` has valid Hedera account + 500+ tℏ
- **"Cannot find module '@hashgraph/sdk'"**: Run `npm install` in backend/
- **CORS errors**: Ensure frontend on :3000, backend on :5000
- **Transaction not appearing on HashScan**: Wait 5-10 seconds, then refresh

#### Hedera Concepts
- **HTS (Token Service)**: Create and manage tokens (like ERC-20)
- **HCS (Consensus Service)**: Immutable message log (for audit trails)
- **Mirror Node**: Public explorer (hashscan.io) to verify transactions
- **Testnet**: Free blockchain for development (not real money)
- **Account ID**: Format 0.0.XXXXX (like an address)
- **Private Key**: Ed25519 key (secret, never share)
- **Transaction**: Single atomic action on Hedera (costs $0.0001 each)

#### Why Hedera Over Ethereum / Bitcoin?
- **Cost**: $0.0001 per transaction (Ethereum = $5-50)
- **Speed**: 5-second finality (Bitcoin = 10 minutes)
- **Energy**: Carbon-negative network (Ethereum = massive carbon footprint)
- **Scalability**: 10,000 TPS capacity (Ethereum = 15 TPS)

---

## 🎯 HACKATHON SUBMISSION REQUIREMENTS

### Mandatory Files (By Deadline: Oct 31, 23:59 CET)

| File | Location | Status | Notes |
|------|----------|--------|-------|
| Executable Code | GitHub (PUBLIC repo) | ✅ Ready | Must run with `npm install` + `npm start` |
| README.md | Repo root | ✅ Ready | Setup instructions (< 10 min) |
| .env.example | Repo root | ✅ Ready | Template for credentials (no secrets) |
| 3-Minute Demo Video | YouTube/Vimeo | ✅ Planned | Must show LIVE transaction on HashScan |
| Pitch Deck (12 slides) | Google Slides/PDF | ✅ Planned | Business case + technical architecture |
| DoraHacks BUIDL Page | DoraHacks | ✅ Planned | All links + team info |
| Hedera Certification | BUIDL page | ✅ Required | At least ONE team member certified |

### Judging Criteria (Hackathon Rubric)

| Category | Weight | How to Excel |
|----------|--------|---|
| **Technical Execution** | 35% | Working code on testnet, clean architecture, proper error handling |
| **Innovation** | 25% | Novel application of Hedera to African problem, unique approach |
| **Problem-Solution Fit** | 20% | Real problem ($49B market), clear solution, measurable impact |
| **Feasibility** | 15% | Realistic roadmap, team capability, regulatory understanding |
| **Presentation** | 5% | Clear pitch, professional demo, compelling narrative |

### How to Win This Category

**Technical Execution (35%)**:
- ✅ Code runs without errors on first try
- ✅ Working HTS token creation on testnet
- ✅ Working HTS token transfer on testnet
- ✅ Working HCS audit logging on testnet
- ✅ All transactions verifiable on HashScan
- ✅ Clean, commented code
- ✅ Professional UI/UX

**Innovation (25%)**:
- ✅ First remittance platform on Hedera (novel)
- ✅ HCS for regulatory compliance (creative use)
- ✅ Directly addresses African problem (contextual)
- ✅ Sustainable business model (0.5% fee)
- ✅ Scalable architecture (can add currencies)

**Problem-Solution Fit (20%)**:
- ✅ 8.5% remittance fees (verified statistic)
- ✅ $49B market size in Sub-Saharan Africa (World Bank data)
- ✅ Solution saves users 8% (clear quantified benefit)
- ✅ Regulatory compliance via HCS (addresses real need)
- ✅ Fast (5 seconds vs. 3-5 days)

**Feasibility (15%)**:
- ✅ MVP complete for hackathon
- ✅ Mainnet roadmap clear (months 2-6)
- ✅ Team has blockchain + fintech experience
- ✅ Regulatory path understood (CBN/CMA)
- ✅ Partnerships possible (MTN, Airtel, Safaricom)

**Presentation (5%)**:
- ✅ Pitch tells compelling story (problem → solution → impact)
- ✅ Demo shows real working product (not mockups)
- ✅ All links working (GitHub, video, deck)
- ✅ Team credentials clear (why they can execute)

---

## 🚀 POST-HACKATHON ROADMAP

### Month 1-2: Regulatory & Foundation
- [ ] Consult with CBN (Central Bank of Nigeria)
- [ ] Consult with CMA (Capital Markets Authority, Kenya)
- [ ] Consult with BoG (Bank of Ghana)
- [ ] Understand licensing requirements (Money Services Business)
- [ ] Set up corporate structure (limited company)

### Month 3-4: Fiat Integration & Pilot
- [ ] Partner with payment processor (Paystack, Flutterwave)
- [ ] Add USD ↔ NGN conversion
- [ ] Launch beta with 500 users
- [ ] Collect feedback on UX
- [ ] Add KYC/AML checks

### Month 5-6: Mainnet Launch
- [ ] Deploy on Hedera mainnet
- [ ] Add support for Kenyan Shilling (KES)
- [ ] Add support for Ghanaian Cedi (GHS)
- [ ] Launch for 5,000+ users
- [ ] Announce partnerships

### Month 7-12: Scale & Partnerships
- [ ] Add HSCS for smart contract compliance
- [ ] Integrate with MTN Mobile Money
- [ ] Integrate with Airtel Money
- [ ] Integrate with Safaricom M-Pesa
- [ ] Target 50K monthly active users
- [ ] Generate $400K+ monthly revenue

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues & Solutions

#### Issue: ".env file not found"
**Cause**: Missing `.env` file
**Solution**: `cp .env.example .env` then edit with your Hedera credentials

#### Issue: "Cannot find module '@hashgraph/sdk'"
**Cause**: Dependencies not installed
**Solution**: `cd backend && npm install`

#### Issue: "Invalid Hedera credentials"
**Cause**: Account ID or Private Key incorrect
**Solution**: Check format (ID: 0.0.XXXXX, Key: Ed25519 format), get from https://portal.hedera.com

#### Issue: "Insufficient tℏ balance"
**Cause**: Less than 500 tℏ in account
**Solution**: Request more from faucet at https://portal.hedera.com

#### Issue: "CORS errors in console"
**Cause**: Frontend/Backend running on wrong ports
**Solution**: Frontend on :3000, Backend on :5000; check in code

#### Issue: "Transaction not appearing on HashScan"
**Cause**: Not waiting for finality
**Solution**: Wait 5-10 seconds after transaction, then refresh HashScan

#### Issue: "API returns 'RemitFlow not initialized'"
**Cause**: Haven't clicked "Initialize Now" yet
**Solution**: Click button to create token + topic first

---

## 📚 REFERENCES & RESOURCES

### Hedera Official Documentation
- **Getting Started**: https://docs.hedera.com/hedera
- **HTS Docs**: https://docs.hedera.com/hedera/guides/smart-contracts
- **HCS Docs**: https://docs.hedera.com/hedera/guides/consensus-service
- **JavaScript SDK**: https://github.com/hashgraph/hedera-sdk-js
- **Mirror Node Explorer**: https://hashscan.io/testnet

### Hedera Testnet
- **Portal**: https://portal.hedera.com (get account + tℏ)
- **Faucet**: https://testnet-faucet.hedera.com/ (request tokens)
- **Status**: https://status.hedera.com (check network health)

### African Remittance Data
- **World Bank Remittance Corridor Database**: https://www.worldbank.org/en/topic/migrationremittancesdiaspora
- **IFAD Rural Remittances**: https://www.ifad.org/en/remittances
- **African Development Bank**: https://www.afdb.org

### Project Setup
- **Node.js**: https://nodejs.org (download v16+)
- **React**: https://react.dev (documentation)
- **Express**: https://expressjs.com (documentation)
- **Git**: https://git-scm.com (version control)

### Hedera Developer Community
- **Discord**: https://discord.gg/hedera (live support)
- **Forums**: https://community.hedera.com (discussions)
- **GitHub**: https://github.com/hashgraph (open source)

---

## 📄 VERSION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Oct 31, 2025 | Hackathon Team | Initial PRD for MVP |
| (Post-MVP) | TBD | Team | Will include mainnet deployment |

---

## 🎓 FOR COPILOT: CRITICAL CONTEXT

**If asked to modify code**, remember:
- **Do not touch `.env`**: Environment variables are secrets
- **Always check HTS transactions**: Verify on HashScan after changes
- **Always check HCS transactions**: Verify audit logs are created
- **Test end-to-end**: Frontend → Backend → Hedera testnet → Mirror Node
- **Keep MVP scope**: Don't add complexity (no database, no auth for MVP)
- **Document changes**: Add comments explaining why, not just what

**If asked to debug**, check:
1. Is backend running on port 5000? (`npm start` from backend/)
2. Is frontend running on port 3000? (`npm start` from frontend/)
3. Is `.env` file present in `backend/` with valid Hedera account?
4. Is account balance > 500 tℏ? (Check at https://portal.hedera.com)
5. Are transaction hashes visible on HashScan? (Mirror Node verification)

**If asked to add features**, prioritize:
1. Complete core MVP first (this PRD)
2. Test all endpoints work
3. Record demo video
4. Submit before deadline
5. Post-hackathon: add HCS, add mainnet, add fiat on-ramps

---

**Last Updated**: October 31, 2025, 7:03 AM -05
**Status**: Active Development (Hackathon MVP Phase)
**Next Review**: After hackathon submission
