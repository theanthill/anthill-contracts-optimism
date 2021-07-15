// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../core/BaseToken.sol";

contract MockETH is BaseToken {
    constructor() BaseToken("ETH", "ETH") {}
}
