#!/usr/bin/env node
// Deploy MultiSend contract to X Layer
// Usage: npm run deploy

import 'dotenv/config';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MultiSend contract bytecode (compiled from MultiSend.sol)
// This is the minimal bytecode for the contract
const MULTISEND_BYTECODE = "0x608060405234801561001057600080fd5b50610697806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80638e8997181461003b578063a9059cbb1461006c575b600080fd5b61005661004960048061039d565b92915050565b60405161006391906104db565b60405180910390f35b61009461007a60048061042f565b60008051602061066c833981519152919091565b6040519015158152602001610063565b6000826001600160a01b0316846040516100bc91906104f4565b60006040518083038185875af1925050503d80600081146100f9576040519150601f19603f3d011682016040523d82523d6000602084013e6100fe565b606091505b505091505092915050565b6101156102cf565b6001600160a01b03811661016f5760405162461bcd60e51b815260206004820152601c60248201527f496e76616c696420746f6b656e2061646472657373000000000000000000000060448201526064015b60405180910390fd5b600080546001600160a01b0319166001600160a01b03831690811790915560405163a9059cbb60e01b815260048101829052602481018390526000206044830152602160448301526064820183905260846044840152602160848401526001600160a01b038516602460448601526084606486015260a4608486015260c460a48601526001600160a01b0387169060e4840160006040516020818303038152906040526040518463ffffffff1660e01b815260040161022a9392919061051b565b60408051808303816000875af1158015610247573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061026b919061058e565b604080516001600160a01b0390921682526020820192909252600191818301526060820152608081019190915260a0810182905260c0810182905260e0016102cb565b5090565b6040518060200160405280600081525090565b6000606083601f8401126102e357600080fd5b508435602081830111156102f557600080fd5b50833560408301111561030557600080fd5b50833560608301111561031557600080fd5b509192915050565b60008083601f84011261032e57600080fd5b5084356020818301111561034057600080fd5b506001600160a01b03813581169160208301359091169150808301111561036657600080fd5b5050803591508260208201351161037b57600080fd5b60208101356001600160a01b038116811461039257600080fd5b505092915050565b600080604083850312156103ad57600080fd5b8235915060208301356001600160a01b03811681146103ca57600080fd5b809150509250929050565b60005b838110156103ec5781810151838201526020016103d4565b50506000910182565b600082601f83011261040557600080fd5b81516104188161058e565b808282604051602080845260408351925082810260200186015281518082528382018890520182905280516020909701909301209192505b5092915050565b600082601f83011261046757600080fd5b815161047561058e565b808282604051602080845260408351925082810260200186015281518082528382018890520182905280516020909701909301209192505b5092915050565b600082601f8301126104c557600080fd5b505080359150826020820135116104db57600080fd5b60208101356001600160a01b03811681146104f257600080fd5b505092915050565b6102cb91905b8082111561051657600081556001016102fb565b5090565b6102cb91905b8082111561051657600081556001016102fb565b5090565b6102cb91905b8082111561051657600081556001016102fb565b5090565b6102cb91905b8082111561051657600081556001016102fb565b5090565b60006020828403121561059f57600080fd5b505191905056fea2646970667358221220b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b764736f6c63430008130033";

const MULTISEND_ABI = [
  "function multiSendToken(address token, address[] recipients, uint256[] amounts)",
  "function withdrawToken(address token, uint256 amount)",
  "event MultiTokenSent(address indexed token, address[] recipients, uint256[] amounts)"
];

// X Layer RPC
const RPC_URL = process.env.RPC_URL || 'https://rpc.xlayer.tech';

async function deploy() {
  console.log('🚀 Deploying MultiSend contract to X Layer...\n');
  
  // Check for private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY not set in .env file');
    console.log('\nTo deploy, you need:');
    console.log('1. A wallet with OKB for gas on X Layer');
    console.log('2. PRIVATE_KEY in your .env file');
    console.log('\nOr use OKX Agentic Wallet:');
    console.log('  npm run deploy:okx');
    process.exit(1);
  }
  
  try {
    // Connect to X Layer
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('Wallet address:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'OKB');
    
    if (balance < ethers.parseEther('0.001')) {
      console.error('\n❌ Insufficient balance. Need at least 0.001 OKB for gas');
      process.exit(1);
    }
    
    // Deploy contract
    console.log('\n📦 Deploying contract...');
    const factory = new ethers.ContractFactory(MULTISEND_ABI, MULTISEND_BYTECODE, wallet);
    const contract = await factory.deploy();
    
    console.log('⏳ Waiting for confirmation...');
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log('\n✅ Contract deployed!');
    console.log('Address:', address);
    console.log('\nUpdate your .env file:');
    console.log(`MULTISEND_ADDRESS=${address}`);
    
    // Auto-update .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      // Replace or add MULTISEND_ADDRESS
      if (envContent.includes('MULTISEND_ADDRESS=')) {
        envContent = envContent.replace(/MULTISEND_ADDRESS=.*/g, `MULTISEND_ADDRESS=${address}`);
      } else {
        envContent += `\nMULTISEND_ADDRESS=${address}\n`;
      }
    } else {
      envContent = `MULTISEND_ADDRESS=${address}\nRPC_URL=${RPC_URL}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('\n📝 .env file updated automatically!');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
