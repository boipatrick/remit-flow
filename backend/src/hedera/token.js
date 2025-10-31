const {
  AccountId,
  TokenCreateTransaction,
  TokenSupplyType,
  TokenType,
  TokenId,
  TransferTransaction
} = require('@hashgraph/sdk');

const { getClient, getOperator } = require('./config');

const createRemittanceToken = async ({ name, symbol, decimals, initialSupply }) => {
  const client = getClient();
  const { accountId, privateKey } = getOperator();

  const tx = await new TokenCreateTransaction()
    .setTokenName(name)
    .setTokenSymbol(symbol)
    .setTreasuryAccountId(accountId)
    .setTokenType(TokenType.FungibleCommon)
    .setSupplyType(TokenSupplyType.Infinite)
    .setDecimals(decimals)
    .setInitialSupply(initialSupply)
    .freezeWith(client);

  const signedTx = await tx.sign(privateKey);
  const submit = await signedTx.execute(client);
  const receipt = await submit.getReceipt(client);

  return {
    tokenId: receipt.tokenId.toString(),
    transactionId: submit.transactionId.toString()
  };
};

const transferRemittanceToken = async ({ tokenId, recipientAccountId, amount, memo = 'RemitFlow payment' }) => {
  const transferAmount = Number(amount);
  if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
    throw new Error('amount must be a positive number');
  }

  const client = getClient();
  const { accountId, privateKey } = getOperator();
  const token = TokenId.fromString(tokenId);
  const recipient = typeof recipientAccountId === 'string'
    ? AccountId.fromString(recipientAccountId)
    : recipientAccountId;

  const tx = await new TransferTransaction()
    .setTransactionMemo((memo || '').slice(0, 100))
    .addTokenTransfer(token, accountId, -transferAmount)
    .addTokenTransfer(token, recipient, transferAmount)
    .freezeWith(client);

  const signedTx = await tx.sign(privateKey);
  const submit = await signedTx.execute(client);
  const receipt = await submit.getReceipt(client);

  return {
    status: receipt.status.toString(),
    transactionId: submit.transactionId.toString()
  };
};

module.exports = {
  createRemittanceToken,
  transferRemittanceToken
};