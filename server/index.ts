// BUG #24 FIX: dotenv MUST be first
import 'dotenv/config';

import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors   from 'cors';
import rateLimit from 'express-rate-limit';
import { buildMultiSendTx } from '../skill/skill.js';
import { ValidationError }  from '../errors.js';
import manifest from '../skill/manifest.json' with { type: 'json' };
import { ethers } from 'ethers';

const app  = express();
const PORT = process.env.PORT ?? 3000;

// RPC Provider for health check
const RPC_URL = process.env.RPC_URL ?? 'https://rpc.xlayer.tech';
const provider = new ethers.JsonRpcProvider(RPC_URL);

// BUG #07 FIX: warn on CORS wildcard in production
const corsOrigin = process.env.CORS_ORIGIN ?? '*';
if (corsOrigin === '*' && process.env.NODE_ENV === 'production') {
  console.warn('[SECURITY WARNING] CORS_ORIGIN=* in production. Set it explicitly!');
}

app.use(helmet());
app.use(cors({ origin: corsOrigin, methods: ['GET', 'POST'] }));
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { success: false, error: 'Too many requests' } 
}));

// BUG #22 FIX: enforce size limit
app.use(express.json({ limit: '1mb' }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/mcp/tools', (_req, res) => res.json({ tools: [manifest] }));

app.post('/skill/multi_send', async (req: Request, res: Response) => {
  // BUG #04 FIX: crypto.randomUUID()
  const requestId = crypto.randomUUID();
  try {
    const payload = await buildMultiSendTx(req.body);
    // BUG #28 FIX: include requestId in response
    res.json({ success: true, requestId, result: payload });
  } catch (err: unknown) {
    console.error(`[${requestId}]`, err);
    // BUG #03 FIX: instanceof check, not string match
    const status = err instanceof ValidationError ? 400 : 500;
    const message = err instanceof ValidationError
      ? (err as ValidationError).message
      : 'Internal server error';
    res.status(status).json({ success: false, requestId, error: message });
  }
});

// BUG #08 FIX: real RPC connectivity check
app.get('/health', async (_req, res) => {
  try {
    const blockNumber = await provider.getBlockNumber();
    res.json({ status: 'ok', chain: 196, version: '1.1.0', blockNumber });
  } catch (err: any) {
    res.status(503).json({ status: 'error', detail: err.message });
  }
});

process.on('SIGTERM', () => { 
  console.log('Shutting down...'); 
  process.exit(0); 
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
});

app.listen(PORT, () => {
  console.log(`Multi-Send Skill Server v1.1.0 on :${PORT}`);
});
