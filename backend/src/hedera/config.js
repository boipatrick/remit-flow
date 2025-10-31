const { Client, AccountId, PrivateKey } = require('@hashgraph/sdk');

let cachedClient;

const ensureEnvironment = () => {
  const missing = [];
  if (!process.env.HEDERA_ACCOUNT_ID) missing.push('HEDERA_ACCOUNT_ID');
  if (!process.env.HEDERA_PRIVATE_KEY) missing.push('HEDERA_PRIVATE_KEY');
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

const createClient = () => {
  const network = (process.env.HEDERA_NETWORK || 'testnet').toLowerCase();
  const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

  const client = Client.forName(network);
  client.setOperator(operatorId, operatorKey);
  return client;
};

const getClient = () => {
  if (!cachedClient) {
    cachedClient = createClient();
  }
  return cachedClient;
};

const getOperator = () => ({
  accountId: AccountId.fromString(process.env.HEDERA_ACCOUNT_ID),
  privateKey: PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY)
});

module.exports = {
  ensureEnvironment,
  getClient,
  getOperator
};