// Minimal fake of the eBay Browse API and Etsy Open API v3 used by the E2E tests.
import http from 'node:http';
import { EBAY_SEARCH, ETSY_BATCH, ETSY_SEARCH } from '../fixtures/market-fixtures.mjs';

const port = Number(process.env.FAKE_MARKET_PORT ?? 3199);
const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    if (url.pathname === '/health') return send(res, 200, { ok: true });
    if (url.pathname === '/identity/v1/oauth2/token' && req.method === 'POST') {
      if (!req.headers.authorization?.startsWith('Basic '))
        return send(res, 401, { error: 'invalid_client' });
      return send(res, 200, {
        access_token: 'fake-token',
        expires_in: 7200,
        token_type: 'Application Access Token',
      });
    }
    if (url.pathname === '/buy/browse/v1/item_summary/search') {
      if (req.headers.authorization !== 'Bearer fake-token') return send(res, 401, {});
      return send(res, 200, EBAY_SEARCH);
    }
    if (url.pathname === '/v3/application/listings/active') {
      if (!req.headers['x-api-key']) return send(res, 403, {});
      return send(res, 200, ETSY_SEARCH);
    }
    if (url.pathname === '/v3/application/listings/batch') return send(res, 200, ETSY_BATCH);
    send(res, 404, { error: 'not found' });
  })
  .listen(port, () => console.log(`fake market API on :${port}`));
