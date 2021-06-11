// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./core/BaseToken.sol";

contract AntToken is BaseToken {
    /**
     * @notice Constructs the Ant Token ERC-20 contract.
     */
    constructor(uint256 amount) BaseToken("AntToken", "ANT") {
        // Mints an initial amount of ANT token for liquidity purposes
        mint(msg.sender, amount);
    }
}
