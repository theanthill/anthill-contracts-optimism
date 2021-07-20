// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

/**
    Currency token of the system
 */

import "../core/BaseToken.sol";

contract AntToken is BaseToken {
    constructor() BaseToken("AntToken", "ANT") {}
}
