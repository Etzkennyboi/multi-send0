#!/usr/bin/env node
// Execute multi-send transaction with approval
// Usage: npm run execute -- "send 0.01 USDT to address1 and address2"

import 'dotenv/config';
import { ethers } from 'ethers';
import { execSync } from 'child_process';
import { buildMultiSendTx } from './skill.js';

const USDT_ADDRESS = '0x1E4a5963aBFD975d8c9021ce480b42188849D41d';
const USDT_ABI = ["function approve(address spender, uint256 amount)"];

function parseNaturalLanguage(input) {
  const pattern = /send\s+([\d.]+)\s*(\w+)\s+to\s+(.+)/i;
  const match = input.match(pattern);
  
  if (!match) {
    throw new Error('Invalid format. Use: "send 0.01 USDT to address1 and address2"');
  }
  
  const amount = match[1];
  const token = match[2].toUpperCase();
  const addressesPart = match[3];
  
  const addresses = addressesPart
    .split(/(?:,|\s+and\s+|\s+)/)
    .map(a => a.trim())
    .filter(a => a.startsWith('0x') && a.length === 42);
  
  if (addresses.length === 0) {
    throw new Error('No valid addresses found');
  }
  
  const decimals = token === 'USDT' ? 6 : 18;
  const amountInWei = BigInt(Math.round(parseFloat(amount) * 10 ** decimals)).toString();
  
  return {
    token: token === 'USDT' ? USDT_ADDRESS : token,
    recipients: addresses.map(addr => ({
      address: addr,
      amount: amountInWei
    }))
  };
}

async function main() {
  const input = process.argv.slice(2).join(' ');
  
  if (!input) {
    console.log('Usage: npm run execute -- "send 0.01 USDT to 0x... and 0x..."');
    process.exit(1);
  }
  
  const MULTISEND_ADDRESS = process.env.MULTISEND_ADDRESS;
  if (!MULTISEND_ADDRESS) {
    console.error('❌ MULTISEND_ADDRESS not set');
    console.log('Run: npm run deploy');
    process.exit(1);
  }
  
  try {
    console.log('Parsing:', input);
    const parsed = parseNaturalLanguage(input);
    
    console.log('\n📦 Building multi-send transaction...');
    const result = await buildMultiSendTx(parsed);
    
    console.log('\n✅ Transaction ready:');
    console.log('Contract:', result.transaction.to);
    console.log('Data:', result.transaction.data.substring(0, 66) + '...');
    
    // Calculate total amount for approval
    const totalAmount = parsed.recipients.reduce((sum, r) => sum + BigInt(r.amount), BigInt(0));
    console.log('\n💰 Total to approve:', ethers.formatUnits(totalAmount, 6), 'USDT');
    
    // Check for OKX credentials
    const apiKey = process.env.OKX_API_KEY;
    const secretKey = process.env.OKX_SECRET_KEY;
    const passphrase = process.env.OKX_PASSPHRASE;
    
    if (apiKey && secretKey && passphrase) {
      console.log('\n🔐 Using OKX Agentic Wallet...');
      
      // Step 1: Approve tokens
      console.log('\nStep 1: Approving USDT...');
      const approveData = new ethers.Interface(USDT_ABI).encodeFunctionData('approve', [
        MULTISEND_ADDRESS,
        totalAmount.toString()
      ]);
      
      const approveScript = `
$env:OKX_API_KEY = "${apiKey}"
$env:OKX_SECRET_KEY = "${secretKey}"
$env:OKX_PASSPHRASE = "${passphrase}"
onchainos wallet contract-call --chain 196 --to ${USDT_ADDRESS} --input-data ${approveData} --amt 0
`;
      
      require('fs').writeFileSync('approve_temp.ps1', approveScript);
      execSync('powershell -ExecutionPolicy Bypass -File approve_temp.ps1', { stdio: 'inherit' });
      require('fs').unlinkSync('approve_temp.ps1');
      
      // Step 2: Execute multi-send
      console.log('\nStep 2: Executing multi-send...');
      const executeScript = `
$env:OKX_API_KEY = "${apiKey}"
$env:OKX_SECRET_KEY = "${secretKey}"
$env:OKX_PASSPHRASE = "${passphrase}"
onchainos wallet contract-call --chain 196 --to ${result.transaction.to} --input-data ${result.transaction.data} --amt 0
`;
      
      require('fs').writeFileSync('execute_temp.ps1', executeScript);
      execSync('powershell -ExecutionPolicy Bypass -File execute_temp.ps1', { stdio: 'inherit' });
      require('fs').unlinkSync('execute_temp.ps1');
      
      console.log('\n✅ Multi-send complete!');
      
    } else {
      console.log('\n⚠️  OKX credentials not found');
      console.log('Transaction payload ready. To execute:');
      console.log('1. Approve USDT to', MULTISEND_ADDRESS);
      console.log('2. Call multiSendToken with the data above');
      console.log('\nOr set OKX credentials in .env and run again');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
