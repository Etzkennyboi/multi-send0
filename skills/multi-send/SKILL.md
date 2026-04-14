---
name: okx-multi-send
description: "Agent-native skill for batched token transfers on X Layer. Supports both individual bundling and contract-based multi-send."
version: 1.0.0
author: Etzkennyboi
---

# Multi-Send Token (Bundler)

This tool generates a list of standard ERC20 `transfer` calls. 

### Usage
- Input a token address and a list of recipients.
- The tool returns an array of transaction payloads.
- Your wallet should execute these as a bundle.

### Benefits
- **No Setup**: No custom contracts needed.
- **Universal**: Works with any ERC20 token on X Layer.
- **Transparent**: Every transfer is a visible, standard call.
