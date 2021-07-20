// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

/**
    Token that represents the value of the protocol
 */
import "../core/BaseToken.sol";

contract AntShare is BaseToken {
    constructor() BaseToken("AntShare", "ANTS") {}
}
