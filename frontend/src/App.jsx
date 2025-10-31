import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

const defaultInitState = { tokenId: '', topicId: '' };

function App() {
  const [initResult, setInitResult] = useState(defaultInitState);
  const [loading, setLoading] = useState(false);
  const [remitPayload, setRemitPayload] = useState({
    tokenId: '',
    topicId: '',
    recipientAccountId: '',
    amount: '',
    memo: 'RemitFlow payout'
  });
  const [remitResponse, setRemitResponse] = useState(null);
  const [error, setError] = useState(null);

  const callInit = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/init`, { method: 'POST' });
      if (!res.ok) throw new Error(`Init failed: ${res.statusText}`);
      const data = await res.json();
      setInitResult({ tokenId: data.token.tokenId, topicId: data.topic.topicId });
      setRemitPayload((prev) => ({
        ...prev,
        tokenId: data.token.tokenId,
        topicId: data.topic.topicId
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const callRemit = async (evt) => {
    evt.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setRemitResponse(null);

      const body = {
        ...remitPayload,
        amount: Number(remitPayload.amount)
      };

      const res = await fetch(`${API_BASE_URL}/api/remit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Remittance failed');
      }

      const data = await res.json();
      setRemitResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setRemitPayload((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="app">
      <header>
        <h1>RemitFlow Africa</h1>
        <p>Hedera-powered remittances at lightning speed.</p>
      </header>

      <section className="card">
        <h2>1. Initialize infrastructure</h2>
        <button onClick={callInit} disabled={loading}>
          {loading ? 'Working…' : 'Initialize now'}
        </button>

        {initResult.tokenId && (
          <div className="result">
            <p><strong>Token ID:</strong> {initResult.tokenId}</p>
            <p><strong>Topic ID:</strong> {initResult.topicId}</p>
          </div>
        )}
      </section>

      <section className="card">
        <h2>2. Send remittance</h2>
        <form onSubmit={callRemit}>
          <label>
            Token ID
            <input
              name="tokenId"
              value={remitPayload.tokenId}
              onChange={handleChange}
              placeholder="0.0.xxxxx"
              required
            />
          </label>
          <label>
            Topic ID
            <input
              name="topicId"
              value={remitPayload.topicId}
              onChange={handleChange}
              placeholder="0.0.xxxxx"
              required
            />
          </label>
          <label>
            Recipient account ID
            <input
              name="recipientAccountId"
              value={remitPayload.recipientAccountId}
              onChange={handleChange}
              placeholder="0.0.xxxxx"
              required
            />
          </label>
          <label>
            Amount (KES cents)
            <input
              name="amount"
              type="number"
              min="1"
              value={remitPayload.amount}
              onChange={handleChange}
              placeholder="100"
              required
            />
          </label>
          <label>
            Memo (optional)
            <input
              name="memo"
              value={remitPayload.memo}
              onChange={handleChange}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Processing…' : 'Send'}
          </button>
        </form>

        {remitResponse && (
          <div className="result">
            <h3>Transfer successful</h3>
            <p><strong>Token tx:</strong> {remitResponse.transfer.transactionId}</p>
            <p><strong>Status:</strong> {remitResponse.transfer.status}</p>
            <p><strong>Consensus tx:</strong> {remitResponse.consensus.transactionId}</p>
            <p><strong>Sequence #:</strong> {remitResponse.consensus.sequenceNumber}</p>
          </div>
        )}
      </section>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

export default App;