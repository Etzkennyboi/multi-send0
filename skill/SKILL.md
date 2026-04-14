---
name: multi_send_token
description: "Batch transfer ERC20 tokens to multiple recipients in a single atomic transaction on X Layer. High efficiency for payouts and distributions."
license: MIT
metadata:
  version: "1.1.0"
  blockchain: X Layer
---

# Multi-Send Token

Batch transfer ERC20 tokens to multiple recipients in a single atomic transaction on X Layer. High efficiency for payouts and distributions.

## 🛑 INITIALIZATION & DEPLOYMENT

- **MCP DISCOVERY**: This skill serves tool definitions via [Model Context Protocol](https://modelcontextprotocol.io). Access them via `GET /mcp/tools` on the dev server.
- **DEPLOYMENT STATUS**: If `MULTISEND_ADDRESS` is not configured, the skill will operate in **READY-ONLY mode**. You can discover tools, but execution will fail until a contract is deployed.
- **BOOTSTRAP**: You **SHOULD** run `npm run bootstrap` to initialize the environment. If a `PRIVATE_KEY` is missing, deployment will be skipped—this is acceptable for initial server startup.
- **TEE WALLET INTEGRATION**: When using a TEE wallet, use the returned `data` and `to` fields in your signing payload.
- **NEVER** bypass this skill for batching. Use the `MultiSend` contract for efficiency.

## ## Instruction Priority

This document uses tagged blocks to indicate rule severity. In case of conflict, higher priority wins:

1. **`<NEVER>`** — Absolute prohibition. Violation may cause irreversible fund loss. Never bypass.
2. **`<MUST>`** — Mandatory step. Skipping breaks functionality or safety.
3. **`<SHOULD>`** — Best practice. Follow when possible; deviation acceptable with reason.

## Command Index

| Command | Description | Auth Required |
|---|---|---|
| `multi_send_token` | Batch transfer ERC20 tokens to multiple recipients in a single atomic transaction | Yes |

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | **Yes** | The ERC20 token address to send (must be a valid 0x address on X Layer). |
| `recipients` | array | **Yes** | List of recipients and corresponding amounts in wei. Min 2, max 100 items. |
| `recipients[].address` | string | **Yes** | Recipient wallet address. |
| `recipients[].amount` | string | **Yes** | Amount to send in wei (e.g. '1000000000000000000' for 1 token if 18 decimals). |
| `callerAddress` | string | No | The address of the sender (required for gas simulation). |
| `simulate` | boolean | No | Whether to simulate gas estimation. Requires `callerAddress`. Defaults to `true`. |

## Return Format

Returns a `TxPayload` object ready for TEE execution:

```json
{
  "to": "0xDef...",     // The Multi-Send contract address
  "data": "0x...",      // The encoded multiSend(address,address[],uint256[]) calldata
  "value": "0",         // Always "0" for ERC-20 multi-send transactions
  "gasEstimate": "..."  // The estimated gas limit (if simulate = true)
}
```

## Global Notes

<MUST>
- The `token` address and ALL `recipient.address` fields MUST be valid EVM (0x-prefixed, 42 chars) addresses.
- The `amount` fields MUST be provided in the lowest minimal units (e.g. `wei`) as strings. Do not pass floats or UI units.
- Before calling `multi_send_token`, ensure the `callerAddress` has approved the Multi-Send contract to spend the required total amount of the ERC20 token.
- Always perform gas simulation (`simulate: true`) to catch revert errors (insufficient allowance, insufficient balance) early, unless executing a blind pre-compiled transaction.
</MUST>

<SHOULD>
- If the simulation fails (`CALL_EXCEPTION`), suggest checking the token allowance and wallet balance before retrying.
- Group large distributions into multiple batches of ~50-100 recipients max to avoid approaching the block gas limit (warning triggers at >90% of block gas limit).
</SHOULD>

<NEVER>
- NEVER use this skill for native token (OKB/ETH) transfers; this contract logic is exclusively built for ERC20 tokens.
- NEVER exceed the 100 recipients limit per batch.
</NEVER>

## Error Handling

If gas estimation fails, the agent will receive a `ValidationError` containing the revert reason. 
Example error strings:
- *"Gas estimation failed (ERC20: transfer amount exceeds balance)."*
- *"Gas estimation failed (ERC20: transfer amount exceeds allowance)."*

When this happens, inform the user why the operation reverted and help them resolve the prerequisite (e.g. approve the contract for token spending).
