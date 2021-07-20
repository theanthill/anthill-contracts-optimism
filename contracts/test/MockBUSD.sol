// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import "../core/BaseToken.sol";

contract MockBUSD is BaseToken {
    constructor() BaseToken("BUSD", "BUSD") {}
}
