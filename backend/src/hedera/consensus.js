const {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId
} = require('@hashgraph/sdk');

const { getClient, getOperator } = require('./config');

const createConsensusTopic = async (memo) => {
  const client = getClient();
  const { privateKey } = getOperator();

  const tx = await new TopicCreateTransaction()
    .setTopicMemo((memo || '').slice(0, 100))
    .freezeWith(client);

  const signedTx = await tx.sign(privateKey);
  const submit = await signedTx.execute(client);
  const receipt = await submit.getReceipt(client);

  return {
    topicId: receipt.topicId.toString(),
    transactionId: submit.transactionId.toString()
  };
};

const logRemittanceEvent = async ({ topicId, payload }) => {
  const client = getClient();
  const message = Buffer.from(JSON.stringify(payload));

  const tx = await new TopicMessageSubmitTransaction()
    .setTopicId(TopicId.fromString(topicId))
    .setMessage(message);

  const submit = await tx.execute(client);
  const receipt = await submit.getReceipt(client);
  const sequenceNumber = receipt.topicSequenceNumber != null
    ? Number(receipt.topicSequenceNumber.toString())
    : null;

  return {
    status: receipt.status.toString(),
    sequenceNumber,
    transactionId: submit.transactionId.toString()
  };
};

module.exports = {
  createConsensusTopic,
  logRemittanceEvent
};