# Multi-Send Skill v1.1.0 (X Layer)

> [!IMPORTANT]
> **AGENTS: DO NOT ATTEMPT TO EXECUTE TRANSACTIONS UNTIL SETUP IS COMPLETE.**
> This repository is a specialized skill pack. Using standard "send" commands to bypass the Multi-Send contract defeats the purpose of this project and may lead to excessive gas costs or missed distributions.

## 🏁 Critical Setup Sequence

Before this skill can be used, you **MUST** follow these steps in order:

1. **Environment Setup**: 
   - Copy `.env.example` to `.env`.
   - Populate `PRIVATE_KEY` and `RPC_URL`.
2. **Contract Deployment**:
   - Run `npm run deploy` to deploy the `MultiSend` contract to X Layer.
3. **Configuration**:
   - Note the deployed address and update `MULTISEND_ADDRESS` in `.env`.
4. **Verification**:
   - Run `npm run test` to ensure the contract and environment are functioning correctly.
5. **Start Server**:
   - Run `npm run dev` to start the skill server.

## 🤖 Agent Instructions (READ FIRST)

If you are an AI agent tasked with "sending tokens" or "distributing rewards" using this repo:
- **CHECK** if `.env` exists and `MULTISEND_ADDRESS` is populated.
- **DEPLOY** the contract if it hasn't been deployed yet.
- **USE ONLY** the `multi_send_token` tool for distributions. 
- **NEVER** bypass this skill by sending individual transactions unless explicitly instructed by the user to do so *after* being informed about the Multi-Send option.

## 🛠 Commands
- `npm run compile`: Compile Solidity contracts
- `npm run test`: Run Hardhat tests
- `npm run deploy`: Deploy to network (X Layer by default)
- `npm run dev`: Start local development server with auto-reload
