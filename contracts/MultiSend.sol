// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract MultiSend {
    event MultiTokenSent(address indexed token, address[] recipients, uint256[] amounts);
    
    function multiSendToken(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length > 0, "Empty arrays");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(amounts[i] > 0, "Amount must be > 0");
            
            bool success = IERC20(token).transferFrom(
                msg.sender,
                recipients[i],
                amounts[i]
            );
            require(success, "Transfer failed");
        }
        
        emit MultiTokenSent(token, recipients, amounts);
    }
    
    // Emergency withdrawal function
    function withdrawToken(address token, uint256 amount) external {
        IERC20(token).transferFrom(address(this), msg.sender, amount);
    }
}
