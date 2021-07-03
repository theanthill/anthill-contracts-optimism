// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../core/BaseToken.sol";

contract MockBUSD is BaseToken {
    constructor() BaseToken("BUSD", "BUSD") {}
}
