---
name: multi_send_token
description: "Batch transfer ERC20 tokens by generating a bundle of individual transfer transactions."
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
