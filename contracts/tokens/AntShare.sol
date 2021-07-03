// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    Token that represents the value of the protocol
 */
import "../core/BaseToken.sol";

contract AntShare is BaseToken {
    constructor() BaseToken("AntShare", "ANTS") {}
}
