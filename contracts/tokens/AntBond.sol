// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../core/BaseToken.sol";

contract AntBond is BaseToken {
    constructor() BaseToken("AntBond", "ANTB") {}
}
