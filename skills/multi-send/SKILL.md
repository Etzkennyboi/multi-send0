---
name: okx-multi-send
description: "Agent-native skill for batched token transfers on X Layer. Supports both individual bundling and contract-based multi-send."
version: 1.0.0
author: Etzkennyboi
---

# Multi-Send Token (Contract Mode)

This tool generates a **single transaction call** to the MultiSend smart contract to transfer ERC20 tokens to multiple recipients atomatically.

### Requirements
- **MULTISEND_ADDRESS**: Must be configured in the `.env` file.
- **Approval**: You must approve the MultiSend contract to spend your tokens before executing this call.

### Usage
- Input a token address and a list of recipients.
- The tool returns a **single transaction payload** targeting the MultiSend contract.
- Your wallet executes this as one transaction.

### Benefits
- **One Transaction**: Save gas and time by batching transfers.
- **Atomic**: All transfers succeed or all fail together.
- **Security**: Uses a verified MultiSend contract interface.
