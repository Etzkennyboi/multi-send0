// skill/skill.ts v2.0.0
import { ethers } from 'ethers';
import { validateInput, type MultiSendInput } from './validate.js';

const RPC_URL = process.env.RPC_URL ?? 'https://rpc.xlayer.tech';
const EXPECTED_CHAIN = 196n;

const provider = new ethers.JsonRpcProvider(RPC_URL, undefined, {
  staticNetwork: await ethers.Network.from(Number(EXPECTED_CHAIN)),
});

export interface TxPayload {
  to: string;
  data: string;
  value: string;
  gasEstimate?: string;
}

export interface MultiSendResponse {
  mode: 'bundle';
  transactions: TxPayload[];
}

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)"
];

const erc20Iface = new ethers.Interface(ERC20_ABI);

export async function buildMultiSendTx(raw: MultiSendInput): Promise<MultiSendResponse> {
  const input = validateInput(raw);

  console.log(`[SKILL] Generating bundle for ${input.recipients.length} transfers.`);
  
  const transactions: TxPayload[] = input.recipients.map(r => ({
    to: input.token,
    data: erc20Iface.encodeFunctionData('transfer', [r.address, BigInt(r.amount)]),
    value: '0',
  }));

  // Optional: Add gas estimation for each tx in the bundle if requested
  if (input.simulate && input.callerAddress) {
    for (const tx of transactions) {
      try {
        const gas = await provider.estimateGas({
          to: tx.to,
          data: tx.data,
          from: input.callerAddress,
        });
        tx.gasEstimate = gas.toString();
      } catch (err: any) {
        console.error(`[gas estimation] failed for recipient:`, err.message);
      }
    }
  }

  return {
    mode: 'bundle',
    transactions,
  };
}
