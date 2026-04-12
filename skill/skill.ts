// skill/skill.ts  v1.1.0
import { ethers } from 'ethers';
import { ValidationError } from '../errors.js';
import { validateInput, type MultiSendInput } from './validate.js';
import MULTISEND_ABI from '../abi/MultiSend.json' with { type: 'json' };
import skillConfig from './config.json' with { type: 'json' };

const MULTISEND_ADDRESS = process.env.MULTISEND_ADDRESS || skillConfig.MULTISEND_ADDRESS;

const RPC_URL      = process.env.RPC_URL      ?? 'https://rpc.xlayer.tech';
const EXPECTED_CHAIN = 196n;

// Provider with explicit options (Bug #20)
const provider = new ethers.JsonRpcProvider(RPC_URL, undefined, {
  staticNetwork: await ethers.Network.from(196),
});

// BUG #29 FIX: verify we're on X Layer at startup
try {
  const net = await provider.getNetwork();
  if (net.chainId !== EXPECTED_CHAIN) {
    console.error(`[CRITICAL] Wrong chain: ${net.chainId} (expected ${EXPECTED_CHAIN})`);
  }
} catch (err) {
  console.warn('[WARN] Could not verify chain ID at startup - RPC may be down.');
}

// BUG #17 FIX: retry helper
async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 500): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise(r => setTimeout(r, delayMs * 2 ** i));
    }
  }
  throw new Error('unreachable');
}

export interface TxPayload {
  to: string;
  data: string;
  value: string;
  gasEstimate: string;
}

// BUG #01 FIX: return type is Promise<TxPayload>
export async function buildMultiSendTx(raw: MultiSendInput): Promise<TxPayload> {
  if (!MULTISEND_ADDRESS) {
    throw new Error('MULTISEND_ADDRESS is not configured');
  }

  const input = validateInput(raw);
  const iface = new ethers.Interface(MULTISEND_ABI);
  const addrs = input.recipients.map(r => r.address);

  let amounts: bigint[];
  try {
    amounts = input.recipients.map(r => BigInt(r.amount));
  } catch {
    throw new ValidationError('Invalid amount — must be valid integer in wei.');
  }

  const data = iface.encodeFunctionData('multiSend', [input.token, addrs, amounts]);

  let gasEstimate = '0';
  if (input.simulate && input.callerAddress) {
    // BUG #06 + #17 FIX: retry + preserve revert reason
    gasEstimate = await withRetry(async () => {
      try {
        const gas = await provider.estimateGas({
          to: MULTISEND_ADDRESS,
          data,
          from: input.callerAddress,
        });

        // BUG #15 FIX: warn if estimate approaches block gas limit
        const block = await provider.getBlock('latest');
        if (block && gas > (block.gasLimit * 9n) / 10n) {
          console.warn(`[WARN] gasEstimate (${gas}) > 90% block gas limit`);
        }
        return gas.toString();
      } catch (err: any) {
        // BUG #23 FIX: log full revert reason
        const reason = err?.revert?.name ?? err?.reason ?? err?.message ?? 'unknown';
        console.error('[gas estimation] revert reason:', reason, 'data:', err?.data);
        
        if (err.code === 'CALL_EXCEPTION') {
          throw new ValidationError(
            `Gas estimation failed (${reason}). Check: approval granted, balance sufficient, valid recipients.`
          );
        }
        throw new Error(`Gas estimation error: ${err.message}`);
      }
    });
  }

  return {
    to: MULTISEND_ADDRESS,
    data,
    value: '0',
    gasEstimate,
  };
}
