# Multi-Send Skill v2.0 (Transaction Bundler)

> [!TIP]
> **This is a contract-less skill.** It generates a bundle of standard ERC20 `transfer` transactions. Most modern AI/TEE wallets can execute this bundle in a single user-interaction.

## 🏁 Quickstart

1. **Initialize**: Run `npm install`.
2. **Configure**: Set `RPC_URL` in `.env` (defaults to X Layer).
3. **Serve**: Run `npm run dev`.

## 🤖 Agent Workflow
- **Discovery**: `GET /mcp/tools` defines the `multi_send_token` tool.
- **Action**: Pass recipient list -> Receive `transactions[]` bundle -> Execute bundle via wallet.

## 🛠 Commands
- `npm run dev`: Start local MCP-compatible server
- `npm run build`: Compile TypeScript
- `npm run test`: Run bundle simulation test
