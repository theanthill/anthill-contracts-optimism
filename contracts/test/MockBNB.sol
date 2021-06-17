// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../core/BaseToken.sol";

contract MockBNB is BaseToken {
    constructor() BaseToken("BNB", "BNB") {}
}
