# Multi-Send Token

**Send tokens to multiple recipients in ONE transaction on X Layer.**

AI agents love this because it's simple: clone, install, deploy contract, send to multiple addresses in one command.

---

## Table of Contents

- [Quick Start](#quick-start-ai-agent-workflow)
- [Prerequisites](#prerequisites)
- [Deployment Guide](#deployment-guide)
- [Commands](#commands)
- [Usage Examples](#usage-examples)
- [How It Works](#how-it-works)
- [Supported Tokens](#supported-tokens)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Quick Start (AI Agent Workflow)

```bash
# 1. Clone repo
git clone <your-repo-url>
cd multi-send-skill

# 2. Install (auto-runs postinstall)
npm install

# 3. Deploy MultiSend contract (one-time setup)
npm run deploy

# 4. Send to multiple addresses in ONE transaction!
npm run execute -- "send 0.01 USDT to 0xADDR1 and 0xADDR2"
```

---

## Prerequisites

### Option A: Deploy with Private Key (Recommended)

Create `.env` file:
```bash
# Required for deployment
PRIVATE_KEY=0xYourPrivateKeyWith0xPrefix

# Optional - defaults to X Layer mainnet
RPC_URL=https://rpc.xlayer.tech
```

**Need a private key?**
1. Create a new wallet (MetaMask, OKX Wallet, etc.)
2. Get OKB from OKX or bridge from Ethereum
3. Export private key and paste above

### Option B: Use OKX Agentic Wallet

Already set up in your environment:
```bash
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_PASSPHRASE=your_passphrase
```

Then deploy with: `npm run deploy:okx`

---

## Deployment Guide

### Step 1: Environment Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and configure your credentials:**
   
   **For Private Key Deployment:**
   ```bash
   PRIVATE_KEY=0xYourPrivateKeyHere
   RPC_URL=https://rpc.xlayer.tech
   ```
   
   **For OKX Agentic Wallet:**
   ```bash
   OKX_API_KEY=your_api_key
   OKX_SECRET_KEY=your_secret_key
   OKX_PASSPHRASE=your_passphrase
   RPC_URL=https://rpc.xlayer.tech
   ```

### Step 2: Fund Your Wallet

Before deploying, ensure your wallet has:
- **OKB tokens** on X Layer for gas fees (minimum 0.001 OKB recommended)
- Get OKB from [OKX](https://www.okx.com/) or bridge from Ethereum

### Step 3: Deploy the Contract

**Option A: Deploy with Private Key**
```bash
npm run deploy
```

**Option B: Deploy via OKX Agentic Wallet**
```bash
npm run deploy:okx
```

**What happens during deployment:**
1. Compiles the MultiSend.sol contract
2. Deploys to X Layer mainnet
3. Automatically saves the contract address to `.env` as `MULTISEND_ADDRESS`
4. Displays the contract address for verification

**Example output:**
```
🚀 Deploying MultiSend contract to X Layer...

Wallet address: 0xYourWalletAddress...
Balance: 0.05 OKB

📦 Deploying contract...
⏳ Waiting for confirmation...

✅ Contract deployed!
Address: 0x1234...abcd

Update your .env file:
MULTISEND_ADDRESS=0x1234...abcd

📝 .env file updated automatically!
```

### Step 4: Verify Deployment

Check your `.env` file contains:
```bash
MULTISEND_ADDRESS=0xYourDeployedContractAddress
```

---

## Commands

### Deploy Contract (One-time)
```bash
# Deploy with private key
npm run deploy

# Or deploy via OKX Agentic Wallet
npm run deploy:okx
```

**Output:** Contract address automatically saved to `.env`

### Build Transaction (Preview)
```bash
# See transaction without executing
npm run send -- "send 0.01 USDT to 0x... and 0x..."
```

### Execute Multi-Send
```bash
# Full execution with approval and send
npm run execute -- "send 0.01 USDT to 0xADDR1 and 0xADDR2"
```

**What happens:**
1. Parses natural language
2. Builds transaction
3. Approves USDT to MultiSend contract
4. Executes multi-send in ONE transaction
5. All recipients get tokens atomically

---

## Usage Examples

```bash
# Send to 2 addresses
npm run execute -- "send 0.01 USDT to 0xf33ee27249dd9f870c5fe318064065e1ffe218f9 and 0x1b09760be32b745f41ea164a6d1f0fef9239204d"

# Send to 3 addresses (comma separated)
npm run execute -- "send 0.05 USDT to 0xADDR1, 0xADDR2, 0xADDR3"

# Send to 4 addresses (mixed format)
npm run execute -- "send 0.1 USDT to 0xADDR1, 0xADDR2 and 0xADDR3, 0xADDR4"
```

---

## How It Works

1. **MultiSend Contract**: A smart contract that receives one transaction and executes multiple ERC20 transfers
2. **Natural Language Parser**: Converts "send X to Y and Z" into transaction data
3. **Atomic Execution**: All transfers succeed or all fail together
4. **Gas Efficient**: One transaction instead of multiple

### Contract Functions

```solidity
function multiSendToken(
    address token,
    address[] recipients,
    uint256[] amounts
)
```

### Contract Architecture

```
User Transaction
       ↓
MultiSend Contract
       ↓
   ┌───┴───┐
   ↓       ↓
Recipient1  Recipient2
   ↑           ↑
   └─────┬─────┘
         ↓
    ERC20 Token
```

**Key Benefits:**
- **Atomicity**: All transfers complete together or all revert
- **Gas Savings**: Significantly cheaper than individual transactions
- **Simplicity**: Single transaction for multiple recipients

---

## Supported Tokens

Currently supports:
- **USDT** on X Layer: `0x1E4a5963aBFD975d8c9021ce480b42188849D41d`
- Any ERC20 token (specify address directly)

---

## Project Structure

```
├── contracts/
│   ├── MultiSend.sol          # Main smart contract
│   └── IERC20.sol             # ERC20 interface
├── scripts/
│   ├── deploy.js              # Deploy with private key
│   └── deploy-okx.js          # Deploy via OKX wallet
├── skills/multi-send/
│   ├── cli.ts                 # Natural language parser
│   ├── execute.ts             # Full execution flow
│   ├── skill.ts               # Transaction builder
│   ├── validate.ts            # Input validation
│   ├── errors.ts              # Error handling
│   └── index.ts               # Main entry point
├── .env.example               # Environment template
├── hardhat.config.cjs         # Hardhat configuration
└── package.json               # Dependencies & scripts
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MULTISEND_ADDRESS` | Yes | Deployed contract address (auto-set by deploy) |
| `PRIVATE_KEY` | For deploy | Wallet private key with 0x prefix |
| `RPC_URL` | No | X Layer RPC (default: https://rpc.xlayer.tech) |
| `OKX_API_KEY` | For OKX | Your OKX API key |
| `OKX_SECRET_KEY` | For OKX | Your OKX secret |
| `OKX_PASSPHRASE` | For OKX | Your OKX passphrase |

---

## Troubleshooting

### "MULTISEND_ADDRESS not set"
Run `npm run deploy` first to deploy the contract

### "Insufficient balance"
Need OKB on X Layer for gas. Get from OKX or bridge from Ethereum.

### "Token not found"
Make sure you're using the correct USDT address for X Layer

### "Execution reverted"
- Check token approval
- Ensure you have enough USDT balance
- Verify addresses are valid

### "ProviderError: intrinsic gas too low"
Your wallet may not have enough OKB for gas. Fund your wallet with at least 0.001 OKB.

### "Contract deployment failed"
- Check your RPC_URL is accessible
- Verify your private key is correct (must start with 0x)
- Ensure you have sufficient OKB balance

### "Nonce too low"
Wait a few seconds and try again, or reset your wallet's nonce.

---

## For AI Agents

This repo is designed for AI agents. After `git clone` and `npm install`:

1. **Deploy contract** (one-time): `npm run deploy`
2. **Send to multiple addresses**: `npm run execute -- "send 0.01 USDT to 0x... and 0x..."`

No complex setup. No multiple steps. One command = one transaction to multiple recipients.

---

## Smart Contract Details

### MultiSend.sol

**Purpose**: Batch ERC20 token transfers in a single atomic transaction

**Key Features**:
- Validates input arrays have matching lengths
- Ensures no zero-address recipients
- Validates all amounts are greater than zero
- Emits event for off-chain tracking
- Includes emergency withdrawal function

**Security Considerations**:
- Requires prior token approval
- Atomic execution prevents partial transfers
- No reentrancy risk (state changes after external calls)

---

## Development

### Install Dependencies
```bash
npm install
```

### Run Tests
```bash
npm test
```

### Build Contract
```bash
npx hardhat compile
```

---

## License

MIT
