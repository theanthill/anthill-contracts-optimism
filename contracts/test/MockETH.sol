// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import "../core/BaseToken.sol";

contract MockETH is BaseToken {
    constructor() BaseToken("ETH", "ETH") {}
}
