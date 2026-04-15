#!/usr/bin/env node
// Simple CLI for multi-send - Just run after git clone + npm install
// Usage: npm run send -- "send 0.01 USDT to address1 and address2"

import 'dotenv/config';
import { buildMultiSendTx } from './skill.js';

const USDT_ADDRESS = '0x1E4a5963aBFD975d8c9021ce480b42188849D41d'; // X Layer USDT

function parseNaturalLanguage(input) {
  // Pattern: "send X TOKEN to address1[, address2, ...]"
  const pattern = /send\s+([\d.]+)\s*(\w+)\s+to\s+(.+)/i;
  const match = input.match(pattern);
  
  if (!match) {
    throw new Error('Invalid format. Use: "send 0.01 USDT to address1 and address2"');
  }
  
  const amount = match[1];
  const token = match[2].toUpperCase();
  const addressesPart = match[3];
  
  // Parse addresses (comma, "and", or space separated)
  const addresses = addressesPart
    .split(/(?:,|\s+and\s+|\s+)/)
    .map(a => a.trim())
    .filter(a => a.startsWith('0x') && a.length === 42);
  
  if (addresses.length === 0) {
    throw new Error('No valid addresses found. Addresses must start with 0x and be 42 chars');
  }
  
  // Convert amount to wei (6 decimals for USDT)
  const decimals = token === 'USDT' ? 6 : 18;
  const amountInWei = BigInt(Math.round(parseFloat(amount) * 10 ** decimals)).toString();
  
  return {
    token: token === 'USDT' ? USDT_ADDRESS : token, // Support USDT by name
    recipients: addresses.map(addr => ({
      address: addr,
      amount: amountInWei
    }))
  };
}

async function main() {
  const input = process.argv.slice(2).join(' ');
  
  if (!input) {
    console.log('Usage: npm run send -- "send 0.01 USDT to 0x123... and 0x456..."');
    console.log('');
    console.log('Examples:');
    console.log('  npm run send -- "send 0.01 USDT to 0x123...abc and 0x456...def"');
    console.log('  npm run send -- "send 1 USDT to 0x123...abc, 0x456...def, 0x789...ghi"');
    process.exit(1);
  }
  
  try {
    console.log('Parsing:', input);
    const parsed = parseNaturalLanguage(input);
    
    console.log('Building transaction...');
    const result = await buildMultiSendTx(parsed);
    
    console.log('\n✅ Transaction ready:');
    console.log(JSON.stringify(result, null, 2));
    
    // Check if MULTISEND_ADDRESS is configured
    if (!process.env.MULTISEND_ADDRESS) {
      console.log('\n⚠️  Warning: MULTISEND_ADDRESS not set in .env');
      console.log('   Please set it before executing transactions.');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
