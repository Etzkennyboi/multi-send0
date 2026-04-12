// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title  MultiSend v1.1.0
/// @notice Batch-transfer ERC20 tokens to N recipients atomically.
///         Caller must approve this contract for the total amount first.
/// @dev    Stateless — no storage, no owner, no upgrades.
/// @dev    CEI pattern — all state/validation before external calls.
/// @notice LIMITATION: Fee-on-transfer tokens are NOT supported.
contract MultiSend {
    using SafeERC20 for IERC20;

    event MultiSendExecuted(
        address indexed sender,
        address indexed token,
        uint256 totalAmount,
        uint256 recipientCount
    );

    error LengthMismatch();
    error EmptyRecipients();
    error ZeroAmount();
    error ZeroAddress();
    error NotAContract();     // BUG #02 — new in v1.1.0

    function multiSend(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        // Validate token
        if (token == address(0)) revert ZeroAddress();

        // BUG #02 FIX: verify token is a contract, not an EOA
        uint256 codeSize;
        assembly { codeSize := extcodesize(token) }
        if (codeSize == 0) revert NotAContract();

        uint256 n = recipients.length;
        if (n == 0) revert EmptyRecipients();
        if (n != amounts.length) revert LengthMismatch();

        IERC20 tkn = IERC20(token);
        uint256 total;

        // Pass 1: validate all inputs + accumulate total (checked math)
        for (uint256 i; i < n; ) {
            if (recipients[i] == address(0)) revert ZeroAddress();
            if (amounts[i] == 0) revert ZeroAmount();
            total += amounts[i];
            unchecked { ++i; }
        }

        // Pass 2: execute transfers (unchecked loop increment only)
        for (uint256 i; i < n; ) {
            tkn.safeTransferFrom(msg.sender, recipients[i], amounts[i]);
            unchecked { ++i; }
        }

        emit MultiSendExecuted(msg.sender, token, total, n);
    }

    /// @notice Pre-flight view: returns total required allowance.
    /// @dev BUG #13 FIX: revert on empty array.
    function requiredAllowance(
        uint256[] calldata amounts
    ) external pure returns (uint256 total) {
        if (amounts.length == 0) revert EmptyRecipients();
        for (uint256 i; i < amounts.length; ++i) {
            total += amounts[i];
        }
    }
}
