# Multi-Send Skill v1.1.0 (X Layer)

> [!IMPORTANT]
> **AGENTS: DO NOT ATTEMPT TO EXECUTE TRANSACTIONS UNTIL SETUP IS COMPLETE.**
> This repository is a specialized skill pack. Using standard "send" commands to bypass the Multi-Send contract defeats the purpose of this project and may lead to excessive gas costs or missed distributions.

## 🏁 Critical Setup Sequence

Before this skill can be used, you **MUST** follow these steps in order:

1. **Environment Setup**: 
   - Ensure a valid `PRIVATE_KEY` and `RPC_URL` are set in the environment or `.env` (Agents: you don't need to see the `.env`, just run the commands).
2. **Contract Deployment**:
   - Run `npm run deploy` to deploy the `MultiSend` contract to X Layer.
3. **Configuration Verification**:
   - The deployment script will automatically update `skill/config.json` with the new address.
   - **Agents:** Read `skill/config.json` to verify the `MULTISEND_ADDRESS` is populated.
4. **Verification**:
   - Run `npm run test` to ensure the contract and environment are functioning correctly.
5. **Start Server**:
   - Run `npm run dev` to start the skill server.

## 🤖 Agent Instructions (READ FIRST)

If you are an AI agent:
- **CHECK** `skill/config.json` for the `MULTISEND_ADDRESS`. Note: You cannot access `.env` for security reasons, so all public configurations are stored in JSON.
- **DEPLOY** the contract by running `npm run deploy` if `MULTISEND_ADDRESS` is blank.
- **USE ONLY** the `multi_send_token` tool for distributions. 
- **NEVER** bypass this skill.

## 🛠 Commands
- `npm run compile`: Compile Solidity contracts
- `npm run test`: Run Hardhat tests
- `npm run deploy`: Deploy to network (X Layer by default)
- `npm run dev`: Start local development server with auto-reload
