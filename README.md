# RemitFlow Africa



## Certification Link

[HEDERA CERTIFICATION LINK](https://drive.google.com/file/d/1VuoUFUHmRZ5-QrBPH2c7KM_WR73aVwVD/view?usp=sharing)

## PitchDeck Link

[PITCHDECK LINK](https://drive.google.com/file/d/1PUV3MN4sPwAMXskr2e362WiGGO4Y1izI/view?usp=sharing)




RemitFlow Africa is a Hedera-powered remittance MVP built for the Hedera Africa Hackathon 2025. It mints a KES stable-token on HTS, records payouts on the Hedera Consensus Service, and exposes a simple web client for operations staff.

---

## 1. Architecture Snapshot

- **Backend** – Node.js + Express API (Hedera SDK for HTS + HCS operations).
- **Frontend** – React (Vite) SPA that drives initialization and remittance flows.
- **Ledger** – Hedera Testnet: token creation & treasury transfers, consensus log topics.

---

## 2. Prerequisites

| Tool | Version | Notes |
| ---- | ------- | ----- |
| Node.js | >= 18.x LTS | Required for both backend and frontend. |
| npm    | >= 9.x       | Bundled with Node. |
| Hedera Testnet account | | Needs HBAR balance and private key. |
| Token-associated recipient account(s) | | Associate using HashPack / Blade or SDK. |

---

## 3. Environment Variables

### Backend (`backend/.env`)
```
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxxx             # operator/treasury account
HEDERA_PRIVATE_KEY=302e02...             # private key (keep secret)
PORT=5000
TOKEN_NAME=RemitFlow KES
TOKEN_SYMBOL=rKES
TOKEN_DECIMALS=2
TOKEN_INITIAL_SUPPLY=1000000
TOPIC_MEMO=RemitFlow audit trail
```

Create from template:

```powershell
cd backend
Copy-Item .env.example .env
notepad .env   # update with your credentials
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:5000
```

Set up:

```powershell
cd frontend
Copy-Item .env.example .env
```

---

## 4. Install & Run

```powershell
# Backend
cd backend
npm install
npm start

# In a new terminal – Frontend
cd frontend
npm install
npm run dev      # visit http://localhost:3000
```

Health check:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

---

## 5. Hedera Initialization Flow

1. Open the frontend (http://localhost:3000).
2. Click **“Initialize now”**.
3. Backend creates:
   - **Token ID** (HTS fungible token with your treasury as operator).
   - **Topic ID** (HCS audit log).
4. Copy both IDs for later use and documentation.
5. Verify on HashScan:
   - Token: https://hashscan.io/testnet/token/**TOKEN_ID**
   - Topic: https://hashscan.io/testnet/topic/**TOPIC_ID**

---

## 6. Executing a Remittance

1. Ensure the recipient Hedera account is associated with the token (`TOKEN_ID`).
2. In the frontend form:
   - Paste `tokenId` & `topicId`.
   - Provide recipient account ID (e.g., `0.0.1234567`).
   - Enter amount in minor units (KES cents for 2 decimals).
   - Optional memo for ledger trace.
3. Submit **Send**.
4. Success response includes:
   - `transfer.transactionId` (token transfer).
   - `consensus.transactionId` & `sequenceNumber` (audit log entry).
5. Validate on HashScan:
   - Token transfer: https://hashscan.io/testnet/transaction/**TRANSFER_TX_ID**
   - Topic message: https://hashscan.io/testnet/topic/**TOPIC_ID** (inspect sequence entry).

---

## 7. Troubleshooting & Tips

| Issue | Fix |
| ----- | --- |
| `Missing required environment variables` | Ensure `backend/.env` is populated and server restarted. |
| `INVALID_ACCOUNT_ID` | Recipient ID invalid or not token-associated; associate first. |
| `INSUFFICIENT_TOKEN_BALANCE` | Top-up treasury mint or adjust amount. |
| CORS errors | Confirm frontend `.env` `VITE_API_BASE_URL` matches backend URL. |
| Token/topic recreations | Store IDs to reuse; otherwise new init creates fresh token/topic pairs. |

---

## 8. Submission Artifacts Checklist

- ✅ Token ID & Topic ID (with HashScan links).
- ✅ Backend & frontend source committed.
- ✅ README quickstart (this file).
- ✅ Demo recording (per hackathon PRD).
- ✅ Future roadmap & impact summary (add to PRD/README before final submission).

