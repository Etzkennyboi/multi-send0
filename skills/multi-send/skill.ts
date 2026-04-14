// skills/multi-send/skill.ts v3.0.0
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
  mode: 'contract';
  transaction: TxPayload;
}

const MULTISEND_ABI = [
  "function multiSendToken(address token, address[] recipients, uint256[] amounts)"
];

const multiSendIface = new ethers.Interface(MULTISEND_ABI);

/**
 * Builds a single transaction to execute a multi-send via a smart contract.
 * Mode: contract (One Transaction)
 */
export async function buildMultiSendTx(raw: MultiSendInput): Promise<MultiSendResponse> {
  const input = validateInput(raw);
  const MULTISEND_ADDRESS = process.env.MULTISEND_ADDRESS;

  if (!MULTISEND_ADDRESS) {
    throw new Error('MULTISEND_ADDRESS is required for contract mode. Please configure it in your environment.');
  }

  console.log(`[SKILL] Generating contract call for ${input.recipients.length} recipients.`);

  const recipients = input.recipients.map(r => r.address);
  const amounts = input.recipients.map(r => BigInt(r.amount));

  const data = multiSendIface.encodeFunctionData('multiSendToken', [
    input.token,
    recipients,
    amounts
  ]);

  const transaction: TxPayload = {
    to: MULTISEND_ADDRESS,
    data,
    value: '0',
  };

  // Perform gas estimation if requested
  if (input.simulate && input.callerAddress) {
    try {
      const gas = await provider.estimateGas({
        to: transaction.to,
        data: transaction.data,
        from: input.callerAddress,
      });
      transaction.gasEstimate = gas.toString();
    } catch (err: any) {
      console.error(`[gas estimation] failed for contract call:`, err.message);
      // We still return the tx even if simulation fails, but without gasEstimate
    }
  }

  return {
    mode: 'contract',
    transaction,
  };
}
