import { ethers } from 'ethers';
import { ValidationError } from './errors.js';

// BUG #09 FIX: configurable max amount
const MAX_AMOUNT = process.env.MAX_AMOUNT_WEI
  ? BigInt(process.env.MAX_AMOUNT_WEI)
  : BigInt('999999999999999999999999999999');

export interface Recipient {
  address: string;
  amount: string;
}

export interface MultiSendInput {
  token: string;
  recipients: Recipient[];
  callerAddress?: string;
  simulate?: boolean;
}

export function validateInput(raw: MultiSendInput): MultiSendInput {
  if (!raw.token) throw new ValidationError('Token address is required');
  if (!ethers.isAddress(raw.token)) throw new ValidationError(`Invalid token: ${raw.token}`);
  if (raw.token === ethers.ZeroAddress) throw new ValidationError('Token cannot be zero address');

  if (!Array.isArray(raw.recipients)) throw new ValidationError('recipients must be an array');
  if (raw.recipients.length < 2) throw new ValidationError('At least 2 recipients required');
  if (raw.recipients.length > 100) throw new ValidationError('Max 100 recipients per call');

  const seen = new Set<string>();
  let totalWei = 0n;  // BUG #19 FIX: accumulate for zero-total check

  for (let i = 0; i < raw.recipients.length; i++) {
    const r = raw.recipients[i];
    if (!ethers.isAddress(r.address)) throw new ValidationError(`Recipient ${i}: invalid address`);
    if (r.address === ethers.ZeroAddress)  throw new ValidationError(`Recipient ${i}: zero address`);
    const norm = r.address.toLowerCase();
    if (seen.has(norm)) throw new ValidationError(`Recipient ${i}: duplicate address`);
    seen.add(norm);

    let amt: bigint;
    try {
      let amountStr = String(r.amount).trim().toLowerCase();
      if (/^[0-9]+(e[0-9]+)?$/.test(amountStr) && amountStr.includes('e')) {
        const [base, exp] = amountStr.split('e');
        if (base === '0') {
          amt = 0n;
        } else {
          amt = BigInt(base) * (10n ** BigInt(exp));
        }
      } else {
        amt = BigInt(amountStr);
      }
    } catch { throw new ValidationError(`Recipient ${i}: invalid amount '${r.amount}'`); }
    if (amt <= 0n) throw new ValidationError(`Recipient ${i}: amount must be > 0`);
    if (amt > MAX_AMOUNT) throw new ValidationError(`Recipient ${i}: amount exceeds maximum`);
    totalWei += amt;
  }

  // BUG #19 FIX
  if (totalWei === 0n) throw new ValidationError('Total send amount must be greater than 0');

  if (raw.callerAddress && !ethers.isAddress(raw.callerAddress))
    throw new ValidationError(`Invalid callerAddress: ${raw.callerAddress}`);

  return raw;
}
