// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../core/BaseToken.sol";

contract AntToken is BaseToken {
    constructor() BaseToken("AntToken", "ANT") {}
}
