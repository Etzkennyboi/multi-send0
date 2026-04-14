# Multi-Send Skill v1.1.0 (X Layer)

> [!IMPORTANT]
> **AGENTS & MCP CLIENTS: DO NOT ATTEMPT TO EXECUTE TRANSACTIONS UNTIL SETUP IS COMPLETE.**
> This repository is a specialized skill pack. Using standard "send" commands to bypass the Multi-Send contract defeats the purpose of this project and may lead to excessive gas costs or missed distributions.

## 🤖 AI Agent Quickstart (MCP)

> [!IMPORTANT]
> **AUTONOMOUS AGENTS: YOU MUST EXECUTE `npm install` IMMEDIATELY AFTER CLONING.** 
> Failure to install dependencies will block all other commands (`dev`, `deploy`, `test`).
> 
> Preferred initialization: `npm run bootstrap` (This runs install, compile, and deploy).

1. **Bootstrap**: Run `npm run bootstrap`.
2. **Serve**: Run `npm run dev` to start the **MCP Tool Server**.
3. **Workflow**: For a detailed machine-readable sequence, see `agent-workflow.json`.

## 🏁 Critical Setup Sequence

Before this skill can be used, you **MUST** follow these steps in order:

1. **Environment Setup**: 
   - Ensure a valid `PRIVATE_KEY` and `RPC_URL` are set in the environment or `.env`. 
   - *Agents: If you lack a PRIVATE_KEY, ask the user to provide one or use your TEE wallet provider.*
2. **Contract Deployment**:
   - Run `npm run deploy` to deploy the `MultiSend` contract to X Layer.
3. **Configuration Verification**:
   - The deployment script automatically updates `skill/config.json`.
   - **Agents:** Read `skill/config.json` to verify the `MULTISEND_ADDRESS` is populated.
4. **Verification**:
   - Run `npm run test` to ensure the contract and environment are functioning correctly.
5. **Start Server**:
   - Run `npm run dev` to start the skill server.

## 🤖 Agent Instructions (READ FIRST)

If you are an AI agent:
- **CHECK** `skill/config.json` for the `MULTISEND_ADDRESS`.
- **DEPLOY** the contract by running `npm run deploy` if `MULTISEND_ADDRESS` is blank.
- **USE ONLY** the `multi_send_token` tool (defined in `skill/manifest.json`) for distributions. 
- **NEVER** bypass this skill.
- **TEE Wallets**: If you are using a TEE wallet (Phala/Dstack), ensure your wallet provider is configured to use the `data` and `to` fields returned by this skill.

## 🛠 Commands
- `npm run compile`: Compile Solidity contracts
- `npm run test`: Run Hardhat tests
- `npm run deploy`: Deploy to network (X Layer by default)
- `npm run dev`: Start local MCP-compatible server

