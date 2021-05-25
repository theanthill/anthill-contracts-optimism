// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./owner/Operator.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract AntShare is ERC20Burnable, Operator {
    constructor(uint256 maxAmount) ERC20("AntShare", "ANTS") {
        // Pre-mints the max amount of shares that will ever exist
        _mint(msg.sender, maxAmount);
    }
}
