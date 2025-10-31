const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');

const { ensureEnvironment } = require('./hedera/config');
const { createRemittanceToken, transferRemittanceToken } = require('./hedera/token');
const { createConsensusTopic, logRemittanceEvent } = require('./hedera/consensus');

ensureEnvironment();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/init', asyncHandler(async (_req, res) => {
  const tokenConfig = {
    name: process.env.TOKEN_NAME || 'RemitFlow Token',
    symbol: process.env.TOKEN_SYMBOL || 'RFLOW',
    decimals: Number(process.env.TOKEN_DECIMALS ?? 2),
    initialSupply: Number(process.env.TOKEN_INITIAL_SUPPLY ?? 0)
  };

  const topicMemo = process.env.TOPIC_MEMO || 'RemitFlow audit log';

  const { tokenId, transactionId: tokenTransactionId } = await createRemittanceToken(tokenConfig);
  const { topicId, transactionId: topicTransactionId } = await createConsensusTopic(topicMemo);

  res.status(201).json({
    message: 'Infrastructure initialized',
    token: { tokenId, transactionId: tokenTransactionId },
    topic: { topicId, transactionId: topicTransactionId }
  });
}));

app.post('/api/remit', asyncHandler(async (req, res) => {
  const { tokenId, recipientAccountId, amount, memo, topicId } = req.body;

  if (!tokenId || !recipientAccountId || amount === undefined || !topicId) {
    return res.status(400).json({
      error: 'tokenId, recipientAccountId, amount, and topicId are required'
    });
  }

  const { status, transactionId } = await transferRemittanceToken({
    tokenId,
    recipientAccountId,
    amount,
    memo
  });

  const consensusResult = await logRemittanceEvent({
    topicId,
    payload: {
      tokenId,
      recipientAccountId,
      amount,
      memo,
      transactionId,
      timestamp: new Date().toISOString()
    }
  });

  res.status(200).json({
    message: 'Remittance executed',
    transfer: { status, transactionId },
    consensus: consensusResult
  });
}));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`RemitFlow backend listening on http://localhost:${PORT}`);
});