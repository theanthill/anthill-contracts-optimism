// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    Token that represents the value of the protocol
 */
import "./core/BaseToken.sol";

contract AntShare is BaseToken {

    // [workerant] Use ERC20Capped to set the maximum amount
    constructor(uint256 maxAmount) BaseToken("AntShare", "ANTS") {
        // Pre-mints the max amount of shares that will ever exist
        mint(msg.sender, maxAmount);
    }
}
