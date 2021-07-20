// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import "../core/BaseToken.sol";

contract MockBNB is BaseToken {
    constructor() BaseToken("BNB", "BNB") {}
}
